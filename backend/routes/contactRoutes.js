const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const contactController = require('../controllers/contactController');

const router = express.Router();

// Validation rules
const contactValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('message').trim().notEmpty().withMessage('Message is required')
];

// Public route
router.post('/', contactValidation, contactController.createContact);

// Protected route
router.get('/', protect, contactController.getContacts);

module.exports = router;
