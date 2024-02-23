import env from './config/env.js';
import fs from 'fs';
import $RefParser from "@apidevtools/json-schema-ref-parser";
import { generate } from './generators/index.js';
const { readFile, writeFile, mkdir } = fs.promises;

const schemaToTables = (schema) => {

    const typeMapper = (type) => {
        switch (type.toLowerCase()) {
            case 'id': return 'increments';
            case 'string': return 'string';
            case 'integer': return 'integer';
            case 'biginteger': return 'biginteger';
            case 'date': return 'biginteger';
            case 'number': return 'float';
            case 'boolean': return 'boolean';
            case 'object': return 'jsonb';
            case 'array': return 'jsonb';
            default: throw new Error('Unknown type: ' + type);
        };
    };

    //U: get the table definition for a given entity (if exists in the table schema)
    const getEntityTable = (entity) => {
        const sameEntity = (entity1, entity2) => {
            return entity1.title === entity2.title &&
                entity1.type === entity2.type &&
                Object.entries(entity1.properties).every(([k, v], i) => v === entity2.properties[k]) &&
                entity1.required.every((v, i) => v === entity2.required[i]);

        }
        return Object.entries(schema.properties.tables.properties)
            .find(([k, v]) => sameEntity(v.items, entity)) || [];
    };

    const createTables = (tables, tableName, tableDef) => {

        const addTable = (tables, tableName, tableDef) => {

            let newTable = {
                name: tableName, static: Boolean(tableDef['x-static']), columns: [
                    { name: 'id', type: 'increments', nullable: false, fkTable: null, fkTable: null, defaultTo: undefined, pk: true }
                ]
            };
            if (!newTable.static) {
                newTable.columns.push({ name: env.tables.cdc.editedBy, type: 'integer', nullable: false, fkTable: 'users', fkColumn: 'id' , defaultTo: undefined, pk: false });
               // newTable.columns.push({ name: env.tables.cdc.editedAt, type: 'biginteger', nullable: false, fkTable: null, fkColumn: null,  defaultTo: undefined, pk: false });
            };
            let auxTables = [];
            //console.log({tables, tableName, tableDef})
            Object.entries(tableDef.items.properties).forEach(([key, value]) => {

                const addArrayColumn = (columnName, columnDef) => {
                    const itemsDef = columnDef.items;
                    const [entityTableName, entityTableDef] = getEntityTable(itemsDef);

                    if (entityTableName) {
                        //A: ENTITY TABLE EXISTS, ADD AUX JOIN TABLE (N:M RELATIONSHIP)
                        const joinTableName = tableName + entityTableName.charAt(0).toUpperCase() + entityTableName.slice(1) + 'Map';
                        const joinTable = {
                            name: joinTableName,
                            static: Boolean(columnDef['x-static']),
                            columns: [
                                {
                                    name: (tableDef.items.title || tableName).charAt(0).toLowerCase() + (tableDef.items.title || tableName).slice(1).replace(' ', '') + 'Id',
                                    type: 'integer',
                                    nullable: false,
                                    fkTable: tableName,
                                    fkColumn: 'id',
                                    defaultTo: undefined,
                                    pk: true
                                },
                                {
                                    name: (entityTableDef.items.title || entityTableName).charAt(0).toLowerCase() + (entityTableDef.items.title || entityTableName).slice(1).replace(' ', '') + 'Id',
                                    type: 'integer',
                                    nullable: false,
                                    fkTable: entityTableName,
                                    fkColumn: 'id',
                                    defaultTo: undefined,
                                    pk: true
                                }
                            ]
                        };

                        if (!columnDef.uniqueItems)
                            joinTable.columns.push({
                                name: 'count',
                                type: 'integer',
                                nullable: false,
                                fkTable: null,
                                fkColumn: null,
                                defaultTo: itemsDef.default ?? 1,
                                pk: false
                            });

                        if (!joinTable.static) {
                            joinTable.columns.push({ name: env.tables.cdc.editedBy, type: 'integer', nullable: false, fkTable: 'users', fkColumn: 'id', defaultTo: undefined, pk: false });
                            //joinTable.columns.push({ name: env.tables.cdc.editedAt, type: 'biginteger', nullable: false, fkTable: null,fkColumn: null, defaultTo: undefined, pk: false });
                        };

                        auxTables.push(joinTable);

                    } else {
                        //A: NO FOREIGN KEY, just a column storing an array as jsonb
                        newTable.columns.push({
                            name: key,
                            type: typeMapper(columnDef.type),
                            nullable: Boolean(tableDef.items.properties.required?.includes(key)),
                            fkTable: null,
                            fkColumn: null,
                            defaultTo: itemsDef.default,
                            unique: Boolean(columnDef.uniqueItems),
                            pk: false
                        });
                    }

                    return [newTable, auxTables];
                };

                const addObjectColumn = (columnName, columnDef) => {
                    const [entityTableName, entityTableDef] = getEntityTable(columnDef);

                    if (entityTableName) {
                        //A: ENTITY TABLE EXISTS, COLUMN IS A FOREIGN KEY
                        newTable.columns.push({
                            name: key,
                            type: typeMapper('integer'),
                            nullable: Boolean(tableDef.properties.required.includes(key)),
                            fkTable: entityTableName,
                            fkColumn: null,
                            defaultTo: columnDef.default,
                            unique: Boolean(columnDef['x-unique']),
                            pk: false
                        });
                    } else {
                        //A: NO FOREIGN KEY, just a column storing an array as jsonb
                        newTable.columns.push({
                            name: key,
                            type: typeMapper(columnDef.type),
                            nullable: Boolean(tableDef.items.properties.required?.includes(key)),
                            fkTable: null,
                            fkColumn: null,
                            defaultTo: columnDef.default,
                            unique: Boolean(columnDef['x-unique']),
                            pk: false
                        });
                    }

                    return [newTable, auxTables];
                };

                const addSimpleColumn = (columnName, columnDef) => {
                    newTable.columns.push({
                        name: key,
                        type: typeMapper(value.type),
                        nullable: tableDef.items.properties.required?.includes(key),
                        fkTable: null,
                        fkColumn: null,
                        defaultTo: value.default,
                        unique: Boolean(columnDef['x-unique']),
                        pk: false
                    });
                    return [newTable, auxTables];
                };

                switch (value.type.toLowerCase()) {
                    case 'array':
                        [newTable, auxTables] = addArrayColumn(key, value);
                        break;
                    case 'object':
                        [newTable, auxTables] = addObjectColumn(key, value);
                        break;
                    default:
                        [newTable, auxTables] = addSimpleColumn(key, value);
                        break;
                };

            });
            return [...tables, ...auxTables, newTable];
        };

        const entity = tableDef?.items?.type;

        switch (entity) {
            case 'object':
                tables = addTable(tables, tableName, tableDef);
                break;
            //TODO: handle other types
            default:
                throw new Error('Unknown type: ' + entity);
        }

        return tables;

    };

    //TODO: handle object types, add them to special table
    const addToOthersTable = (tables, tableName, tableDef) => {
        if (!tables.find(t => t.name === 'others')) {
            tables.push({ name: 'others', columns: [] });
        }
        tables.find(t => t.name === 'others').columns.push({
            name: key,
            type: typeMapper(value.type),
            required: schema.required.includes(key),
            fkTable: value.$ref ? value.$ref.split('/').pop() : null,
            fkColumn: value.$ref ? 'id' : null,
        });
    };

    let tables = [];
    const entities = Object.entries(schema.properties.tables.properties);

    entities.forEach(([tableName, tableDef]) => {
        tables = tableDef.type.toLowerCase() === 'array' ?
            createTables(tables, tableName, tableDef) :
            addToOthersTable(tables, tableName, tableDef);
    });

    return tables;
};

const addGenericPermissionsEnums = async (schema, tables) => {
    schema.definitions.tables.enum = tables.map(t => t.name);
    schema = await $RefParser.dereference(schema);
    return [schema, tables];
};

const addDefaults = async (schema, tables) => {

    const addGenericPermissions = (schema, tables) => {
        let index = 1;
        const genericPermissions = tables.map(t => [
            { id: index++, table: t.name, action: 'Read Table', description: 'Read all data from the table' },
            { id: index++, table: t.name, action: 'Write Table', description: 'Write data to the table' },
            { id: index++, table: t.name, action: 'Read Files', description: 'Read files from the table' },
            { id: index++, table: t.name, action: 'Write Files', description: 'Write files to the table' },
            { id: index++, table: t.name, action: 'Read Comments', description: 'Read comments from the table' },
            { id: index++, table: t.name, action: 'Write Comments', description: 'Write comments to the table' },
            { id: index++, table: t.name, action: 'Read History', description: 'Read history from the table' },
        ]).flat();

        schema.properties.tables.properties.genericPermissions.default = genericPermissions;
        tables.find(t => t.name === 'genericPermissions').default = genericPermissions;

        return [schema, tables];
    };
    const addAdmin = (schema, tables) => {
        const admin = env.admin;

        schema.properties.tables.properties.users.default = [admin];
        tables.find(t => t.name === 'users').default = [{ id: 1, ...admin }];

        schema.properties.tables.properties.rols.default =
            [{ name: 'admin', description: 'Administrator', permissions: tables.find(t => t.name === 'genericPermissions') }];
        tables.find(t => t.name === 'rols').default = [{ id: 1, name: 'admin', description: 'Administrator' }];

        const genericPermissions = tables.find(t => t.name === 'genericPermissions').default;
        tables.find(t => t.name === 'rolsGenericPermissionsMap').default = genericPermissions.map(p => ({ rolId: 1, genericPermissionId: p.id }));

        return [schema, tables];
    };

    [schema, tables] = addGenericPermissions(schema, tables);
    [schema, tables] = addAdmin(schema, tables);

    return [schema, tables];
};

//U: sorts tables by dependencies
const sortTables = (tables) => {
    return tables.sort((a, b) => {
        if (a.name === 'users') return -1;
        if (b.name === 'users') return 1;
        const dependencies = a.columns.map(c => c.fkTable).filter(fk => fk);
        return dependencies.includes(b.name) ? 1 : -1;
    });
};

const writeOutput = async (schema, tables) => {
    await mkdir(env.generator.outputPath, { recursive: true });
    await writeFile(env.generator.outputPath + '/schema.json', JSON.stringify(schema, null, 2));
    console.log('Data has been written to ./output/schema.json');
    await writeFile(env.generator.outputPath + '/tables.json', JSON.stringify(tables, null, 2));
    console.log('Data has been written to ./output/tables.json');
};

readFile('./input/schema.json', 'utf8').then(async data => {
    let jsonSchema = await $RefParser.dereference(JSON.parse(data.toString()));
    let tables = schemaToTables(jsonSchema);
    [jsonSchema, tables] = await addGenericPermissionsEnums(jsonSchema, tables);
    [jsonSchema, tables] = await addDefaults(jsonSchema, tables);
    tables = sortTables(tables);
    await writeOutput(jsonSchema, tables);
    await generate(jsonSchema, tables);
}).catch(console.error);


