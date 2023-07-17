// All Requires
const router = require('express').Router();
const { sendOTPEmail } = require('../controllers/emailController');

// Routes
router
   /**
   * @route base_url/email/api/v1/send-otp-email
   * @method POST
   */
  .post('/send-otp-email', sendOTPEmail);

// Export
module.exports = router;
