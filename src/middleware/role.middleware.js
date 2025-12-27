function checkRole(allowed = []) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (allowed.length === 0) return next();
    if (allowed.includes(req.user.role)) return next();
    return res.status(403).json({ error: 'Forbidden' });
  };
}

module.exports = { checkRole };
