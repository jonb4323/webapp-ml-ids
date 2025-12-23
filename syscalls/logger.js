const LOG_LEVELS = require("./levels.js");
const { formatLog } = require("./formatter.js");
const { consoleTransport } = require("./transport.js");

class Logger {
  constructor({ level = LOG_LEVELS.INFO, transports = [] } = {}) {
    this.level = level;
    this.transports = transports.length ? transports : [consoleTransport];
  }

  log(level, message, options = {}) {
    if (LOG_LEVELS[level] < this.level) return;

    const formatted = formatLog({
      level,
      message,
      ...options,
    });

    this.transports.forEach((t) => t(formatted));
  }

  // levels of logs 
  debug(msg, opts) { this.log("DEBUG", msg, opts); }
  info(msg, opts) { this.log("INFO", msg, opts); }
  warn(msg, opts) { this.log("WARN", msg, opts); }
  error(msg, opts) { this.log("ERROR", msg, opts); }
  fatal(msg, opts) { this.log("FATAL", msg, opts); }
}

module.exports = Logger;