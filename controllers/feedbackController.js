const feedbackController = {};
const Feedback = require("../models/Feedback");

feedbackController.addFeedback = async (req, res, next) => {
  try {
    // Extract the feedback and userEmail from the request body
    const { feedback, userEmail } = req.body;

    // Create a new feedback object
    const newFeedback = new Feedback({
      feedback,
      userEmail,
    });

    // Save the new feedback to the database
    await newFeedback.save();

    res.status(200).send({
      isSuccess: true,
      message: "Feedback created successfully!",
    });
  } catch (err) {
    res.status(500).send({
      isSuccess: false,
      message: err.message || "Something went wrong",
    });
  }
};

module.exports = feedbackController;
