const {
  getPrices,
  createSession,
  checkSubscription,
  webhook,
} = require("../controllers/stripeController");
const isAuthenticated = require("../middleware/isAuthenticated");
const express = require("express");
const router = express.Router();

// // ROUTE
router.post("/createSession", isAuthenticated, createSession);
router.post("/webhook", express.raw({ type: "application/json" }), webhook);

// Exports
module.exports = router;
