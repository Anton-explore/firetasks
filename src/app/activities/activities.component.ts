import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivitiesService, IUserActivities } from 'src/app/services/activities.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { IUser } from '../tasks-dashboard/tasks-dashboard.component';


@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivitiesComponent implements OnInit {
  user?: IUser;
  tasks$?: Observable<IUserActivities[]>

  constructor(
    private auth: AngularFireAuth,
    private activitiesService: ActivitiesService,
  ) { }

  ngOnInit(): void {
    this.tasks$ = this.activitiesService.userActivities$;
  };

  trackByIndex(index: number): number {
    return index;
  }
}
