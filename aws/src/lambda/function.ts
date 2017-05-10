import { Lambda } from 'aws-sdk';
import uuid = require('uuid/v4');
import * as winston from 'winston';
import zipdir = require('zip-dir');

const zip = (dir, filter) => new Promise<Buffer>((res, rej) => {
  zipdir(dir, { filter }, (err, buffer) => {
    if (err) {
      return rej(err);
    }
    return res(buffer);
  });
});

const dynamoAccessToRole = (access: 'ro' | 'rw' | 'none') => {
  switch (access) {
    case 'ro':
      return 'arn:aws:iam::812374064424:role/aws-lambda-and-dynamo-ro';
    case 'rw':
      return 'arn:aws:iam::812374064424:role/aws-lambda-and-dynamo-rw';
    case 'none':
      return 'arn:aws:iam::812374064424:role/lambda_basic_execution';
    default:
      throw new Error(`wrong dynamo access "${access}"`);
  }
};

const ensureLambda = async ({ name, handler, environment, dynamoAccess, zipFile }) => {
  const lambda = new Lambda({ apiVersion: '2015-03-31' });

  const role = dynamoAccessToRole(dynamoAccess);
  const params = {
    FunctionName: name,
    Role: role,
    Handler: handler,
    Environment: {
      Variables: environment
    },
    Runtime: 'nodejs6.10'
  };

  try {
    const response = await lambda.createFunction({
      ...params,
      Timeout: 10,
      Code: {
        ZipFile: zipFile
      }
    })
      .promise();

    winston.debug(`function: createFunction`, response);

    return response;
  } catch (e) {
    if (e.code !== 'ResourceConflictException') {
      throw e;
    }
    const func = await lambda.updateFunctionCode({
      FunctionName: name,
      ZipFile: zipFile,
      Publish: true
    })
      .promise();

    winston.debug(`function: updateFunctionCode`, func);

    const config = await lambda.updateFunctionConfiguration({
      FunctionName: name,
      ...params
    })
      .promise();

    winston.debug(`function: updateFunctionConfiguration`, config);

    return func;
  }
};

const permitLambdaCallFromApiGateway = async ({ func }) => {
  const lambda = new Lambda({ apiVersion: '2015-03-31' });

  const permission = await lambda.addPermission({
    FunctionName: func.FunctionArn,
    StatementId: uuid(),
    Action: 'lambda:InvokeFunction',
    Principal: 'apigateway.amazonaws.com'
  })
    .promise();

  winston.debug(`function: addPermission`, permission);
};

export const ensureFunction = async ({
  name,
  codeDirectory,
  codeFilter,
  handler,
  environment,
  dynamoAccess = 'none',
  withApiGateway = false
}) => {
  const zipFile = await zip(codeDirectory, codeFilter);
  const lambda = await ensureLambda({ name, handler, environment, dynamoAccess, zipFile });

  if (withApiGateway) {
    await permitLambdaCallFromApiGateway({ func: lambda });
  }

  return lambda;
};

export const pruneFunctions = async (filter = (_func: Lambda.FunctionConfiguration) => false) => {
  const lambda = new Lambda({ apiVersion: '2015-03-31' });

  const listResponse = await lambda.listFunctions()
    .promise();

  winston.debug(`pruneFunctions: functions`, listResponse.Functions);

  const promises = listResponse.Functions
    .filter(filter)
    .map((func) =>
      lambda.deleteFunction({ FunctionName: func.FunctionName })
        .promise()
    );

  await Promise.all(promises);
};
