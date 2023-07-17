const isAuthenticated = require("../middleware/isAuthenticated");
const { addFeedback } = require("../controllers/feedbackController");

const router = require("express").Router();
// All Requires

// ROUTE
router
  /**
   * @route base_url/feedback/api/v1/add-feedback
   * @method POST
   */
  .post("/add-feedback", isAuthenticated, addFeedback);

// Exports
module.exports = router;
