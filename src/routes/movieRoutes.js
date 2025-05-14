import express from 'express';
import {
  listMovies,
  getMovieDetailsById,
  getMoviesByYear,
  getMoviesByGenre
} from '../controllers/movieController.js';

const router = express.Router();

// Route for listing all movies
router.get('/', listMovies);

// Route for movie details by movieId
router.get('/:movieId', getMovieDetailsById);

// Route for movies by year
router.get('/year/:year', getMoviesByYear);

// Route for movies by genre
router.get('/genre/:genre', getMoviesByGenre);

export default router;
