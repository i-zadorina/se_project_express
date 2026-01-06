const router = require('express').Router();
const {
  getCurrentUser,
  updateUser,
  hideDefaultItem,
  unhideDefaultItem,
} = require('../controllers/users');
const { validateUserUpdate } = require('../middlewares/validation');
const auth = require('../middlewares/auth');

router.use(auth);

router.put('/me/hidden-default-items/:seedId', hideDefaultItem);
router.delete('/me/hidden-default-items/:seedId', unhideDefaultItem);

router.get('/me', getCurrentUser);
router.patch('/me', validateUserUpdate, updateUser);

module.exports = router;
