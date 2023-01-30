import { join } from "path";
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

import {
  AuthorizationType,
  LambdaIntegration,
  MethodOptions,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { GenericTable } from "./generic-table";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { AuthorizerWrapper } from "./auth/authorizer-wrapper";
import { Runtime } from "aws-cdk-lib/aws-lambda";

export class SpaceStack extends Stack {
  private api = new RestApi(this, "space-api");
  private authorizer: AuthorizerWrapper;

  private table = new GenericTable(this, {
    tableName: "spaces-table",
    primaryKey: "spaceId",
    createLambdaPath: "create",
    readLambdaPath: "read",
    updateLambdaPath: "update",
    deleteLambdaPath: "delete",
    secondaryIndexes: ["location"],
  });

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    this.authorizer = new AuthorizerWrapper(this, this.api);

    // const helloLambdaNodejs = new lambdaFunction(this, "helloLambdaNodejs", {
    //   runtime: Runtime.NODEJS_16_X,
    //   code: Code.fromAsset(
    //     join(__dirname, "..", "services", "node-lambda", "hello.ts")
    //   ),
    //   handler: "handler",
    // });

    const helloLambdaNodejs = new NodejsFunction(this, "helloLambdaNodejs", {
      runtime: Runtime.NODEJS_16_X,
      entry: join(__dirname, "..", "services", "node-lambda", "hello.ts"),
      handler: "handler",
    });

    const s3ListPolicy = new PolicyStatement();
    s3ListPolicy.addActions("s3:ListAllMyBuckets");
    s3ListPolicy.addResources("*");
    helloLambdaNodejs.addToRolePolicy(s3ListPolicy);

    const optionsWithAuthorizer: MethodOptions = {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: this.authorizer.authorizer.authorizerId,
      },
    };

    //Hello api lambda integration:
    const helloLambdaNodejsIntegration = new LambdaIntegration(
      helloLambdaNodejs
    );
    const helloLambdaNodejsResource = this.api.root.addResource("hello-nodejs");
    helloLambdaNodejsResource.addMethod(
      "GET",
      helloLambdaNodejsIntegration,
      optionsWithAuthorizer
    );

    // const helloLambdaIntegration = new LambdaIntegration(helloLambda);
    // const helloLambdaResource = this.api.root.addResource("hello");
    // helloLambdaResource.addMethod(
    //   "GET",
    //   helloLambdaIntegration,
    //   optionsWithAuthorizer
    // );

    //Spaces API Integration
    const spaceResource = this.api.root.addResource("spaces");
    spaceResource.addMethod("POST", this.table.createLambdaIntegration);
    spaceResource.addMethod("GET", this.table.readLambdaIntegration);
    spaceResource.addMethod("PUT", this.table.updateLambdaIntegration);
    spaceResource.addMethod("DELETE", this.table.updateLambdaIntegration);
  }
}
