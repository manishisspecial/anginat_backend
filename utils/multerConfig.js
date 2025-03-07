const multer = require("multer");

// Configure multer to use memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 2 * 1024 * 1024, // 2 MB limit
    },
    fileFilter: (req, file, cb) => {
  
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(file.originalname.toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true); // Accept the file
        } else {
            cb(new Error("Only .jpeg, .jpg, and .png files are allowed")); // Reject the file
        }
    },
});

module.exports = upload;
