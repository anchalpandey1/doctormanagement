import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

// Get the directory name from the module URL
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Multer to store files on disk
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Specify the directory where uploaded files will be stored
        const uploadDir = path.join(__dirname, '../../public/uploads');
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate a unique filename for the uploaded file
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const extname = path.extname(file.originalname).toLowerCase();
        cb(null, file.fieldname + '-' + uniqueSuffix + extname);
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 50MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        // const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
        const extname = allowedTypes.test(
            path.extname(file.originalname).toLowerCase()
        );
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images (jpeg, jpg, png) and PDFs are allowed'));
        }
    },
});

// Middleware to resize images using Sharp
const resizeImage = async (filePath, filename) => {

  try {
      // const filePath = req.file.path;
      const resizedFilePath = path.join(
          path.dirname(filePath),
          `resized-${filename}`
      );

      // Resize the image to a maximum width of 800px (maintaining aspect ratio)
      await sharp(filePath)
          .resize(800, 800, {
              fit: 'inside', // Maintain aspect ratio
              withoutEnlargement: true, // Don't enlarge images smaller than 800px
          })
          .toFormat('jpeg', { quality: 80 }) // Convert to JPEG with 80% quality
          .toFile(resizedFilePath);
        await fs.unlink(filePath);
        return resizedFilePath;
  } catch (error) {
      next(error);
  }
};

export { upload, resizeImage };