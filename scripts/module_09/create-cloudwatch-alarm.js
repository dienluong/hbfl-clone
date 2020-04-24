// Imports
const AWS = require('aws-sdk');

AWS.config.update({ region: '/* TODO: Add your region */' });

// Declare local variables
const cw = new AWS.CloudWatch();
const alarmName = 'hamster-elb-alarm';
const topicArn = 'arn:aws:sns:us-east-1:206615147391:hamster-topic';
const tgArn = 'targetgroup/hamsterTG/5cf54b65ac2771d7';
const lbArn = 'app/hamsterELB/c25bd72297d2a301';

createCloudWatchAlarm(alarmName, topicArn, tgArn, lbArn)
.then(data => console.log(data));

function createCloudWatchAlarm (alarmName, topicArn, tg, lb) {
  const params = {
    AlarmName: alarmName,
    Namespace: 'AWS/ApplicationELB',
    MetricName: 'HealthyHostCount',
    ComparisonOperator: 'LessThanThreshold',
    Threshold: 1,
    EvaluationPeriods: 1,
    Period: 60,
    AlarmActions: [
      topicArn,
    ],
    Dimensions: [
      {
        Name: 'TargetGroup',
        Value: tg,
      },
      {
        Name: 'LoadBalancer',
        Value: lb,
      },
    ],
    Statistic: 'Average',
    TreatMissingData: 'breaching',
  };

  return cw.putMetricAlarm(params).promise();
}
