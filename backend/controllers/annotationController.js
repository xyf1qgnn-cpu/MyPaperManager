const Annotation = require('../models/Annotation');

// Create or Update an annotation
exports.upsertAnnotation = async (req, res) => {
  try {
    const { id, documentId, content, position, comment, type } = req.body;
    
    // Check if annotation exists
    let annotation = await Annotation.findOne({ id });

    if (annotation) {
      // Update existing
      annotation.content = content;
      annotation.position = position;
      annotation.comment = comment;
      annotation.type = type;
      annotation.documentId = documentId; // Ensure doc ID is consistent
      await annotation.save();
    } else {
      // Create new
      annotation = new Annotation({
        id,
        documentId,
        content,
        position,
        comment,
        type,
        user: req.user ? req.user._id : null
      });
      await annotation.save();
    }

    res.status(200).json(annotation);
  } catch (error) {
    console.error('Error saving annotation:', error);
    res.status(500).json({ message: 'Server error saving annotation' });
  }
};

// Get all annotations for a document
exports.getAnnotations = async (req, res) => {
  try {
    const { documentId } = req.params;
    const annotations = await Annotation.find({ documentId });
    res.status(200).json(annotations);
  } catch (error) {
    console.error('Error fetching annotations:', error);
    res.status(500).json({ message: 'Server error fetching annotations' });
  }
};

// Delete an annotation by its custom ID
exports.deleteAnnotation = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Annotation.findOneAndDelete({ id });
    
    if (!result) {
      return res.status(404).json({ message: 'Annotation not found' });
    }

    res.status(200).json({ message: 'Annotation deleted successfully' });
  } catch (error) {
    console.error('Error deleting annotation:', error);
    res.status(500).json({ message: 'Server error deleting annotation' });
  }
};
