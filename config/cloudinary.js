const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create storage configuration for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'site-snap',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'webm'],
    resource_type: 'auto', // Automatically detect image or video
  },
});

// Helper function to delete file from Cloudinary
const deleteFromCloudinary = async (urlOrPublicId) => {
  try {
    if (!urlOrPublicId) {
      return { result: 'not found' };
    }

    let public_id = urlOrPublicId;
    
    // If it's a Cloudinary URL, extract public_id
    if (urlOrPublicId.includes('cloudinary.com')) {
      try {
        // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{transformation}/{version}/{public_id}.{format}
        // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/site-snap/example.jpg
        
        const url = new URL(urlOrPublicId);
        const pathParts = url.pathname.split('/');
        
        // Find 'upload' in path
        const uploadIndex = pathParts.indexOf('upload');
        
        if (uploadIndex !== -1 && pathParts.length > uploadIndex + 1) {
          // Get everything after 'upload' (skipping transformation params and version)
          // Usually: ['', 'image', 'upload', 'v1234567890', 'site-snap', 'filename.jpg']
          const afterUpload = pathParts.slice(uploadIndex + 1);
          
          // Find version (starts with 'v') and public_id parts
          let versionIndex = -1;
          for (let i = 0; i < afterUpload.length; i++) {
            if (afterUpload[i].startsWith('v')) {
              versionIndex = i;
              break;
            }
          }
          
          if (versionIndex !== -1 && afterUpload.length > versionIndex + 1) {
            // Get public_id (everything after version)
            const publicIdParts = afterUpload.slice(versionIndex + 1);
            public_id = publicIdParts.join('/');
            
            // Remove file extension
            if (public_id.includes('.')) {
              public_id = public_id.substring(0, public_id.lastIndexOf('.'));
            }
          } else {
            // No version found, try last parts
            const lastPart = afterUpload[afterUpload.length - 1];
            if (lastPart.includes('.')) {
              public_id = lastPart.substring(0, lastPart.lastIndexOf('.'));
              // Check if folder name exists
              if (afterUpload.length > 1) {
                const folderIndex = afterUpload.length - 2;
                if (afterUpload[folderIndex] === 'site-snap') {
                  public_id = `site-snap/${public_id}`;
                }
              }
            }
          }
        }
        
        // If we still don't have a proper public_id, try simple extraction
        if (!public_id || public_id === urlOrPublicId) {
          const filename = pathParts[pathParts.length - 1];
          public_id = filename.substring(0, filename.lastIndexOf('.')) || filename;
          // Try to include folder if available
          if (pathParts.includes('site-snap')) {
            public_id = `site-snap/${public_id}`;
          }
        }
      } catch (parseError) {
        console.error('Error parsing Cloudinary URL:', parseError);
        // If parsing fails, try to extract filename directly
        const lastSlash = urlOrPublicId.lastIndexOf('/');
        const lastDot = urlOrPublicId.lastIndexOf('.');
        if (lastSlash !== -1 && lastDot !== -1 && lastDot > lastSlash) {
          public_id = urlOrPublicId.substring(lastSlash + 1, lastDot);
          // Check if site-snap is in the URL
          if (urlOrPublicId.includes('/site-snap/')) {
            public_id = `site-snap/${public_id}`;
          }
        } else {
          public_id = urlOrPublicId;
        }
      }
    }
    
    // If public_id doesn't start with folder, add it (if it's not already a full path)
    if (public_id && !public_id.startsWith('site-snap/') && !public_id.includes('/')) {
      public_id = `site-snap/${public_id}`;
    }
    
    // Attempt deletion with different resource types if needed
    let result = await cloudinary.uploader.destroy(public_id, {
      resource_type: 'image',
    });
    
    // If image deletion failed, try video
    if (result.result === 'not found') {
      result = await cloudinary.uploader.destroy(public_id, {
        resource_type: 'video',
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    // Don't throw - allow the operation to continue even if Cloudinary delete fails
    return { result: 'error', error: error.message };
  }
};

// Helper function to delete multiple files
const deleteMultipleFromCloudinary = async (publicIds) => {
  try {
    const results = await Promise.all(
      publicIds.map(async (publicId) => {
        try {
          return await deleteFromCloudinary(publicId);
        } catch (error) {
          console.error(`Error deleting ${publicId}:`, error);
          return null;
        }
      })
    );
    return results;
  } catch (error) {
    console.error('Error deleting multiple files:', error);
    throw error;
  }
};

// Helper function to extract public_id from Cloudinary URL
const extractPublicId = (url) => {
  if (!url) return null;
  
  try {
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1];
    const publicId = `site-snap/${filename.split('.')[0]}`;
    return publicId;
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
};

module.exports = {
  cloudinary,
  storage,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
  extractPublicId,
};

