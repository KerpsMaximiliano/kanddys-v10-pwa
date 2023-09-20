import { Component, OnInit } from '@angular/core';

import gql from 'graphql-tag';

import { MerchantsService } from 'src/app/core/services/merchants.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { Item } from 'src/app/core/models/item';
import { environment } from 'src/environments/environment';
import * as moment from 'moment'
import { Merchant } from 'src/app/core/models/merchant';

@Component({
  selector: 'app-affiliate-referals',
  templateUrl: './affiliate-referrals.component.html',
  styleUrls: ['./affiliate-referrals.component.scss']
})
export class AffiliateReferalsComponent implements OnInit {
  assetsFolder: string = environment.assetsUrl;
  currentMonth: string;
  previousMonth: string;
  startOfMonth: string;
  merchant:string;
  affiliate:any = [];

  datesOfYear = [];

  constructor( private merchantService: MerchantsService) { }

  async ngOnInit() {
    this.getFirstDayOfMonth();
    const currentDate = moment();
    this.currentMonth = (moment(currentDate).locale("es").format("MMMM")).toUpperCase();
    this.previousMonth = (moment().date(0).locale("es").format("MMMM")).toUpperCase();
    this.startOfMonth = moment().clone().startOf('month').format('YYYY-MM-DD hh:mm');
    await this.getMerchantDefault();
    await this.getAffiliateTotalRecords();
    console.log(this.affiliate);
    

  }

  back() { }

  getFirstDayOfMonth() {
    const fechaReferencia = moment();
    const enero = moment(fechaReferencia).startOf('year');
    while (fechaReferencia.isSameOrAfter(enero)) { // Obtenemos el nombre del mes
      this.datesOfYear.push({
        month: fechaReferencia.locale("es").format('MMMM'),
        date: moment(fechaReferencia).clone().startOf('month')
      })
      fechaReferencia.subtract(1, 'month');
    }
  }
  async getMerchantDefault(){
    const merchantDefault:Merchant = await this.merchantService.merchantDefault();
    this.merchant =  merchantDefault._id;
  }

  async getAffiliateTotalRecords(){
    const paginate: PaginationInput = {
      findBy:{
        reference: this.merchant
      }
    }
    this.datesOfYear.forEach(async date => {
      const affiliate  = await this.merchantService.affiliateTotalpaginate(paginate, date.date);
      if(affiliate.totalResults > 0){
        this.affiliate.push({
          results : affiliate.results,
          month: date.month
        })
      }
    }
    );
  }

}
