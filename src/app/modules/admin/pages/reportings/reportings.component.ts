import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DeliveryZonesService } from 'src/app/core/services/deliveryzones.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { WebformsService } from 'src/app/core/services/webforms.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { LinkDialogComponent } from 'src/app/shared/dialogs/link-dialog/link-dialog.component';
import { LinksDialogComponent } from 'src/app/shared/dialogs/links-dialog/links-dialog.component';
import { SingleActionDialogComponent } from 'src/app/shared/dialogs/single-action-dialog/single-action-dialog.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-reportings',
  templateUrl: './reportings.component.html',
  styleUrls: ['./reportings.component.scss'],
})
export class ReportingsComponent implements OnInit {
  env: string = environment.assetsUrl;
  merchant: any = [];
  deliveryZonesTotal: any = { total: 0, count: 0 };
  onlyDayTotal: any = { total: 0, count: 0 };
  onlyMonthTotal: any = { total: 0, count: 0 };
  recurrentTotal: any = { total: 0, count: 0 };
  questions:any = []
  @ViewChild('picker') datePicker: MatDatepicker<Date>;
  range = new FormGroup({
    start: new FormControl(''),
    end: new FormControl(''),
  });

  webformOrder: any = {};
  dateString: string = 'Aún no hay filtros aplicados';
  constructor(
    private deliveryZoneService: DeliveryZonesService,
    private orderService: OrderService,
    private merchantsService: MerchantsService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private _bottomSheet: MatBottomSheet,
    private router: Router,
    private webformsService: WebformsService
  ) {}

  async ngOnInit() {
    await this.getMerchant();
    await this.getWebforms();
    this.getExpenditures();
    this.getIncomes();
  }

  async getDeliveryZones() {
    let result = await this.deliveryZoneService.deliveryZones();
    console.log(result);
  }

  async getExpenditures() {
    this.getExpendituresTotal('delivery-zone').then((e) => {
      this.deliveryZonesTotal = e;
    });
    this.getExpendituresTotal('only-day').then((e) => {
      this.onlyDayTotal = e;
    });
    this.getExpendituresTotal('only-month').then((e) => {
      this.onlyMonthTotal = e;
    });
    this.getExpendituresTotal('recurrent').then((e) => {
      this.recurrentTotal = e;
    });
  }

  async getExpendituresTotal(type) {
    const result = await this.orderService.expendituresTotalById(
      type,
      this.merchant._id
    );
    return result.expendituresTotalById;
  }

  async getIncomes() {
    let result = await this.orderService.answerIncomeTotal(
      this.webformOrder._id
    );
    console.log(result);
  }


  async getMerchant() {
    this.merchant = await this.merchantsService.merchantDefault();
  }

  async getWebforms() {
    const result = await this.webformsService.webforms({
      findBy: {
        type: 'order',
      },
    });
    this.webformOrder = result[0];
    this.questions = result[0].questions;
    console.log(this.questions);
    
  }

  openDialog(type, question = null) {
    this._bottomSheet.open(LinksDialogComponent, {
      data: [
        {
          options: [
            {
              title: 'Renombrar',
              callback: () => this.navigate(type, question),
            },
            {
              title: `Eliminar toda la data de '${question?.value}'`,
              callback: () => this.removeQuestion(question?._id),
            },
            {
              title: `Eliminar todo lo relacionado a  '${question?.value}'`,
              callback: () => this.removeQuestion(question?._id),
            }
          ],
        },
      ],
    });
  }

  navigate(type, question) {
    if (type == 'income' && question != null){
      this.webformsService.webformId = this.webformOrder._id;
      this.webformsService.editingQuestion = question;
      this.router.navigate([`/admin/rename-question/name`]);
    }
    else this.router.navigate([`/admin/expenditures/${type}`]);
  }

  openDatePicker() {
    this.datePicker.open();
  }

  async onDateChange() {

  }

  removeQuestion(questionId) {
    if (questionId != null && questionId != undefined) {
      this.dialogService.open(SingleActionDialogComponent, {
        type: 'fullscreen-translucent',
        props: {
          title: 'Elimina este artículo',
          buttonText: 'Sí, borrar',
          mainButton: () => {
            this.webformsService.webformRemoveQuestion(
              [questionId],
              this.webformOrder._id
            );
            this.questions = this.questions.filter(e=>e._id!=questionId);
          },
        },
      });
    }
  }
}
