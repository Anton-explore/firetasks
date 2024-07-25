import { Pipe, PipeTransform } from '@angular/core';
import { IUserData } from '../tasks-dashboard/task-dialog.component';


@Pipe({
  name: 'userAvatar'
})
export class UserAvatarPipe implements PipeTransform {
  transform(userId: string | undefined, users: IUserData[] | null): string {
    if (userId && users) {
      const user = users.find(user => user.id === userId);
      return user && user.avatar ? user.avatar : '';
    } else {
      return ''
    }
  }
}
