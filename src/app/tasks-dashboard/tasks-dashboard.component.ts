import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Task, TaskActivity, TaskModel, TaskStatus } from '@firetasks/models'

import { TaskService, TaskList } from '../services/task.service';
import { TaskDialogComponent } from './task-dialog.component';
import { AngularFireAuth } from '@angular/fire/compat/auth';

export interface IUser { uid: string, displayName?: string };
@Component({
  selector: 'app-tasks-dashboard',
  templateUrl: './tasks-dashboard.component.html',
  styleUrls: ['./tasks-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksDashboardComponent implements OnInit {
  taskLists$?: Observable<TaskList[]>;
  user?: IUser;
  isLoading = false;

  constructor(
    private dialog: MatDialog,
    private auth: AngularFireAuth,
    private taskService: TaskService,
  ) {}

  ngOnInit() {
    this.auth.currentUser.then(user => this.user = user as any);
    this.taskLists$ = this.taskService.taskLists$;
  }

  trackByIndex(index: number, list: TaskList): number {
    return index;
  }

  onDrop(event: CdkDragDrop<Task[]>): void {
    this.isLoading = true;
    if (event.previousContainer.id === event.container.id) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.isLoading = false;
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      task.status = event.container.id as TaskStatus;
      this.taskService.update(task)
        .then(() => {
          transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex
          );
        })
        .finally(() => {
          this.isLoading = false;
        })
        .catch((err) => console.error(err));
    }
  }

  checkActivities(activities?: TaskActivity[]): number | null {
    if (!activities) {
      return null;
    }
    const toBeDone = activities.filter(activity => activity.isCompleted === false)
    return toBeDone.length || null;
  }

  async addNewTask(status: string) {
    this.dialog.open(TaskDialogComponent, {
      width: '550px',
      autoFocus: 'first-header',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '300ms',
      data: {
        task: new TaskModel({
          status: status as TaskStatus,
          owner: {
            id: this.user!.uid,
            name: this.user!.displayName!,
          },
        }),
        userId: this.user?.uid,
      },
    });
  }

  async showTaskDetail(task: Task) {
    this.dialog.open(TaskDialogComponent, {
      width: '550px',
      autoFocus: 'first-header',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '300ms',
      data: {
        task,
        userId: this.user?.uid,
      },
    });
  }
}
