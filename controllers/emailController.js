var nodemailer = require('nodemailer');
const OTP = require('../models/OTP');
const { signupEmailTemplate } = require('../utils/signupEmailTemplate');
const { generateOTP } = require('../utils/generateOTP');

const emailController = {};

emailController.sendOTPEmail = async (req, res, next) => {
  // Read data from request body
  const otp = generateOTP()
  const sendTo = req.body.email;
  const name = req.body.name;
  console.log({otp, sendTo, name})

  try {
    const otpModel = await OTP.findOne({ email:sendTo });
    if (otpModel) {
      try{
        otpModel.name = name;
        otpModel.otp = otp;
        await otpModel.save();
      }catch(err){
        return res
        .status(500)
        .send({ msg: err.message || 'something went wrong at server' });
      }
    } else {
      try{
        const newOTPModel = new OTP({
          name,
          email:sendTo,
          otp:otp,
        });
        await newOTPModel.save();
      }catch(e){
        return res
        .status(500)
        .send({ msg: err.message || 'something went wrong at server' });
      }
    }
 
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    var mailOptions = {
      from: process.env.EMAIL,
      to: sendTo,
      subject: 'Verification OTP from email warmup',
      html: signupEmailTemplate(otp , name),
    };
    
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        res.status(500).send({
          isSuccess: false,
          msg: error.message || 'something went wrong at server',
        });
      } else {
        res.status(200).send({ isSuccess: true, msg: 'success', info: info });
      }
    });
  } catch (err) {
    res
      .status(500)
      .send({ msg: err.message || 'something went wrong at server' });
  }
};

module.exports = emailController;
