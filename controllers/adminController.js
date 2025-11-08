const User = require('../models/User');

// @desc    Get all users (admin only)
// @route   GET /api/admin/users
// @access  Private - Admin only
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('seller_id');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single user (admin only)
// @route   GET /api/admin/users/:id
// @access  Private - Admin only
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('seller_id');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user role (admin only)
// @route   PUT /api/admin/users/:id/role
// @access  Private - Admin only
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!role || !['visitor', 'seller', 'admin'].includes(role)) {
      return res.status(400).json({ 
        message: 'Please provide a valid role (visitor, seller, or admin)' 
      });
    }
    
    // Prevent changing own role from admin (safety measure)
    if (req.user._id.toString() === req.params.id && role !== 'admin') {
      return res.status(400).json({ 
        message: 'You cannot change your own role from admin' 
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password').populate('seller_id');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ 
      success: true, 
      data: user,
      message: `User role updated to ${role}` 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private - Admin only
const deleteUser = async (req, res) => {
  try {
    // Prevent deleting own account
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ 
        message: 'You cannot delete your own account' 
      });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await user.deleteOne();
    res.status(200).json({ 
      success: true, 
      data: {},
      message: 'User deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getUsers,
  getUser,
  updateUserRole,
  deleteUser,
};

