//  Import from packages
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Import middleware
const { errors } = require('celebrate');
const bodyParser = require('body-parser');
const { limiter } = require('./middlewares/limiter');
const errorHandler = require('./middlewares/error-handler');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const path = require('path');

// Server crash testing route
app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Server will crash now');
  }, 0);
});

app.get('/', (req, res) => res.send({ ok: true }));

//  Import routes index
const routes = require('./routes/index');

const { PORT = 3002, MONGODB_URI } = process.env;

//  Connect to database
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to DB');
  })
  .catch(console.error);

//  App's logic
app.use(bodyParser.json());

app.use(
  cors({
    origin: [
      'https://wtwr.net',
      'https://www.wtwr.net',
      'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.options('*', cors());

app.use(limiter);
app.use(requestLogger);
app.use(
  '/assets',
  express.static(path.join(__dirname, 'public/assets'), {
    maxAge: '365d',
    immutable: true,
  })
);

app.use('/', routes);

app.use(errorLogger); // enabling the error logger

app.use(errors()); // celebrate error handler

app.use(errorHandler); // centralized error handler

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
