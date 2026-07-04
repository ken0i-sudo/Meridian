const Contact = require('../models/Contact');
const { ErrorResponse } = require('../middleware/error');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
exports.createContact = async (req, res, next) => {
  try {
    const contact = await Contact.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: contact
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all contact submissions
// @route   GET /api/contact
// @access  Private (Admin only would be better, but Private is fine for now)
exports.getContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find().sort('-createdAt');

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (err) {
    next(err);
  }
};
