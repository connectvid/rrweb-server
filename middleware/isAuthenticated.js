//external imports
const createError = require("http-errors");
const { getAuth } = require("firebase-admin/auth");

//internal imports
const admin = require("../config/firebase.config.js");

//create isAuthenticated middleware
const isAuthenticated = (req, res, next) => {
  try {
    if (!req.headers?.authorization?.startsWith("Bearer ")) {
      next(createError(401, "Please send a valid token"));
    } else {
      const token = req.headers.authorization.split(" ")[1];
      getAuth(admin)
        .verifyIdToken(token)
        .then((decodedUser) => {
          if (!decodedUser) {
            next(createError(401, "Failed to decode user from the token"));
          }
          req.user = decodedUser;
          next();
        })
        .catch((err) => {
          next(
            createError(
              401,
              "Session Expired please reload the page or login again."
            )
          );
        });
    }
  } catch (err) {
    console.log({
      code: err.code,
    });
    return res.status(500).send({ message: err.message });
  }
};

//export isAuthenticated middleware
module.exports = isAuthenticated;
