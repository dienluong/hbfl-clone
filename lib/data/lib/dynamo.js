const AWS = require('aws-sdk')

AWS.config.update({ region: 'us-east-1' });

const client = new AWS.DynamoDB.DocumentClient()

function getAll (tableName) {
  const params = {
    TableName: tableName,
  };

  return new Promise((resolve, reject) => {
    client.scan(params, (err, data) => {
      if (err) { reject(err); }
      else { resolve(data.Items); }
    });
  });
}

async function get (tableName, id) {
  const params = {
    TableName: tableName,
    KeyConditionExpression: 'id = :hkey',
    ExpressionAttributeValues: {
      ':hkey': +id,
    },
  };

  const data = await client.query(params).promise();
  return data.Items[0];
}

function put (tableName, item) {
  const params = {
    TableName: tableName,
    Item: item
  }
  return new Promise((resolve, reject) => {
    client.put(params, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

module.exports = {
  get,
  getAll,
  put
}
