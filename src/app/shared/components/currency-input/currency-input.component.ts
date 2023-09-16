import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { DialogFlowService } from 'src/app/core/services/dialog-flow.service';

@Component({
  selector: 'app-currency-input',
  templateUrl: './currency-input.component.html',
  styleUrls: ['./currency-input.component.scss'],
})
export class CurrencyInputComponent implements OnInit {
  @ViewChild('input') currencyInput: ElementRef<HTMLInputElement>;
  curencyFocused = false;
  @Input() formattedPricing = '0.00';
  @Input() initialValue: number;
  @Input() currencyLabel: string;
  @Input() fieldStyles: Record<string, any> = null;
  @Input() cursorStyles: Record<string, any> = null;
  @Input() placeholderColor: string;
  @Input() inputContentColor: string;
  @Input() inputContentSize: string;
  @Input() inputTextStyles: Record<string, any> = null;
  @Input() inputId: string = 'pricing';
  @Input() inputName: string = 'pricing';
  @Input() innerLabel: string;
  @Input() innerLabelStyles: Record<string, any> = null;
  @Input() required: boolean = true;
  @Input() labelLarge: boolean = false;
  @Input() blockKeyboardNavigation: boolean = false;
  @Input() dialogId: string;
  @Output() onInputEvent = new EventEmitter<number>();

  constructor(
    private decimalPipe: DecimalPipe,
    private dialogFlowService: DialogFlowService
  ) {}

  ngOnInit(): void {
    const dialogValue =
      this.dialogFlowService.dialogsFlows?.['flow1']?.itemPricing?.fields
        ?.pricing;

    this.initialValue = this.getNumericValue(this.initialValue || dialogValue);
    if (this.initialValue) this.formatNumber(this.initialValue);
  }

  countDecimals(value: number) {
    if (!value) return;
    if (Math.floor(value) === value) return 0;
    return value.toString().split('.')[1]?.length || 0;
  }

  getNumericValue(value: number) {
    if (!value) return;
    return this.countDecimals(value) < 2 ? Math.floor(value * 100) : value;
  }

  formatNumber(
    event: Event | number,
    emit?: boolean,
    input?: HTMLInputElement
  ) {
    let value: string;
    if (typeof event === 'number') value = `${event}`;
    else value = (<HTMLInputElement>event.target).value;
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
      if (parseFloat(formatted.replace(/,/g, '')) > 9999999999999.99) {
        input.value = this.formattedPricing.replace(/\$|,/g, '');
        return;
      }
      this.formattedPricing = formatted;
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
      if (parseFloat(formatted.replace(/,/g, '')) > 9999999999999.99) {
        input.value = this.formattedPricing.replace(/\$|,/g, '');
        return;
      }
      this.formattedPricing = formatted;
    }
    if (!emit) return;
    const num = parseFloat(this.formattedPricing.replace(/\$|,/g, ''));
    this.onInputEvent.emit(num);
  }
}
