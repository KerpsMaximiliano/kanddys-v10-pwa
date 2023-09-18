import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { Merchant } from 'src/app/core/models/merchant';
import { Taxes } from 'src/app/core/models/taxes';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { TaxesService } from 'src/app/core/services/taxes.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';


@Component({
  selector: 'app-taxes',
  templateUrl: './taxes.component.html',
  styleUrls: ['./taxes.component.scss'],
})
export class TaxesComponent implements OnInit {
  assetsFolder: string = environment.assetsUrl;
  merchantId: string;
  taxes: any = [];
  finalCustomer: boolean = false;

  constructor(
    public merchantsService: MerchantsService,
    private taxesService: TaxesService,
    private router: Router,
  ) { }

  async ngOnInit() {
    await this.getMerchantDefault();
    await this.getTaxesbyMerchant();
  }

  async getMerchantDefault() {
    const merchantDefault: Merchant = await this.merchantsService.merchantDefault();
    this.merchantId = merchantDefault._id;
  }

  async getTaxesbyMerchant() {

    const taxesByMerchant = await this.taxesService.getTaxes({
      findBy: {
        merchant: this.merchantId
      },
    });

    this.taxes = taxesByMerchant;
    (this.taxes.find(tax => tax.type === "consumer")) ? this.finalCustomer = true : this.finalCustomer = false;
  }

  goToCreate() { }

  goToCreateFinalCustomer = () => {
    this.createFiscalCredit();
  }

  back() {

  }

  async createFiscalCredit() {
    const navigationData : NavigationExtras = {
      replaceUrl: true,
      queryParams : {
        merchant: this.merchantId,
      }
    }
    await this.router.navigate(['/admin/tax-edition'],  navigationData);
  }

  async goToEditTax(tax: any) {
    const navigationData : NavigationExtras = {
      replaceUrl: true,
      queryParams : {
        expiration: tax.expirationDate,
        percentage: tax.percentage,
        nextTax: tax.nextTax,
        type: tax.type,
        prefix: tax.prefix,
        merchant: this.merchantId,
        finalSequence: tax.finalSequence
      }
    }
    await this.router.navigate([`/admin/tax-edition/${tax._id}`], navigationData);
  }

  isAvailableToEdition(tax){
    const currentDate =  moment();
    const isafter = moment(tax.expirationDate).isAfter(currentDate);
    return isafter === true && (tax.available > 0) ? true : false;
  }
}
