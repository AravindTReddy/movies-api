import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as movieController from '../src/controllers/movieController.js';
import { moviesDb, ratingsDb } from '../src/db/config/db.js';
import * as helpers from '../src/shared/helpers.js';

vi.mock('../src/db/config/db.js', () => ({
  moviesDb: {
    all: vi.fn(),
    get: vi.fn(),
  },
  ratingsDb: {
    all: vi.fn(),
    get: vi.fn(),
  },
}));

vi.mock('../src/shared/helpers.js', () => ({
  formatBudget: vi.fn((amount) => `$${Number(amount).toLocaleString('en-US')}`),
  validateYear: vi.fn((year) => /^(19|20)\d{2}$/.test(year)),
  validateInteger: vi.fn((val) => /^\d+$/.test(val)),
}));

describe('movieController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // List Movies
  it('should list all movies', async () => {
    const req = { query: { page: 1 } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    const mockRows = [
      { imdbId: 'tt1', title: 'A', genres: 'Action', releaseDate: '2020-01-01', budget: 1000 },
      { imdbId: 'tt2', title: 'B', genres: 'Drama', releaseDate: '2020-02-01', budget: 2000 },
    ];

    moviesDb.all.mockImplementation((q, p, cb) => cb(null, mockRows));

    await movieController.listMovies(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      { ...mockRows[0], budget: '$1,000' },
      { ...mockRows[1], budget: '$2,000' },
    ]);
  });

  // Movie Details
  it('should return movie details and rating', async () => {
    helpers.validateInteger.mockReturnValue(true);
    const req = { params: { movieId: '1' } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    const mockMovie = {
      movieId: 1, imdbId: 'tt1', title: 'A', overview: 'desc', releaseDate: '2020-01-01',
      budget: 1000, runtime: 120, language: 'en', genres: 'Action', productionCompanies: 'PC', status: 'Released'
    };
    const mockRating = { avgRating: 7.5 };

    moviesDb.get.mockImplementationOnce((q, p, cb) => cb(null, mockMovie));
    ratingsDb.get.mockImplementationOnce((q, p, cb) => cb(null, mockRating));

    await movieController.getMovieDetailsById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      ...mockMovie,
      rating: 7.5,
      budget: '$1,000',
    });
  });

  it('should return 404 if movie not found', async () => {
    helpers.validateInteger.mockReturnValue(true);
    const req = { params: { movieId: '999' } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    moviesDb.get.mockImplementationOnce((q, p, cb) => cb(null, undefined));

    await movieController.getMovieDetailsById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Movie not found' });
  });

  it('should return 400 for invalid movieId', async () => {
    helpers.validateInteger.mockReturnValue(false);
    const req = { params: { movieId: 'abc' } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    await movieController.getMovieDetailsById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid movieId. It should be a positive integer.' });
  });

  // Movies by Year
  it('should return movies by year', async () => {
    helpers.validateYear.mockReturnValue(true);
    const req = { params: { year: '2020' }, query: { page: 1 } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    const mockRows = [
      { imdbId: 'tt1', title: 'A', genres: 'Action', releaseDate: '2020-01-01', budget: 1000 },
    ];
    moviesDb.all.mockImplementation((q, p, cb) => cb(null, mockRows));

    await movieController.getMoviesByYear(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      { ...mockRows[0], budget: '$1,000' },
    ]);
  });

  it('should return 400 for invalid year', async () => {
    helpers.validateYear.mockReturnValue(false);
    const req = { params: { year: 'abcd' }, query: { page: 1 } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    await movieController.getMoviesByYear(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid year. It should be a 4-digit number between 1900 and 2099.' });
  });

  // Movies by Genre
  it('should return movies by genre', async () => {
    const req = { params: { genre: 'Action' }, query: { page: 1 } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    const mockRows = [
      { imdbId: 'tt1', title: 'A', genres: 'Action', releaseDate: '2020-01-01', budget: 1000 },
    ];
    moviesDb.all.mockImplementation((q, p, cb) => cb(null, mockRows));

    await movieController.getMoviesByGenre(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      { ...mockRows[0], budget: '$1,000' },
    ]);
  });

  it('should return 400 for invalid genre', async () => {
    const req = { params: { genre: '1234' }, query: { page: 1 } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    await movieController.getMoviesByGenre(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid genre. It should be a string.' });
  });

  // Error handling: when DB throws error, next is called
  it('should call next on DB error in listMovies', async () => {
    const req = { query: { page: 1 } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    moviesDb.all.mockImplementation((q, p, cb) => cb(new Error('DB error')));

    await movieController.listMovies(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
