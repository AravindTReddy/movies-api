# Movies API

## Overview

A RESTful API built with Node.js, Express, and SQLite for querying movie data and ratings.  
Features include paginated movie listings, detailed movie info, filtering by year or genre, and input validation.

## Prerequisites

- **Node.js** (v18 or later recommended)
- **npm** (https://www.npmjs.com/)

## Setup

1. **Clone or download** this repository.

2. **Install dependencies:**
``` npm install ```

## Running the Application

**Start the Server** 
``` npm start ```

You should see output like:

Server running on port 3000

Server will start on [http://localhost:3000](http://localhost:3000) by default.

## Features

- **List All Movies:** Paginated (50 per page), includes IMDb ID, title, genres, release date, and budget (formatted in dollars).
- **Movie Details:** Get full details for a movie by ID, including average rating from users.
- **Movies by Year:** List all movies released in a given year, paginated and sortable by date.
- **Movies by Genre:** List all movies matching a genre, paginated.
- **Security:** Uses Helmet and rate limiting.
- **Health Check:** `/health` endpoint for uptime monitoring.

## Testing

- Tests are located in the `tests/` directory.
- Run tests with:
    ```
    npm test
    ```

