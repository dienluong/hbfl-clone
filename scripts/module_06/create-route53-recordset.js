// Imports
const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });

// Declare local variables
const route53 = new AWS.Route53();
const hzId = '/hostedzone/Z038537416BN8JVXRMZFY';

createRecordSet(hzId)
.then(data => console.log(data));

function createRecordSet (hzId) {
  const params = {
    HostedZoneId: hzId,
    ChangeBatch: {
      Changes: [
        {
          Action: 'CREATE',
          ResourceRecordSet: {
            Name: 'hbfl.online',
            Type: 'A',  // Alias routing
            AliasTarget: {
              DNSName: 'hamsterELB-1102130463.us-east-1.elb.amazonaws.com', //DNS name of our Elastic Load Balancer
              EvaluateTargetHealth: false,
              HostedZoneId: 'Z35SXDOTRQ7X7K',  // Load Balancer's hosted zone ID as found in https://docs.aws.amazon.com/general/latest/gr/elb.html
            },
          },
        },
      ],
    },
  };

  return route53.changeResourceRecordSets(params).promise();
}
