import jwt from 'jsonwebtoken';

const authenticate = (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.token;
    if (!token) return next(new Error('Authentication error: No token provided'));
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.join(`user_${decoded.userId}`);
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
};

export default authenticate;