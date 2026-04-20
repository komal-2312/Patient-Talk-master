const fs = require("fs");
const path = require("path");

const logsDir = path.join(__dirname, "..", "..", "logs");
const loginLogPath = path.join(logsDir, "login.log");
const registrationLogPath = path.join(logsDir, "registration.log");

function ensureLogsDir() {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
}

function appendLine(filePath, line) {
  ensureLogsDir();
  fs.appendFile(filePath, `${line}\n`, (err) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to write log:", err);
    }
  });
}

function logLogin(data) {
  const entry = {
    type: "LOGIN",
    timestamp: new Date().toISOString(),
    ...data,
  };
  appendLine(loginLogPath, JSON.stringify(entry));
}

function logRegistration(data) {
  const entry = {
    type: "REGISTRATION",
    timestamp: new Date().toISOString(),
    ...data,
  };
  appendLine(registrationLogPath, JSON.stringify(entry));
}

const systemLogPath = path.join(logsDir, "system.log");
const errorLogPath = path.join(logsDir, "error.log");

function logFeedbackSubmission(data) {
  const entry = { type: "FEEDBACK_SUBMISSION", timestamp: new Date().toISOString(), ...data };
  appendLine(systemLogPath, JSON.stringify(entry));
}

function logFormCreated(data) {
  const entry = { type: "FORM_CREATED", timestamp: new Date().toISOString(), ...data };
  appendLine(systemLogPath, JSON.stringify(entry));
}

function logFormEdited(data) {
  const entry = { type: "FORM_EDITED", timestamp: new Date().toISOString(), ...data };
  appendLine(systemLogPath, JSON.stringify(entry));
}

function logFeedbackDeleted(data) {
  const entry = { type: "FEEDBACK_DELETED", timestamp: new Date().toISOString(), ...data };
  appendLine(systemLogPath, JSON.stringify(entry));
}

function logError(data) {
  const entry = { type: "ERROR", timestamp: new Date().toISOString(), ...data };
  appendLine(errorLogPath, JSON.stringify(entry));
}

module.exports = {
  logLogin,
  logRegistration,
  logFeedbackSubmission,
  logFormCreated,
  logFormEdited,
  logFeedbackDeleted,
  logError,
};

