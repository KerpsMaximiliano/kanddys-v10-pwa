import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { fileToBase64 } from 'src/app/core/helpers/files.helpers';
import { unlockUI } from 'src/app/core/helpers/ui.helpers';
import { ItemImageInput } from 'src/app/core/models/item';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-create-expenditure',
  templateUrl: './create-expenditure.component.html',
  styleUrls: ['./create-expenditure.component.scss'],
})
export class CreateExpenditureComponent implements OnInit {
  env: string = environment.assetsUrl;
  merchant: any = {};
  type;
  typeRequest;
  amount;
  name = '';
  file;
  base64: any;
  showDays = false;
  months = [
    { id: 1, month: 'Ene', selected: false },
    { id: 2, month: 'Feb', selected: false },
    { id: 3, month: 'Mar', selected: false },
    { id: 4, month: 'Abr', selected: false },
    { id: 5, month: 'May', selected: false },
    { id: 6, month: 'Jun', selected: false },
    { id: 7, month: 'Jul', selected: false },
    { id: 8, month: 'Ago', selected: false },
    { id: 9, month: 'Sep', selected: false },
    { id: 10, month: 'Oct', selected: false },
    { id: 11, month: 'Nov', selected: false },
    { id: 12, month: 'Dic', selected: false },
  ];

  days: any = [];
  title: any;
  constructor(
    private orderService: OrderService,
    private merchantService: MerchantsService,
    private router: Router,
    private activatedRoute:ActivatedRoute
  ) {}

  async ngOnInit() {
    this.selectMonth();
    await this.getMerchant();
    this.activatedRoute.params.subscribe(params => {
      this.type = params['type'];
      this.setValues();
    });
  }

  async getMerchant() {
    this.merchant = await this.merchantService.merchantDefault();
  }

  selectMonth(id? : number) {
    let month = id;
    if (!id) month = new Date().getMonth() + 1;
    this.months.forEach((e) => {
      if (e.id == month) e.selected = true;
      else e.selected = false;
    });
    if (id) this.createDays(month);
    if (!id) this.createDays(month, true);
  }

  createDays(id, currentDay: boolean = false) {
    this.days = [];
    const day = new Date().getDate();
    console.log(day);

    let daysCount = this.getDaysInMonth(id);
    for (let i = 1; i <= daysCount; i++) {
      let selected = false;
      if (currentDay && i == day) {
        selected = true
        this.days.push({ id: day, selected });
      } 
      else if (i == 1 && !currentDay) {
        selected = true;
        this.days.push({ id: i, selected });
      }
      else this.days.push({ id: i, selected });
    }
  }

  getDaysInMonth(month): number {
    const year = new Date().getFullYear();
    return new Date(year, month, 0).getDate();
  }

  selectDay(id) {
    this.days.forEach((e) => {
      if (e.id == id) e.selected = true;
      else e.selected = false;
    });
  }

  async onImageInput(file) {
    this.file = file;
    console.log(this.file);
    this.base64 = await fileToBase64(file[0]);
    console.log(this.base64);
    let images: ItemImageInput[] = this.file.map((file) => {
      return {
        file: file,
        index: 0,
        active: true,
      };
    });
  }

  async createExpenditure() {
    if (this.amount) {

      try {
        unlockUI();
        await this.orderService.createExpenditure(
          this.merchant._id,
          {
            type: this.typeRequest,
            amount: this.amount,
            name: this.name,
            media: this.base64,
            activeDate: {
              from: this.createDate(),
              month: this.months.find((e) => e.selected)?.id,
            },
          }
        );
        unlockUI();
      } catch (error) {
        unlockUI();
        console.log(error);
      }
    }
    this.router.navigate([`admin/reportings`]);
  }

  createDate() {
    let day = this.days.find((e) => e.selected)?.id;
    let month = this.months.find((e) => e.selected)?.id;
    let year = new Date().getFullYear();

    return month + '/' + day + '/' + year;
  }

  setValues(){
    if(this.type=='day'){
      this.title = "Egreso único específico en un día"; 
      this.typeRequest = 'only-day';
      this.showDays = true;
    }else if(this.type=='month'){
      this.title = "Egreso especifico de un mes";
      this.typeRequest = 'only-month';
    }else{
      this.title ="Egresos mensuales y recurrentes";
      this.typeRequest = 'recurrent';
    }
  }
}
