// ALL REQUIRES STARTS
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const db = require("./config/db.config");
const defaultErrorHandle = require("./middleware/defaultErrorHandle");

// CREATING APP
const app = express();

// DECLARING PORT
const PORT = process.env.PORT || 5000;

// MIDDLEWARES
const middlwares = [
  cors({
    origin: "*",
  }),
  express.urlencoded({ extended: true }),
  // express.json({ limit: "10mb" }),
  fileUpload(),
];

if (process.env.NODE_ENV !== "production") {
  app.use(require("morgan")("dev"));
}
app.use(middlwares);
app.use((req, res, next) => {
  console.log(req.originalUrl);
  if (req.originalUrl === "/api/v1/stripe/webhook") {
    next();
  } else {
    express.json({ limit: "10mb" })(req, res, next);
  }
});
//
// ROUTE DECLARATION
app.use("/api/v1/user", require("./routes/userRoute"));
app.use("/api/v1/email", require("./routes/emailRoute"));
app.use("/api/v1/otp", require("./routes/otpRoute"));
app.use("/api/v1/stripe", require("./routes/stripeRoute"));
app.use("/api/v1/feedback", require("./routes/feedbackRoute"));
app.use("/api/v1/record", require("./routes/recordRoute"));

// ROOT GET API
app.get("/", async (req, res) => {
  try {
    res.send({
      runningOn: process.env.NODE_ENV,
      isSuccess: true,
      date: "2023-06-05", //yyyy-mm-dd last deployment date
    });
  } catch (e) {
    res.send({ e: e });
  }
});

app.use(defaultErrorHandle);

// CONNECT DB WITH MONGOOSE
db()
  .then(() => {
    console.log("Mongodb connected successfully!");
    if (process.env.NODE_ENV === "development") {
      // startCampaign();
      app.listen(PORT, () => {
        console.log(`Dev server is listening on port: ${PORT} ❤️`);
      });
    } else {
      app.listen(PORT, () => {
        // startCampaign();
        console.log(`Server started on port: ${PORT}`);
      });
    }
  })
  .catch((err) => {
    console.log(`SERVER ERROR: ${err}`);
  });
