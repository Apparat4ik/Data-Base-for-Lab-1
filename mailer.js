const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendMail = async (subject, text) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'apparat.inc45@gmail.com',
            subject: subject,
            text: text
        });

        if (error) {
            console.error('Ошибка от API Resend:', error);
        } else {
            console.log('Письмо принято сервером Resend! ID:', data.id);
        }
    } catch (err) {
        console.error('Системная ошибка в mailer.js:', err);
    }
};

module.exports = { sendMail };