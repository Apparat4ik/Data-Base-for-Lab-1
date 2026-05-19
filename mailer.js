const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false, 
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false 
    }
});

const sendMail = (subject, text) => {
    transporter.sendMail({
        from: `"Система Безопасности" <${process.env.SMTP_USER}>`,
        to: 'poststudent@students.local', 
        subject,
        text
    }).catch(err => console.error('Ошибка отправки:', err));
};

module.exports = { sendMail };
