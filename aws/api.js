

// I am trying to upload an image file (jpeg) to AWS S3 via the PUT interface, and I am getting the error SignatureDoesNotMatch.

// On my server, I have an Express node.js app with an endpoint to create a signed url.

// 'use strict';

// const express = require('express');
// const bodyParser = require('body-parser');

// const config = require('./config');

// // Load the AWS SDK for Node.js
// const AWS = require('aws-sdk');
// AWS.config.update({
//     accessKeyId: config.AWS_ACCESS_KEY_ID, 
//     secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
//     region: 'us-east-1'
// });
// const s3 = new AWS.S3();

// const app = express();
// const awsS3Router = express.Router();

// // parse application/json
// app.use(bodyParser.urlencoded({extended: false}));
// app.use(bodyParser.json());

// // AWS S3 REST endpoints
// awsS3Router.get('/getImageDrop', function(req, res) {
//     if(!req.query.filename) {
//         res.status(400).send('Request query is empty!');
//     }
//     const s3Params = {
//         Bucket: config.S3_BUCKET,
//         ContentType: 'image/jpeg',
//         ACL: 'public-read',
//         Key: req.query.filename,
//         Expires: 6000
//     };
//     s3.getSignedUrl('putObject', s3Params, function(err, data) {
//         if(err){
//             console.error('ERROR: ' + err);
//             return res.end();
//         }
//         const returnData = {
//             signedRequest: data,
//             url: 'https://' + config.S3_BUCKET + '.s3.amazonaws.com/' + req.query.filename
//         };
//         app.locals.s3SignedUrl = returnData.signedRequest;
//         res.write(JSON.stringify(returnData));
//         res.end();
//     });
// });
// app.use('/aws/s3', awsS3Router);

// module.exports = app;

// Expand snippet

// On the client side, I can call this endpoint and get a signed S3 url back. The response url format is: https://[bucket name].s3.amazonaws.com/878CF5A4-D013-435F-BF7D-F45AB69E580F.jpg?AWSAccessKeyId=[AWS access key]&Content-Type=image%2Fjpeg&Expires=1521244920&Signature=[Signature]&x-amz-acl=public-read

// The client code has a function to upload the file to the signed S3 url.

// async uploadImageToS3BucketAsync(imageFileUri, fileSize, signedUrl) {
//         const fileName = PathParse(imageFileUri).base;
//         let form = new FormData();
//         form.append('files[0]', {
//             'uri': imageFileUri,
//             'name': fileName,
//             'type': 'image/jpeg'
//         });
//         //form.append('photo', imageFileUri);
//         console.info('INFO: PUT ' + signedUrl.signedRequest + ': Request: ' + JSON.stringify(form));
//     	return fetch((signedUrl.signedRequest), {
//     		method: 'PUT',
//             headers: { 'Content-Type': 'image/jpeg', 'Content-Length': fileSize },
//             body: form
//     	})
//     	    .then(function(res) {
//                 if (res.ok) {
//                     console.info('INFO: PUT ' + JSON.stringify(signedUrl) + ': Response: ' + JSON.stringify(res));
//                     return res.json();
//                 } else {
//                     console.error('Failed to upload image to S3 bucket!');
//                     console.error('ERROR: ' + JSON.stringify(res));
//                     alert('Failed to upload image to S3 bucket!!');
//                 }
//             })
//             .catch(function(err) {
//                 console.error('ERROR: Request failed', err);
//             });
//     }