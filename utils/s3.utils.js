const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'your-bucket-name';
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Upload a file to S3 or local storage
 * @param {Object} file - Multer file object
 * @returns {Promise<string>} - URL of the uploaded file
 */
const uploadToS3 = async (file) => {
  // If S3 is not configured, save to local storage
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    return saveToLocal(file);
  }

  const fileContent = fs.readFileSync(file.path);
  const key = `wireframes/${uuidv4()}${path.extname(file.originalname)}`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileContent,
    ContentType: file.mimetype,
    ACL: 'public-read',
  };

  try {
    const data = await s3.upload(params).promise();
    
    // Clean up the temporary file
    fs.unlinkSync(file.path);
    
    return data.Location;
  } catch (error) {
    console.error('Error uploading to S3, falling back to local storage:', error);
    return saveToLocal(file);
  }
};

/**
 * Save file to local storage (fallback)
 * @param {Object} file - Multer file object
 * @returns {string} - Relative URL of the saved file
 */
const saveToLocal = (file) => {
  try {
    const fileName = `${uuidv4()}${path.extname(file.originalname)}`;
    const filePath = path.join('uploads/wireframes', fileName);
    const fullPath = path.join(__dirname, '../../', filePath);
    
    // Ensure directory exists
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Move the file from temp to uploads directory
    fs.renameSync(file.path, fullPath);
    
    // Return relative URL
    return `/${filePath.replace(/\\/g, '/')}`; // Ensure forward slashes for URLs
  } catch (error) {
    console.error('Error saving file locally:', error);
    throw new Error('Failed to save file');
  }
};

/**
 * Delete a file from S3 or local storage
 * @param {string} fileUrl - URL or path of the file to delete
 * @returns {Promise<boolean>} - True if deletion was successful
 */
const deleteFromS3 = async (fileUrl) => {
  // If it's a local file path
  if (!fileUrl.startsWith('http')) {
    return deleteLocalFile(fileUrl);
  }

  try {
    // Extract the key from the URL
    const key = fileUrl.split(`.com/`).pop();
    
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error('Error deleting from S3, trying local:', error);
    return deleteLocalFile(fileUrl);
  }
};

/**
 * Delete a local file
 * @param {string} filePath - Path to the file
 * @returns {boolean} - True if deletion was successful
 */
const deleteLocalFile = (filePath) => {
  try {
    // If it's a URL path, convert to filesystem path
    const fsPath = filePath.startsWith('/')
      ? path.join(__dirname, '../..', filePath)
      : filePath;

    if (fs.existsSync(fsPath)) {
      fs.unlinkSync(fsPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting local file:', error);
    return false;
  }
};

module.exports = {
  uploadToS3,
  deleteFromS3,
};
