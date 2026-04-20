function notFoundHandler(req, res, next) {
  if (res.headersSent) return next();
  res.status(404).json({ message: "Route not found" });
}

const { logError } = require("../helpers/logger");

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  logError({ message: err.message, stack: err.stack, path: req.path });
  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    success: false,
    message: err.message || "Server error",
  });
}


module.exports = {
  notFoundHandler,
  errorHandler,
};

