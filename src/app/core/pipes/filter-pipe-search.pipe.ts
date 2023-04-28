import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterPipeSearch',
})
export class FilterPipeSearchPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items || !searchText) return items;
    searchText = searchText.toLowerCase();
    return items.filter((data) => this.matchValue(data, searchText));
  }
  matchValue(data, value) {
    return Object.keys(data)
      .map((key) => {
        return new RegExp(value, 'gi').test(data[key]);
      })
      .some((result) => result);
  }
}
