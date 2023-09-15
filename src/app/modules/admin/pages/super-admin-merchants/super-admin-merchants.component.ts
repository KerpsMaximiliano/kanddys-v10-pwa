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
  countries: any = [];
  merchantTypes: any = [];
  merchantCountries: any = [];
  selectedCountries: any = [];
  selectedRoles: any = [];
  everyCountrySelected = true;
  everyRoleSelected = true;
  totalMerchants = 0;

  constructor(private merchantService: MerchantsService) {}

  ngOnInit(): void {
    this.getMerchants();
    this.getMonthsOfYear();
    this.getDataCountries();
    this.getMerchantsType();
    this.getMerchantsCountries();
  }

  async getMerchants() {
    let isTotal = true;
    let input: PaginationInput = {
      options: {
        limit: -1,
      },
    };
    if (this.selectedCountries.length > 0) {
      input.findBy = input.findBy || {};
      input.findBy.deliveryLocations = [
        {
          country: this.selectedCountries,
        },
      ];

      isTotal = false;
    }
    if (this.selectedRoles.length > 0) {
      input.findBy = input.findBy || {};
      input.findBy.roles = this.selectedRoles

      isTotal = false;
    }
    let result = await this.merchantService.merchants(input);
    if (result != undefined) {
      this.merchants = result;
      if (isTotal) this.totalMerchants = result.length;
    }
  }

  getMonthsOfYear() {
    let today = new Date();
    this.months = this.months.slice(0, today.getMonth() + 1).reverse();
  }

  getMerchantsMonth(month) {
    return this.merchants.filter(
      (e) => new Date(e.createdAt)?.getMonth() == month
    );
  }

  isStore = (merchant) =>
    merchant?.roles?.some(
      (e) =>
        e.name?.toUpperCase() == 'STORE' || e.code?.toUpperCase() == 'STORE'
    );
  isProvider = (merchant) =>
    merchant?.roles?.some(
      (e) =>
        e.name?.toUpperCase() == 'PROVIDER' ||
        e.code?.toUpperCase() == 'PROVIDER'
    );

  saleToText(merchant) {
    if (this.isStore(merchant)) return 'consumidor final';
    else if (this.isProvider(merchant)) return 'floristerias';
    else return 'no definido';
  }

  async getDataCountries() {
    let result = await this.merchantService.getDataCountries();
    if (result) this.countries = result;
  }

  getCountry(merchant) {
    const val = this.countries.find(
      (c) =>
        c._id ==
        merchant.deliveryLocations?.find(
          (e) => e.country != null && e.country != undefined
        )?.country._id
    )?.value;
    return val;
  }

  async getMerchantsType() {
    let result = await this.merchantService.merchantQuantityOfFiltersRole();
    if (result != undefined) this.merchantTypes = result;
  }

  merchantsQuantityStore() {
    return this.merchantTypes.find(
      (e) => e.role?.code?.toUpperCase() == 'STORE'
    )?.total;
  }

  merchantsQuantityProvider() {
    return this.merchantTypes.find(
      (e) => e.role?.code?.toUpperCase() == 'PROVIDER'
    )?.total;
  }

  async getMerchantsCountries() {
    let result = await this.merchantService.merchantQuantityOfFiltersCountry();
    if (result != undefined) this.merchantCountries = result;
  }

  getQuantityOfCountry(country) {
    return (
      this.merchantCountries.find((e) => e.country?._id == country._id)
        ?.count || 0
    );
  }

  selectCountry(countryId) {
    if (countryId == true) {
      this.everyCountrySelected = true;
      this.selectedCountries = [];
    } else {
      this.everyCountrySelected = false;
      if (this.selectedCountries.some((e) => e == countryId))
        this.selectedCountries = this.selectedCountries.filter(
          (e) => e != countryId
        );
      else this.selectedCountries.push(countryId);
    }

    this.getMerchants();
  }

  selectRole(roleName) {
    if (roleName == true) {
      this.everyRoleSelected = true;
      this.selectedRoles = [];
    } else {
      let roleId = this.merchantTypes.find(
        (e) => e.role?.code?.toUpperCase() == roleName
      )?.role?._id;
      this.everyRoleSelected = false;
      if (this.selectedRoles.some((e) => e == roleId))
        this.selectedRoles = this.selectedRoles.filter((e) => e != roleId);
      else this.selectedRoles.push(roleId);
    }

    this.getMerchants();
  }

  isCountrySelected = (countryId) =>
    this.selectedCountries.some((e) => e == countryId);

    isRoleSelected(roleName){
      let roleId = this.merchantTypes.find(
        (e) => e.role?.code?.toUpperCase() == roleName
      )?.role?._id;
      return this.selectedRoles.some(e=>e==roleId);
    }
}
