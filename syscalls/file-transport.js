const fs = require('fs');
const path = require('path');

// Writes logs to date-stamped files in the syscalls/logs directory
const fileTransport = (log) => {
  try {
    const logsDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    const date = new Date().toISOString().split("T")[0];
    const filename = `logs-${date}.json`;
    const filepath = path.join(logsDir, filename);
    fs.appendFileSync(filepath, log + "\n", "utf8");
  } catch (error) {
    console.error("Failed to write to log file:", error);
    console.log(log);
  }
};

module.exports = { fileTransport };
