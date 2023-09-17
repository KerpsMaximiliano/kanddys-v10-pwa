import {
  Component,
  OnInit,
  ViewChild,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { DeliveryZonesService } from 'src/app/core/services/deliveryzones.service';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { CostsDialogComponent } from 'src/app/shared/dialogs/costs-dialog/costs-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormData, FormComponent } from 'src/app/shared/dialogs/form/form.component';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HeaderService } from 'src/app/core/services/header.service';
import { TranslateService } from '@ngx-translate/core';
import { Expenditure } from 'src/app/core/models/order';
import { CreateExpenditureDialogComponent } from '../../dialogs/create-expenditure-dialog/create-expenditure-dialog.component';


@Component({
  selector: 'app-costs-metrics-navigation',
  templateUrl: './costs-metrics-navigation.component.html',
  styleUrls: ['./costs-metrics-navigation.component.scss']
})
export class CostsMetricsNavigationComponent implements OnInit {

  @Input() opened: boolean;
  @Output() closed = new EventEmitter();

  merchant: any = null;
  only_day : any = {total: 0, count: 0};
  recurrent : any = {total: 0, count: 0};
  delivery_zone : any = {total: 0, count: 0};
  others : any = {total: 0, count: 0};
  taxes : any = null;
  taxesLoading = false
  incomeMerchant = 0
  incomeMerchantLoading = false
  expenditures : Array<Expenditure> = []

  ordersTotal : any = {total: 0, items: 0, length: 0};
  ordersTotalLoading = false
  incomeTotal : any = {total: 0, count: 0}
  incomeTotalLoading = false

  viewIndex = 2

  constructor(
    public merchantsService: MerchantsService,
    public headerService: HeaderService,
    private translate: TranslateService,
    private merchantService: MerchantsService,
    private orderService: OrderService,
    private deliveryZonesService: DeliveryZonesService,
    private dialog: MatDialog,
    ) {
    translate.setDefaultLang('en');
    translate.use('en');
  }

  async ngOnInit(): Promise<void> {
    // lockUI()
    const merchant = await this.merchantService.merchantDefault();
    this.merchant = merchant

    const only_day = await this.orderService.expendituresTotalById("only-day", this.merchant._id,);
    this.only_day = only_day.expendituresTotalById
    console.log("only_day", only_day)

    const recurrent = await this.orderService.expendituresTotalById("recurrent", this.merchant._id,)
    this.recurrent = recurrent.expendituresTotalById
    console.log("recurrent", recurrent)

    const delivery_zone = await this.orderService.expendituresTotalById("delivery-zone", this.merchant._id,)
    this.delivery_zone = delivery_zone.expendituresTotalById
    console.log("delivery_zone", delivery_zone)

    const others = await this.orderService.expendituresTotalById("others", this.merchant._id,)
    this.others = others.expendituresTotalById
    console.log("others", others)

    // unlockUI()

    const incomeMerchant = await this.merchantService.incomeMerchant({
      findBy: {
        merchant: merchant._id,
      },
    });
    this.incomeMerchant = incomeMerchant
    this.incomeMerchantLoading = true
    console.log("incomeMerchant", incomeMerchant)

    const ordersTotal = await this.orderService.ordersTotal(
      ['completed', 'to confirm'],
      this.merchant._id,
    );
    this.ordersTotal = ordersTotal
    this.ordersTotalLoading = true
    console.log("ordersTotal", ordersTotal)

    const incomeTotal = await this.deliveryZonesService.incomeTotalDeliveryZoneByMerchant( this.merchant._id );
    this.incomeTotal = incomeTotal
    this.incomeTotalLoading = true
    console.log("incomeTotal", incomeTotal)

    const taxes = await this.merchantService.taxesByMerchant({
      findBy: {
        merchant: this.merchant._id
      }
    })
    this.taxes = taxes.taxesByMerchant
    this.taxesLoading = true
    console.log("taxes", taxes)
  }
  amountFormat(amount) {
    const formattedAmount = Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return formattedAmount;
  }

  // showDialog() {
  //   const dialogRef = this.dialog.open(CostsDialogComponent, {});

  //   dialogRef.afterClosed().subscribe(type => {
  //     console.log(type)
  //     if (type) this.createZone(type)
  //   });
  // }
  createZone(type_item: string) {
    let fieldsToCreateForFormDialog: FormData = {
      fields: [],
    };
    const fieldsArrayForFieldValidation: Array<{
      fieldName: string;
      fieldKey: string;
      fieldTextDescription: string;
    }> = [];
    fieldsToCreateForFormDialog.fields = [
      {
        label: 'Nombra',
        name: 'nombra',
        type: 'text',
        validators: [Validators.pattern(/[\S]/)],
      },
      {
        label: 'Cantidad',
        name: 'cantidad',
        type: 'number',
        validators: [Validators.pattern(/[\S]/)],
      },
    ];
    fieldsArrayForFieldValidation.push({
      fieldName: 'stock',
      fieldKey: 'nombra',
      fieldTextDescription: 'Nombra',
    });
    fieldsArrayForFieldValidation.push({
      fieldName: 'cantidad',
      fieldKey: 'cantidad',
      fieldTextDescription: 'Cantidad',
    });
    const dialogRef = this.dialog.open(FormComponent, {
      data: fieldsToCreateForFormDialog,
    });

    dialogRef.afterClosed().subscribe(async (result: FormGroup) => {
      let isError = false;
      fieldsArrayForFieldValidation.forEach((field) => {
        let error = `${field.fieldTextDescription} invalido`;

        try {
          if (
            result?.value[field.fieldKey] &&
            result?.controls[field.fieldKey].valid
          ) {
          } else {
            isError = true;
            this.headerService.showErrorToast(error, 1000);
          }
        } catch (error) {
          console.error(error);
          this.headerService.showErrorToast(error);
        }
      });
      if (!isError) {
        lockUI()
        const merchant = await this.merchantService.merchantDefault();
        console.log(result?.value)
        const {nombra, cantidad} = result?.value;
        const expenditure = await this.deliveryZonesService.createExpenditure(
          merchant._id,
          {
            name:nombra,
            amount:Number(cantidad),
            type: type_item
          }
        );
        console.log(expenditure)
        unlockUI()
      }
    });
  }
  showCreateExpDialog() {
    const dialogRef = this.dialog.open(CreateExpenditureDialogComponent)
    dialogRef.afterClosed().subscribe(async result => {
      if (result) {
        if (result.name.length && result.amount) {
          const inputExpenditure = {
            name: result.name,
            amount: result.amount,
            type: "only-day",
            activeDate: {
              from: result.date
            }
          } as Expenditure;
  
          const newExpenditure = await this.orderService.createExpenditure(
            this.merchant._id,
            inputExpenditure
          )
          this.expenditures = [newExpenditure, ...this.expenditures]
        }
      }
    })
  }

  @ViewChild('sidenav') sidenav: MatSidenav;

  close() {
    this.sidenav.close();
  }

}
