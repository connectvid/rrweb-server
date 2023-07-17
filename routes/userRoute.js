const isAuthenticated = require("../middleware/isAuthenticated");
const {
  createUser,
  getUserByEmailAndUID,
  createUserOrGetUser,
} = require("../controllers/userController");

const router = require("express").Router();
// All Requires

// ROUTE
router
  /**
   * @route base_url/user/api/v1/create-user
   * @method POST
   */
  .post("/create-user", isAuthenticated, createUser)
  /**
   * @route base_url/user/api/v1/create-user-or-get-user
   * @method POST
   */
  .post("/create-user-or-get-user", isAuthenticated, createUserOrGetUser)
  /**
   * @route base_url/user/api/v1/get-user-by-email/:email/:uid
   * @method GET
   */
  .get(
    "/get-user-by-email-and-uid/:email/:uid",
    isAuthenticated,
    getUserByEmailAndUID
  );

// Exports
module.exports = router;
