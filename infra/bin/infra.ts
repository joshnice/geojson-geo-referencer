#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { GeoReferenceToolStack } from '../lib/geo-reference-tool-stack';

const app = new cdk.App();
new GeoReferenceToolStack(app, 'Geo-reference-tool', {});