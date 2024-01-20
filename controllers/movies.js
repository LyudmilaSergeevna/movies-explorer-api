const movieModel = require('../models/movie');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const UnauthorizedAccessError = require('../errors/UnauthorizedAccessError');
const ForbiddenError = require('../errors/ForbiddenError');

function readAllMovies(req, res, next) {
  const userId = req.user._id;
  if (!userId) {
    throw new UnauthorizedAccessError('Необходима авторизация.');
  }
  return movieModel.find({ owner: userId })
    .then((movies) => res.send(movies))
    .catch(next);
}

function createMovie(req, res, next) {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  return movieModel.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    owner: req.user._id,
    movieId,
  })
    .then((movie) => res.status(201).send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError({ message: err.message }));
        return;
      }
      next(err);
    });
}

function deleteMovie(req, res, next) {
  const { movieId } = req.params;
  movieModel.findById(movieId)
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError('Фильм с указанным _id не найден.');
      }
      if (req.user._id === movie.owner.toString()) {
        return movieModel.findByIdAndDelete(movieId)
          .then(() => res.status(200).send(movie));
      }
      throw new ForbiddenError('Вы не можете удалять чужие фильмы.');
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError({ message: err.message }));
        return;
      }
      next(err);
    });
}

module.exports = {
  readAllMovies,
  createMovie,
  deleteMovie,
};
