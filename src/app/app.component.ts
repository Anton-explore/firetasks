import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  user?: any;

  constructor(
    private auth: AngularFireAuth,
  ) { }

  ngOnInit() {
    this.auth.onAuthStateChanged((user) => {
      this.user = user;
    });
  }

  logout() {
    this.auth.signOut();

    window.location.reload();
  }
}
