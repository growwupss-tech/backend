const Hero_Slides = require('../models/Hero_Slides');
const { deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get all hero slides
// @route   GET /api/hero-slides
// @access  Public
const getHeroSlides = async (req, res) => {
  try {
    const heroSlides = await Hero_Slides.find();
    res.status(200).json({ success: true, count: heroSlides.length, data: heroSlides });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single hero slide
// @route   GET /api/hero-slides/:id
// @access  Public
const getHeroSlide = async (req, res) => {
  try {
    const heroSlide = await Hero_Slides.findById(req.params.id);

    if (!heroSlide) {
      return res.status(404).json({ message: 'Hero slide not found' });
    }

    res.status(200).json({ success: true, data: heroSlide });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create hero slide
// @route   POST /api/hero-slides
// @access  Private
const createHeroSlide = async (req, res) => {
  try {
    // Use uploaded file URL or body image URL
    const imageUrl = req.file ? req.file.path : req.body.image;

    if (!imageUrl) {
      // Clean up uploaded file if validation fails
      if (req.file) {
        try {
          await deleteFromCloudinary(req.file.path);
        } catch (deleteError) {
          console.error('Error cleaning up uploaded file:', deleteError);
        }
      }
      return res.status(400).json({ message: 'Please provide an image' });
    }

    const heroSlideData = {
      ...req.body,
      image: imageUrl,
    };

    const heroSlide = await Hero_Slides.create(heroSlideData);
    res.status(201).json({ success: true, data: heroSlide });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await deleteFromCloudinary(req.file.path);
      } catch (deleteError) {
        console.error('Error cleaning up uploaded file:', deleteError);
      }
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update hero slide
// @route   PUT /api/hero-slides/:id
// @access  Private
const updateHeroSlide = async (req, res) => {
  try {
    const existingHeroSlide = await Hero_Slides.findById(req.params.id);

    if (!existingHeroSlide) {
      // Clean up uploaded file if hero slide doesn't exist
      if (req.file) {
        try {
          await deleteFromCloudinary(req.file.path);
        } catch (deleteError) {
          console.error('Error cleaning up uploaded file:', deleteError);
        }
      }
      return res.status(404).json({ message: 'Hero slide not found' });
    }

    // If new image is uploaded, delete old image
    if (req.file) {
      if (existingHeroSlide.image) {
        try {
          await deleteFromCloudinary(existingHeroSlide.image);
        } catch (deleteError) {
          console.error('Error deleting old image:', deleteError);
        }
      }
    }

    // Use uploaded file URL or keep existing or use body image URL
    const imageUrl = req.file ? req.file.path : (req.body.image || existingHeroSlide.image);

    const updateData = {
      ...req.body,
      image: imageUrl,
    };

    const heroSlide = await Hero_Slides.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: heroSlide });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await deleteFromCloudinary(req.file.path);
      } catch (deleteError) {
        console.error('Error cleaning up uploaded file:', deleteError);
      }
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete hero slide
// @route   DELETE /api/hero-slides/:id
// @access  Private
const deleteHeroSlide = async (req, res) => {
  try {
    const heroSlide = await Hero_Slides.findById(req.params.id);

    if (!heroSlide) {
      return res.status(404).json({ message: 'Hero slide not found' });
    }

    // Delete image from Cloudinary
    if (heroSlide.image) {
      try {
        await deleteFromCloudinary(heroSlide.image);
      } catch (deleteError) {
        console.error('Error deleting image from Cloudinary:', deleteError);
        // Continue with deletion even if Cloudinary deletion fails
      }
    }

    await heroSlide.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getHeroSlides,
  getHeroSlide,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
};

