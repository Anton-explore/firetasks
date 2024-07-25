import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, OnDestroy {
  user?: any;
  isOnActivitiesPage: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private auth: AngularFireAuth,
    private router: Router
  ) { }

  ngOnInit() {
    this.auth.onAuthStateChanged((user) => {
      this.user = user;
    });
    this.checkCurrentRoute();
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.checkCurrentRoute();
    });
  }

  checkCurrentRoute() {
    this.isOnActivitiesPage = this.router.url === '/activities';
  }

  logout() {
    this.auth.signOut();
    window.location.reload();
  }
  toggleToActivities() {
    if (this.isOnActivitiesPage) {
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/activities']);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
