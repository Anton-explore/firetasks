import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Task, TaskActivity, TaskStatus } from '@firetasks/models';
import { TaskService } from '../services/task.service';
import { UserService } from '../services/user.service';
import { filter, Observable, map } from 'rxjs';

export interface DialogData {
  task: Task;
  userId?: string;
}

@Component({
  selector: 'app-task-dialog',
  templateUrl: './task-dialog.component.html',
  styleUrls: ['./task-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskDialogComponent {

  isLoading = false;
  task: Task = this.data.task;
  taskForm = inject(FormBuilder).nonNullable.group({
    title: [this.task.title || '', Validators.required],
    status: [this.task.status || TaskStatus.TODO, Validators.required],
    activities: inject(FormBuilder).nonNullable.array([] as FormGroup[])
  });

  get isOwner() {
    return !!this.data.userId && this.data.userId === this.task.owner.id;
  }

  get activitiesFormArray() {
    return this.taskForm.get('activities') as FormArray;
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: DialogData,
    private dialogRef: MatDialogRef<TaskDialogComponent>,
    private taskService: TaskService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initActivities();
  }

  private initActivities() {
    this.task?.activities?.forEach(activity => {
      this.activitiesFormArray.push(this.createActivityFormGroup(activity));
    });
    this.cdRef.markForCheck();
  }

  private createActivityFormGroup(activity?: TaskActivity): FormGroup {
    return this.fb.group({
      title: [activity?.title || '', Validators.required],
      assignee: [activity?.assignee || '', Validators.required],
      isCompleted: [activity?.isCompleted || false]
    });
  }

  save() {
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

  cancel() {
    this.taskForm.reset();
  }

  delete() {
    this.isLoading = true;
    this.taskService.delete(this.task).finally(() => {
      this.isLoading = false;
      this.dialogRef.close();
    }).catch(console.error);
  }

  updateActivities(action: string) {
    this.isLoading = true;

    switch (action) {
      case 'create':
        this.activitiesFormArray.push(this.createActivityFormGroup());
        this.cdRef.detectChanges;
        this.isLoading = false;
        break;
      case 'edit':
        this.task = this.task.copyWith({
          ...this.task,
          activities: this.task?.activities ? [...this.task?.activities, ...this.getFormValues()] : this.getFormValues(),
          updatedAt: new Date(),
        });

        this.taskService.updateActivities(this.task).finally(() => {
          this.cdRef.markForCheck();
          this.isLoading = false;
        }).catch(console.error);
        break;
      case 'delete':
        this.task = this.task.copyWith({
          ...this.taskForm.value,
          updatedAt: new Date(),
        });

        this.taskService.updateActivities(this.task).finally(() => {
          this.cdRef.markForCheck();
          this.isLoading = false;
        }).catch(console.error);
        break;
      default:
        console.log('error');
    }

  }

  getFormValues() {
    const values = this.activitiesFormArray.value;
    return values;
  }
}
