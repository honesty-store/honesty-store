import { ECS } from 'aws-sdk';
import { ensureListener } from '../elbv2/listener';
import { ensureLoadBalancer } from '../elbv2/loadbalancer';
import { ensureTargetGroup } from '../elbv2/targetgroup';
import { ensureRule } from '../elbv2/rule';
import { templateJSON } from '../template';
import { ensureTaskDefinition, pruneTaskDefinitions } from '../ecs/taskDefinition';
import pushImage from '../ecr/push';
import { createHash } from 'crypto';
import { ensureService } from '../ecs/service';
import { ensureTable } from '../dynamodb/table';
import { ensureAlias } from '../route53/alias';
import * as winston from 'winston';

export const prefix = 'hs';
export const defaultTargetGroupDir = 'web';
export const role = 'arn:aws:iam::812374064424:role/ecs-service-role';
export const cluster = 'test-cluster';

const config = {
    web: {
        loadBalancer: { pathPattern: '/*', priority: 10 }
    },
    api: {
        loadBalancer: { pathPattern: '/api/*', priority: 1 }
    },
    transaction: {
        database: true,
        loadBalancer: { pathPattern: '/transaction/*', priority: 3 },
        taskRoleArn: 'arn:aws:iam::812374064424:role/dynamo-db-role'
    },
    user: {
        database: true,
        loadBalancer: { pathPattern: '/user/*', priority: 4 },
        taskRoleArn: 'arn:aws:iam::812374064424:role/dynamo-db-role'
    },
};

const ensureDatabase = async ({ branch, dir }) => {
    const { config, data } = await templateJSON({
        type: 'table',
        name: dir,
        data: { }
    });
    return await ensureTable({
        config: {
            ...config,
            TableName: `${prefix}-${branch}-${dir}`
        },
        data
    });
};

// TODO: doesn't remove resources left over when a dir is deleted until the branch is deleted
export default async ({ branch, dir }) => {
    const loadBalancer = await ensureLoadBalancer({
        name: `${prefix}-${branch}`
    });
    await ensureAlias({
        name: branch,
        value: loadBalancer.DNSName
    });
    const defaultTargetGroup = await ensureTargetGroup({
        name: `${prefix}-${branch}-${defaultTargetGroupDir}`
    });
    const listener = await ensureListener({
        loadBalancerArn: loadBalancer.LoadBalancerArn,
        defaultTargetGroupArn: defaultTargetGroup.TargetGroupArn
    });
    const targetGroup = await ensureTargetGroup({
        name: `${prefix}-${branch}-${dir}`
    });
    const rule = await ensureRule({
        listenerArn: listener.ListenerArn,
        targetGroupArn: targetGroup.TargetGroupArn,
        pathPattern: config[dir].loadBalancer.pathPattern,
        priority: config[dir].loadBalancer.priority
    });
    const image = await pushImage({
        imageName: dir,
        repositoryName: `${prefix}-${branch}-${dir}`,
        tag: 'latest'
    });
    const db = config[dir].database ? await ensureDatabase({ branch, dir }) : {};
    // TODO: create bespoke roles
    const containerDefinitions: ECS.ContainerDefinitions = await templateJSON({
        type: 'containerDefinition',
        name: dir,
        data: {
            image,
            tableName: db.TableName
        }
    });
    const taskDefinition = await ensureTaskDefinition({
        family: `${prefix}-${branch}-${dir}`,
        containerDefinitions,
        taskRoleArn: config[dir].taskRoleArn
    });
    await pruneTaskDefinitions({
        filter: ({ family, revision }) => family === taskDefinition.family && revision !== taskDefinition.revision,
    });
    // For now assuming all tasks contain only one container with a port mapping which should be load balanced
    const service = await ensureService({
        serviceName: `${prefix}-${branch}-${dir}`,
        cluster,
        desiredCount: 1,
        taskDefinition: taskDefinition.taskDefinitionArn,
        loadBalancers: [
            {
                containerName: containerDefinitions[0].name,
                containerPort: containerDefinitions[0].portMappings[0].containerPort,
                targetGroupArn: targetGroup.TargetGroupArn
            }
        ],
        role
    });
    winston.info(`Deployed to https://${loadBalancer.DNSName}${rule.Conditions[0].Values[0]}.`);
};