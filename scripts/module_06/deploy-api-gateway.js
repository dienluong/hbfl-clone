// Imports
const AWS = require('aws-sdk')

AWS.config.update({ region: 'us-east-1' });

// Declare local variables
const apiG = new AWS.APIGateway()
const apiId = 'idakzjpz36';

createDeployment(apiId, 'prod')
.then(data => console.log(data))

function createDeployment (apiId, stageName) {
  const params = {
    restApiId: apiId,
    stageName,
  };

  return apiG.createDeployment(params).promise();
}
