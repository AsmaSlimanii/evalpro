import { Pipe, PipeTransform } from '@angular/core';
import { formatDistanceToNow } from 'date-fns';

@Pipe({
  name: 'timeAgo'
})
export class TimeAgoPipe implements PipeTransform {

   transform(value: Date | string): string {
    if (!value) return '';
    return formatDistanceToNow(new Date(value), { addSuffix: true });
  }

}
