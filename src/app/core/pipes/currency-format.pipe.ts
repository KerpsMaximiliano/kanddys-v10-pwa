import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'CurrencyPipe'
  })
  export class CurrencyFormatPipe implements PipeTransform {
    transform(value: number): string {
      if (isNaN(value)) {
        return '';
      }
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  }