// Imports
// TODO: Import the aws-sdk
const AWS = require('aws-sdk');

// TODO: Configure region
AWS.config.update({ region: 'us-east-1' });

// Declare local variables
// TODO: Create an ec2 object
const ec2 = new AWS.EC2();

createImage('i-08ee978b9167ba0f7', 'hamsterImage')
.then((data) => console.log('Complete: ', data))

function createImage (seedInstanceId, imageName) {
    // TODO: Implement AMI creation
    const params = {
        InstanceId: seedInstanceId,
        Name: imageName,
    };

    return new Promise((resolve, reject) => {
        ec2.createImage(params, (err, data) => {
            if (err) { reject(err); return; }
            else { resolve(data); return; }
        });
    });
}
