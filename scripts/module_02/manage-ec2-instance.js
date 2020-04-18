// Imports
const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });

// Declare local variables
const ec2 = new AWS.EC2();

function listInstances () {
  return new Promise((resolve, reject) => {
    ec2.describeInstances({}, (err, data) => {
      if (err) { reject(err) }
      else {
        resolve(data.Reservations.reduce((p, c) => p.concat(c.Instances), []))
      }
    });
  });
}

function terminateInstance (instanceId) {
  const params = {
    InstanceIds: [
      instanceId,
    ]
  };

  return new Promise((resolve, reject) => {
    ec2.terminateInstances(params, (err, data) => {
      if (err) { reject(err) }
      else { resolve(data) }
    });
  });
}

listInstances()
.then(data => {
  console.log(data);
  const hamsterInstance = data.find(e => {
    return e.KeyName === 'hamster_key';
  });

  if (hamsterInstance) {
    terminateInstance(hamsterInstance.InstanceId)
    .then(data => console.log(data))
    .catch(err => console.log(err));
  }
});
