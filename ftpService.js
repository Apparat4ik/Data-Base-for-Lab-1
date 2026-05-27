const { Client } = require("basic-ftp");
const { Readable, Writable } = require("stream");

const ftpConfig = {
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    secure: false
};

const FTP_DIR = "/files"; 

async function getDbData() {
    const client = new Client();
    try {
        await client.access(ftpConfig);
        await client.cd(FTP_DIR);
        
        let data = "";
        const writable = new Writable({
            write(chunk, encoding, callback) {
                data += chunk.toString();
                callback();
            }
        });

        await client.downloadTo(writable, "db.json");
        return JSON.parse(data);
    } catch (err) {
        console.error("Ошибка чтения с FTP:", err);
        throw new Error(`Ошибка скачивания базы с FTP: ${err.message}`);
    } finally {
        client.close();
    }
}

async function saveDbData(dataObject) {
    const client = new Client();
    try {
        await client.access(ftpConfig);
        await client.cd(FTP_DIR);
        
        const jsonString = JSON.stringify(dataObject, null, 2);
        const readable = Readable.from([jsonString]);

        await client.uploadFrom(readable, "db.json");
    } catch (err) {
        console.error("Ошибка записи на FTP:", err);
        throw new Error(`Ошибка записи на FTP: ${err.message}`);
    } finally {
        client.close();
    }
}

module.exports = { getDbData, saveDbData };