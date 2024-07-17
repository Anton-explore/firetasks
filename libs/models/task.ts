import { UserRef } from './user';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export interface Task {
  id: string;
  title: string;
  activities?: TaskActivity[];
  status: TaskStatus;
  owner: UserRef;
  createdAt: Date;
  updatedAt: Date;

  toFirestore(): any;
  copyWith(data: Partial<Task>): Task;
}

export interface TaskActivity {
  activityId: string,
  title: string;
  assignee?: string;
  isCompleted: boolean;
}

export class TaskModel implements Task {
  id: string;
  title: string = '';
  activities?: TaskActivity[] = [];
  status = TaskStatus.TODO;
  owner: UserRef;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<Task>) {
    this.id = data.id!;
    this.owner = data.owner!;
    this.createdAt = this.updatedAt = data.createdAt || new Date();

    Object.assign(this, data);
  }

  static fromFirestore(data: any): Task {
    return new TaskModel({
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    });
  }

  toFirestore() {
    return { ...this };
  }

  copyWith(data: Partial<Task>): Task {
    return new TaskModel({
      ...this,
      ...data
    });
  }
}
