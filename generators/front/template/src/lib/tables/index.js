import http from '../http';
import u from '../utils';

const { readTable, writeTable, clearTable, updateRow } = (() => {

    if (window.indexedDB == null) console.warn('IndexedDB NOT SUPORTED!');

    let db;
    let openDbRequest = new Promise((resolve, reject) => {
        const request = indexedDB.open('tables', 1);

        request.onupgradeneeded = (event) => console.log('IndexedDB upgrade needed', event);
        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(event.target.result);
        }
        request.onerror = (event) => console.error('Error opening indexedDB', event);
    });

    const writeTable = (tableName, row) => new Promise(async (resolve, reject) => {
        await openDbRequest;
        if (!db.objectStoreNames.contains(tableName)) {
            db.createObjectStore(tableName, { autoIncrement: true });
        }
        const transaction = db.transaction([tableName], 'readwrite');
        const objectStore = transaction.objectStore(tableName);
        const request = objectStore.add(row);

        request.onsuccess = resolve;
        request.onerror = reject;
    });

    const readTable = (tableName) => new Promise(async (resolve, reject) => {
        await openDbRequest;
        if (!db.objectStoreNames.contains(tableName)) resolve(null);
        else{
            const transaction = db.transaction([tableName], 'readonly');
            const objectStore = transaction.objectStore(tableName);
            const request = objectStore.openCursor();
            const data = [];
    
            request.onsuccess = function (event) {
                const cursor = event.target.result;
                if (cursor) {
                    data.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(data);
                }
            };
    
            request.onerror = reject;
        }
        
    });

    const clearTable = (tableName) => new Promise((resolve, reject) => {
        const transaction = db.transaction([tableName], 'readwrite');
        const objectStore = transaction.objectStore(tableName);
        const request = objectStore.clear();

        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event);
    });

    const updateRow = (tableName, id, newData) => new Promise((resolve, reject) => {
        const transaction = db.transaction([tableName], 'readwrite');
        const objectStore = transaction.objectStore(tableName);
        const request = objectStore.put(newData, id);

        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event);
    });

    window.onbeforeunload = () => db.close();

    return { readTable, writeTable, clearTable, updateRow }
})();

readTable('tt').then(console.log);
writeTable('tt', { hola: 3 }).then(console.log);
readTable('tt').then(console.log);

const buildPksHashTable = (rows, pks) => {
    const hashTable = {};
    rows.forEach(row => {
        const key = pks.reduce((p, pk) => p + '_' + row[pk], '');
        hashTable[key] = row;
    });
    return hashTable;
};
const updateHashTable = ({ hashTable, pks }, row, action) => {
    const key = pks.reduce((p, pk) => p + '_' + row[pk], '');
    switch (action?.toLowerCase()) {
        case 'insert':
            hashTable[key] = row;
            break;
        case 'update':
            hashTable[key] = { ...hashTable[key], ...row };
            break;
        case 'delete':
            delete hashTable[key];
            break;
        default:
            throw 'Invalid action: ' + action;
    };
    return hashTable;
};
const getByPks = ({ hashTable, pks }, pksValues) => {
    const key = pks.reduce((p, pk) => p + '_' + pksValues[pk], '');
    return hashTable[key];
};
const loadLocalStorageCache = () => {
    let res = {};
    for (let i = 0; i < localStorage.length; i++) {
        let k = localStorage.key(i);
        if (k.startsWith('table_')) {
            let splitKey = k.split('_');
            let tableName = splitKey[1].toLowerCase();
            res[tableName] = JSON.parse(localStorage.getItem(k));
            const { rows, pks, ts, total } = res[tableName];
            res[tableName].hashTable = buildPksHashTable(rows, pks);
        }
    }
    console.log('Cache built for tables: ', Object.keys(res));
    return res;
};

export const cache = loadLocalStorageCache();

export const getPaginatedTable = async (tableName, query) => new Promise(async (resolve, reject) => {
    query = u.isEmpty(query) ? {} : query;
    query = u.isString(query) ? query : JSON.stringify(query);

    const path = BACKEND_URL + `/table/${tableName.toLowerCase()}?q=${query}`;

    let getRes = await http.get(path).catch(reject);
    getRes.ok ? resolve(getRes.body) : reject(getRes);
});
export const getTable = async (tableName, update = true) => new Promise(async (resolve, reject) => {
    tableName = tableName.toLowerCase();
    if (!update) resolve(cache[tableName].rows);
    const path = BACKEND_URL + `/table/${tableName}`;
    let cached = cache[tableName];
    let getRes = await http.get(path, { 'x-cache-ts': cached?.ts }).catch(reject);
    if (!getRes.ok) {
        reject(getRes);
    } else {
        const { rows, pks, total } = getRes.body;
        const { cacheTs, cacheType } = getRes.headers;
        cache[tableName] ??= {};
        switch (cacheType) {
            case 'new':
                cache[tableName] = { ts: cacheTs, rows, pks, total };
                localStorage.setItem(`table_${tableName}`, JSON.stringify(cache[tableName]));
                cache[tableName].hashTable = buildPksHashTable(rows, pks);
                break;
            case 'update':
                cache[tableName].total = resBody.total;
                cache[tableName].pks = resBody.pks || cache[tableName].pks;
                cache[tableName].ts = cacheTs;
                resBody.rows.sort((a, b) => a.id - b.id).forEach(({ row, action }) => {
                    const { rows, pks, hashTable } = cache[tableName];
                    switch (action) {
                        case 'insert':
                            rows.push(row);
                            updateHashTable({ hashTable, pks }, row, action);
                            break;
                        case 'update':
                            updateHashTable({ hashTable, pks }, row, action);
                            break;
                        case 'delete':
                            const delRow = getByPks({ hashTable, pks }, row);
                            const rowIndex = rows.indexOf(delRow);
                            rows.splice(rowIndex, 1);
                            updateHashTable({ hashTable, pks }, row, action);
                            break;
                        default:
                            reject('Invalid cache update row: ' + row);
                            break;
                    }
                });
                break;
            case 'upToDate':
                break
            default:
                reject('Invalid cache type: ' + cacheType);
                break;
        }
        resolve(cache[tableName].rows);
    };
});
export const getHashTable = async (tableName, update = true) => new Promise(async (resolve, reject) => {
    if (update) await getTable(tableName, update).catch(reject);
    resolve(cache[tableName].hashTable);
});
export const getRowByPks = async (tableName, pksValues, update = true) => new Promise(async (resolve, reject) => {
    if (update) await getTable(tableName, update).catch(reject);
    const pks = cache[tableName].pks;
    const key = pks.reduce((p, pk) => p + '_' + pksValues[pk], '');
    resolve(cache[tableName].hashTable[key]);
});
export const postRow = async (tableName, row, update = true) => new Promise(async (resolve, reject) => {
    const table = await getTable(tableName, update).catch(reject);
});
export const editRow = async (tableName, row, update = true) => new Promise(async (resolve, reject) => {
    const table = await getTable(tableName, update).catch(reject);
});
export const delRow = async (tableName, pks, update = true) => new Promise(async (resolve, reject) => {
    const table = await getTable(tableName, update).catch(reject);
});

