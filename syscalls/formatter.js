function formatLog({
    level,
    message,
    context,
    syscall,
    error,
}) {
    // Extract standard fields
    const {
        event_type, request_id, session_id, user_id, 
        client_ip, user_agent, duration_ms, status_code,
        outcome, failure_reason, url, method, ...restContext
    } = context || {};

    // Base log object
    const logObject = {
        ts: new Date().toISOString(),
        level,
        event_type: event_type || 'app_log',
        request_id,
        session_id,
        user_id,
        client_ip,
        user_agent,
        route: url, 
        method,
        outcome: outcome || (error ? 'fail' : undefined),
        failure_reason,
        status_code,
        latency_ms: duration_ms,
        message,
        syscall,
        error: error
        ? { name: error.name, message: error.message, stack: error.stack }
        : null,
        data: Object.keys(restContext).length ? restContext : undefined
    };

    // Remove undefined keys
    Object.keys(logObject).forEach(key => 
        logObject[key] === undefined && delete logObject[key]
    );

    return JSON.stringify(logObject);
}

module.exports = { formatLog };