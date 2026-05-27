const { Client } = require("basic-ftp");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ftpConfig = {
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    secure: false
};

const REMOTE_FILE_PATH = "/files/db.json"; 

async function getDbData() {
    const client = new Client();
    // Генерируем уникальное имя файла для каждого запроса
    const tempFilePath = path.join('/tmp', `db_${crypto.randomUUID()}.json`); 
    
    try {
        await client.access(ftpConfig);
        await client.downloadTo(tempFilePath, REMOTE_FILE_PATH);
        
        const data = fs.readFileSync(tempFilePath, "utf8");
        return JSON.parse(data);
    } catch (err) {
        console.error("Ошибка чтения с FTP:", err);
        return { incidents: [] }; 
    } finally {
        client.close();
        // Обязательно убираем за собой мусор
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath); 
    }
}

async function saveDbData(dataObject) {
    const client = new Client();
    const tempFilePath = path.join('/tmp', `db_${crypto.randomUUID()}.json`);
    
    try {
        const jsonString = JSON.stringify(dataObject, null, 2);
        fs.writeFileSync(tempFilePath, jsonString);

        await client.access(ftpConfig);
        
        try {
            await client.remove(REMOTE_FILE_PATH);
        } catch (e) {
            // Игнорируем, если файла еще нет
        }

        await client.uploadFrom(tempFilePath, REMOTE_FILE_PATH);
    } catch (err) {
        console.error("Ошибка записи на FTP:", err);
        throw err;
    } finally {
        client.close();
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    }
}

module.exports = { getDbData, saveDbData };