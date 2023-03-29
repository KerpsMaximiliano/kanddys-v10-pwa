import { Component, OnInit, ViewChild } from '@angular/core';
import Swiper, { SwiperOptions } from 'swiper';
import SwiperCore, { Virtual } from 'swiper/core';
import { fileToBase64 } from 'src/app/core/helpers/files.helpers';
import { ItemImageInput, ItemInput } from 'src/app/core/models/item';
import { ItemsService } from 'src/app/core/services/items.service';
import { FormBuilder, Validators } from '@angular/forms';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from 'ngx-intl-tel-input';

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

  @ViewChild('mediaSwiper') mediaSwiper: SwiperComponent;

  constructor(
    private _ItemsService: ItemsService,
    private _formBuilder: FormBuilder
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
    { country: 'Estados Unidos', selected: false },
    { country: 'México', selected: false },
    { country: 'Colombia', selected: false },
    { country: 'España', selected: false },
    { country: 'Argentina', selected: false },
    { country: 'Perú', selected: false },
    { country: 'Venezuela', selected: false },
    { country: 'Chile', selected: false },
    { country: 'Ecuador', selected: false },
    { country: 'Guatemala', selected: false },
    { country: 'Bolivia', selected: false },
    { country: 'Costa Rica', selected: false },
    { country: 'República Dominicana', selected: false },
    { country: 'El Salvador', selected: false },
    { country: 'Honduras', selected: false },
    { country: 'Nicaragua', selected: false },
    { country: 'Panamá', selected: false },
    { country: 'Paraguay', selected: false },
    { country: 'Puerto Rico', selected: false },
    { country: 'Uruguay', selected: false },
  ];

  filteredCountries: any[] = [];

  searchText: string = '';

  cities = [
    { city: 'Ciudad ID xy' },
    { city: 'Ciudad ID xy' },
    { city: 'Ciudad ID xy' },
    { city: 'Ciudad ID xy' },
    { city: 'Ciudad ID xy' },
    { city: 'Ciudad ID xy' },
    { city: 'Ciudad ID xy' },
    { city: 'Ciudad ID xy' },
    { city: 'Ciudad ID xy' },
    { city: 'Ciudad ID xy' },
    { city: 'Ciudad ID xy' },
    { city: 'Ciudad ID xy' },
    { city: 'Ciudad ID xy' },
    { city: 'Ciudad ID xy' },
    { city: 'Ciudad ID xy' },
    { city: 'Ciudad ID xy' },
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
    phone: [null, [Validators.required, Validators.minLength(10)]],
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

  ngOnInit(): void {
    this.currentMediaSlide = 0;

    console.log(this.itemFormMail.valid);
  }

  updateCurrentSlideData(event: any) {
    this.currentMediaSlide = this.mediaSwiper.directiveRef.getIndex();
    console.log(this.currentMediaSlide);
    // if (this.currentMediaSlide === 5 && !this.itemFormMail.valid) {
    //   console.log('No se puede');
    //   this.swiperConfig.allowSlideNext = false;
    // }
    // else if (this.currentMediaSlide === 6 && !this.itemFormPhone.valid) {
    //   this.swiperConfig.allowSlideNext = false;
    // }
    // else if (this.itemFormMail.valid) {
    //   this.swiperConfig.allowSlideNext = true;
    // }
    // else if (this.currentMediaSlide === 6 && !this.itemFormPhone.valid) {
    //   this.swiperConfig.allowSlideNext = false;
    // }
    // else if (this.currentMediaSlide === 5 && this.itemFormMail.valid) {
    //   this.swiperConfig.allowSlideNext = true;
    // } else if (this.currentMediaSlide === 6 && this.itemFormPhone.valid) {
    //   this.swiperConfig.allowSlideNext = true;
    // }
  }

  async onImageInput(file) {
    this.file = file;
    console.log(this.file);
    this.base64 = await fileToBase64(file[0]);
    console.log(this.base64);
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
  }

  async onMailInput(event: Event | string, input: HTMLInputElement) {
    this.mail = input.value;
    this.itemFormMail.get('mail').patchValue(this.mail);
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

  onPhoneInput() {
    if (this.inputPhone != null) {
      let data: any = this.inputPhone;
      this.phoneNumber = data.e164Number;
      //console.log('full number: ', Data.e164Number);
    }
    this.itemFormPhone.get('phone').patchValue(this.phoneNumber);
  }

  filterCountries() {
    this.filteredCountries = this.countries.filter((item) => {
      return item.country.toLowerCase().includes(this.searchText.toLowerCase());
    });
  }

  nextSlide() {
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

  selectedCountry(index: number) {}
}
