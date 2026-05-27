const { Client } = require("basic-ftp");
const fs = require("fs");
const path = require("path");

const ftpConfig = {
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    secure: false
};

// Задаем жесткий абсолютный путь, как он виден в FileZilla
const REMOTE_FILE_PATH = "/files/db.json"; 
const tempFilePath = path.join('/tmp', 'db.json'); 

async function getDbData() {
    const client = new Client();
    client.ftp.verbose = true; 
    try {
        await client.access(ftpConfig);
        await client.downloadTo(tempFilePath, REMOTE_FILE_PATH);
        
        const data = fs.readFileSync(tempFilePath, "utf8");
        return JSON.parse(data);
    } catch (err) {
        console.error("❌ Ошибка чтения с FTP:", err);
        throw err;
    } finally {
        client.close();
    }
}

async function saveDbData(dataObject) {
    const client = new Client();
    client.ftp.verbose = true; //
    try {
        const jsonString = JSON.stringify(dataObject, null, 2);
        fs.writeFileSync(tempFilePath, jsonString);

        await client.access(ftpConfig);
        
        try {
            await client.remove(REMOTE_FILE_PATH);
            console.log("Старый db.json удален.");
        } catch (e) {
            console.log("Файл не удален (возможно, его еще нет).");
        }

        // Грузим по абсолютному пути
        await client.uploadFrom(tempFilePath, REMOTE_FILE_PATH);
        console.log("✅ Данные успешно записаны на FTP!");
    } catch (err) {
        console.error("❌ Ошибка записи на FTP:", err);
        throw err; 
    } finally {
        client.close();
    }
}

module.exports = { getDbData, saveDbData };