const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authMiddleware');
const itemController = require('../controllers/itemController');

router.get('/', authenticateUser, itemController.getItems);
router.get('/count-by-type', authenticateUser, itemController.getItemsCountByType);
router.post('/', authenticateUser, itemController.createItem);
router.put('/:id', authenticateUser, itemController.updateItem);
router.delete('/:id', authenticateUser, itemController.deleteItem);

module.exports = router;
