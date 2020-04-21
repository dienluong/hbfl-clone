// Imports
const AWS = require('aws-sdk')

AWS.config.update({ region: 'us-east-1' });

// Declare local variables
const route53 = new AWS.Route53();
const hzName = 'hbfl.online';

createHostedZone(hzName)
.then(data => console.log(data))

function createHostedZone (hzName) {
  const params = {
    Name: hzName,
    CallerReference: `${Date.now()}`,
  };

  return route53.createHostedZone(params).promise();
}
