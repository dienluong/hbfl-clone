const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });

const sns = new AWS.SNS();
const TOPIC_ARN = 'arn:aws:sns:us-east-1:206615147391:hamster-topic';

function publish (msg) {
  const params = {
    Message: msg,
    TopicArn: TOPIC_ARN,
  };

  return sns.publish(params).promise();
}

module.exports = { publish };
