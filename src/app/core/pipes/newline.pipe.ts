import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'newlineToBr'
})
export class NewlineToBrPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;

    // Replace '\n' with '<br />' tags
    return value.replace(/\n/g, '<br />');
  }
}