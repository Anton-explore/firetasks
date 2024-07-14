import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Task, TaskActivity, TaskModel, TaskStatus } from '@firetasks/models'

import { TaskService, TaskList } from '../services/task.service';
import { TaskDialogComponent } from './task-dialog.component';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-tasks-dashboard',
  templateUrl: './tasks-dashboard.component.html',
  styleUrls: ['./tasks-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TasksDashboardComponent implements OnInit, OnDestroy {
  taskLists$?: Observable<TaskList[]>;
  taskLists?: TaskList[];
  user?: { uid: string, displayName?: string };
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private dialog: MatDialog,
    private auth: AngularFireAuth,
    private taskService: TaskService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.auth.currentUser.then(user => this.user = user as any);
    this.taskService.taskLists$
      .pipe(takeUntil(this.destroy$))
      .subscribe(taskLists => {
        this.taskLists = taskLists;
        this.cdRef.markForCheck();
      });
  }

  onDrop(event: CdkDragDrop<Task[]>) {
    this.isLoading = true;
    if (event.previousContainer.id === event.container.id) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.cdRef.markForCheck();
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
          this.cdRef.markForCheck();
        })
        .catch((err) => console.error(err));
    }
  }

  checkActivities(activities?: TaskActivity[]): number | null {
    if (!activities) {
      return null;
    }
    const toBeDone = activities.filter(activity => activity.isCompleted === false)
    return toBeDone.length;
  }

  async addNewTask(status: string) {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '550px',
      height: '600px',
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
    // dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
    //   this.cdRef.markForCheck();
    //   console.log('The dialog was closed', result);
    // });
  }

  async showTaskDetail(task: Task) {
    // console.log('showTaskDetail', task);
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '550px',
      height: '600px',
      data: {
        task,
        userId: this.user?.uid,
      },
    });

    // dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
    //   this.cdRef.markForCheck();
    //   console.log('The dialog was closed', result);
    // });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
