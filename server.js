const jsonServer = require('json-server');
const { sendMail } = require('./mailer');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.use((req, res, next) => {
    if (req.path.includes('/incidents')) {
        
        if (req.method === 'POST') {
            const { title, severity } = req.body;
            sendMail('🚨 Добавлен новый инцидент', `В систему добавлен инцидент:\nОписание: ${title}\nУровень угрозы: ${severity}`);
        }

        if (req.method === 'DELETE') {
            const id = req.path.split('/').pop();
            sendMail('🗑️ Удаление инцидента', `Инцидент с ID ${id} был удален из базы данных.`);
        }
        
        if (req.method === 'PUT') {
            const id = req.path.split('/').pop();
            const { status } = req.body;
            sendMail('🔄 Изменение статуса', `Статус инцидента №${id} изменен на: ${status}`);
        }
    }
    
    next();
});

server.use(router);
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
