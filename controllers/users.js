// Import hash encryption and validation packages
const bcrypt = require('bcryptjs');
const validator = require('validator');

// Import token handler and signature key
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../utils/config');

// Import schema and customized errors
const User = require('../models/user');
const { errorMessage } = require('../utils/error-messages');
const BadRequestError = require('../utils/errors/BadRequestError');
const NotFoundError = require('../utils/errors/NotFoundError');
const UnauthorizedError = require('../utils/errors/UnauthorizedError');
const ConflictError = require('../utils/errors/ConflictError');

const path = require('path');
const fs = require('fs/promises');
const sharp = require('sharp');

const BASE_URL = (process.env.BASE_URL || '').replace(/\/+$/, '');

async function saveAvatarLocal(userId, buffer) {
  const outDir = path.join(__dirname, '..', 'public', 'assets', 'avatars');
  await fs.mkdir(outDir, { recursive: true });

  const fileName = `${userId}.webp`;
  const outPath = path.join(outDir, fileName);

  const out = await sharp(buffer)
    .rotate()
    .resize(256, 256, { fit: 'cover' })
    .webp({ quality: 75 })
    .toBuffer();

  await fs.writeFile(outPath, out);

  return `${BASE_URL}/assets/avatars/${fileName}?v=${Date.now()}`;
}

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file?.buffer) {
      throw new BadRequestError('No file buffer');
    }

    const outDir = path.join(__dirname, '..', 'public', 'assets', 'avatars');
    await fs.mkdir(outDir, { recursive: true });

    const fileName = `${req.user._id}.webp`;
    const outPath = path.join(outDir, fileName);

    const out = await sharp(req.file.buffer)
      .rotate()
      .resize(256, 256, { fit: 'cover' })
      .webp({ quality: 75 })
      .toBuffer();

    await fs.writeFile(outPath, out);

    const avatarUrl = await saveAvatarLocal(req.user._id, req.file.buffer);

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    );

    return res.send({ data: updatedUser });
  } catch (err) {
    console.error('UPLOAD AVATAR ERROR:', err);
    return next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!password) throw new BadRequestError('Invalid data');

    const hash = await bcrypt.hash(password, 10);

    let user = await User.create({ name, email, password: hash });

    if (req.file?.buffer) {
      const avatarUrl = await saveAvatarLocal(user._id, req.file.buffer);
      user = await User.findByIdAndUpdate(
        user._id,
        { avatar: avatarUrl },
        { new: true }
      );
    }

    return res.send({
      name: user.name,
      avatar: user.avatar,
      email: user.email,
    });
  } catch (err) {
    if (err.name === 'MongoServerError') {
      next(new ConflictError('User with this email already exists'));
    } else if (err.name === 'ValidationError') {
      next(new BadRequestError(err.message));
    } else {
      next(err);
    }
  }
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError('Invalid data');
  }
  if (!validator.isEmail(email)) {
    throw new BadRequestError(errorMessage.invalidEmail);
  }
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: '7d',
      });
      return res.send({ token });
    })
    .catch((err) => {
      if (err.message === 'Incorrect email or password') {
        next(new UnauthorizedError('Authentication error'));
      } else {
        next(err);
      }
    });
};

const getCurrentUser = (req, res, next) => {
  const userId = req.user._id;
  User.findById(userId)
    .orFail()
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      console.error(err);
      if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError({ message: errorMessage.NotFoundError }));
      } else if (err.name === 'CastError' || err.name === 'ValidationError') {
        next(new BadRequestError({ message: errorMessage.BadRequestError }));
      } else {
        next(err);
      }
    });
};

const updateUser = (req, res, next) => {
  User.findByIdAndUpdate(
    req.user._id,
    { name: req.body.name },
    {
      new: true,
      runValidators: true,
    }
  )
    .orFail(() => new Error('DocumentNotFoundError'))
    .then((updatedUser) => res.send({ data: updatedUser }))
    .catch((err) => {
      console.error(err);
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        next(new BadRequestError({ message: errorMessage.validationError }));
      } else if (err.message === 'DocumentNotFoundError') {
        next(new NotFoundError({ message: errorMessage.NotFoundError }));
      } else {
        next(err);
      }
    });
};

const hideDefaultItem = (req, res, next) => {
  const { seedId } = req.params;

  User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { hiddenDefaultItems: seedId } },
    { new: true }
  )
    .then((user) => res.send({ data: user }))
    .catch(next);
};

const unhideDefaultItem = (req, res, next) => {
  const { seedId } = req.params;

  User.findByIdAndUpdate(
    req.user._id,
    { $pull: { hiddenDefaultItems: seedId } },
    { new: true }
  )
    .then((user) => res.send({ data: user }))
    .catch(next);
};

module.exports = {
  getCurrentUser,
  updateUser,
  uploadAvatar,
  createUser,
  login,
  hideDefaultItem,
  unhideDefaultItem,
};
