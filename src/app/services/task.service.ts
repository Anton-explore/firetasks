import { groupBy, mapValues } from 'lodash';
import { Injectable } from '@angular/core';
import { Firestore, collectionData, collection, doc, setDoc, deleteDoc, updateDoc, } from '@angular/fire/firestore';
import { Task, TaskModel, TaskStatus } from '@firetasks/models';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

export interface TasksGrouped {
  [key: string]: TaskList;
}
export interface TaskList {
  label: string;
  status: string;
  order: number;
  tasks: TaskModel[];
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private firestore: Firestore) { }

  readonly taskLists$ = collectionData(collection(this.firestore, 'tasks')).pipe(
    map((data) => data.map((item) => TaskModel.fromFirestore(item))),
    map((tasks) => groupBy(tasks, 'status')),
    map((tasksByStatus) => mapValues(tasksByStatus, (tasks, status) => ({
      ...this.getStatusInfo(status),
      tasks,
    })) as TasksGrouped),
    map((tasksGrouped) => Object.values(tasksGrouped).sort((a, b) => a.order - b.order)),
    catchError((error) => {
      console.error(error);
      return of([]);
    })
  );


  save(task: Task): Promise<void> {
    let taskRef = task.id ? doc(this.firestore, `tasks/${task.id}`) : doc(collection(this.firestore, 'tasks'));
    task.id = task.id || taskRef.id;
    console.log('Save', task);
    return setDoc(taskRef, task.toFirestore());
  }

  update(task: Task): Promise<void> {
    const taskRef = doc(this.firestore, `tasks/${task.id}`);
    console.log('Update', task);
    return updateDoc(taskRef, { status: task.status as TaskStatus });
  }

  delete(task: Task): Promise<void> {
    console.log('Delete: ', task);
    return deleteDoc(doc(this.firestore, `tasks/${task.id}`));
  }

  private getStatusInfo(statusEnum: string) {
    switch (statusEnum) {
      case TaskStatus.TODO:
        return {label: 'To do', order: 0, status: statusEnum};
      case TaskStatus.IN_PROGRESS:
        return {label: 'In progress', order: 1, status: statusEnum};
      case TaskStatus.DONE:
        return {label: 'Done', order: 2, status: statusEnum};
      default:
        return null;
    }
  }
}
