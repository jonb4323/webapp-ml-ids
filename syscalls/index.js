const Logger = require("./logger.js");
const LOG_LEVELS = require("./levels.js");
const { consoleTransport, fileTransport } = require("./transport.js");

const logger = new Logger({
  level: LOG_LEVELS.DEBUG,
  transports: [consoleTransport, fileTransport],
});

module.exports = logger;