// Imports
const AWS = require('aws-sdk');
const cfParams = require('./cloudfront-parameters');

AWS.config.update({ region: 'us-east-1' });

// Declare local variables
const cf = new AWS.CloudFront();

createDistribution('hamster-bucket-dysonlu')
.then(data => console.log(data));

function createDistribution (bucketName) {
  const params = {
    DistributionConfig: {
      CallerReference: `${Date.now()}`,
      Comment: 'HBFL CloudFront Distribution',
      DefaultCacheBehavior: cfParams.defaultCacheBehavior(bucketName),
      Origins: cfParams.origins(bucketName),
      HttpVersion: 'http2',
      PriceClass: 'PriceClass_100',
      IsIPV6Enabled: true,
      Enabled: true,
    },
  };

  return cf.createDistribution(params).promise();
}
