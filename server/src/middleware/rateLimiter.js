const requestLogs = new Map();

export const createRateLimiter = ({ windowMs = 60 * 1000, maxRequests = 100, message = 'Too many requests, please try again later.' }) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const key = `${ip}:${req.baseUrl || req.path}`;

    if (!requestLogs.has(key)) {
      requestLogs.set(key, []);
    }

    const timestamps = requestLogs.get(key);
    // Filter timestamps within the current sliding window
    const recentTimestamps = timestamps.filter(t => now - t < windowMs);
    recentTimestamps.push(now);
    requestLogs.set(key, recentTimestamps);

    if (recentTimestamps.length > maxRequests) {
      return res.status(429).json({
        error: message,
        retryAfterMs: windowMs - (now - recentTimestamps[0])
      });
    }

    next();
  };
};

export const generalLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 100,
  message: 'General rate limit reached (100 req/min).'
});

export const aiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30, // Gracious for dev/demoing
  message: 'AI rate limit exceeded (30 req/min).'
});

export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 50,
  message: 'Authentication rate limit reached. Please wait before retrying.'
});
