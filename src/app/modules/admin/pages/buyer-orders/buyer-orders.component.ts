import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { ItemOrder } from 'src/app/core/models/order';
import { User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { OrderService } from 'src/app/core/services/order.service';
import { FormComponent } from 'src/app/shared/dialogs/form/form.component';

interface ordersByMonth {
  [month: string]: ItemOrder[];
}

@Component({
  selector: 'app-buyer-orders',
  templateUrl: './buyer-orders.component.html',
  styleUrls: ['./buyer-orders.component.scss']
})
export class BuyerOrdersComponent implements OnInit {
  orders: ItemOrder[] = [];
  total: Number;
  months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  imageFiles: string[] = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
  externalOrderImages : File[] = [];
  externalOrderNumber : number | undefined;
  user: User;
  
  ordersByMonth = [];

  range = new FormGroup({
    start: new FormControl(''),
    end: new FormControl(''),
  });

  constructor(
    private orderService: OrderService, 
    private dialog: MatDialog,
    private authService: AuthService,
    private router: Router,
  ) { }

  async ngOnInit() {
    this.generate();
    this.user = await this.authService.me();
    console.log(this.user);

    if (!this.user) {
      this.router.navigate(['auth/login']);
    }
  }

  async generate() {
    lockUI();

    let options = {};
    let optionsOrderIncome = {};

    if(this.range.get('start')?.value && this.range.get('end')?.value) {
      options = {
        options: {
          limit: -1,
          sortBy: 'createdAt:desc',
          range: {
            from: this.range.get('start')?.value,
            to: this.range.get('end')?.value
          }
        },
      };
      optionsOrderIncome = {
        options: {
          range: {
            from: this.range.get('start')?.value,
            to: this.range.get('end')?.value
          }
        },
      }
    } else {
      options = {
        options: {
          limit: 50,
          sortBy: 'createdAt:desc'
        },
      };
      optionsOrderIncome = {};
    }

    this.orders = (
      await this.orderService.ordersByUser(options)
    )?.ordersByUser;
    console.log(this.orders);

    if(this.ordersByMonth?.length > 0) this.ordersByMonth = [];

    this.orders.map((jsonObject) => {
      if (jsonObject.hasOwnProperty("createdAt")) {
        const createdAt = new Date(jsonObject.createdAt);
        const month = createdAt.getMonth();
      
        const existingMonthObject = this.ordersByMonth.find((element) => element.month === this.months[month]);
      
        if (!existingMonthObject) {
          this.ordersByMonth.push({
            'month': this.months[month],
            'orders': [jsonObject]
          });
        } else {
          existingMonthObject.orders.push(jsonObject);
        }
      }
    });

    console.log(this.ordersByMonth);

    this.total = (
      await this.orderService.orderIncomeCompletedByUser(optionsOrderIncome)
    )?.orderIncomeCompletedByUser?.total;

    unlockUI()
  }

  calcTotal(subtotals: any) {
    let sum = 0;

    subtotals.forEach(subtotal => {
        sum += subtotal.amount;
    });

    return sum;
  }

  emitFileInputClick() {
    (document.querySelector('#file') as HTMLElement).click();
  }

  async loadFile(event: Event) {
    const fileList = (event.target as HTMLInputElement).files;
    console.log(fileList)
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!this.imageFiles.includes(file.type)) return;
      this.externalOrderImages.push(file);
    }
    if (!this.externalOrderImages.length) return;
    this.externalOrderDialog();
  }

  externalOrderDialog() {
    const dialogRef = this.dialog.open(FormComponent, {
      width: '500px',
      data: {
        title: {text:'Monto Pagado:',},
        fields: [
          {
            placeholder: "$ escribe...",
            type: 'text',
            name: 'externalOrderNumber',
            validators: [Validators.pattern(/^\d+(\.\d{2})?$/)],
          },
        ],
        buttonsTexts: {
          cancel: 'Brincar',
          accept: 'Guardar',
        }
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result)
      if (result) {
        console.log(result)
        this.externalOrderNumber = Number(result.value.externalOrderNumber);
        console.log(this.externalOrderNumber)
        this.sendExternalOrder(true);
      } else {
        this.sendExternalOrder(false);
      }
    });
  }

  async sendExternalOrder(sendAmount : boolean) {
    let orderData = {
      metadata: {
        files: this.externalOrderImages,
      },
      user: this.user._id,
    }
    console.log(orderData, this.externalOrderImages)
    if(sendAmount) {
      orderData["amount"] = this.externalOrderNumber;
    }
    await this.orderService.createOrderExternal(orderData, false);

    this.externalOrderImages = [];
    this.externalOrderNumber = undefined;
    this.generate()
  }

  change_start(event:any) {
    console.log('Start date changed:', event.target.value);
  }

  async change_end(event:any) {
    console.log('End date changed:', event.target.value);

    if(this.range.get('start')?.value && this.range.get('end')?.value) {
      this.generate();
    }
  }

  goToOrderDetail(orderID: string, orderType: string) {
    console.log(orderID, orderType);
    if(orderType === 'external') {
      return this.router.navigate(
        [
          `/ecommerce/manual-order-management/${orderID}`
        ],
        {
          queryParams: {
            redirectTo: this.router.url
          }
        }
      );
    }
    return this.router.navigate(
      [
        `/ecommerce/order-detail/${orderID}`
      ],
      {
        queryParams: {
          redirectTo: this.router.url
        }
      }
    );
  }

}
