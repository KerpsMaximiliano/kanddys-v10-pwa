import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { getDaysAgo } from 'src/app/core/helpers/strings.helpers';
import { Expenditure, ItemOrder } from 'src/app/core/models/order';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { ConfirmationDialogComponent } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { FormComponent, FormData } from 'src/app/shared/dialogs/form/form.component';
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
  orderData = {
    dateId: '',
    pricing: 0,
    totalOrders: 0,
    date: ''
  }

  private orderId = '';

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private matSnackbar: MatSnackBar,
    private orderService: OrderService,
    private merchantsService: MerchantsService,
    public headerService: HeaderService,
  ) { }

  ngOnInit() {
    this.getExpenditures()
  }

  async getExpenditures(): Promise<void> {
    this.orderId = this.route.snapshot.paramMap.get('orderId');
    this.order = (await this.orderService.order(this.orderId))?.order;
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
    this.orderData = {
      dateId: this.order.dateId.slice(-5),
      pricing: this.benefits.benefits,
      totalOrders: this.order.items.length,
      date: this.daysAgo(this.order.createdAt)
    }
  }

  calculateExpenses() {
    this.benefits.less = 0;
    this.orderExpenditures.forEach((expenditure) => {
      this.benefits.less += expenditure.amount;
    });
  }

  onDelete(expenditure: Expenditure) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: `Borrar egreso`,
        description: `Estás seguro que deseas borrar el egreso "${expenditure.name}"?`,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirm') {
        this.orderService.orderRemoveExpenditure(expenditure._id, this.order._id);
        this.order.expenditures = this.order.expenditures.filter((value) => value !== expenditure._id);
        this.filterExpenditures();
        this.calculateExpenses();
      }
    });
  }

  addExpenditure(expenditure: Expenditure,) {
    this.orderService.orderAddExpenditure(expenditure._id, this.order._id);
    this.order.expenditures.push(expenditure._id);
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

  onCurrencyInput(value: number) {
    this.expenseForm.get('amount').patchValue(value);
  }

  createExpenditure() {
    let fieldsToCreateForFormDialog: FormData = {
      fields: [{
        label: 'Precio del egreso',
        name: 'price',
        type: 'currency',
        validators: [Validators.pattern(/[\S]/), Validators.min(0.1)],
      },],
      buttonsTexts: {
        cancel: "Cancelar",
        accept: "Ok"
      }
    };

    const dialogRef = this.dialog.open(FormComponent, {
      data: fieldsToCreateForFormDialog,
    });

    dialogRef.afterClosed().subscribe(async (input: FormGroup) => {
      const isFieldValid = input?.value["price"] && input?.controls["price"].valid
      if (input.value["price"] === '') return
      try {
        if (isFieldValid) {
          const expenditure = {
            name: '',
            amount: input.value["price"],
            type: "others",
          } as Expenditure;
          const newExpenditure = await this.orderService
            .createExpenditure(this.merchantsService.merchantData._id, expenditure);
          this.orderService.orderAddExpenditure(newExpenditure._id, this.order._id)
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
          this.orderExpenditures.unshift(this.expenditures[0])
          this.matSnackbar.open(`Factura agregada`, '', { duration: 2000, });
        } else {
          this.headerService.showErrorToast("Precio invalido");
        }
      } catch (error) {
        console.error(error);
        this.headerService.showErrorToast(error);
      }
    });
  }

  modifyTitle(order: Expenditure) {
    const fieldsToCreateForFormDialog: FormData = {
      fields: [{
        label: 'Nombre del egreso',
        name: 'item-title',
        type: 'text',
        validators: [Validators.pattern(/[\S]/)],
        bottomButton: {
          text: 'Eliminar',
          containerStyles: {
            padding: '6px 0',
            color: '#C4C5C3',
            fontFamily: 'InterLight',
            fontSize: '17px',
            fontStyle: 'normal',
            lineHeight: 'normal',
          },
          callback: () => {
            this.dialog.closeAll()
            this.onDelete(order)
          }
        },
        submitButton: {
          text: "Ok",
          styles: {
            width: '70%',
            borderRadius: '8px',
            background: '#87CD9B',
            padding: '6px 15px',
            color: '#181D17',
            textAlign: 'center',
            fontFamily: 'InterBold',
            fontSize: '17px',
            fontStyle: 'normal',
            fontWeight: '700',
            lineHeight: 'normal',
            position: 'absolute',
            right: '0',
            bottom: '0',
          }
        }
      }],
      hideBottomButtons: true,
    };

    const dialogRef = this.dialog.open(FormComponent, { data: fieldsToCreateForFormDialog, });

    dialogRef.afterClosed().subscribe((input: FormGroup) => {
      const name = input?.value["item-title"]
      const isFieldValid = name && input?.controls["item-title"].valid
      if (name === '') return
      try {
        if (isFieldValid) {
          const expenditure = {
            name,
            amount: order.amount,
            type: order.type,
          } as Expenditure;
          this.orderService.updateExpenditure(expenditure, order._id)
            .then((data) => {
              const idOrderUpdated = data._id
              const id = this.orderExpenditures
                .findIndex(orderExpenditure => orderExpenditure._id === idOrderUpdated)
              this.orderExpenditures[id].name = name
              this.matSnackbar.open(`Nombre de la factura actualizada`, '', { duration: 2000, });
            }).catch(error => {
              console.error(error)
              this.headerService.showErrorToast("Nombre invalido");
            });
        }
      } catch (error) {
        console.error(error);
      }
    });
  }

  modifyPrice(order: Expenditure) {
    let fieldsToCreateForFormDialog = {
      fields: [{
        label: 'Precio del egreso',
        name: 'price',
        type: 'currency',
        validators: [Validators.pattern(/[\S]/), Validators.min(0.1)],
        bottomButton: {
          text: 'Cancelar',
          containerStyles: {
            padding: '6px 0',
            color: '#C4C5C3',
            fontFamily: 'InterLight',
            fontSize: '17px',
            fontStyle: 'normal',
            lineHeight: 'normal',
          },
        },
        submitButton: {
          text: "Ok",
          styles: {
            width: '70%',
            borderRadius: '8px',
            background: '#87CD9B',
            padding: '6px 15px',
            color: '#181D17',
            textAlign: 'center',
            fontFamily: 'InterBold',
            fontSize: '17px',
            fontStyle: 'normal',
            fontWeight: '700',
            lineHeight: 'normal',
            position: 'absolute',
            right: '0',
            bottom: '0',
          }
        }
      },],
    };

    const dialogRef = this.dialog.open(FormComponent, {
      data: fieldsToCreateForFormDialog,
    });

    dialogRef.afterClosed().subscribe((input: FormGroup) => {
      const amount = input?.value["price"]
      const isFieldValid = amount && input?.controls["price"].valid
      if (amount === '') return
      try {
        if (isFieldValid) {
          const expenditure = {
            name: order.name,
            amount,
            type: order.type,
          } as Expenditure;
          this.orderService.updateExpenditure(
            expenditure,
            order._id
          ).then(data => {
            const idOrderUpdated = data._id
            const id = this.orderExpenditures.findIndex(
              orderExpenditure => orderExpenditure._id === idOrderUpdated
            )
            this.orderExpenditures[id].amount = amount
            this.matSnackbar.open(`Precio de la factura actualizada`, '', { duration: 2000 });
          }).catch(error => console.error(error));
        } else {
          this.headerService.showErrorToast("Precio invalido");
        }
      } catch (error) {
        console.error(error);
      }
    });
  }
}
