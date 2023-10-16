import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'CurrencyPipe'
  })
  export class CurrencyFormatPipe implements PipeTransform {
    transform(value: number): string {
      if (isNaN(value)) {
        return '';
      }
      const formattedValue = value.toFixed(2);

      return formattedValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  }