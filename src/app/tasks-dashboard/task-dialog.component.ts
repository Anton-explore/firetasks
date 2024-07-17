import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Task, TaskActivity, TaskStatus } from '@firetasks/models';
import { TaskService } from '../services/task.service';
import { filter, map, Observable } from 'rxjs';
import { UserService } from '../services/user.service';
import { ActivitiesService } from '../services/activities.service';

export interface DialogData {
  task: Task;
  userId?: string;
}

export interface IUserData {
  id: string,
  name: string,
  avatar: string | undefined
}

@Component({
  selector: 'app-task-dialog',
  templateUrl: './task-dialog.component.html',
  styleUrls: ['./task-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskDialogComponent {

  private fb = inject(FormBuilder);
  isLoading = false;
  task: Task = this.data.task;
  taskForm = this.fb.nonNullable.group({
    title: [this.task.title || '', Validators.required],
    status: [this.task.status || TaskStatus.TODO, Validators.required],
    activities: this.fb.array([] as FormGroup[])
  });

  users$?: Observable<IUserData[]>;
  activityIds: string[] = [];

  get isOwner() {
    return !!this.data.userId && this.data.userId === this.task.owner.id;
  }

  get activitiesForm() {
    return this.taskForm.get('activities') as FormArray;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: DialogData,
    private dialogRef: MatDialogRef<TaskDialogComponent>,
    private taskService: TaskService,
    private activitiesService: ActivitiesService,
    private userService: UserService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.activityIds = this.task.activities?.map(activity => activity.activityId) || [];
    this.initActivities();
    this.users$ = this.userService.users$
      .pipe(
        filter(user => user !== null),
        map(users => users.map(user => ({ id: user.id, name: user.name, avatar: user.avatar })
      )));
    this.data.userId && this.activitiesService.getActivitiesForUser(this.data.userId).subscribe(activities => console.log(activities));
  }

  private initActivities() {
    if (this.task.activities) {
      this.task.activities.map(activity => {
        this.activitiesForm.push(this.createActivityFormGroup(activity));
      });
    }
  }

  private createActivityFormGroup(activity?: TaskActivity): FormGroup {
    return this.fb.nonNullable.group({
      title: [activity?.title || '', Validators.required],
      assignee: [activity?.assignee || '', Validators.required],
      isCompleted: [activity?.isCompleted || false]
    });
  }

  getActivityGroup(index: number): FormGroup {
    return this.activitiesForm.at(index) as FormGroup;
  }

  trackByIndex(index: number): number {
    return index;
  }

  onSubmit(event: Event): void {
    event.preventDefault();
  }

  save() {
    if (this.taskForm.value.title) {
      this.isLoading = true;
      this.task = this.task.copyWith({
        ...this.taskForm.value,
        updatedAt: new Date(),
      });

      this.taskService.save(this.task).finally(() => {
        this.isLoading = false;
        this.cdRef.markForCheck();
      }).catch(console.error);
    }
  }

  cancel() {
    this.taskForm.reset();
  }

  delete() {
    if (this.taskForm.value.title) {
      this.isLoading = true;
      this.taskService.delete(this.task).finally(() => {
        this.isLoading = false;
        this.dialogRef.close();
      }).catch(console.error);
    }
  }

  addActivity() {
    this.isLoading = true;
    this.activitiesForm.push(this.createActivityFormGroup());
    const newActivityId = `activity_${this.activityIds.length}`;
    this.activityIds.push(newActivityId);
    const newActv = { activityId: newActivityId, title: '', isCompleted: false };
    this.task.activities?.push(newActv);
    this.activitiesService.addActivity(this.task.id, newActv)
      .finally(() => {
        this.isLoading = false;
        this.cdRef.detectChanges();
      })
      .catch(console.error);
  }

  saveActivity(index: number) {
    const activityForm = this.getActivityGroup(index).value;
    const activity = this.task.activities ? this.task.activities[index]: null;
    if (this.task.activities && activity && this.taskForm.value.title) {
      const editedActivity: TaskActivity = {
        activityId: activity.activityId,
        title: activityForm.title || '',
        assignee: activityForm.assignee || '',
        isCompleted: activityForm.isCompleted || false
      };
      const activitiesCopy = [...this.task.activities];
      this.task.activities[index] = editedActivity;
      if (JSON.stringify(this.task.activities) !== JSON.stringify(activitiesCopy)) {
        this.activitiesService.updateActivity(this.task.id, this.task.activities)
          .finally(() => {
            this.isLoading = false;
            this.cdRef.markForCheck();
          })
          .catch(console.error);
      }
    }
  }

  deleteActivity(index: number) {
    this.isLoading = true;
    this.activitiesForm.removeAt(index);
    const taskToDelete = this.task.activities && this.task.activities[index];
    this.task.activities?.splice(index, 1);
    this.activityIds.splice(index, 1);
    taskToDelete && this.activitiesService.deleteActivity(this.task.id, taskToDelete)
      .finally(() => {
        this.isLoading = false;
        this.cdRef.markForCheck();
      })
      .catch(console.error);
  }
}
