import { Pipe, PipeTransform } from '@angular/core';
import { UserData } from '../tasks-dashboard/activities/activities.component';



@Pipe({
  name: 'userName'
})
export class UserNamePipe implements PipeTransform {
  transform(userId: string, users: UserData[]): string {
    const user = users.find(user => user.id === userId);
    return user ? user.name : 'No one';
  }
}
