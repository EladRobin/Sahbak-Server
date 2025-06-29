const express = require('express');
const router = express.Router();
const { authenticateToken, checkAdmin } = require('../middleware/authMiddleware');
const itemController = require('../controllers/itemController');
const Item = require('../models/Item'); // ⬅️ אל תשכח את זה

router.get('/', authenticateToken, itemController.getItems);
router.get('/count-by-type', authenticateToken, itemController.getItemsCountByType);
router.post('/', authenticateToken, itemController.createItem);
router.put('/:id', authenticateToken, itemController.updateItem);
router.delete('/:id', authenticateToken, checkAdmin, itemController.deleteItem); // מחיקה רק לאדמין
router.put('/:id/mark-defective', authenticateToken, checkAdmin, itemController.markItemAsDefective);


router.post('/:id/sign', async (req, res) => {
  try {
    const { signature } = req.body;
    if (!signature) return res.status(400).json({ message: 'לא התקבלה חתימה' });

    const now = new Date();

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { signature, signatureDate: now },
      { new: true }
    );

    if (!item) return res.status(404).json({ message: 'פריט לא נמצא' });

    res.json(item);
  } catch (err) {
    console.error('Error saving item signature:', err);
    res.status(500).json({ message: 'שגיאה בשמירת חתימה' });
  }
});



// ציוד לא כשיר - רק אדמין
router.get('/defective', authenticateToken, checkAdmin, itemController.getDefectiveItems);

module.exports = router;
