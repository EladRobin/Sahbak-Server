const Item = require('../models/Item');

exports.getItems = async (req, res) => {
  try {
    const items = await Item.find({});
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching items' });
  }
};

exports.createItem = async (req, res) => {
  try {
    const { name, idNumber, item, sn } = req.body;
    if (!name || !idNumber || !item || !sn) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const newItem = new Item({ name, idNumber, item, sn });
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(500).json({ message: 'Error creating item' });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, idNumber, item, sn } = req.body;
    if (!name || !idNumber || !item || !sn) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const updatedItem = await Item.findByIdAndUpdate(id, { name, idNumber, item, sn }, { new: true });
    if (!updatedItem) return res.status(404).json({ message: 'Item not found' });

    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ message: 'Error updating item' });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Item.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting item' });
  }
};
exports.getItemsCountByType = async (req, res) => {
  try {
    const result = await Item.aggregate([
      {
        $group: {
          _id: "$item", // קיבוץ לפי סוג הפריט
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          count: 1
        }
      }
    ]);

    res.json(result);
  } catch (err) {
    console.error("Aggregation error:", err);
    res.status(500).json({ message: "שגיאה באחזור פילוח פריטים" });
  }
};
exports.getDefectiveItems = async (req, res) => {
  try {
    const defectiveItems = await Item.find({ status: 'defective' });
    res.json(defectiveItems);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching defective items' });
  }
};
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, idNumber, item, sn, status } = req.body;
    if (!name || !idNumber || !item || !sn) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      id,
      { name, idNumber, item, sn, status }, 
      { new: true }
    );
    if (!updatedItem) return res.status(404).json({ message: 'Item not found' });

    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ message: 'Error updating item' });
  }
};
exports.markItemAsDefective = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findById(id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const now = new Date();
    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    if (!item.signatureDate || item.signatureDate < monthAgo) {
      return res.status(400).json({ message: 'חתימה אינה בתוקף, אנא חתום מחדש.' });
    }

    item.status = 'defective';
    await item.save();

    res.json(item);
  } catch (err) {
    console.error("Error marking item defective:", err);
    res.status(500).json({ message: "Error marking item defective" });
  }
};

