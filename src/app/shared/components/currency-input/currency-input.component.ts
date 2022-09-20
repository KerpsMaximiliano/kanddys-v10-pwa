import { DecimalPipe } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-currency-input',
  templateUrl: './currency-input.component.html',
  styleUrls: ['./currency-input.component.scss'],
})
export class CurrencyInputComponent implements OnInit {
  curencyFocused = false;
  formattedPricing = '$0.00';
  @Input() initialValue: number;
  @Input() fieldStyles: Record<string, any> = null;
  @Output() onInputEvent = new EventEmitter<number>();

  constructor(private decimalPipe: DecimalPipe) {}

  ngOnInit(): void {
    this.initialValue && this.formatNumber(this.initialValue);
  }

  formatNumber(event: Event | number, emit?: boolean) {
    let value: string;
    if (typeof event === 'number') value = `${event}`;
    else value = (<HTMLInputElement>event.target).value;
    if (value == '') {
      return;
    }
    if (value.includes('.')) {
      value = value
        .split('')
        .filter((char) => char !== '.')
        .join('');
    }
    const plainNumber = value.split(',').join('');
    if (plainNumber[0] === '0') {
      const formatted =
        plainNumber.length > 3
          ? this.decimalPipe.transform(
              Number(plainNumber.slice(0, -2) + '.' + plainNumber.slice(-2)),
              '1.2'
            )
          : this.decimalPipe.transform(
              Number(
                '0.' +
                  (plainNumber.length <= 2
                    ? '0' + plainNumber.slice(1)
                    : plainNumber.slice(1))
              ),
              '1.2'
            );
      this.formattedPricing = '$' + formatted;
    } else {
      const formatted =
        plainNumber.length > 2
          ? this.decimalPipe.transform(
              Number(plainNumber.slice(0, -2) + '.' + plainNumber.slice(-2)),
              '1.2'
            )
          : this.decimalPipe.transform(
              Number(
                '0.' +
                  (plainNumber.length === 1 ? '0' + plainNumber : plainNumber)
              ),
              '1.2'
            );
      this.formattedPricing = '$' + formatted;
    }
    if (!emit) return;
    this.onInputEvent.emit(
      parseFloat(this.formattedPricing.replace(/\$|,/g, ''))
    );
  }
}
