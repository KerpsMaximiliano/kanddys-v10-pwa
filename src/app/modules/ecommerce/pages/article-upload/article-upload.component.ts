import { Component, OnInit, ViewChild } from '@angular/core';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import { fileToBase64 } from 'src/app/core/helpers/files.helpers';
import { ItemImageInput } from 'src/app/core/models/item';
import { ItemsService } from 'src/app/core/services/items.service';
import { SwiperOptions } from 'swiper';
import { DecimalPipe } from '@angular/common';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private snackBar: MatSnackBar
  ) {}

  currentMediaSlide: number;
  @ViewChild('mediaSwiper') mediaSwiper: SwiperComponent;
  kioskoName;
  file;
  base64;
  images;
  pricing: number;
  formattedPricing = '$0.00';
  initialValue: number;
  nameMessage: string = 'Este nombre no está disponible';

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

  ngOnInit(): void {
    this.currentMediaSlide = 0;
    this.swiperConfig.allowSlideNext = false;
    // this.initialValue = this.getNumericValue(this.initialValue);
    // if (this.initialValue) this.formatNumber(this.initialValue);
  }

  async updateCurrentSlideData() {
    this.currentMediaSlide = await this.mediaSwiper.directiveRef.getIndex();
    console.log(this.currentMediaSlide);

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

    const reader = new FileReader();
    reader.onload = (e) => {
      this._ItemsService.editingImageId = this.images[0]._id;
    };
  }

  async nextSlide() {
    // this.swiperConfig.allowSlideNext = true;
    this.mediaSwiper.directiveRef.nextSlide();
  }

  onCurrencyInput(value: number) {
    this.pricing = value;
    // this.itemForm.get('pricing').patchValue(this.pricing);
  }

  public templateStyles() {
    return { 'grid-template-columns': `repeat(3, 1fr)` };
  }

  async checkMerchant(name: string) {
    const checkedMerchant = await this.merchantService.merchantByName(name);
    console.log(checkedMerchant);

    if (checkedMerchant) {
      this.swiperConfig.allowSlideNext = false;
      this.snackBar.open('Este nombre no se encuentra disponible', '', {
        duration: 2000,
      });
    } else {
      this.swiperConfig.allowSlideNext = true;
    }
  }

  sendMessage() {
    if (this.pricing > 0) {
      const message = `Hola, soy ${this.kioskoName}, te envío este mensaje`;
      window.location.href = `https://wa.me/19295263397?text=${message}`;
      //window.open(`https://wa.me/19295263397?text=${message}`, '_blank');
    }
  }

  // formatNumber(
  //   event: Event | number,
  //   emit?: boolean,
  //   input?: HTMLInputElement
  // ) {
  //   let value: string;
  //   if (typeof event === 'number') value = `${event}`;
  //   else value = (<HTMLInputElement>event.target).value;
  //   if (value.includes('.')) {
  //     value = value
  //       .split('')
  //       .filter((char) => char !== '.')
  //       .join('');
  //   }
  //   const plainNumber = value.split(',').join('');
  //   if (plainNumber[0] === '0') {
  //     const formatted =
  //       plainNumber.length > 3
  //         ? this.decimalPipe.transform(
  //             Number(plainNumber.slice(0, -2) + '.' + plainNumber.slice(-2)),
  //             '1.2'
  //           )
  //         : this.decimalPipe.transform(
  //             Number(
  //               '0.' +
  //                 (plainNumber.length <= 2
  //                   ? '0' + plainNumber.slice(1)
  //                   : plainNumber.slice(1))
  //             ),
  //             '1.2'
  //           );
  //     if (parseFloat(formatted.replace(/,/g, '')) > 9999999999999.99) {
  //       input.value = this.formattedPricing.replace(/\$|,/g, '');
  //       return;
  //     }
  //     this.formattedPricing = '$' + formatted;
  //   } else {
  //     const formatted =
  //       plainNumber.length > 2
  //         ? this.decimalPipe.transform(
  //             Number(plainNumber.slice(0, -2) + '.' + plainNumber.slice(-2)),
  //             '1.2'
  //           )
  //         : this.decimalPipe.transform(
  //             Number(
  //               '0.' +
  //                 (plainNumber.length === 1 ? '0' + plainNumber : plainNumber)
  //             ),
  //             '1.2'
  //           );
  //     if (parseFloat(formatted.replace(/,/g, '')) > 9999999999999.99) {
  //       input.value = this.formattedPricing.replace(/\$|,/g, '');
  //       return;
  //     }
  //     this.formattedPricing = '$' + formatted;
  //   }
  //   if (!emit) return;
  //   const num = parseFloat(this.formattedPricing.replace(/\$|,/g, ''));
  //   // this.onInputEvent.emit(num);
  // }

  // getNumericValue(value: number) {
  //   if (!value) return;
  //   return this.countDecimals(value) < 2 ? Math.floor(value * 100) : value;
  // }

  // countDecimals(value: number) {
  //   if (!value) return;
  //   if (Math.floor(value) === value) return 0;
  //   return value.toString().split('.')[1]?.length || 0;
  // }
}
