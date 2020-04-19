// Imports
const AWS = require('aws-sdk');
const helpers = require('./helpers');

// Configure region
AWS.config.update({ region: 'us-east-1'});

// Declare local variables
const sgName = 'hamster_sg';
const keyName = 'hamster_key';
// Create an ec2 object
const ec2 = new AWS.EC2();

// Do all the things together
createSecurityGroup(sgName)
.then(() => {
  return createKeyPair(keyName)
})
.then(helpers.persistKeyPair)
.then(() => {
  return createInstance(sgName, keyName)
})
.then((data) => {
  console.log('Created instance with:', data)
})
.catch((err) => {
  console.error('Failed to create instance with:', err)
});

// Create functions
function createSecurityGroup (sgName) {
  return new Promise((resolve, reject) => {
    ec2.describeSecurityGroups({ GroupNames: [sgName] }, (err, data) => {
      if (err) { reject(err); return; }
      else {
        console.log('---> ', data);
        // return if sg already exists
        if (data.SecurityGroups.length) {
          resolve();
          return;
        }
        else {
          const sgParams = {
            Description: sgName,
            GroupName: sgName,
          };

          ec2.createSecurityGroup(sgParams, (err, sg) => {
            if (err) { reject(err); return; }
            else {
              // add rules to security group for SSH and app
              const ruleParams = {
                GroupId: sg.GroupId,
                IpPermissions: [
                  { IpProtocol: 'tcp', FromPort: '22', ToPort: '22', IpRanges: [{ CidrIp: '0.0.0.0/0' }] },
                  { IpProtocol: 'tcp', FromPort: '3000', ToPort: '3000', IpRanges: [{ CidrIp: '0.0.0.0/0' }] }
                ],
              };

              ec2.authorizeSecurityGroupIngress(ruleParams, err => {
                if (err) { reject(err); return; }
                else { resolve(); return; }
              });
            }
          });
        }
      }
    });
  })
}

function createKeyPair (keyName) {
  const params = {
    KeyName: keyName,
  };

  return new Promise((resolve, reject) => {
    ec2.describeKeyPairs({ KeyNames: [keyName] }, (err, data) => {
      if (err) { reject(err) }
      else {
        if (data.KeyPairs.length) {
          resolve(data.KeyPairs[0]);
        }
        else {
          ec2.createKeyPair(params, (err, data) => {
            if (err) { reject(err) }
            else { resolve(data) }
          });
        }
      }
    });
  });
}

function createInstance (sgName, keyName) {
  const params = {
    // AMI: Amazon Linux 2 AMI (HVM), SSD Volume Type
    ImageId: 'ami-0323c3dd2da7fb37d',
    InstanceType: 't2.micro',
    KeyName: keyName,
    MaxCount: 1,
    MinCount: 1,
    SecurityGroups: [
      sgName,
    ],
    // startup shell script in base64 encoding
    UserData: 'IyEvYmluL2Jhc2gNCmN1cmwgLS1zaWxlbnQgLS1sb2NhdGlvbiBodHRwczovL3JwbS5ub2Rlc291cmNlLmNvbS9zZXR1cF8xMi54IHwgc3VkbyBiYXNoIC0NCnN1ZG8geXVtIGluc3RhbGwgLXkgbm9kZWpzDQpzdWRvIHl1bSBpbnN0YWxsIC15IGdpdA0KZ2l0IGNsb25lIGh0dHBzOi8vZ2l0aHViLmNvbS9yeWFubXVyYWthbWkvaGJmbC5naXQNCmNkIGhiZmwNCm5wbSBpDQpucG0gcnVuIHN0YXJ0',
  };

  return new Promise((resolve, reject) => {
    ec2.runInstances(params, (err, data) => {
      if (err) { reject(err) }
      else { resolve(data) }
    });
  })
}
