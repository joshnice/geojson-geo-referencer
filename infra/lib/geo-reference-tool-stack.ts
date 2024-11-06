import * as cdk from 'aws-cdk-lib';
import { Distribution, OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway';
import { BucketAccessControl } from 'aws-cdk-lib/aws-s3';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Function as LambdaFunction, Runtime, Code } from "aws-cdk-lib/aws-lambda";
import type { Construct } from 'constructs';
import * as path from "node:path";

const name = "geo-reference-tool";

export class GeoReferenceToolStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Bucket
    const frontendBuildBucket = new Bucket(this, `${name}-frontend-build-bucket`, {
      accessControl: BucketAccessControl.PRIVATE,
      bucketName: `${name}-frontend-build-bucket`
    });


    const googleMapsApiBucket = new Bucket(this, `${name}-google-maps-api-bucket`, {
      accessControl: BucketAccessControl.PRIVATE,
      bucketName: `${name}-google-maps-api-bucket`
    });

    const originAccessIdentity = new OriginAccessIdentity(this, `${name}-origin-access-identity`);
    frontendBuildBucket.grantRead(originAccessIdentity);

    new Distribution(this, `${name}-cloudfront-distribution`, {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new S3Origin(frontendBuildBucket, { originAccessIdentity }),
      },
    });

    const apiLambdaFunction = new LambdaFunction(this, `${name}-lambda-fn`, {
      functionName: `${name}-lambda-fn`,
      runtime: Runtime.NODEJS_LATEST,
      handler: 'index.handler',
      code: Code.fromAsset(path.join(__dirname, '../../api/dist')),
    });

    const api = new LambdaRestApi(this, `${name}-api-gateway`, {
      handler: apiLambdaFunction,
      restApiName: "google-maps",
      deploy: true,
      deployOptions: {
        stageName: "api",
      },
    });

    googleMapsApiBucket.grantReadWrite(apiLambdaFunction);
  }
}
