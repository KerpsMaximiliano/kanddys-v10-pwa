import { Component, OnInit, ViewChild } from '@angular/core';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import { fileToBase64 } from 'src/app/core/helpers/files.helpers';
import { ItemImageInput, ItemInput } from 'src/app/core/models/item';
import { ItemsService } from 'src/app/core/services/items.service';
import { SwiperOptions } from 'swiper';
import { DecimalPipe } from '@angular/common';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-article-upload',
  templateUrl: './article-upload.component.html',
  styleUrls: ['./article-upload.component.scss'],
})
export class ArticleUploadComponent implements OnInit {
  constructor(
    private _ItemsService: ItemsService,
    private decimalPipe: DecimalPipe,
    private merchantService: MerchantsService,
    private snackBar: MatSnackBar,
    private _formBuilder: FormBuilder
  ) {}

  currentMediaSlide: number;
  @ViewChild('mediaSwiper') mediaSwiper: SwiperComponent;
  kioskoName: string;
  file;
  base64;
  images;
  pricing: number;
  formattedPricing = '$0.00';
  initialValue: number;
  nameMessage: string = 'Este nombre no está disponible';
  isMerchantCreated;
  url: string;
  interval;
  item;

  slides = [{ number: 0 }, { number: 1 }, { number: 2 }];

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

  itemForm = this._formBuilder.group({
    name: [null, [Validators.required, Validators.minLength(4)]],
  });

  itemFormImg = this._formBuilder.group({
    img: [null, Validators.required],
  });

  itemFormPrice = this._formBuilder.group({
    price: [null, Validators.required],
  });

  async ngOnInit() {
    this.currentMediaSlide = 0;
    this.swiperConfig.allowSlideNext = false;
    // this.initialValue = this.getNumericValue(this.initialValue);
    // if (this.initialValue) this.formatNumber(this.initialValue);
    if (this.currentMediaSlide === 0 && !this.itemForm.valid) {
      this.swiperConfig.allowSlideNext = false;
    }

    // else if (this.currentMediaSlide === 1 && !this.images) {
    //   this.swiperConfig.allowSlideNext = false;
    // } else {
    //   this.swiperConfig.allowSlideNext = true;
    // }

    if (this.currentMediaSlide === 0 && !this.itemForm.valid) {
      this.swiperConfig.allowSlideNext = false;
    } else {
      this.swiperConfig.allowSlideNext = true;
    }

    await this.runInterval();
  }

  async runInterval() {
    this.interval = setInterval(async () => {
      console.log('Chequeando');
      if (this.currentMediaSlide !== 0 && this.itemForm.valid) {
        console.log('Dentro del if');
        const isNewMerchant = await this.merchantService.merchantByName(
          this.kioskoName
        );

        console.log(isNewMerchant);

        // if (isNewMerchant) {
        //   console.log(isNewMerchant._id);
        // }
      }
    }, 15000);

    // if (this.item.createPreItem) {
    //   clearInterval(this.interval);
    // }
  }

  // stopInterval() {
  //   clearInterval(this.interval);
  // }

  async updateCurrentSlideData() {
    this.currentMediaSlide = await this.mediaSwiper.directiveRef.getIndex();

    if (this.currentMediaSlide === 1 && !this.images) {
      this.swiperConfig.allowSlideNext = false;
    } else if (this.currentMediaSlide === 1 && this.images) {
      this.swiperConfig.allowSlideNext = true;
    }
    console.log(this.currentMediaSlide);
    console.log(this.images);

    console.log(this.itemForm.valid);

    // if (this.currentMediaSlide === 5 && !this.itemFormMail.valid) {
    //   this.swiperConfig.allowSlideNext = false;
    // } else if (this.currentMediaSlide === 5 && this.checkMail) {
    //   this.swiperConfig.allowSlideNext = false;
    //   this.snackBar.open('Este correo ya se encuentra registrado', '', {
    //     duration: 2000,
    //   });
    // } else if (this.currentMediaSlide === 6 && !this.itemFormPhone.valid) {
    //   this.swiperConfig.allowSlideNext = false;
    // } else if (this.currentMediaSlide === 6 && this.checkPhone) {
    //   this.swiperConfig.allowSlideNext = false;
    //   this.snackBar.open('Este telefono ya se encuentra registrado', '', {
    //     duration: 2000,
    //   });
    // } else if (this.currentMediaSlide === 9 && !this.isCountrySelected) {
    //   this.swiperConfig.allowSlideNext = false;
    // } else if (this.currentMediaSlide === 10 && !this.isCitySelected) {
    //   this.swiperConfig.allowSlideNext = false;
    // } else {
    //   this.swiperConfig.allowSlideNext = true;
    // }
  }

  async onNameInput(event: Event | string, input: HTMLInputElement) {
    this.kioskoName = input.value;
    console.log(this.kioskoName);
    this.itemForm.get('name').patchValue(this.kioskoName);
    console.log(this.kioskoName.length);
    if (this.kioskoName.length === 0) this.swiperConfig.allowSlideNext = false;
    this.checkMerchant(this.kioskoName);
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
    this.itemFormImg.get('img').patchValue(this.base64);

    const reader = new FileReader();
    reader.onload = (e) => {
      this._ItemsService.editingImageId = this.images[0]._id;
    };
    this.updateCurrentSlideData();
  }

  async nextSlide() {
    // this.swiperConfig.allowSlideNext = true;
    this.mediaSwiper.directiveRef.nextSlide();
  }

  onCurrencyInput(value: number) {
    this.pricing = value;
    this.itemFormPrice.get('price').patchValue(this.pricing);
  }

  public templateStyles() {
    return { 'grid-template-columns': `repeat(3, 1fr)` };
  }

  async checkMerchant(name: string) {
    const checkedMerchant = await this.merchantService.merchantByName(name);
    console.log(checkedMerchant);
    if (checkedMerchant) {
      console.log(checkedMerchant._id);
    }

    console.log(this.isMerchantCreated);

    if (checkedMerchant && this.currentMediaSlide === 0) {
      this.swiperConfig.allowSlideNext = false;
      this.snackBar.open('Este nombre no se encuentra disponible', '', {
        duration: 2000,
      });
    } else {
      this.swiperConfig.allowSlideNext = true;
    }
  }

  async sendMessage() {
    const itemInput: ItemInput = {
      pricing: this.pricing,
      images: this.images,
    };
    this.item = await this._ItemsService.createPreItem(itemInput);
    console.log(this.item);
    console.log(this.item.createPreItem);
    console.log(this.item.createPreItem._id);
    clearInterval(this.interval);
    const whatsapp = await this.merchantService.createMerchantWhatsapp(
      this.item.createPreItem._id,
      this.kioskoName
    );
    console.log(whatsapp);

    if (whatsapp) {
      const url = whatsapp.createMerchantWhatsapp;
      console.log(url);

      const stringUrl = String(url);

      console.log(this.url);
      window.open(stringUrl, '_blank');
    }
  }
}
