const { CognitoJwtVerifier } = require('aws-jwt-verify');

// Public telemetry stays read-only. All state changes and diagnostics require
// a signed Cognito access token belonging to the configured admin group.
function createApiGuard({ env = process.env, verifier } = {}) {
  const configured = env.COGNITO_USER_POOL_ID && env.COGNITO_CLIENT_ID;
  const jwtVerifier = verifier || (configured ? CognitoJwtVerifier.create({
    userPoolId: env.COGNITO_USER_POOL_ID,
    clientId: env.COGNITO_CLIENT_ID,
    tokenUse: 'access',
  }) : null);
  return async (req, res, next) => {
    const sensitive = !['GET', 'HEAD', 'OPTIONS'].includes(req.method)
      || /^\/(admin|internal|esp32)(\/|$)/i.test(req.path);
    if (!sensitive) return next();
    const match = /^Bearer ([^\s]+)$/.exec(req.headers.authorization || '');
    if (!match) return res.status(401).json({ error: 'Authentication required' });
    if (!jwtVerifier) return res.status(503).json({ error: 'Admin authentication is not configured' });
    try {
      const claims = await jwtVerifier.verify(match[1]);
      if (!Array.isArray(claims['cognito:groups']) || !claims['cognito:groups'].includes(env.COGNITO_ADMIN_GROUP || 'admin')) {
        return res.status(403).json({ error: 'Administrator access required' });
      }
      req.auth = claims;
      return next();
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}
module.exports = { createApiGuard };
