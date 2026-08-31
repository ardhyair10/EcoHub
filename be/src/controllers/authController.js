const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('../services/emailService');

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
};

const buildOtpPayload = ({ email, otpCode, requireOtp = true }) => ({
  email,
  otp_code: otpCode,
  require_otp: requireOtp,
});

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Cek apakah user sudah ada
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Buat user (belum terverifikasi)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password_hash,
        role: role || 'CITIZEN',
        is_verified: false,
      },
    });

    // Generate dan kirim OTP
    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

    await prisma.otp.create({
      data: {
        email,
        otp_code: otpCode,
        expires_at: expiresAt,
      },
    });

    let emailError = null;
    try {
      await sendOtpEmail(email, otpCode);
    } catch (err) {
      emailError = err;
      console.error('Error sending OTP:', err);
    }

    const otpPayload = buildOtpPayload({ email: newUser.email, otpCode });
    const message = emailError
      ? `Registrasi berhasil. Email verifikasi gagal dikirim. Gunakan kode OTP berikut untuk melanjutkan: ${otpCode}`
      : 'Registrasi berhasil. Silakan cek email Anda untuk kode OTP.';

    res.status(201).json({
      success: true,
      message,
      data: { ...otpPayload, email: newUser.email },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp_code } = req.body;

    const otpRecord = await prisma.otp.findFirst({
      where: { email, otp_code },
      orderBy: { created_at: 'desc' },
    });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Kode OTP tidak valid' });
    }

    if (otpRecord.expires_at < new Date()) {
      return res.status(400).json({ success: false, message: 'Kode OTP sudah kedaluwarsa' });
    }

    // Update user sebagai terverifikasi
    const user = await prisma.user.update({
      where: { email },
      data: { is_verified: true },
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Hapus OTP setelah berhasil
    await prisma.otp.deleteMany({ where: { email } });

    res.status(200).json({
      success: true,
      message: 'Verifikasi berhasil',
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, eco_points: user.eco_points },
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Email atau password salah' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Email atau password salah' });
    }

    if (!user.is_verified) {
      // Jika belum verifikasi, generate OTP baru
      const otpCode = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await prisma.otp.create({
        data: { email, otp_code: otpCode, expires_at: expiresAt },
      });

      let emailError = null;
      try {
        await sendOtpEmail(email, otpCode);
      } catch (err) {
        emailError = err;
        console.error('Error sending OTP:', err);
      }

      const otpPayload = buildOtpPayload({ email, otpCode });
      const message = emailError
        ? `Akun belum terverifikasi. Email OTP gagal dikirim. Gunakan kode OTP berikut untuk melanjutkan: ${otpCode}`
        : 'Akun belum terverifikasi. Kami telah mengirimkan OTP baru ke email Anda.';

      return res.status(403).json({
        success: false,
        message,
        data: otpPayload,
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, eco_points: user.eco_points },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return res.status(200).json({ success: true, message: 'Jika email terdaftar, OTP telah dikirimkan.' });
    }

    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Delete existing OTPs for this email to prevent spam
    await prisma.otp.deleteMany({ where: { email } });

    await prisma.otp.create({
      data: {
        email,
        otp_code: otpCode,
        expires_at: expiresAt,
      },
    });

    try {
      await sendOtpEmail(email, otpCode);
    } catch (err) {
      console.error('Error sending forgot password OTP:', err);
      // Fallback for demo purposes if email fails, usually you'd return an error
      return res.status(200).json({ 
        success: true, 
        message: 'Jika email terdaftar, OTP telah dikirimkan.',
        // IN PRODUCTION, DO NOT SEND OTP IN RESPONSE. This is just in case SMTP fails during development.
        data: { fallback_otp: otpCode } 
      });
    }

    res.status(200).json({ success: true, message: 'Jika email terdaftar, OTP telah dikirimkan.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp_code, new_password } = req.body;

    const otpRecord = await prisma.otp.findFirst({
      where: { email, otp_code },
      orderBy: { created_at: 'desc' },
    });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Kode OTP tidak valid' });
    }

    if (otpRecord.expires_at < new Date()) {
      return res.status(400).json({ success: false, message: 'Kode OTP sudah kedaluwarsa' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(new_password, salt);

    await prisma.user.update({
      where: { email },
      data: { 
        password_hash,
        is_verified: true // Ensure they are verified if they can reset password
      },
    });

    await prisma.otp.deleteMany({ where: { email } });

    res.status(200).json({ success: true, message: 'Password berhasil diubah. Silakan login.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
};

module.exports = {
  register,
  verifyOtp,
  login,
  forgotPassword,
  resetPassword,
  buildOtpPayload,
};
