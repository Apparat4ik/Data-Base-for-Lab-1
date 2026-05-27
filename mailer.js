const { Resend } = require('resend');

// Инициализируем Resend с помощью ключа из переменных окружения
const resend = new Resend(process.env.RESEND_API_KEY);

const sendMail = (subject, text) => {
    resend.emails.send({
        from: 'onboarding@resend.dev', // Дефолтный отправитель для бесплатных аккаунтов
        to: 'apparat.inc45@gmail.com', // Укажи почту, на которую регистрировал Resend!
        subject: subject,
        text: text
    })
    .then(() => console.log('Письмо успешно отправлено через HTTP API (Resend)!'))
    .catch(err => console.error('Ошибка отправки через Resend:', err));
};

module.exports = { sendMail };
