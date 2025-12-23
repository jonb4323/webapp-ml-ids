const logger = require('../../syscalls/index.js');
const context = require('../utils/context.js');

const requestLogger = (req, res, next) => {
  // Use crypto.randomUUID since uuid usage might be an issue if not installed, keeping it simple
  const requestId = require('crypto').randomUUID();
  const startTime = Date.now();
  
  const store = {
    requestId,
    startTime,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    session: req.sessionID,
    user: null 
  };

  context.run(store, () => {
    // Log Request Start
    logger.info('Incoming Request', {
      event_type: 'http_request',
      request_id: requestId,
      method: req.method,
      url: req.originalUrl,
      client_ip: req.ip,
      user_agent: req.get('user-agent')
    });

    res.on('finish', () => {
       const duration = Date.now() - startTime;
       // Log Request End
       logger.info('Request Completed', {
          event_type: 'http_request_completed',
          request_id: requestId,
          status_code: res.statusCode,
          latency_ms: duration,
          user_id: store.user ? store.user.id : (req.user ? req.user.id : 'anon'),
          outcome: res.statusCode >= 400 ? 'fail' : 'success'
       });
    });
    next();
  });
};

module.exports = requestLogger;
