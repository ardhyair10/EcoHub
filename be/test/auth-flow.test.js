const assert = require('node:assert/strict');
const authController = require('../src/controllers/authController');

assert.equal(typeof authController.buildOtpPayload, 'function', 'buildOtpPayload should exist');

const payload = authController.buildOtpPayload({ email: 'user@example.com', otpCode: '123456' });
assert.equal(payload.email, 'user@example.com');
assert.equal(payload.otp_code, '123456');
assert.equal(payload.require_otp, true);

console.log('auth-flow test passed');
