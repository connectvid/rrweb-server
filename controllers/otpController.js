const OTP = require('../models/OTP');

const otpController = {};

otpController.verifyOTP = async (req, res, next) => {
    const otp = req.body.OTP;
    const email = req.body.email;
    const name = req.body.name;
    console.log({otp: otp, email: email, name: name})
  
    try{
      const otpData = await OTP.findOne({ email });
      if(otpData.email === email && otpData.name === name && otpData.otp === otp){
        return res.status(200).send({
            isSuccess: true,
            message:"OTP matched!"
          })
      }else{
        return res.status(400).send({
            isSuccess: false,
            message:"OTP does not match"
          })
      }
    }catch(err){
      res.status(500).send({
        isSuccess: false,
        message:err.message||"Something went wrong"
      })
    }
};

module.exports = otpController;
