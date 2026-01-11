const multer = require('multer');

const uploadAvatar = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(
      file.mimetype
    );
    cb(ok ? null : new Error('Only jpg/png/webp allowed'), ok);
  },
});

module.exports = { uploadAvatar };
