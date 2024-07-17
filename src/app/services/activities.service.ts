import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { collection, doc, updateDoc, Firestore, collectionData, arrayUnion, arrayRemove } from '@angular/fire/firestore';
import { Task, TaskActivity, TaskModel } from '@firetasks/models';
import { Observable, catchError, first, map, of, switchMap, } from 'rxjs';

export interface IUserActivities {
  title: string,
  id: string,
  activities: TaskActivity[]
}

@Injectable({
  providedIn: 'root'
})
export class ActivitiesService {

  constructor(private firestore: Firestore, private auth: AngularFireAuth,) { }

  readonly userActivities$ = this.auth.authState.pipe(
      first(),
      switchMap(user => this.getActivitiesForUser(user?.uid || '')
      )
    )

  getActivitiesForUser(userId: string): Observable<IUserActivities[]> {
    return collectionData(collection(this.firestore, 'tasks')).pipe(
        map(data => data.map((item) => TaskModel.fromFirestore(item))),
        map(tasks => this.groupActivities(tasks, userId)),
        catchError((error) => {
          console.error(`Error fetching activities for user ${userId}:`, error);
          return of([]);
        })
      )
  }

  private groupActivities(tasks: Task[], assignee: string): IUserActivities[] {
    return tasks.map(task => {
      const filteredActivities = task.activities?.filter(activity => activity.assignee === assignee);
      return {
        title: task.title,
        id: task.id,
        activities: filteredActivities || [],
      };
    }).filter(task => task.activities ? task.activities.length > 0 : []);
  }

  addActivity(taskId: string, activity: TaskActivity): Promise<void> {
    let taskRef = taskId ? doc(this.firestore, `tasks/${taskId}`) : doc(collection(this.firestore, 'tasks'));
    taskId = taskId || taskRef.id;
    return updateDoc(taskRef, {
      activities: arrayUnion(activity)
    });
  }

  updateActivity(taskId: string, activities: TaskActivity[]): Promise<void> {
    const taskRef = doc(this.firestore, `tasks/${taskId}`);
    return updateDoc(taskRef, { activities: activities });
  }

  deleteActivity(taskId: string, activity: TaskActivity): Promise<void> {
    const taskRef = doc(this.firestore, `tasks/${taskId}`);
    return updateDoc(taskRef, {
      activities: arrayRemove(activity)
    });
  }
}
