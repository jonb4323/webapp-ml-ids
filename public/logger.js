// Browser-compatible logger based on syscalls/logger.js

const LOG_LEVELS = {
  DEBUG: 10,
  INFO: 20,
  WARN: 30,
  ERROR: 40,
  FATAL: 50
};

function formatLog({ level, message, context, syscall, error }) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    syscall,
    context,
    error: error
      ? { name: error.name, message: error.message, stack: error.stack }
      : null,
  });
}

const consoleTransport = (log) => {
  console.log(log);
};

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

// Create and export a default logger instance
const logger = new Logger({
  level: LOG_LEVELS.DEBUG,
});

// Make it available globally for script.js
window.logger = logger;
