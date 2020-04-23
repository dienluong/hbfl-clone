// Imports
const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });

// Declare local variables
const s3 = new AWS.S3();

configureS3Site('hamster-bucket-dysonlu')
.then(data => console.log(data));

function configureS3Site (bucketName) {
  const params = {
    Bucket: bucketName,
    WebsiteConfiguration: {
      IndexDocument: {
        Suffix: 'index.html',
      },
    },
  };

  return s3.putBucketWebsite(params).promise();
}
