require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sendMail } = require('./mailer');
const { getDbData, saveDbData } = require('./ftpService');

const app = express();

app.use(cors());
app.use(express.json());

// GET: Получить все инциденты
app.get('/incidents', async (req, res) => {
    const db = await getDbData();
    res.json(db.incidents || []);
});

// GET: Получить один инцидент по ID
app.get('/incidents/:id', async (req, res) => {
    const db = await getDbData();
    const incident = db.incidents.find(i => i.id === req.params.id);
    if (incident) {
        res.json(incident);
    } else {
        res.status(404).json({ error: "Инцидент не найден" });
    }
});

// POST: Создать новый инцидент
app.post('/incidents', async (req, res) => {
    const db = await getDbData();
    
    // Генерируем ID (похоже на то, как делал json-server)
    const newIncident = { 
        ...req.body, 
        id: Math.random().toString(36).substring(2, 11) 
    };
    
    if (!db.incidents) db.incidents = [];
    db.incidents.push(newIncident);
    
    await saveDbData(db);
    
    sendMail('🚨 Добавлен новый инцидент', `В систему добавлен инцидент:\nОписание: ${newIncident.title}\nУровень угрозы: ${newIncident.severity}`);
    
    res.status(201).json(newIncident);
});

// PUT: Обновить инцидент
app.put('/incidents/:id', async (req, res) => {
    const db = await getDbData();
    const index = db.incidents.findIndex(i => i.id === req.params.id);
    
    if (index !== -1) {
        db.incidents[index] = { ...db.incidents[index], ...req.body };
        await saveDbData(db);
        
        sendMail('🔄 Изменение статуса', `Статус инцидента №${req.params.id} изменен на: ${req.body.status}`);
        res.json(db.incidents[index]);
    } else {
        res.status(404).json({ error: "Инцидент не найден" });
    }
});

// DELETE: Удалить инцидент
app.delete('/incidents/:id', async (req, res) => {
    const db = await getDbData();
    const initialLength = db.incidents ? db.incidents.length : 0;
    
    db.incidents = (db.incidents || []).filter(i => i.id !== req.params.id);
    
    if (db.incidents.length < initialLength) {
        await saveDbData(db);
        sendMail('🗑️ Удаление инцидента', `Инцидент с ID ${req.params.id} был удален из базы данных.`);
        res.status(200).json({});
    } else {
        res.status(404).json({ error: "Инцидент не найден" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Express server running on port ${PORT}`));
