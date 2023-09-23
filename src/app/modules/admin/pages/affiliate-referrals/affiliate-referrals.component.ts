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
import { PaymentLogsService } from 'src/app/core/services/paymentLogs.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-affiliate-referals',
  templateUrl: './affiliate-referrals.component.html',
  styleUrls: ['./affiliate-referrals.component.scss']
})
export class AffiliateReferalsComponent implements OnInit {
  itemSearchbar: FormControl = new FormControl('');
  assetsFolder: string = environment.assetsUrl;
  currentMonth: string;
  previousMonth: string;
  startOfMonth: string;
  merchant: string;
  affiliate: any = [];
  filteredResults: any = [];
  showAllMonths:boolean = true;

  datesOfYear = [];

  constructor(private merchantService: MerchantsService, private paymentLog: PaymentLogsService) { }

  async ngOnInit() {
    this.getFirstDayOfMonth();
    const currentDate = moment();
    this.currentMonth = (moment(currentDate).locale("es").format("MMMM")).toUpperCase();
    this.previousMonth = (moment().date(0).locale("es").format("MMMM")).toUpperCase();
    this.startOfMonth = moment().clone().startOf('month').format('YYYY-MM-DD hh:mm');
    await this.getMerchantDefault();
    await this.getAffiliateTotalRecords();

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
  async getMerchantDefault() {
    const merchantDefault: Merchant = await this.merchantService.merchantDefault();
    this.merchant = merchantDefault._id;
  }

  async getAffiliateTotalRecords() {
    const paginate: PaginationInput = {
      findBy: {
        parent: this.merchant
      }
    }
    this.datesOfYear.forEach(async date => {
      const affiliate = await this.merchantService.affiliateTotalpaginate(paginate, date.date);
      if (affiliate.referrals.totalResults > 0) {
        this.affiliate.push({
          affiliate: affiliate.affiliate,
          voucherData: await this.getVoucherData(affiliate.affiliate[0].paymentLog),
          results: affiliate.referrals.results,
          month: date.month
        })
      }
    }
    );
  }

  async getVoucherData(paymentId: string) {
    const paginate: PaginationInput = {
      findBy: {
        _id: paymentId,
        merchant: this.merchant
      }
    }
    const voucher = await this.paymentLog.paymentLogMerchant(paginate);
    return voucher[0];
  }

  async searchItems(event) {
    setTimeout(async () => {
      await this.getListItems(this.itemSearchbar.value);
    }, 500);
  }

  async getListItems(searchName = "") {
    if (searchName === "") {
      this.showAllMonths = true;
    } else {
      this.showAllMonths = false;
      setTimeout(async () => {
        await this.filterResults(searchName);
      }, 500);
    }
  }

  async filterResults(searchName) {
    this.filteredResults = [];
    const searchTextLower = searchName.toLowerCase();
    this.affiliate.forEach((affiliate: any, index) => {
      this.filteredResults.push(affiliate.results[index])
    })
    this.filteredResults = this.filteredResults.filter((result) => {
      const reference = result.reference || {};
      const owner = reference.owner || {};
      const name = reference.name || '';
      const email = owner.email || '';
      const phone = owner.phone || '';
      return (
        name.toLowerCase().includes(searchTextLower) ||
        email.toLowerCase().includes(searchTextLower) ||
        phone.toLowerCase().includes(searchTextLower)
      );
    });    
  }

}
