// Imports
const AWS = require('aws-sdk');
const helpers = require('./helpers');

// Configure region
AWS.config.update({ region: 'us-east-1'});

// Declare local variables
const sgName = 'hamster_sg_bitnami';
const keyName = 'hamster_key_bitnami';
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
      if (err) {
        if (err.code === 'InvalidGroup.NotFound') {
          const sgParams = {
            Description: sgName,
            GroupName: sgName,
          };

          ec2.createSecurityGroup(sgParams, (err, sg) => {
            if (err) { reject(err); return; }
            else {
              console.log('SG created. Adding rules.');
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
        else {
          console.log('descSG: ', err);
          reject(err);
          return;
        }
      }
      else {
        console.log('---> ', data);
        // return if sg already exists
        if (data.SecurityGroups.length) {
          resolve();
          return;
        }
        else {
          reject(data);
          return;
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
      if (err) {
        if (err.code === 'InvalidKeyPair.NotFound') {
          ec2.createKeyPair(params, (err, data) => {
            if (err) { reject(err); return; }
            else { resolve(data); return; }
          });
        }
        else {
          reject(err); return;
        }
      }
      else {
        if (data.KeyPairs.length) {
          resolve(data.KeyPairs[0]); return;
        }
        else {
          reject(data); return;
        }
      }
    });
  });
}

function createInstance (sgName, keyName) {
  const params = {
    ImageId: 'ami-003bca6d67e11b3c7',
    InstanceType: 't2.micro',
    KeyName: keyName,
    MaxCount: 1,
    MinCount: 1,
    SecurityGroups: [
      sgName,
    ],
    // startup shell script in base64 encoding
    UserData: 'IyEvYmluL2Jhc2gNCnN1ZG8gYXB0LWdldCB1cGRhdGUNCnN1ZG8gYXB0LWdldCAteSBpbnN0YWxsIGdpdA0KZ2l0IGNsb25lIGh0dHBzOi8vZ2l0aHViLmNvbS9yeWFubXVyYWthbWkvaGJmbC5naXQgL2hvbWUvYml0bmFtaS9oYmZsDQpjaG93biAtUiBiaXRuYW1pOiAvaG9tZS9iaXRuYW1pL2hiZmwNCmNkIC9ob21lL2JpdG5hbWkvaGJmbA0Kc3VkbyBucG0gaQ0Kc3VkbyBucG0gcnVuIHN0YXJ0',
  };

  return new Promise((resolve, reject) => {
    ec2.runInstances(params, (err, data) => {
      if (err) { reject(err) }
      else { resolve(data) }
    });
  })
}
