// Imports
const AWS = require('aws-sdk')

AWS.config.update({ region: 'us-east-1' });

// Declare local variables
const apiG = new AWS.APIGateway();
const apiName = 'hamster-api'

let apiData

createRestApi(apiName)
.then((data) => {
  apiData = data
  return getRootResource(apiData)
})
.then(rootResourceId => createResource(rootResourceId, 'hbfl', apiData))
.then(hbflResourceId => createResourceMethod(hbflResourceId, 'GET', apiData))
.then(hbflResourceId => createMethodIntegration(hbflResourceId, 'GET', apiData))
.then(hbflResourceId => createResource(hbflResourceId, '{proxy+}', apiData))
.then(proxyResourceId => createResourceMethod(proxyResourceId, 'ANY', apiData, 'proxy'))
.then(proxyResourceId => createMethodIntegration(proxyResourceId, 'ANY', apiData, 'proxy'))
.then(data => console.log(data))

function createRestApi (apiName) {
  const params = {
    name: apiName,
  };

  return apiG.createRestApi(params).promise();
}

async function getRootResource (api) {
  const params = {
    restApiId: api.id,
  };

  const resources = await apiG.getResources(params).promise();
  const root = resources.items.find(r => r.path === '/');
  return root.id;
}

async function createResource (parentResourceId, resourcePath, api) {
  const params = {
    parentId: parentResourceId,
    pathPart: resourcePath,
    restApiId: api.id,
  };

  const resource = await apiG.createResource(params).promise();
  return resource.id;
}

async function createResourceMethod (resourceId, method, api, path) {
  const params = {
    authorizationType: 'NONE',
    httpMethod: method,
    resourceId,
    restApiId: api.id,
  };

  await apiG.putMethod(params).promise();
  return resourceId;
}

async function createMethodIntegration (resourceId, method, api, path) {
  const params = {
    httpMethod: method,
    resourceId,
    restApiId: api.id,
    integrationHttpMethod: method,
    type: 'HTTP_PROXY',
    uri: 'http://hamsterELB-1102130463.us-east-1.elb.amazonaws.com',
  };

  await apiG.putIntegration(params).promise();
  return resourceId;
}
