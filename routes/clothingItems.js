const router = require('express').Router();
const optionalAuth = require('../middlewares/optionalAuth');

// Import controllers
const {
  getItems,
  createItem,
  deleteItem,
  updateItem,
  likeItem,
  dislikeItem,
} = require('../controllers/clothingItems');

// Import middlewares
const auth = require('../middlewares/auth');
const {
  validateCreateItem,
  validateItemId,
} = require('../middlewares/validation');

router.get('/', optionalAuth, getItems);
router.use(auth);

router.post('/', validateCreateItem, createItem);
router.put('/:itemId', validateItemId, updateItem);
router.delete('/:itemId', validateItemId, deleteItem);
router.put('/:itemId/likes', validateItemId, likeItem);
router.delete('/:itemId/likes', validateItemId, dislikeItem);

module.exports = router;
