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
import { Country, State, City } from 'country-state-city';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { NotificationDialogComponent } from '../../../../shared/dialogs/notification-dialog/notification-dialog.component';
import { Router } from '@angular/router';

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

  @ViewChild('mediaSwiper') mediaSwiper: SwiperComponent;

  constructor(
    private _ItemsService: ItemsService,
    private _formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private dialog: DialogService,
    private router: Router
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

  payOptions = [
    {
      text: 'Por transferencia directo a mi cuenta',
      callback: async () => {
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

  industrias = [
    { industria: 'Artículos del hogar', selected: false },
    { industria: 'Artículos personales', selected: false },
    { industria: 'Artículos de regalos', selected: false },
    { industria: 'Artículos del Amazon', selected: false },
    { industria: 'Servicios personales', selected: false },
    { industria: 'Servicios del hogar', selected: false },
    { industria: 'Comidas', selected: false },
    { industria: 'Spas', selected: false },
    { industria: 'Flores', selected: false },
  ];

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
    phone: [null, [Validators.required, Validators.minLength(12)]],
  });

  itemFormBank = this._formBuilder.group({
    name: [null, [Validators.required, Validators.minLength(10)]],
    account: [null, [Validators.required, Validators.minLength(16)]],
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

  ngOnInit(): void {
    this.currentMediaSlide = 0;

    console.log(this.itemFormMail.valid);
    console.log(this.phoneNumber);

    // console.log(Country.getAllCountries());

    // console.log(State.getStatesOfCountry('AR'));
    // console.log(City.getCitiesOfCountry('AR'));

    // console.log(State.getAllStates());
    // console.log(City.getAllCities());
  }

  async updateCurrentSlideData() {
    this.currentMediaSlide = await this.mediaSwiper.directiveRef.getIndex();
    console.log(this.currentMediaSlide);

    if (this.currentMediaSlide === 5 && !this.itemFormMail.valid) {
      this.swiperConfig.allowSlideNext = false;
    } else if (
      this.currentMediaSlide === 6 &&
      !this.itemFormPhone.valid &&
      this.inputPhone !== null
    ) {
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

    this.cities = await City.getCitiesOfCountry(this.selectedCountryCode);

    console.log(this.cities);

    await this.nextSlide();
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

    if (!this.checkMail && !this.checkPhone) {
      this.user = await this.authService.signup(
        this.signUpInput,
        'none',
        null,
        false
      );
      console.log(this.user);

      this.router.navigate([`ecommerce/kiosko-view/${this.user.user._id}`]);
    }
  }
}
