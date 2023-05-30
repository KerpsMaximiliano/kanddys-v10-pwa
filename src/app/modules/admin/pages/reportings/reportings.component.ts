import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Merchant } from 'src/app/core/models/merchant';
import { Answer, Question } from 'src/app/core/models/webform';
import { AuthService } from 'src/app/core/services/auth.service';
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
  merchant: Merchant = null;
  deliveryZonesTotal: any = { total: 0, count: 0 };
  onlyDayTotal: any = { total: 0, count: 0 };
  onlyMonthTotal: any = { total: 0, count: 0 };
  recurrentTotal: any = { total: 0, count: 0 };
  incomeByDeliveryZones: any = { total: 0, count: 0 };
  questions: Array<{
    question?: Question;
    answer?: Answer;
  }> = [];
  extraIncomesInProducts: Array<{
    _id: string;
    value: string;
    merchant: string;
    field: string;
  }> = [];
  expenditureTypesCreatedByMerchant: Array<{
    _id: string;
    value: string;
    merchant: string;
    field: string;
  }> = [];
  extraIncomeTotalForTypeCreatedByMerchantById: Record<string, any> = {};
  expenditureTypesCreatedByMerchantById: Record<string, any> = {};
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
    private authService: AuthService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private _bottomSheet: MatBottomSheet,
    private router: Router,
    private webformsService: WebformsService
  ) {}

  async ngOnInit() {
    await this.checkIfUserIsAMerchant();

    await this.getWebforms();
    this.getExpenditures();
    this.getIncomes();
    await this.getExtraIncomesInProducts();
    await this.getIncomeByDeliveryZone();
    await this.getExpenditureTypesCustom();
  }

  async checkIfUserIsAMerchant() {
    const user = await this.authService.me();

    if (user) {
      const merchantDefault = await this.merchantsService.merchantDefault();

      if (!merchantDefault) this.router.navigate(['others/error-screen']);

      this.merchant = merchantDefault;
    } else {
      this.router.navigate(['auth/login']);
    }
  }

  async getDeliveryZones() {
    let result = await this.deliveryZoneService.deliveryZones();
    console.log(result);
  }

  async getIncomeByDeliveryZone() {
    const result =
      await this.deliveryZoneService.incomeTotalDeliveryZoneByMerchant(
        this.merchant._id
      );

    if (result) this.incomeByDeliveryZones = result;
  }

  async getExpenditureTypesCustom() {
    const result = await this.orderService.expenditureTypesCustom(
      this.merchant._id
    );
    if (result) {
      this.expenditureTypesCreatedByMerchant = result;

      for await (const expenditure of this.expenditureTypesCreatedByMerchant) {
        const result = await this.orderService.expendituresTotal(
          'delivery-zone',
          this.merchant._id,
          expenditure._id
        );

        if (result)
          this.expenditureTypesCreatedByMerchantById[result._id] = result;
      }
    }
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

  async getExtraIncomesInProducts() {
    this.extraIncomesInProducts = await this.orderService.incomeTypes(
      this.merchant?._id
    );

    for await (const income of this.extraIncomesInProducts) {
      const result = await this.orderService.incomeTotalByType(
        income._id,
        this.merchant._id,
        'item'
      );

      if (result)
        this.extraIncomeTotalForTypeCreatedByMerchantById[income._id] = result;
    }
  }

  async getMerchant() {
    this.merchant = await this.merchantsService.merchantDefault();
  }

  async getWebforms() {
    const result = await this.webformsService.webforms({
      findBy: {
        type: 'order',
        active: true,
        user: this.merchant.owner._id,
      },
    });
    this.webformOrder = result[0];
    const questions = result[0].questions;
    if (questions.length > 0)
      questions.map(question => {
        this.questions.push({ question });
      });
  }

  async getAnswers(webformId: string) {
    const result = await this.webformsService.answerPaginate(
      {
        findBy: {
          webform: webformId,
        }
      }
    );


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
            },
          ],
        },
      ],
    });
  }

  navigate(type, question) {
    if (type == 'income' && question != null) {
      this.webformsService.webformId = this.webformOrder._id;
      this.webformsService.editingQuestion = question;
      this.router.navigate([`/admin/rename-question/name`]);
    } else this.router.navigate([`/admin/expenditures/${type}`]);
  }

  openDatePicker() {
    this.datePicker.open();
  }

  async onDateChange() {}

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
            this.questions = this.questions.filter((e) => e.question._id != questionId);
          },
        },
      });
    }
  }
}
