const { isValidObjectId } = require("mongoose");
const User = require("../models/User");
// const { stripe } = require("../utils/stripe");
const OTP = require("../models/OTP");
const { stripe } = require("../utils/stripe");

exports.createUser = async (req, res) => {
  try {
    const email = req.body.email;
    const userExists = await User.findOne({ email });
    console.log({ email });
    if (userExists) {
      return res.status(200).send({
        isSuccess: true,
        user: userExists,
      });
    }
    // console.log({ email });

    // create Stripe customer ID
    const customer = await stripe.customers.create({
      email: email,
    });
    // console.log({customer})

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    // create newUserData object
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
      uid: req.body.UID,
      role: "user",
      status: "active",
      stripeCustomerID: customer.id,
      selectedPlan: "none",
      endDate,
    };

    console.log({ newUserData });

    // create new user instance
    const newUser = new User(newUserData);

    // save user at dabase
    const result = await newUser.save();

    console.log({ result });

    // send success response
    res.status(200).json({
      isSuccess: true,
      message: "user created successfully",
      user: newUser,
    });
  } catch (err) {
    res.status(500).json({
      isSuccess: false,
      message: err.message || "Something went wrong",
    });
  }
};

exports.getUserByEmailAndUID = async (req, res) => {
  try {
    const email = req.params.email;
    const uid = req.params.uid;

    const user = await User.findOne({
      email,
    });

    if (user) {
      return res.status(200).send({
        isSuccess: true,
        user,
      });
    } else {
      res.status(404).send({
        isSuccess: false,
        message: "User not found",
      });
    }
  } catch (err) {
    res.status(500).send({
      isSuccess: false,
      message: err.message || "Something went wrong",
    });
  }
};

exports.createUserOrGetUser = async (req, res) => {
  try {
    const email = req.body.email;
    const userExists = await User.findOne({ email });
    console.log({ email });
    if (userExists) {
      return res.status(200).send({
        isSuccess: true,
        user: userExists,
      });
    }

    // create Stripe customer ID
    const customer = await stripe.customers.create({
      email: email,
    });
    // console.log({customer})

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    // create newUserData object
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
      uid: req.body.UID,
      role: "user",
      status: "active",
      stripeCustomerID: customer.id,
      selectedPlan: "trial",
      endDate,
    };

    console.log({ newUserData });

    // create new user instance
    const newUser = new User(newUserData);

    // save user at dabase
    const result = await newUser.save();

    console.log({ result });

    // send success response
    res.status(200).json({
      isSuccess: true,
      message: "user created successfully",
      user: newUser,
    });
  } catch (err) {
    res.status(500).json({
      isSuccess: false,
      message: err.message || "Something went wrong",
    });
  }
};
