require("dotenv").config();
const S3 = require("aws-sdk/clients/s3");
const fs = require("fs");
const bucketName = process.env.S3_BUCKET;
const region = process.env.S3_REGION;
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
const s3 = new S3({  region,  accessKeyId,  secretAccessKey,});
function uploadFile(file) {  
    // console.log('upload file file=========================================',file);
    const fileStream = fs.createReadStream(file.path);  
    const uploadParams = {    
        Bucket: bucketName,    
        Body: fileStream,    
        Key: file.filename,  
    };
    return s3.upload(uploadParams).promise(); 
    // this will upload file to S3
}
module.exports = { uploadFile };
