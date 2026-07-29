const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      const error = new Error('Not authorized to access this route');
      error.statusCode = 401;
      throw error;
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'temporary_secret_change_later');
      
      req.user = decoded;
      req.isDemo = Boolean(decoded.is_demo || decoded.email === 'admin@example.com');
      
      next();
    } catch (err) {
      const error = new Error('Not authorized to access this route');
      error.statusCode = 401;
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { protect };
