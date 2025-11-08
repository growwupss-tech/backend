const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUserRole,
  deleteUser,
} = require('../controllers/adminController');
const { protect, isAdmin } = require('../middleware/auth');

// All admin routes require admin role
// IMPORTANT: More specific routes must come before less specific ones
router.get('/users', protect, isAdmin, getUsers);
router.put('/users/:id/role', protect, isAdmin, updateUserRole); // Must come before /users/:id
router.get('/users/:id', protect, isAdmin, getUser);
router.delete('/users/:id', protect, isAdmin, deleteUser);

module.exports = router;

