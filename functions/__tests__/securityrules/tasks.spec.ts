import { resolve } from 'path';
import { readFileSync } from 'fs';
import * as firebase from '@firebase/testing';
import { app as fbApp } from 'firebase';

import { TaskActivity, TaskStatus } from '../../../libs/models';

// Visualize Evaluation: http://localhost:4103/emulator/v1/projects/test-firestore-security-project:ruleCoverage.html
const TEST_FIREBASE_PROJECT_ID = 'test-firestore-security-project';

function initializeFirestoreTestAppWithUser(user?: any): firebase.firestore.Firestore {
  return firebase
      .initializeTestApp({
        projectId: TEST_FIREBASE_PROJECT_ID,
        auth: user ?
        {
          uid: user.id,
        } :
        undefined,
      })
      .firestore();
}

const testUser1 = {
  id: 'testUser-1',
};
const testUser2 = {
  id: 'testUser-2',
};
const testActivity: TaskActivity = {
  activityId: 'test-id',
  title: 'Test title',
  assignee: 'test-id',
  isCompleted: true,
};

describe('tasks collection', () => {
  let admin: fbApp.App;

  beforeAll((done) => {
    firebase
        .loadFirestoreRules({
          projectId: TEST_FIREBASE_PROJECT_ID,
          rules: readFileSync(resolve(__dirname, '../../../firestore.rules')).toString('utf-8'),
        })
        .then(() => {
          done();
        });
    admin = firebase.initializeAdminApp({
      projectId: TEST_FIREBASE_PROJECT_ID,
    });
  });

  afterAll(async () => {
    await admin.delete();
    await Promise.all(firebase.apps().map((app) => app.delete()));
  });

  function createTask(id: string, owner: any) {
    return admin.firestore().doc(`tasks/${id}`).set({
      id,
      title: 'test',
      owner,
    });
  }

  beforeEach(async () => {
    await createTask('task-id', testUser1);
  });

  it('any signedin user should be able to read tasks', async () => {
    const db = initializeFirestoreTestAppWithUser(testUser1);

    await firebase.assertSucceeds(
        db.doc('tasks/task-id').get(),
    );
  });

  it('any not-signedin user should NOT be able to read tasks', async () => {
    const db = initializeFirestoreTestAppWithUser();

    await firebase.assertFails(
        db.doc('tasks/task-id').get(),
    );
  });

  it('non-signedin users should NOT be allowed to update or delete tasks', async () => {
    const db = initializeFirestoreTestAppWithUser();

    await firebase.assertFails(
        db.doc('tasks/task-id').update({}),
    );
    await firebase.assertFails(
        db.doc('tasks/task-id').update({ status: TaskStatus.DONE }),
    );
    await firebase.assertFails(
        db.doc('tasks/task-id').delete(),
    );
  });

  it('non-owners should NOT be allowed to update or delete tasks (only exception is the status field and activities)', async () => {
    const db = initializeFirestoreTestAppWithUser(testUser2);

    await firebase.assertFails(
        db.doc('tasks/task-id').update({ title: 'i am not allowed' }),
    );
    await firebase.assertSucceeds(
        db.doc('tasks/task-id').update({ status: TaskStatus.DONE }),
    );
    await firebase.assertSucceeds(
        db.doc('tasks/task-id').update({ activities: [testActivity] }),
    );
    await firebase.assertFails(
        db.doc('tasks/task-id').update({ status: TaskStatus.DONE, title: 'i am not allowed' }),
    );
    await firebase.assertFails(
        db.doc('tasks/task-id').delete(),
    );
  });

  it('signedin users should be allowed to create tasks with themselves as the owner', async () => {
    const db = initializeFirestoreTestAppWithUser(testUser1);

    await firebase.assertSucceeds(
        db.doc('tasks/new-task-id').set({
          id: 'new-task-id',
          title: 'new task',
          owner: { id: testUser1.id },
        }),
    );
  });

  it('owners should be allowed to update or delete tasks', async () => {
    const db = initializeFirestoreTestAppWithUser(testUser1);

    await firebase.assertSucceeds(
        db.doc('tasks/task-id').update({}),
    );
    await firebase.assertSucceeds(
        db.doc('tasks/task-id').update({ status: TaskStatus.DONE }),
    );
    await firebase.assertSucceeds(
        db.doc('tasks/task-id').delete(),
    );
  });
});
