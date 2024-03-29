import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { HitCounter } from './hitcounter';
import { TableViewer } from 'cdk-dynamo-table-viewer';

export class CdkWorkshopStack extends cdk.Stack {
    public readonly hcViewerUrl: cdk.CfnOutput;
    public readonly hcEndpoint: cdk.CfnOutput;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const hello = new lambda.Function(this, 'HelloHandler', {
            runtime: lambda.Runtime.NODEJS_16_X,
            code: lambda.Code.fromAsset('lambda'),
            handler: 'hello.handler',
        });

        const helloWithCounter = new HitCounter(this, 'HelloHitCounter', {
            downstream: hello,
        });

        const gateway = new apigw.LambdaRestApi(this, 'Endpoint', {
            handler: helloWithCounter.handler,
        });

        const tv = new TableViewer(this, 'ViewHitCounter', {
            title: 'Hello Hits',
            table: helloWithCounter.table,
            sortBy: '-hits',
        });

        this.hcEndpoint = new cdk.CfnOutput(this, 'GatewayUrl', {
            value: gateway.url,
        });

        this.hcViewerUrl = new cdk.CfnOutput(this, 'TableViewerUrl', {
            value: tv.endpoint,
        });
    }
}
