const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.cookies.token;
  console.log('Auth middleware: token present:', !!token);
  console.log('Auth middleware: request origin:', req.headers.origin);
  console.log('Auth middleware: request method:', req.method);
  console.log('Auth middleware: request path:', req.path);
  if (!token) {
    console.log('Auth middleware: No token provided');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded.userId;
    console.log('Auth middleware: Token verified for user:', req.user);
    next();
  } catch (error) {
    console.log('Auth middleware: Token verification failed:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
