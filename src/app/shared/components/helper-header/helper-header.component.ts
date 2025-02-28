import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HeaderService } from 'src/app/core/services/header.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
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
  @Input() orderItems: boolean = false;
  @Input() middleTextColor: string = '#27A2FC';
  @Input() middleTextFontFamily: string = 'RobotoMedium';
  @Input() middleTextFontSize: string = '19px';
  @Input() dialogProps: Record<string, any>;
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
  @Input() cart: boolean = false;
  @Input() cartCallback: (...params) => any;
  @Input() back: boolean = true;
  @Input() leftIconText: string = null;
  @Input() shadow: boolean = false;
  @Input() position: string = 'relative';
  @Input() replaceXWithLabel: boolean = false;
  @Input() leftLabel: string = 'Cancel';
  wallet: boolean = false;
  walletBalance: number;
  @Input() searchLabel: string = 'label';
  @Input() cartAmount: number;

  //OUTPUTS
  @Output() data = new EventEmitter<string>();

  env: string = environment.assetsUrl;

  constructor(
    private headerService: HeaderService, // private _DialogRef: DialogRef
    private dialog: DialogService
  ) {}

  ngOnInit(): void {
    if (this.headerService.walletData != undefined) {
      this.walletBalance = this.headerService.walletData.balance;
      //this.wallet = true;
    }

    if (this.cart && this.headerService.saleflow?._id)
      this.getShoppinCartItems();
  }

  getShoppinCartItems() {
    const productData = this.headerService.getItems();
    this.cartAmount = productData?.length;
  }

  openDialog() {}

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
