const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendOtpEmail = async (toEmail, otpCode) => {
  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: toEmail,
    subject: 'Eco Hub - Kode Verifikasi Anda',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Selamat Datang di Eco Hub!</h2>
        <p>Gunakan kode verifikasi (OTP) berikut untuk menyelesaikan proses pendaftaran atau masuk ke akun Anda:</p>
        <div style="background-color: #f1f5f9; padding: 16px; text-align: center; border-radius: 8px; margin: 24px 0;">
          <h1 style="color: #0f172a; letter-spacing: 4px; margin: 0;">${otpCode}</h1>
        </div>
        <p>Kode ini hanya berlaku selama 10 menit. Jangan bagikan kode ini kepada siapapun.</p>
        <p>Terima kasih,<br>Tim Eco Hub</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${toEmail}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Gagal mengirim email verifikasi');
  }
};

module.exports = {
  sendOtpEmail,
};
