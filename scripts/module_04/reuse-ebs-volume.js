// Imports
const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });

// Declare local variables
const ec2 = new AWS.EC2();
const volumeIdSrc = 'vol-0b8c08aee491a7d54';
const volumeIdDst = 'vol-0b7eb62a9dd986f6f';
const instanceId = 'i-065d2d948fda79340';

detachVolume(volumeIdSrc)
.then(() => stopInstance(instanceId))
.then(() => wait('instanceStopped', 'Instance', instanceId))
.then(() => detachVolume(volumeIdDst))
.then(() => wait('volumeAvailable', 'Volume', volumeIdDst))
.then(() => attachVolume(instanceId, volumeIdSrc))
.then(() => wait('volumeInUse', 'Volume', volumeIdSrc))
.then(() => startInstance(instanceId))
.catch((err) => console.log(err));

async function wait(state, resourceType, id) {
    return ec2.waitFor(state, { [`${resourceType}Ids`]: [id] }).promise();
}
function detachVolume (volumeId) {
  const params = {
    VolumeId: volumeId,
  };

  return new Promise((resolve, reject) => {
    ec2.detachVolume(params, (err, data) => {
      if (err) { reject(err); }
      else { resolve(data); }
    });
  })
}

function attachVolume (instanceId, volumeId) {
  const params = {
    VolumeId: volumeId,
    InstanceId: instanceId,
    Device: '/dev/xvda',
  };
  return new Promise((resolve, reject) => {
    ec2.attachVolume(params, (err, data) => {
      if (err) { reject(err); }
      else { resolve(data); }
    });
  })
}

function stopInstance(instanceId) {
  const params = {
    InstanceIds: [ instanceId ],
  };

  return new Promise((resolve, reject) => {
    ec2.stopInstances(params, (err, data) => {
      if (err) { reject(err) }
      else { resolve(data) }
    });
  });
}

function startInstance(instanceId) {
  const params = {
    InstanceIds: [ instanceId ],
  };

  return new Promise((resolve, reject) => {
    ec2.startInstances(params, (err, data) => {
      if (err) { reject(err); }
      else { resolve(data); }
    });
  });
}
