// Import express router
const router = require('express').Router();

// Import specific routers
const userRouter = require('./users');
const itemRouter = require('./clothingItems');

// Import controllers for signin/up
const { login, createUser } = require('../controllers/users');

// Import middlewares for validation
const {
  validateLogin,
  validateCreateUser,
} = require('../middlewares/validation');

// Import 404 error
const NotFoundError = require('../utils/errors/NotFoundError');

// Upload avatar
const { uploadAvatar } = require('../middlewares/upload');
router.post(
  '/signup',
  uploadAvatar.single('avatar'),
  validateCreateUser,
  createUser
);

// For known endpoints
router.post('/signin', validateLogin, login);

router.use('/items', itemRouter);
router.use('/users', userRouter);

// For unknown routes
router.use((req, res, next) => {
  console.log(req);
  next(new NotFoundError('Invalid route'));
});

module.exports = router;
