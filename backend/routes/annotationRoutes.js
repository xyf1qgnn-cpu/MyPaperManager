const express = require('express');
const router = express.Router();
const annotationController = require('../controllers/annotationController');
const { protect } = require('../middleware/auth'); // Optional: depending on if we require auth

// We can choose to protect these routes or not. Given the context, we likely want auth.
// However, the prompt didn't explicitly mention auth for these specific endpoints, but the system has auth.
// I will use `auth` middleware if available (it is in `../middleware/auth`).

// Upsert (Create/Update)
router.post('/', protect, annotationController.upsertAnnotation);

// Get by Document ID
router.get('/:documentId', protect, annotationController.getAnnotations);

// Delete by ID
router.delete('/:id', protect, annotationController.deleteAnnotation);

module.exports = router;
