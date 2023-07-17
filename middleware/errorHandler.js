// external imports
const createError = require("http-errors");

// 404 not found handler
exports.notFoundHandler = (req, res, next) => {
  next(createError(404, "Your requested content was not found!"));
};

//default error handler
exports.commonErrorHandler = (err, req, res, next) => {
  res.status(err.status || 500).json({
    isSuccess: false,
    message: err.message || "Unknown error occurred at server.",
  });
};
