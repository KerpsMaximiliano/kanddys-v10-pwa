import { Component, OnInit, ViewChild } from '@angular/core';

import gql from 'graphql-tag';

import { MerchantsService } from 'src/app/core/services/merchants.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { PaginationInput, PaginationRangeInput } from 'src/app/core/models/saleflow';
import { Item, RangeDate } from 'src/app/core/models/item';
import { environment } from 'src/environments/environment';
import * as moment from 'moment'
import { Merchant } from 'src/app/core/models/merchant';
import { PaymentLogsService } from 'src/app/core/services/paymentLogs.service';
import { FormControl, FormGroup } from '@angular/forms';
import { QueryparametersService } from 'src/app/core/services/queryparameters.service';
import { QueryParameter } from 'src/app/core/models/query-parameters';
import { MatDatepicker } from '@angular/material/datepicker';
import { AffiliateService } from 'src/app/core/services/affiliate.service';

@Component({
  selector: 'app-affiliate-referals',
  templateUrl: './affiliate-referrals.component.html',
  styleUrls: ['./affiliate-referrals.component.scss']
})
export class AffiliateReferalsComponent implements OnInit {
  benefit:number = 0;
  startDateLabel:string = "";
  endDateLabel:string = "";
  itemSearchbar: FormControl = new FormControl('');
  assetsFolder: string = environment.assetsUrl;
  currentMonth: string;
  previousMonth: string;
  startOfMonth: string;
  merchant: string;
  affiliate: any = [];
  filteredResults: any = [];
  showAllMonths:boolean = true;
  startDate: Date = null;
  endDate: Date = null;
  range = new FormGroup({
    start: new FormControl(''),
    end: new FormControl(''),
  });
  queryParamaters: QueryParameter[] = [];
  datesOfYear = [];
  @ViewChild('picker') datePicker: MatDatepicker<Date>;

  constructor(private merchantService: MerchantsService, 
              private paymentLog: PaymentLogsService,
              private affiliateService: AffiliateService) { }

  async ngOnInit() {
    this.getFirstDayOfMonth();
    const currentDate = moment();
    this.currentMonth = (moment(currentDate).locale("es").format("MMMM")).toUpperCase();
    this.previousMonth = (moment().date(0).locale("es").format("MMMM")).toUpperCase();
    this.startOfMonth = moment().clone().startOf('month').format('YYYY-MM-DD hh:mm');
    await this.getMerchantDefault();
    await this.getAffiliateTotalRecords();

    let localTime = moment().format('YYYY-MM-DD'); // store localTime
    let currentDateFormated = localTime + "T00:00:00.000Z";
    const initialDateRangeBenefit: PaginationRangeInput = {
      from:"2023-01-01T00:00:00.000Z",
      to:currentDateFormated
    }
    await this.getBenefits(this.merchant,initialDateRangeBenefit);
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

  async getBenefits(reference, range){
    const benefits = await this.affiliateService.affiliateComisionTotalByRange(reference, range);
    this.benefit = benefits && benefits.total ? benefits.total : 0;
  }

  async getAffiliateTotalRecords() {
    this.affiliate = [];
    const paginate: PaginationInput = {
      findBy: {
        parent: this.merchant
      }
    }
    this.datesOfYear.forEach(async date => {
      const affiliate = await this.affiliateService.affiliateTotalpaginate(paginate, date.date);
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

  async onDateChange() {
    if (this.range.get('start').value && this.range.get('end').value) {
      lockUI();
      try {
        this.startDate = new Date(this.range.get('start').value);
        this.endDate = new Date(this.range.get('end').value);
        this.startDateLabel = moment(this.startDate).format("DD/MM/YYYY");
        this.endDateLabel = moment(this.endDate).format("DD/MM/YYYY");
        this.getDatesByRange();
        unlockUI();
      } catch (error) {
        unlockUI();
        console.log(error);
      }
    }
  }

  openDatePicker() {
    this.datePicker.open();
  }

  async getDatesByRange() {
    this.datesOfYear = [];
    const currentDate = new Date(this.startDate);
    while (currentDate <= this.endDate) {
      const fistDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      this.datesOfYear.push({
        month: moment(fistDayOfMonth).locale("es").format('MMMM'),
        date: moment(fistDayOfMonth).clone().startOf('month')
      })      
      // Avanza al mes siguiente
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    await this.getAffiliateTotalRecords();
    const starDateFormated = moment(this.startDate).format('YYYY-MM-DD')+ "T00:00:00.000Z";
    const endDateFormated = moment(this.endDate).format('YYYY-MM-DD')+ "T00:00:00.000Z";
    const dateRangeBenefit: PaginationRangeInput = {
      from:starDateFormated,
      to:endDateFormated
    }
    await this.getBenefits(this.merchant,dateRangeBenefit);

  }

}
