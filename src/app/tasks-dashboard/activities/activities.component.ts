import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { filter, map, Observable } from 'rxjs';
import { TaskActivity, UserRef } from '@firetasks/models';
// import { ActivityService } from '../services/activity.service';
import { UserService } from 'src/app/services/user.service';
import { ControlContainer, FormArray, FormGroup } from '@angular/forms';

export interface UserData {
  id: string,
  name: string,
  avatar: string | undefined
}

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
})
export class ActivitiesComponent implements OnInit {
  @Input() taskId?: string;
  @Input() isOwner?: boolean;
  @Input() activities?: TaskActivity[];
  @Output() activitiesChanged = new EventEmitter<string>();
  users$?: Observable<UserData[]>;
  users?: UserData[];
  private parentContainer = inject(ControlContainer);

  public get parentFormGroup(): FormGroup {
    return this.parentContainer.control as FormGroup;
  }

  get activitiesFormArray(): FormArray {
    return this.parentFormGroup.get('activities') as FormArray;
  }

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    console.log(this.activities);
    this.users$ = this.userService.users$
      .pipe(
        filter(user => user !== null),
        map(users => users.map(user => ({ id: user.id, name: user.name, avatar: user.avatar })
      )));
    this.users$.subscribe(users => this.users = users);
  }

  trackByIndex(index: number, activity: TaskActivity): number {
    return index;
  }

  addActivity() {
    this.activitiesChanged.emit('create');
  }

  toggleCompleted(activity: TaskActivity) {
    activity.isCompleted = !activity.isCompleted;

  }

  editActivity() {
    this.activitiesChanged.emit('edit');
  }

  deleteActivity(index: number) {
    this.activitiesFormArray.removeAt(index);
    this.activitiesChanged.emit('delete');
  }

  cancel() {
    this.parentFormGroup.reset();
  }
}
