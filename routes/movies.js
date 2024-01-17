const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const movieController = require('../controllers/movies');

router.get('/', movieController.readAllMovies);

router.post('/', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().pattern(/^(https?:\/\/)?([a-z0-9]+(-[a-z0-9]+)*\.)[^\s@]*$/i),
    trailerLink: Joi.string().required().pattern(/^(https?:\/\/)?([a-z0-9]+(-[a-z0-9]+)*\.)[^\s@]*$/i),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
    thumbnail: Joi.string().required().pattern(/^(https?:\/\/)?([a-z0-9]+(-[a-z0-9]+)*\.)[^\s@]*$/i),
  }),
}), movieController.createMovie);

router.delete('/:movieId', celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().alphanum().length(24),
  }),
}), movieController.deleteMovie);

module.exports = router;
