const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });

const sqs = new AWS.SQS();

async function push (queueName, msg) {
  const params = {
    QueueName: queueName,
  };

  const queueUrl = (await sqs.getQueueUrl(params).promise()).QueueUrl;
  const msgParams = {
    MessageBody: JSON.stringify(msg),
    QueueUrl: queueUrl,
  };

  return sqs.sendMessage(msgParams).promise();
}

module.exports = { push };
