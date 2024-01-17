require('dotenv').config();

const { NODE_ENV, JWT_SECRET } = process.env;
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ConflictError = require('../errors/ConflictError');

function readUser(req, res, next) {
  return userModel.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь по указанному _id не найден.');
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError({ message: err.message }));
        return;
      }
      next(err);
    });
}

function createUser(req, res, next) {
  const { email, password, name } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => userModel.create({ email, password: hash, name }))
    .then(() => {
      if (validator.isEmail(email) === false) {
        throw new BadRequestError('Указан неверный email.');
      }
      return res.status(201).send({ user: { email, name } });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError({ message: err.message }));
        return;
      } if (err.name === 'MongoServerError') {
        next(new ConflictError('Пользователь с таким email уже зарегистрирован.'));
        return;
      }
      next(err);
    });
}

function updateUser(req, res, next) {
  userModel.findByIdAndUpdate(req.user._id, {
    name: req.body.name, email: req.body.email,
  }, {
    new: true, runValidators: true, upsert: false,
  })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь по указанному _id не найден.');
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError({ message: err.message }));
        return;
      }
      next(err);
    });
}

function login(req, res, next) {
  const { email, password } = req.body;
  userModel.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'super-puper-secret', { expiresIn: '7d' });
      res.cookie('jwt', token, { maxAge: 3600000 * 24 * 7, httpOnly: true });
      res.send({ token });
    })
    .catch(next);
}

function logout(req, res) {
  res.clearCookie('jwt');
  res.send('Cookie удалены');
}

module.exports = {
  readUser,
  createUser,
  updateUser,
  login,
  logout,
};
