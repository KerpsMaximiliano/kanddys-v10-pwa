import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HeaderService } from 'src/app/core/services/header.service';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-helper-header',
  templateUrl: './helper-header.component.html',
  styleUrls: ['./helper-header.component.scss'],
})
export class HelperHeaderComponent implements OnInit {
  //STRINGS
  @Input() bgcolor: string = '#E9E9E9';
  @Input() searchBgcolor: string = '#E9E9E9';
  @Input() assetsText: string = '';
  @Input() userID: string = '';
  @Input() extraText: string = '';
  @Input() middleText: string = '';
  @Input() middleTextTransform: string = 'none';
  @Input() middleTextColor: string = '#27A2FC';
  @Input() middleTextFontFamily: string = 'RobotoMedium';
  @Input() middleTextFontSize: string = '19px';
  // @Input() middleTextLeft: string  = '20%';
  // @Input() middleTextTop: string  = '33%';
  @Output() onClose: EventEmitter<boolean> = new EventEmitter(false);
  @Output() onMenu: EventEmitter<void> = new EventEmitter();

  //BOOLEANS
  @Input() notification: boolean = false;
  @Input() add: boolean = false;
  @Input() basic: boolean = true;
  @Input() options: boolean = false;
  @Input() searchAble: boolean = true;
  @Input() empty: boolean = false;
  @Input() back: boolean = true;
  @Input() shadow: boolean = false;
  @Input() position: string = 'relative';
  wallet: boolean = false;
  walletBalance: number;
  @Input() searchLabel: string = 'label';

  //OUTPUTS
  @Output() data = new EventEmitter<string>();

  env: string = environment.assetsUrl;

  constructor(
    private headerService: HeaderService // private _DialogRef: DialogRef
  ) {}

  ngOnInit(): void {
    if (this.headerService.walletData != undefined) {
      this.walletBalance = this.headerService.walletData.balance;
      //this.wallet = true;
    }
  }

  sendData(value: string) {
    this.data.emit(value);
  }

  close(): void {
    // this._DialogRef.close();
    this.onClose.emit(true);
  }

  displayMenu(): void {
    this.onMenu.emit();
  }
}
