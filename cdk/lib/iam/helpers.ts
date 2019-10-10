import cdk = require('@aws-cdk/core');
import { Microservice } from "../Microservice";
import { LambdaInvokePolicy } from "./LambdaInvokePolicy";

export function grantLambdaInvocationPolicyToMicroservices(stack: cdk.Stack, stackMicroservices: Microservice[]) {
    const policy = createInvocationPolicy(stack, stackMicroservices);
    stackMicroservices.forEach((microservice) => {
        microservice.addLambdaInvokePolicy(policy);
    });
}

function createInvocationPolicy(stack: cdk.Stack, microservices: Microservice[]): LambdaInvokePolicy {
    return new LambdaInvokePolicy(stack, `lambda-invoke-${stack.stackName}`, {
        invokeStatementResources: getFunctionArnsFromMicroservices(microservices)
    });
}

function getFunctionArnsFromMicroservices(microservices: Microservice[]): string[] {
    const microserviceArns: string[] = []; 
    microservices.forEach((microservice ) => {
        microserviceArns.push(microservice.calculatedFunctionArn);
    });
    return microserviceArns;
}