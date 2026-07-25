const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    let transporter;
    const isRealEmailConfigured = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

    // Nếu chưa cấu hình đủ EMAIL_USER và EMAIL_PASS trong .env -> Tự động tạo tài khoản xem thử Ethereal
    if (!isRealEmailConfigured) {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
    } else {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    const mailOptions = {
        from: `"KS Platform Support" <${process.env.EMAIL_USER || 'no-reply@ksplatform.com'}>`,
        to: options.email,
        subject: options.subject,
        html: options.html
    };

    const info = await transporter.sendMail(mailOptions);

    // In đường link xem thử Email ra Terminal nếu đang ở chế độ xem thử Ethereal
    if (!isRealEmailConfigured) {
        console.log(`\n==================================================`);
        console.log(`📧 [EMAIL THÔNG BÁO XEM THỬ KHI CHƯA CÓ GMAIL THẬT]:`);
        console.log(`🔗 Bấm giữ Ctrl và Click vào link để xem mail:`);
        console.log(`👉 ${nodemailer.getTestMessageUrl(info)}`);
        console.log(`==================================================\n`);
    }
};

module.exports = sendEmail;