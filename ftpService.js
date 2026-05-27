const { Client } = require("basic-ftp");
const { Readable, Writable } = require("stream");

const ftpConfig = {
    host: process.env.FTP_HOST,
    user: process.env.FTP_USER,
    password: process.env.FTP_PASSWORD,
    secure: false
};

const REMOTE_FILE_PATH = "/files/db.json"; 

async function getDbData() {
    const client = new Client();
    try {
        await client.access(ftpConfig);
        
        let data = "";
        // Читаем данные прямо в оперативную память
        const writable = new Writable({
            write(chunk, encoding, callback) {
                data += chunk.toString();
                callback();
            }
        });
        
        await client.downloadTo(writable, REMOTE_FILE_PATH);
        return JSON.parse(data);
    } catch (err) {
        console.error("❌ Ошибка чтения с FTP:", err);
        return { incidents: [] };
    } finally {
        client.close();
    }
}

async function saveDbData(dataObject) {
    const client = new Client();
    try {
        const jsonString = JSON.stringify(dataObject, null, 2);
        
        // Превращаем JSON-строку в поток для прямой отправки
        const readable = Readable.from([jsonString]);

        await client.access(ftpConfig);
        
        try {
            await client.remove(REMOTE_FILE_PATH);
        } catch (e) {
            // Игнорируем, если удалять нечего
        }

        // Грузим поток из памяти прямо на FTP
        await client.uploadFrom(readable, REMOTE_FILE_PATH);
        
        // Эта строчка покажет в логах Render, сколько РЕАЛЬНО байт мы отправили
        console.log(`✅ На FTP успешно отправлено ${Buffer.byteLength(jsonString)} байт`);
    } catch (err) {
        console.error("❌ Ошибка записи на FTP:", err);
        throw err;
    } finally {
        client.close();
    }
}

module.exports = { getDbData, saveDbData };