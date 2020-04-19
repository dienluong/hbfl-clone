// Imports
const AWS = require('aws-sdk')

AWS.config.update({ region: 'us-east-1' });

// Declare local variables
const autoScaling = new AWS.AutoScaling();
const asgName = 'hamsterASG';
const lcName = 'hamsterLC';
const policyName = 'hamsterPolicy';
const tgArn = 'arn:aws:elasticloadbalancing:us-east-1:206615147391:targetgroup/hamsterTG/5cf54b65ac2771d7';

createAutoScalingGroup(asgName, lcName)
.then(() => createASGPolicy(asgName, policyName))
.then((data) => console.log(data));

function createAutoScalingGroup (asgName, lcName) {
  const params = {
    AutoScalingGroupName: asgName,
    AvailabilityZones: [
      'us-east-1c',
      'us-east-1d'
    ],
    TargetGroupARNs: [
      tgArn,
    ],
    LaunchConfigurationName: lcName,
    MaxSize: 2,
    MinSize: 1,
  };

  return new Promise((resolve, reject) => {
    autoScaling.createAutoScalingGroup(params, (err, data) => {
      if (err) { reject(err); return;}
      else { resolve(data); return;}
    });
  });
}

function createASGPolicy (asgName, policyName) {
  const params = {
    AdjustmentType: 'ChangeInCapacity',
    AutoScalingGroupName: asgName,
    PolicyName: policyName,
    PolicyType: 'TargetTrackingScaling',
    TargetTrackingConfiguration: {
      TargetValue: 5,
      PredefinedMetricSpecification: {
        PredefinedMetricType: 'ASGAverageCPUUtilization',
      }
    }
  };

  return new Promise((resolve, reject) => {
    autoScaling.putScalingPolicy(params, (err, data) => {
      if (err) { reject(err); return; }
      else { resolve(data); return; }
    });
  });
}
