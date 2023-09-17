import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'linkify'
})
export class LinkifyPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;

    // Regular expression to match [Link](URL) patterns
    const linkPattern = /\[([^[]+)\]\(([^)]+)\)/g;

    // Replace [Link](URL) with <a href="URL">Link</a> tags
    const transformedValue = value.replace(linkPattern, '<a href="$2">$1</a>');

    return transformedValue;
  }
}