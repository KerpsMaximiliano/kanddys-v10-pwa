import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { getDaysAgo } from 'src/app/core/helpers/strings.helpers';
import { Expenditure, ItemOrder } from 'src/app/core/models/order';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { ConfirmationDialogComponent } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-order-expenses',
  templateUrl: './order-expenses.component.html',
  styleUrls: ['./order-expenses.component.scss'],
})
export class OrderExpensesComponent implements OnInit {
  env: string = environment.assetsUrl;
  order: ItemOrder;
  adding = false;
  expenditures: Expenditure[] = [];
  orderExpenditures: Expenditure[] = [];
  expendituresByZone: Expenditure[] = [];
  expendituresByUsed: Expenditure[] = [];
  benefits: {
    benefits: number;
    less: number;
  } = {
    benefits: 0,
    less: 0,
  };
  expenseForm = this._formBuilder.group({
    name: ['', Validators.required],
    amount: [0, [Validators.required, Validators.min(0.1)]],
  });
  daysAgo = getDaysAgo;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private merchantsService: MerchantsService,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private matSnackbar: MatSnackBar
  ) {}

  async ngOnInit(): Promise<void> {
    const orderId = this.route.snapshot.paramMap.get('orderId');
    this.order = (await this.orderService.order(orderId))?.order;
    if (!this.order) throw new Error('No hay orden');
    this.expenditures = await this.orderService.expenditures({
      findBy: {
        merchant: this.merchantsService.merchantData._id,
      },
      options: {
        sortBy: 'createdAt:desc',
      },
    });
    this.filterExpenditures();
    this.benefits.benefits = this.order.subtotals.reduce(
      (a, b) => a + b.amount,
      0
    );
    this.calculateExpenses();
  }

  calculateExpenses() {
    this.benefits.less = 0;
    this.orderExpenditures.forEach((expenditure) => {
      this.benefits.less += expenditure.amount;
    });
  }

  onDelete(expenditure: Expenditure) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: `Borrar egreso`,
        description: `Estás seguro que deseas borrar el egreso "${expenditure.name}"?`,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirm') {
        this.orderService.orderRemoveExpenditure(
          expenditure._id,
          this.order._id
        );
        this.order.expenditures = this.order.expenditures.filter(
          (value) => value !== expenditure._id
        );
        this.filterExpenditures();
        this.calculateExpenses();
      }
    });
  }

  addExpenditure(expenditure: Expenditure) {
    this.orderService.orderAddExpenditure(expenditure._id, this.order._id);
    this.order.expenditures.push(expenditure._id);
    this.matSnackbar.open(`${expenditure.name} agregado a la factura`, '', {
      duration: 2000,
    });
    this.filterExpenditures();
    this.calculateExpenses();
  }

  filterExpenditures() {
    this.orderExpenditures = this.expenditures.filter((expenditure) =>
      this.order.expenditures.includes(expenditure._id)
    );
    this.expendituresByZone = this.expenditures.filter(
      (expenditure) =>
        expenditure.type === 'delivery-zone' &&
        !this.order.expenditures.includes(expenditure._id)
    );
    this.expendituresByUsed = this.expenditures
      .filter(
        (expenditure) =>
          expenditure.type !== 'delivery-zone' &&
          !this.order.expenditures.includes(expenditure._id)
      )
      .sort((a, b) => +a.useDate - +b.useDate);
  }

  async createExpenditure() {
    const { name, amount } = this.expenseForm.value;
    if (
      (!name && !amount) ||
      (this.expenseForm.dirty && this.expenseForm.invalid)
    ) {
      this.expenseForm.reset();
      this.adding = !this.adding;
      return;
    }
    const expenditure = {
      name,
      amount,
      type: 'others',
    } as Expenditure;
    this.orderExpenditures.push(expenditure);
    this.expenseForm.reset();
    this.adding = !this.adding;
    const newExpenditure = await this.orderService.createExpenditure(
      this.merchantsService.merchantData._id,
      expenditure
    );
    this.orderExpenditures[this.orderExpenditures.length - 1]._id =
      newExpenditure._id;

    this.orderService.orderAddExpenditure(newExpenditure._id, this.order._id);
    this.order.expenditures.push(newExpenditure._id);
    this.calculateExpenses();
  }

  onCurrencyInput(value: number) {
    this.expenseForm.get('amount').patchValue(value);
  }
}
