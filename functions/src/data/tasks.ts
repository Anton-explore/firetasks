import { Task, TaskActivity, TaskModel, TaskStatus } from '@firetasks/models';
import { pick } from 'lodash';
import { users } from './users';

export const tasks: Task[] = [
  new TaskModel({
    title: 'Design the solution',
    status: TaskStatus.DONE,
    activities: initActivity([
      'Identify resources to be monitored.',
      'Define users and workflow',
      'Identify event sources by resource type.',
      'Define the relationship between resources and business systems.',
      'Identify tasks and URLs by resource type.',
      'Define the server configuration.',
    ]),
    createdAt: new Date(2020, 0, 1),
  }),
  new TaskModel({
    title: 'Prepare for implementation',
    status: TaskStatus.DONE,
    activities: initActivity([
      'Identify the implementation team.',
      'Order the server hardware for production as well as test/quality assurance (QA).',
      'Order console machines.',
      'Order prerequisite software.',
      'Identify the test LPAR.',
      'Identify production LPARs.',
    ]),
    createdAt: new Date(2020, 0, 2),
  }),
  new TaskModel({
    title: 'Prepare the test/QA environment',
    status: TaskStatus.DONE,
    activities: initActivity([
      'Install test and QA servers and prerequisite software.',
      'Install console machines and prerequisite software.',
      'Verify connectivity from test and QA servers to test LPAR, Tivoli Enterprise Console(R) server, and console machines.',
    ]),
    createdAt: new Date(2020, 0, 3),
  }),
  new TaskModel({
    title: 'Install the product in the test/QA environment.',
    status: TaskStatus.IN_PROGRESS,
    activities: initActivity([
      'Install Tivoli Business Systems Manager and appropriate patches on test or QA servers.',
      'Install Tivoli Business Systems Manager on console machines.',
      'Install event enablement on the Tivoli Enterprise Console server.',
      'Install Tivoli Business Systems Manager and appropriate maintenance on the test LPAR.',
      'Create configuration level objects for the test LPAR.',
      'Configure servers, Source/390 on the test LPAR, event enablement on the Tivoli Enterprise Console server, and verify connectivity.',
    ]),
    createdAt: new Date(2020, 0, 4),
  }),
  new TaskModel({
    title: 'Implement distributed data feeds (this can be done in parallel with the Source/390 data feed implementation).',
    status: TaskStatus.IN_PROGRESS,
    activities: initActivity([
      'Extend the data model.',
      'Configure the instance placement.',
      'Configure the Tivoli Enterprise Console rules to send events.',
      'Associate tasks and URLs with object types.',
    ]),
    createdAt: new Date(2020, 0, 5),
  }),
  new TaskModel({
    title: 'Implement Source/390 data feeds on the test LPAR (this can be done in parallel with the distributed data feed implementation)',
    activities: initActivity([
      'Configure filtering, if appropriate.',
      'Perform discovery, if required.',
      'Configure the event source.',
      'Verify the event flow.',
    ]),
    createdAt: new Date(2020, 0, 6),
  }),
  new TaskModel({
    title: 'Implement a business system in the test/QA environment.',
    activities: initActivity([
      'Design a relatively simple business system.',
      'Create the Automated Business Systems configuration file and XML definitions for the business system.',
      'Test the Automated Business Systems file and XML definitions to verify resource inclusion and placement.',
    ]),
    createdAt: new Date(2020, 0, 7),
  }),
  new TaskModel({
    title: 'Schedule jobs',
    activities: initActivity([
      'Tivoli Business Systems Manager SQL server jobs',
      'Source/390 rediscoveries',
      'Batch schedule download/process',
      'Database backup and maintenance',
    ]),
    createdAt: new Date(2020, 0, 8),
  }),
  new TaskModel({
    title: 'Prepare the production environment.',
    activities: initActivity([
      'Install production servers and prerequisite software.',
      'Install console machines and prerequisite software.',
      'Verify connectivity from production servers to the production LPAR, Tivoli Enterprise Console server, and console machines.',
    ]),
    createdAt: new Date(2020, 0, 9),
  }),
  new TaskModel({
    title: 'Install the product in the production environment.',
    activities: initActivity([
      'Install Tivoli Business Systems Manager and appropriate patches on production servers.',
      'Install Tivoli Business Systems Manager on console machines.',
      'Install event enablement on the Tivoli Enterprise Console server.',
      'Install Tivoli Business Systems Manager and appropriate maintenance on the production LPARs.',
      'Create configuration level objects for the production LPARs.',
      'Configure servers, Source/390 on the production LPARs, event enablement on the Tivoli Enterprise Console server, and verify connectivity.',
    ]),
    createdAt: new Date(2020, 0, 10),
  }),
  new TaskModel({
    title: 'Implement distributed data feeds in the production environment.',
    activities: initActivity([
      'Extend the data model.',
      'Configure the instance placement.',
      'Configure the Tivoli Enterprise Console rule to send events.',
      'Associate tasks and URLs with object types.',
    ]),
    createdAt: new Date(2020, 0, 11),
  }),
  new TaskModel({
    title: 'Implement Source/390 data feeds in the production environment.',
    activities: initActivity([
      'Configure filtering, if appropriate.',
      'Perform discovery, if required.',
      'Configure the event source.',
      'Verify the event flow.',
    ]),
    createdAt: new Date(2020, 0, 12),
  }),
  new TaskModel({
    title: 'Implement a business system in the production environment.',
    activities: initActivity([
      'Create the Automated Business Systems configuration file and XML definitions for the business system.',
      'Test the Automated Business Systems file and XML definitions to verify resource inclusion and placement.',
    ]),
    createdAt: new Date(2020, 0, 13),
  }),
  new TaskModel({
    title: 'Install the history server.',
    activities: initActivity([
      'Create databases on the history server.',
      'Set up and test jobs on the database server to produce the database backup.',
      'Set up and test jobs to copy backup databases to the history server.',
      'Set up and test jobs to replicate events to the history server.',
    ]),
    createdAt: new Date(2020, 0, 14),
  }),
].map((task, i) => {
  task.id = `task_${i + 1}`;
  task.owner = pick(users[i % users.length], ['id', 'name']);
  return task;
});

// eslint-disable-next-line require-jsdoc
function initActivity(activities: string[]) {
  return activities.map((activity, i) => ({
    activityId: `activity_${i + 1}`,
    title: activity,
    isCompleted: false,
  }) as TaskActivity);
}
