const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types - extended list
  const allowedTypes = /jpeg|jpg|png|gif|bmp|webp|svg|pdf|doc|docx|xls|xlsx|csv|ppt|pptx|txt|rtf|zip|rar|7z|tar\.gz|fig|sketch|xd|ai|psd|tiff?|mp3|wav|ogg|mp4|webm|mov|avi|json|xml|html?|css|js|jsx|ts|tsx|py|java|cpp|c|h|hpp|php|rb|go|rs|swift|kt|dart|sql|sqlite|db|mdb|accdb|pem|p12|crt|key|ppk|pub|env|gitignore|dockerfile|md|markdown|log|dmg|exe|msi|apk|ipa|torrent|epub|mobi|azw3|odt|ods|odp|odg|odf|wpd|wps|pages|numbers|keynote|heic|heif|3gp|3g2|m4v|m4a|aac|flac|alac|wma|wmv|flv|swf|m4p|m4b|m4r|aiff|aif|aifc|eot|otf|ttf|woff|woff2|ics|vcf|ics|vcf|ics|vcf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, documents, and design files are allowed.'));
  }
};

// Upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: fileFilter
});

module.exports = upload;
