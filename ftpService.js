const fs = require('fs').promises;
const path = require('path');


const DB_FILE_PATH = path.join(__dirname, 'db.json');

async function getDbData() {
    try {
        const data = await fs.readFile(DB_FILE_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.log("Файл db.json не найден, будет создан новый при сохранении.");
            return { incidents: [] };
        }
        console.error("Ошибка чтения локального файла:", err);
        return { incidents: [] };
    }
}

async function saveDbData(dataObject) {
    try {
        const jsonString = JSON.stringify(dataObject, null, 2);
        await fs.writeFile(DB_FILE_PATH, jsonString, 'utf-8');
        console.log("Данные успешно сохранены в db.json");
    } catch (err) {
        console.error("Ошибка записи в локальный файл:", err);
        throw err;
    }
}

module.exports = { getDbData, saveDbData };
