const { Client } = require("basic-ftp");
const fs = require("fs");
const path = require("path");

const ftpConfig = {
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    secure: false
};


const FTP_DIR = "files"; 

const tempFilePath = path.join('/tmp', 'db.json'); 

async function getDbData() {
    const client = new Client();
    try {
        await client.access(ftpConfig);
        await client.cd(FTP_DIR);
        
        // Скачиваем файл с FTP на диск Render
        await client.downloadTo(tempFilePath, "db.json");
        
        // Читаем скачанный файл
        const data = fs.readFileSync(tempFilePath, "utf8");
        return JSON.parse(data);
    } catch (err) {
        console.error("Ошибка чтения с FTP:", err);
        // Если файла еще нет, отдаем пустую структуру, чтобы сайт не падал
        return { incidents: [] };
    } finally {
        client.close();
    }
}

async function saveDbData(dataObject) {
    const client = new Client();
    try {

        const jsonString = JSON.stringify(dataObject, null, 2);
        fs.writeFileSync(tempFilePath, jsonString);

        await client.access(ftpConfig);
        await client.cd(FTP_DIR);
        

        await client.uploadFrom(tempFilePath, "db.json");
    } catch (err) {
        console.error("Ошибка записи на FTP:", err);
        throw err;
    } finally {
        client.close();
    }
}

module.exports = { getDbData, saveDbData };