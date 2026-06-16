const multer = require('multer');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;


// ============================================================
// PURPOSE: Handles file uploads by saving them temporarily to the server's disk.
// HOW IT WORKS:
//   1. Multer intercepts incoming multipart/form-data requests (file uploads).
//   2. The "storage" config tells multer WHERE to save files (uploads/ folder)
//      and HOW to name them (timestamp + original name, e.g., "1718000000-photo.jpg").
//   3. The temp file sits in uploads/ until it gets uploaded to Cloudinary,
//      then it is deleted (cleanup happens in ImageRoutes.js).
// ============================================================
