import { moviesDb, ratingsDb } from '../db/config/db.js';
import { formatBudget, validateYear, validateInteger } from '../shared/helpers.js';

// Promise async/await DB helper methods
const allAsync = (db, query, params = []) =>
  new Promise((resolve, reject) =>
    db.all(query, params, (err, rows) => (err ? reject(err) : resolve(rows)))
  );

const getAsync = (db, query, params = []) =>
  new Promise((resolve, reject) =>
    db.get(query, params, (err, row) => (err ? reject(err) : resolve(row)))
  );

// Constants
const PAGE_SIZE = 50;

// List all movies 
export const listMovies = async (req, res, next) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const offset = (page - 1) * PAGE_SIZE;

  const query = `
    SELECT imdbId, title, genres, releaseDate, budget
    FROM movies
    LIMIT ? OFFSET ?
  `;

  try {
    const rows = await allAsync(moviesDb, query, [PAGE_SIZE, offset]);
    rows.forEach(row => row.budget = formatBudget(row.budget));
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
};

// Get Movie Details by movieId
export const getMovieDetailsById = async (req, res, next) => {
  const movieId = req.params.movieId;
  if (!validateInteger(movieId)) {
    return res.status(400).json({ error: 'Invalid movieId. It should be a positive integer.' });
  }

  const movieQuery = `
    SELECT movieId, imdbId, title, overview, releaseDate, budget, runtime, language,
           genres, productionCompanies, status
    FROM movies
    WHERE movieId = ?
  `;

  try {
    const movieRow = await getAsync(moviesDb, movieQuery, [movieId]);
    if (!movieRow) return res.status(404).json({ error: 'Movie not found' });

    const ratingsQuery = `
      SELECT AVG(rating) AS avgRating
      FROM ratings
      WHERE movieId = ?
    `;
    const ratingRow = await getAsync(ratingsDb, ratingsQuery, [movieId]);
    movieRow.rating = ratingRow && ratingRow.avgRating !== null
      ? parseFloat(ratingRow.avgRating.toFixed(2))
      : null;

    movieRow.budget = formatBudget(movieRow.budget);

    res.status(200).json(movieRow);
  } catch (err) {
    next(err);
  }
};

// Movies by Year 
export const getMoviesByYear = async (req, res, next) => {
  const year = req.params.year;
  if (!validateYear(year)) {
    return res.status(400).json({ error: 'Invalid year. It should be a 4-digit number between 1900 and 2099.' });
  }

  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const offset = (page - 1) * PAGE_SIZE;
  const sortOrder = req.query.sort === 'desc' ? 'DESC' : 'ASC';

  const query = `
    SELECT imdbId, title, genres, releaseDate, budget
    FROM movies
    WHERE releaseDate BETWEEN ? AND ?
    ORDER BY releaseDate ${sortOrder}
    LIMIT ? OFFSET ?
  `;

  try {
    const rows = await allAsync(
      moviesDb,
      query,
      [`${year}-01-01`, `${year}-12-31`, PAGE_SIZE, offset]
    );
    rows.forEach(row => row.budget = formatBudget(row.budget));
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
};

// Movies by Genre
export const getMoviesByGenre = async (req, res, next) => {
  const genre = req.params.genre;
  if (!genre || !isNaN(genre)) {
    return res.status(400).json({ error: 'Invalid genre. It should be a string.' });
  }

  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const offset = (page - 1) * PAGE_SIZE;

  const query = `
    SELECT imdbId, title, genres, releaseDate, budget
    FROM movies
    WHERE LOWER(genres) LIKE ?
    LIMIT ? OFFSET ?
  `;

  try {
    const rows = await allAsync(
      moviesDb,
      query,
      [`%${genre.toLowerCase()}%`, PAGE_SIZE, offset]
    );
    rows.forEach(row => row.budget = formatBudget(row.budget));
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
};
