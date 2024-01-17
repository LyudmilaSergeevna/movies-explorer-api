const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const userController = require('../controllers/users');

router.get('/me', userController.readUser);

router.patch('/me', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().alphanum().length(24),
  }),
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    name: Joi.string().required().min(2).max(30),
  }),
}), userController.updateUser);

module.exports = router;
