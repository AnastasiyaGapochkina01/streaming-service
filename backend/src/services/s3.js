const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  endpoint: process.env.S3_ENDPOINT,
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  s3ForcePathStyle: true,
  signatureVersion: 'v4'
});

const uploadToS3 = (fileBuffer, fileName, mimetype) => {
  return s3.upload({
    Bucket: process.env.S3_BUCKET,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimetype,
    ACL: 'public-read' // Adjust based on your security requirements
  }).promise();
};

const checkS3Connection = async () => {
  try {
    await s3.headBucket({ Bucket: process.env.S3_BUCKET }).promise();
    return true;
  } catch (error) {
    throw new Error(`S3 connection failed: ${error.message}`);
  }
};

const generatePresignedUrl = (fileName, operation = 'getObject', expires = 3600) => {
  return s3.getSignedUrl(operation, {
    Bucket: process.env.S3_BUCKET,
    Key: fileName,
    Expires: expires
  });
};

module.exports = { 
  uploadToS3, 
  checkS3Connection, 
  generatePresignedUrl 
};
