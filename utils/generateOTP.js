const generateOTP = () => {
    let otp = Math.floor(Math.random() * 1000000);
    otp = otp.toString().padStart(6, "0");
    return otp;
  }
  
  module.exports = {generateOTP}