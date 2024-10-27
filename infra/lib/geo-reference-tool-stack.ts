import * as cdk from 'aws-cdk-lib';
import { Distribution, OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { BucketAccessControl } from 'aws-cdk-lib/aws-s3';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import type { Construct } from 'constructs';

const name = "geo-reference-tool";

export class GeoReferenceToolStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Bucket
    const frontendBuildBucket = new Bucket(this, `${name}-frontend-build-bucket`, {
      accessControl: BucketAccessControl.PRIVATE,
      bucketName: `${name}-frontend-build-bucket`
    });

    const originAccessIdentity = new OriginAccessIdentity(this, `${name}-origin-access-identity`);
    frontendBuildBucket.grantRead(originAccessIdentity);

    new Distribution(this, `${name}-cloudfront-distribution`, {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new S3Origin(frontendBuildBucket, { originAccessIdentity }),
      },
    });
  }
}
