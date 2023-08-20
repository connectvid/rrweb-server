const {
  getPrices,
  createSession,
  checkSubscription,
  webhook,
  webhook2,
} = require("../controllers/stripeController");
const isAuthenticated = require("../middleware/isAuthenticated");
const express = require("express");
const router = express.Router();

// // ROUTE
router.post("/createSession", isAuthenticated, createSession);
router.post("/webhook", express.raw({ type: "application/json" }), webhook);
// router.post("/webhook2", express.raw({ type: "application/json" }), webhook2);

// Exports
module.exports = router;
