require('dotenv').config();

const { NODE_ENV, JWT_SECRET } = process.env;
const jwt = require('jsonwebtoken');
const UnauthorizedAccessError = require('../errors/UnauthorizedAccessError');

module.exports = (req, res, next) => {
  let token;
  if (!req.cookies.jwt) {
    token = req.headers.authorization;
  } else {
    token = req.cookies.jwt;
  }
  if (!token) {
    throw new UnauthorizedAccessError('Необходима авторизация');
  }
  let payload;
  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'super-puper-secret');
  } catch (err) {
    next(new UnauthorizedAccessError('Необходима авторизация'));
    return;
  }
  req.user = payload;
  next();
};
