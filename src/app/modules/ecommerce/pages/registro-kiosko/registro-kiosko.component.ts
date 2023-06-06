import { Component, OnInit, ViewChild } from '@angular/core';
import Swiper, { SwiperOptions } from 'swiper';
import SwiperCore, { Virtual } from 'swiper/core';
import { fileToBase64 } from 'src/app/core/helpers/files.helpers';
import { ItemImageInput, ItemInput } from 'src/app/core/models/item';
import { ItemsService } from 'src/app/core/services/items.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { FormBuilder, Validators } from '@angular/forms';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from 'ngx-intl-tel-input';
// import { Country, State, City } from 'country-state-city';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { NotificationDialogComponent } from '../../../../shared/dialogs/notification-dialog/notification-dialog.component';
import { Router } from '@angular/router';
import { IpusersService } from 'src/app/core/services/ipusers.service';
import { ContactService } from 'src/app/core/services/contact.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { CommunitiesService } from 'src/app/core/services/communities.service';

interface industry {
  industria: string;
  selected: boolean;
}

SwiperCore.use([Virtual]);

@Component({
  selector: 'app-registro-kiosko',
  templateUrl: './registro-kiosko.component.html',
  styleUrls: ['./registro-kiosko.component.scss'],
})
export class RegistroKioskoComponent implements OnInit {
  kioskoName: string = '';
  description: string = '';
  mail: string = '';
  bankName: string = '';
  account;
  country: string = '';
  city: string = '';

  user;
  userId: string;

  checkPhone;
  checkMail;

  signUpInput;
  columns: number = 12;
  minLength: number = 10;
  maxLength: number = 15;

  @ViewChild('mediaSwiper') mediaSwiper: SwiperComponent;

  constructor(
    private _ItemsService: ItemsService,
    private _formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private dialog: DialogService,
    private router: Router,
    private ipuser: IpusersService,
    private contactService: ContactService,
    private wallet: WalletService,
    private communities: CommunitiesService
  ) {}

  CountryISO = CountryISO.DominicanRepublic;
  preferredCountries: CountryISO[] = [
    CountryISO.DominicanRepublic,
    CountryISO.UnitedStates,
  ];
  PhoneNumberFormat = PhoneNumberFormat;

  selectedIndustries: string[] = [];

  slides = [
    { number: 0 },
    { number: 1 },
    { number: 2 },
    { number: 3 },
    { number: 4 },
    { number: 5 },
    { number: 6 },
    { number: 7 },
    { number: 8 },
    { number: 9 },
    { number: 10 },
    { number: 11 },
  ];

  countries = [
    { country: 'Estados Unidos', code: 'US' },
    { country: 'México', code: 'MX' },
    { country: 'Colombia', code: 'CO' },
    { country: 'España', code: 'ES' },
    { country: 'Argentina', code: 'AR' },
    { country: 'Perú', code: 'PE' },
    { country: 'Venezuela', code: 'VE' },
    { country: 'Chile', code: 'CL' },
    { country: 'Ecuador', code: 'EC' },
    { country: 'Guatemala', code: 'GT' },
    { country: 'Bolivia', code: 'BO' },
    { country: 'Costa Rica', code: 'CR' },
    { country: 'República Dominicana', code: 'DO' },
    { country: 'El Salvador', code: 'SV' },
    { country: 'Honduras', code: 'HN' },
    { country: 'Nicaragua', code: 'NI' },
    { country: 'Panamá', code: 'PA' },
    { country: 'Paraguay', code: 'PY' },
    { country: 'Puerto Rico', code: 'PR' },
    { country: 'Uruguay', code: 'UY' },
  ];

  filteredCountries: any[] = [];
  filteredCities: any[] = [];

  searchCountry: string = '';
  searchCity: string = '';

  selectedCountryCode: string;
  selectedCityCode: string;

  selectedCountryName: string;
  selectedCityName: string;

  cities;

  isTransfer: boolean = false;

  payOptions = [
    {
      text: 'Por transferencia directo a mi cuenta',
      callback: async () => {
        this.isTransfer = true;
        this.nextSlide();
      },
    },
    {
      text: 'Por tarjeta de crédito, afiliado a azul',
      callback: async () => {
        this.openDialog();
      },
    },
    {
      text: 'PayPal',
      callback: async () => {
        this.openDialog();
      },
    },
    {
      text: 'Xyz',
      callback: async () => {
        this.openDialog();
      },
    },
    {
      text: 'Agregaré esto después de generarle la factura a mi cliente',
      callback: async () => {
        this.openDialog();
      },
    },
  ];

  // industrias = [
  //   { industria: 'Artículos del hogar', selected: false },
  //   { industria: 'Artículos personales', selected: false },
  //   { industria: 'Artículos de regalos', selected: false },
  //   { industria: 'Artículos del Amazon', selected: false },
  //   { industria: 'Servicios personales', selected: false },
  //   { industria: 'Servicios del hogar', selected: false },
  //   { industria: 'Comidas', selected: false },
  //   { industria: 'Spas', selected: false },
  //   { industria: 'Flores', selected: false },
  // ];

  industrias: industry[] = [];

  itemFormMail = this._formBuilder.group({
    mail: [
      null,
      [
        Validators.required,
        Validators.pattern(
          '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'
        ),
      ],
    ],
  });

  itemFormPhone = this._formBuilder.group({
    phone: [
      null,
      [Validators.required, Validators.minLength(12), Validators.maxLength(15)],
    ],
  });

  itemFormBank = this._formBuilder.group({
    name: [null, [Validators.required, Validators.minLength(4)]],
    account: [
      null,
      [Validators.required, Validators.minLength(16), Validators.maxLength(20)],
    ],
  });

  itemFormCountry = this._formBuilder.group({
    country: [null, [Validators.required, Validators.minLength(4)]],
    city: [null, [Validators.required, Validators.minLength(4)]],
  });

  file;
  base64;
  images;

  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    resistance: false,
    freeMode: false,
    spaceBetween: 0,
    // autoplay: {
    //   delay: 10000,
    //   stopOnLastSlide: true,
    //   disableOnInteraction: false,
    // },
    allowSlideNext: true,
  };

  currentMediaSlide: number;
  inputPhone: string = '';
  phoneNumber: string = '';

  isCountrySelected: boolean = false;
  isCitySelected: boolean = false;
  isCurrentCountrySelected: boolean = false;

  userStorage;

  currentCity: string = '';
  currentCountry: string = '';

  allIndustries;

  async ngOnInit() {
    this.allIndustries = await this.communities.communitycategories({});
    console.log(this.allIndustries);

    console.log(this.allIndustries.communitycategories.length);

    for (let i = 0; i < this.allIndustries.communitycategories.length; i++) {
      let industry = {
        industria: this.allIndustries.communitycategories[i]?.name,
        selected: false,
      };
      console.log(industry);
      this.industrias.push(industry);
      console.log(this.industrias);
    }
    console.log(this.industrias);

    await this.getIp();
    this.currentMediaSlide = 0;

    console.log(this.itemFormMail.valid);
    console.log(this.phoneNumber);

    // const options = {
    //   enableHighAccuracy: true,
    //   timeout: 5000,
    //   maximumAge: 0,
    // };

    // this.userStorage = localStorage.getItem('user-data');
    // console.log(this.userStorage);

    // function success(pos) {
    //   const crd = pos.coords;

    //   console.log('Your current position is:');
    //   console.log(`Latitude : ${crd.latitude}`);
    //   console.log(`Longitude: ${crd.longitude}`);
    //   console.log(`More or less ${crd.accuracy} meters.`);
    // }

    // function error(err) {
    //   console.warn(`ERROR(${err.code}): ${err.message}`);
    // }

    // navigator.geolocation.getCurrentPosition(success, error, options);

    // console.log(Country.getAllCountries());

    // console.log(State.getStatesOfCountry('AR'));
    // console.log(City.getCitiesOfCountry('AR'));

    // console.log(State.getAllStates());
    // console.log(City.getAllCities());
  }

  async getIp() {
    let request;
    try {
      request = await fetch(
        'https://api.ipdata.co/?api-key=b193221ea697d98a5232c0a38625a79259f1b27f062a09b23e6ecc82',
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        }
      );
      let response = await request.json();

      // console.log(`Country: ${response.country_name}`);
      // console.log(`City: ${response.city}`);

      this.currentCity = response.city;
      this.currentCountry = response.country_name;
    } catch (error) {
      console.log(request);
      console.log(error);
    }
  }

  async updateCurrentSlideData() {
    this.currentMediaSlide = await this.mediaSwiper.directiveRef.getIndex();
    console.log(this.currentMediaSlide);

    if (this.currentMediaSlide === 5 && !this.itemFormMail.valid) {
      this.swiperConfig.allowSlideNext = false;
    } else if (this.currentMediaSlide === 6 && !this.itemFormPhone.valid) {
      this.swiperConfig.allowSlideNext = false;
    } else if (this.currentMediaSlide === 9 && !this.isCountrySelected) {
      this.swiperConfig.allowSlideNext = false;
    } else if (this.currentMediaSlide === 10 && !this.isCitySelected) {
      this.swiperConfig.allowSlideNext = false;
    } else {
      this.swiperConfig.allowSlideNext = true;
    }
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

    this.images = images;

    const reader = new FileReader();
    reader.onload = (e) => {
      this._ItemsService.editingImageId = this.images[0]._id;
    };
  }

  async onNameInput(event: Event | string, input: HTMLInputElement) {
    this.kioskoName = input.value;
    console.log(this.kioskoName);
  }

  onTitleInput(event: Event | string, input: HTMLInputElement) {
    this.description = input.value;
    console.log(this.description);
  }

  async onMailInput(event: Event | string, input: HTMLInputElement) {
    this.mail = input.value;
    this.itemFormMail.get('mail').patchValue(this.mail);

    await this.updateCurrentSlideData();

    //console.log(this.itemFormMail.valid);
  }

  async onBankInput(event: Event | string, input: HTMLInputElement) {
    this.bankName = input.value;
    this.itemFormBank.get('name').patchValue(this.bankName);
  }

  async onAccountInput(event: Event | string, input: HTMLInputElement) {
    this.account = input.value;
    this.itemFormBank.get('account').patchValue(this.account);
  }

  async onCountryInput(event: Event | string, input: HTMLInputElement) {
    this.country = input.value;
    this.itemFormCountry.get('country').patchValue(this.country);
  }

  async onCityInput(event: Event | string, input: HTMLInputElement) {
    this.city = input.value;
    this.itemFormCountry.get('city').patchValue(this.city);
  }

  async onPhoneInput() {
    if (this.inputPhone != null) {
      let data: any = this.inputPhone;
      this.phoneNumber = data.e164Number;
      console.log('full number: ', data.e164Number);
    }
    this.itemFormPhone.get('phone').patchValue(this.phoneNumber);
    await this.updateCurrentSlideData();
    console.log(this.itemFormPhone.valid);
  }

  openDialog() {
    this.dialog.open(NotificationDialogComponent, {
      type: 'flat-action-sheet',
      flags: ['no-header'],
      customClass: 'app-dialog',
      props: {
        mail: this.mail,
      },
    });
  }

  filterCountries() {
    this.filteredCountries = this.countries.filter((item) => {
      return item.country
        .toLowerCase()
        .includes(this.searchCountry.toLowerCase());
    });
  }

  async filterCities() {
    this.filteredCities = await this.cities.filter((item) => {
      return item.name.toLowerCase().includes(this.searchCity.toLowerCase());
    });
  }

  async nextSlide() {
    // this.swiperConfig.allowSlideNext = true;
    this.mediaSwiper.directiveRef.nextSlide();
  }

  async industrySelected(selected: number) {
    this.industrias[selected].selected = !this.industrias[selected].selected;
    console.log(this.industrias[selected].selected);
    if (this.selectedIndustries.includes(this.industrias[selected].industria)) {
      const index = this.selectedIndustries.indexOf(
        this.industrias[selected].industria
      );
      this.selectedIndustries.splice(index, 1);
      console.log(this.selectedIndustries);
    } else {
      this.selectedIndustries.push(this.industrias[selected].industria);
      console.log(this.selectedIndustries);
    }
  }

  async selectedCountry(index: number) {
    this.swiperConfig.allowSlideNext = true;
    this.isCountrySelected = true;
    this.isCurrentCountrySelected = false;
    await this.updateCurrentSlideData();
    if (this.searchCountry === '') {
      this.selectedCountryCode = this.countries[index].code;
      this.selectedCountryName = this.countries[index].country;
      console.log(this.countries[index]);
    } else {
      this.selectedCountryCode = this.filteredCountries[index].code;
      this.selectedCountryName = this.filteredCountries[index].country;
      console.log(this.filteredCountries[index]);
    }

    // this.cities = await City.getCitiesOfCountry(this.selectedCountryCode);

    console.log(this.cities);

    await this.nextSlide();
  }

  async selectCurrentCountry() {
    this.swiperConfig.allowSlideNext = true;
    this.isCountrySelected = false;
    this.isCurrentCountrySelected = true;
    this.columns = this.columns - 1;
    await this.nextSlide();
  }

  async noPayOption() {
    this.columns = this.columns - 1;
    await this.nextSlide();
  }

  public templateStyles() {
    return { 'grid-template-columns': `repeat(${this.columns}, 1fr)` };
  }

  async selectedCity(index: number) {
    this.swiperConfig.allowSlideNext = true;
    this.isCitySelected = true;
    await this.updateCurrentSlideData();
    if (this.searchCity === '') {
      this.selectedCityCode = this.cities[index].code;
      this.selectedCityName = this.cities[index].name;
      console.log(this.selectedCityName);
    } else {
      this.selectedCityCode = this.filteredCountries[index].code;
      this.selectedCityName = this.filteredCountries[index].name;
      console.log(this.selectedCityName);
    }
    await this.nextSlide();
  }

  async checkUser() {
    if (!this.user) {
      if (this.itemFormPhone.valid) {
        this.checkPhone = await this.authService.checkUser(this.phoneNumber);
        console.log(this.checkPhone);
      }
      if (this.itemFormMail.valid) {
        this.checkMail = await this.authService.checkUser(this.mail);
        console.log(this.checkMail);
      }
    }
  }

  saveBankData() {}

  async createUser() {
    console.log('Aqui creo el User');
    console.log(this.kioskoName);
    console.log(this.description);

    await this.checkUser();

    if (
      this.kioskoName !== '' &&
      this.description !== '' &&
      this.itemFormPhone.valid &&
      this.base64
    ) {
      this.signUpInput = {
        email: this.mail,
        title: this.description,
        username: this.kioskoName,
        phone: this.phoneNumber,
        image: this.base64,
      };
    } else if (
      this.kioskoName !== '' &&
      this.description !== '' &&
      this.itemFormPhone.valid &&
      !this.base64
    ) {
      this.signUpInput = {
        email: this.mail,
        title: this.description,
        username: this.kioskoName,
        phone: this.phoneNumber,
      };
    } else if (
      this.kioskoName !== '' &&
      this.description !== '' &&
      !this.itemFormPhone.valid &&
      !this.base64
    ) {
      this.signUpInput = {
        email: this.mail,
        username: this.kioskoName,
        title: this.description,
      };
    } else if (
      this.kioskoName !== '' &&
      this.description === '' &&
      !this.itemFormPhone.valid &&
      !this.base64
    ) {
      this.signUpInput = {
        email: this.mail,
        username: this.kioskoName,
      };
    } else if (
      this.kioskoName === '' &&
      this.description === '' &&
      !this.itemFormPhone.valid &&
      !this.base64
    ) {
      this.signUpInput = {
        email: this.mail,
      };
    } else if (
      this.kioskoName === '' &&
      this.description !== '' &&
      !this.itemFormPhone.valid &&
      !this.base64
    ) {
      this.signUpInput = {
        email: this.mail,
        title: this.description,
      };
    } else if (
      this.kioskoName === '' &&
      this.description === '' &&
      this.itemFormPhone.valid &&
      !this.base64
    ) {
      this.signUpInput = {
        email: this.mail,
        phone: this.phoneNumber,
      };
    } else if (
      this.kioskoName === '' &&
      this.description === '' &&
      !this.itemFormPhone.valid &&
      this.base64
    ) {
      this.signUpInput = {
        email: this.mail,
        image: this.base64,
      };
    } else if (
      this.kioskoName !== '' &&
      this.description === '' &&
      this.itemFormPhone.valid &&
      !this.base64
    ) {
      this.signUpInput = {
        email: this.mail,
        username: this.kioskoName,
        phone: this.phoneNumber,
      };
    } else if (
      this.kioskoName !== '' &&
      this.description === '' &&
      !this.itemFormPhone.valid &&
      this.base64
    ) {
      this.signUpInput = {
        email: this.mail,
        username: this.kioskoName,
        image: this.base64,
      };
    } else if (
      this.kioskoName === '' &&
      this.description !== '' &&
      this.itemFormPhone.valid &&
      !this.base64
    ) {
      this.signUpInput = {
        email: this.mail,
        title: this.description,
        phone: this.phoneNumber,
      };
    } else if (
      this.kioskoName === '' &&
      this.description !== '' &&
      !this.itemFormPhone.valid &&
      this.base64
    ) {
      this.signUpInput = {
        email: this.mail,
        title: this.description,
        image: this.base64,
      };
    } else if (
      this.kioskoName === '' &&
      this.description === '' &&
      this.itemFormPhone.valid &&
      this.base64
    ) {
      this.signUpInput = {
        email: this.mail,
        phone: this.phoneNumber,
        image: this.base64,
      };
    } else if (
      this.kioskoName !== '' &&
      this.description !== '' &&
      !this.itemFormPhone.valid &&
      this.base64
    ) {
      this.signUpInput = {
        email: this.mail,
        username: this.kioskoName,
        title: this.description,
        image: this.base64,
      };
    } else if (
      this.kioskoName !== '' &&
      this.description === '' &&
      this.itemFormPhone.valid &&
      this.base64
    ) {
      this.signUpInput = {
        email: this.mail,
        username: this.kioskoName,
        phone: this.phoneNumber,
        image: this.base64,
      };
    } else if (
      this.kioskoName === '' &&
      this.description !== '' &&
      this.itemFormPhone.valid &&
      this.base64
    ) {
      this.signUpInput = {
        email: this.mail,
        title: this.description,
        phone: this.phoneNumber,
        image: this.base64,
      };
    }

    if (!this.checkMail && !this.checkPhone && this.itemFormBank.valid) {
      this.user = await this.authService.signup(
        this.signUpInput,
        'none',
        null,
        false
      );
      console.log(this.user);

      const bankData = {
        name: this.bankName,
        account: this.account,
      };

      this.authService.generateMagicLink(
        this.phoneNumber.replace('+', ''),
        `/ecommerce/kiosko-view/${this.user.user._id}`,
        '',
        'UserAccess',
        { data: JSON.stringify(bankData) }
      );

      this.snackBar.open(
        'Te hemos enviado un link de acceso vía Whatsapp',
        '',
        {
          duration: 5000,
        }
      );

      // if (this.itemFormBank.valid) {
      //   const bankData = await this.wallet.createExchangeData({
      //     bank: [
      //       {
      //         bankName: this.bankName,
      //         account: this.account,
      //         typeAccount: 'tipo de cuenta',
      //         ownerAccount: '',
      //         isActive: true,
      //         routingNumber: 88888,
      //       },
      //     ],
      //   });
      //   console.log(bankData);
      // } else {
      //   this.snackBar.open('Los datos del banco son incorrectos', '', {
      //     duration: 5000,
      //   });
      // }

      // this.router.navigate([`ecommerce/kiosko-view/${this.user.user._id}`]);
    } else if (!this.itemFormBank.valid) {
      this.snackBar.open('Los datos del banco son incorrectos', '', {
        duration: 5000,
      });
    }
  }
}
