// Imports
const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });

// Declare local variables
const sns = new AWS.SNS();
const type = 'sms';
const endpoint = '15145023925';
const topicArn = 'arn:aws:sns:us-east-1:206615147391:hamster-topic';

createSubscription(type, topicArn, endpoint)
.then(data => console.log(data));

function createSubscription (type, topicArn, endpoint) {
  const params = {
    Protocol: type,
    TopicArn: topicArn,
    Endpoint: endpoint,
  };

  return sns.subscribe(params).promise();
}
