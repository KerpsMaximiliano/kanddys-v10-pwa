import { DecimalPipe } from '@angular/common';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-currency-input',
  templateUrl: './currency-input.component.html',
  styleUrls: ['./currency-input.component.scss'],
})
export class CurrencyInputComponent implements OnInit {
  formattedPricing = '$0.00';
  curencyFocused = false;
  @Output() onInputEvent = new EventEmitter<number>();

  constructor(private decimalPipe: DecimalPipe) {}

  ngOnInit(): void {}

  formatNumber(event: Event | number) {
    let value: string;
    if (typeof event === 'number') value = `${event}`;
    else value = (<HTMLInputElement>event.target).value;
    if (value.includes('.')) {
      value = value
        .split('')
        .filter((char) => char !== '.')
        .join('');
      console.log(value);
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
    this.onInputEvent.emit(
      parseFloat(this.formattedPricing.replace(/\$|,/g, ''))
    );
  }
}
