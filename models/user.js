const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { errorMessage } = require('../utils/error-messages');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  avatar: {
    type: String,
    required: true,
    validate: {
      validator(value) {
        return validator.isURL(value);
      },
      message: 'You must enter a valid URL',
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator(value) {
        return validator.isEmail(value);
      },
      message: 'You must enter a valid email',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  hiddenDefaultItems: { type: [String], default: [] },
});

userSchema.statics.findUserByCredentials = function findUserByCredentials(
  email,
  password
) {
  return this.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error(errorMessage.incorrectEmailOrPassword));
      }
      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          return Promise.reject(
            new Error(errorMessage.incorrectEmailOrPassword)
          );
        }
        return user;
      });
    });
};

module.exports = mongoose.model('user', userSchema);
