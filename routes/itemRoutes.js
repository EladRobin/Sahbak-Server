const express = require('express');
const router = express.Router();
const { authenticateToken, checkAdmin } = require('../middleware/authMiddleware');
const itemController = require('../controllers/itemController');

router.get('/', authenticateToken, itemController.getItems);
router.get('/count-by-type', authenticateToken, itemController.getItemsCountByType);
router.post('/', authenticateToken, itemController.createItem);
router.put('/:id', authenticateToken, itemController.updateItem);
router.delete('/:id', authenticateToken, checkAdmin, itemController.deleteItem); // מחיקה רק לאדמין

// ציוד לא כשיר - רק אדמין
router.get('/defective', authenticateToken, checkAdmin, itemController.getDefectiveItems);

module.exports = router;
