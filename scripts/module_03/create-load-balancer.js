// Imports
const AWS = require('aws-sdk');
const helpers = require('./helpers');

AWS.config.update({ region: 'us-east-1' });

// Declare local variables
// TODO: Create a new ELBv2 object
const elbv2 = new AWS.ELBv2();
const sgName = 'hamsterELBSG';
const tgName = 'hamsterTG';
const elbName = 'hamsterELB';
const vpcId = 'vpc-20ffff5a';
const subnets = [
  'subnet-0a931447',
  'subnet-50f5050f',
];

helpers.createSecurityGroup(sgName, 80)
.then((sgId) =>
  Promise.all([
    createTargetGroup(tgName),
    createLoadBalancer(elbName, sgId)
  ])
)
.then((results) => {
  const tgArn = results[0].TargetGroups[0].TargetGroupArn;
  const lbArn = results[1].LoadBalancers[0].LoadBalancerArn;
  console.log('Target Group Name ARN:', tgArn);
  return createListener(tgArn, lbArn)
})
.then((data) => console.log(data));

function createLoadBalancer (lbName, sgId) {
  const params = {
    Name: lbName,
    Subnets: subnets,
    SecurityGroups: [
      sgId,
    ]
  };

  return new Promise((resolve, reject) => {
    elbv2.createLoadBalancer(params, (err, data) => {
      if (err) { reject(err); return; }
      else { resolve(data); return; }
    });
  });
}

function createTargetGroup (tgName) {
  const params = {
    Name: tgName,
    Port: 3000,
    Protocol: 'HTTP',
    VpcId: vpcId
  };

  return new Promise((resolve, reject) => {
    elbv2.createTargetGroup(params, (err, data) => {
      if (err) reject(err);
      else resolve(data)
    })
  })
}

function createListener (tgArn, lbArn) {
  const params = {
    DefaultActions: [
      {
        TargetGroupArn: tgArn,
        Type: 'forward'
      }
    ],
    LoadBalancerArn: lbArn,
    Port: 80,
    Protocol: 'HTTP'
  };

  return new Promise((resolve, reject) => {
    elbv2.createListener(params, (err, data) => {
      if (err) reject(err);
      else resolve(data)
    })
  })
}
