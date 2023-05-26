import { AbstractControl, ValidatorFn } from '@angular/forms';

export function maxWordsValidator(maxWords: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value as string;
    if (value) {
      const words = value.trim().split(/\s+/).length;
      if (words > maxWords) {
        return {
          maxWords: { requiredWords: maxWords, actualWords: words },
        };
      }
    }
    return null;
  };
}

export function minWordsValidator(minWords: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value as string;
    if (value) {
      const words = value.trim().split(/\s+/).length;
      if (words < minWords) {
        return {
          minWords: { requiredWords: minWords, actualWords: words },
        };
      }
    }
    return null;
  };
}
