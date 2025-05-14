import sqlite3 from 'sqlite3';
import path from 'path';

const dbConfig = {
  movies: path.resolve(process.cwd(), process.env.DB_PATH || 'src/db/movies.db'),
  ratings: path.resolve(process.cwd(), process.env.RATINGS_DB_PATH || 'src/db/ratings.db')
};

export const moviesDb = new sqlite3.Database(dbConfig.movies);
export const ratingsDb = new sqlite3.Database(dbConfig.ratings);
