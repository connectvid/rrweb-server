// All Requires
const router = require('express').Router();
const { verifyOTP } = require('../controllers/otpController');

// Routes
router
   /**
   * @route base_url/otp/api/v1/verify-otp
   * @method POST
   */
  .post('/verify-otp', verifyOTP);

// Export
module.exports = router;
