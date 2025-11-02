const Attributes = require('../models/Attributes');

// @desc    Get all attributes
// @route   GET /api/attributes
// @access  Public
const getAttributes = async (req, res) => {
  try {
    const attributes = await Attributes.find();
    res.status(200).json({ success: true, count: attributes.length, data: attributes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single attribute
// @route   GET /api/attributes/:id
// @access  Public
const getAttribute = async (req, res) => {
  try {
    const attribute = await Attributes.findById(req.params.id);

    if (!attribute) {
      return res.status(404).json({ message: 'Attribute not found' });
    }

    res.status(200).json({ success: true, data: attribute });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create attribute
// @route   POST /api/attributes
// @access  Private
const createAttribute = async (req, res) => {
  try {
    const attribute = await Attributes.create(req.body);
    res.status(201).json({ success: true, data: attribute });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update attribute
// @route   PUT /api/attributes/:id
// @access  Private
const updateAttribute = async (req, res) => {
  try {
    const attribute = await Attributes.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!attribute) {
      return res.status(404).json({ message: 'Attribute not found' });
    }

    res.status(200).json({ success: true, data: attribute });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete attribute
// @route   DELETE /api/attributes/:id
// @access  Private
const deleteAttribute = async (req, res) => {
  try {
    const attribute = await Attributes.findById(req.params.id);

    if (!attribute) {
      return res.status(404).json({ message: 'Attribute not found' });
    }

    await attribute.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAttributes,
  getAttribute,
  createAttribute,
  updateAttribute,
  deleteAttribute,
};

