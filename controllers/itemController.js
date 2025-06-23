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
