const { fileTransport } = require('./file-transport.js');

const consoleTransport = (log) => {
  console.log(log);
};

module.exports = { consoleTransport, fileTransport };