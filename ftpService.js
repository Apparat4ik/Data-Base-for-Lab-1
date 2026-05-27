const { Client } = require("basic-ftp");
const { Readable, Writable } = require("stream");

// Настройки берем из переменных окружения
const ftpConfig = {
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    secure: false 
};

// Функция для получения данных
async function getDbData() {
    const client = new Client();
    try {
        await client.access(ftpConfig);
        let data = "";
        
        // Создаем поток для записи в переменную
        const writable = new Writable({
            write(chunk, encoding, callback) {
                data += chunk.toString();
                callback();
            }
        });

        await client.downloadTo(writable, "ftp/files/db.json"); 
        return JSON.parse(data);
    } catch (err) {
        console.error("Ошибка чтения с FTP:", err);
        return { incidents: [] };
    } finally {
        client.close();
    }
}

// Функция для сохранения данных
async function saveDbData(dataObject) {
    const client = new Client();
    try {
        await client.access(ftpConfig);
        
        const jsonString = JSON.stringify(dataObject, null, 2);
        const readable = Readable.from([jsonString]);

        await client.uploadFrom(readable, "ftp/files/db.json");
    } catch (err) {
        console.error("Ошибка записи на FTP:", err);
        throw err;
    } finally {
        client.close();
    }
}

module.exports = { getDbData, saveDbData };