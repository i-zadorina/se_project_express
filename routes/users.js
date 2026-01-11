const router = require('express').Router();
const {
  getCurrentUser,
  updateUser,
  hideDefaultItem,
  unhideDefaultItem,
} = require('../controllers/users');
const { validateUserUpdate } = require('../middlewares/validation');
const auth = require('../middlewares/auth');
const { uploadAvatar } = require('../middlewares/upload');
const {
  uploadAvatar: uploadAvatarController,
} = require('../controllers/users');

router.use(auth);

router.put('/me/hidden-default-items/:seedId', hideDefaultItem);
router.delete('/me/hidden-default-items/:seedId', unhideDefaultItem);

router.get('/me', getCurrentUser);
router.patch('/me', validateUserUpdate, updateUser);
router.post(
  '/me/avatar',
  uploadAvatar.single('avatar'),
  uploadAvatarController
);

module.exports = router;
