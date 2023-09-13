import { Component, OnInit } from '@angular/core';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { MerchantsService } from 'src/app/core/services/merchants.service';

@Component({
  selector: 'app-super-admin-merchants',
  templateUrl: './super-admin-merchants.component.html',
  styleUrls: ['./super-admin-merchants.component.scss'],
})
export class SuperAdminMerchantsComponent implements OnInit {
  merchants: any = [];
  months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];


  constructor(private merchantService: MerchantsService) {}

  ngOnInit(): void {
    this.getMerchants();
    this.getMonthsOfYear();
  }

  async getMerchants() {
    let input: PaginationInput = {
      options: {
        limit: -1,
      },
    };
    let result = await this.merchantService.merchants(input);
    if (result != undefined) this.merchants = result;
  }

  getMonthsOfYear(){
    let today = new Date();
    console.log(today.getMonth())
    this.months = this.months.slice(0,today.getMonth()+1).reverse();
  }

  getMerchantsMonth(month){
    return this.merchants.filter(e=> new Date(e.createdAt)?.getMonth()==month);
  }

  isStore = (merchant) => merchant?.roles?.some(e=>e.name?.toUpperCase()=="STORE" ||e.code?.toUpperCase()=="STORE" );
  isProvider = (merchant) => merchant?.roles?.some(e=>e.name?.toUpperCase()=="PROVIDER" ||e.code?.toUpperCase()=="PROVIDER");

  saleToText(merchant){
    if(this.isStore(merchant)) return "consumidor final";
    else if(this.isProvider(merchant)) return "floristerias";
    else return "no definido";
  }
  
}
