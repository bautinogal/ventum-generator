import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import env from '../config/env.js.template/index.js';
import { fileURLToPath } from 'url';
import utils from '../lib/utils/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//U: Use this to insert more than 50 rows at a time
const insertMany = async (table, arr) => {
    let res = [];
    const chunkSize = 50;
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        await table.insert(chunk)
        //res = [...res, ...await table.insert(chunk).returning(['*'])];
    }
    return res;
};
const getData = async () => {
    const getCSV = async (csvPath) => new Promise((resolve, reject) => {
        const csvFilePath = path.join(__dirname, csvPath);
        const results = [];

        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', reject);
    });

    const companys = await getCSV('./data/empresas.csv');
    const persons = await getCSV('./data/personas.csv');
    const places = JSON.parse(fs.readFileSync(path.join(__dirname, './data/localidades.json')));

    return { companys, persons, places };
};
const createUsers = async (table, users) => {
    const { editedAt, editedBy } = env.tables.cdc;
    await insertMany(table, users.map(x => ({
        email: (x.nombre + x.apellido + '_' + utils.randomString(5) + '@gmail.com').replace(/ /g, '').toLowerCase(),
        password: utils.randomString(10),
        name: x.nombre,
        lastName: x.apellido,
        [editedBy]: 1,
        [editedAt]: Date.now()
    })));

    // const batchSize = 100;
    // for (let i = 0; i < 500000; i++) {
    //     let updates = [];
    //     for (let j = i; j < i + batchSize && j < 500000; j++) {
    //         updates.push(
    //             table
    //                 .where({ id: utils.randomInt(1, 100000) })
    //                 .update({ DNI: utils.randomInt(10000000, 40000000) })
    //         );
    //     }
    //     await Promise.all(updates);
    //     knex('a')
    // };

    //         Raw PSGQL
    //         DO $$
    // DECLARE
    //     i INT;
    //     random_id INT;
    //     random_password TEXT;
    // BEGIN
    //     FOR i IN 1..500000 LOOP
    //         -- Genera un ID aleatorio entre 1 y 100000
    //         SELECT INTO random_id floor(random() * 99999 + 1)::int FROM generate_series(1,1);

    //         -- Genera una cadena aleatoria para la contraseña (ajusta la longitud según necesites)
    //         SELECT INTO random_password substring(md5(random()::text) from 1 for 10);

    //         -- Actualiza la fila con el ID aleatorio
    //         UPDATE personas
    //         SET password = random_password
    //         WHERE id = random_id;
    //     END LOOP;
    // END $$;

};

export const seed = async function (knex) {
    const table = knex('users');
    const { companys, persons, places } = await getData();
    await createUsers(table, persons);

};