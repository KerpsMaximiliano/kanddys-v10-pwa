import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'upperPipe'
  })
  export class UpperCasePipe implements PipeTransform {
    transform(value: string): string {
      return value.toUpperCase()
    }
  }