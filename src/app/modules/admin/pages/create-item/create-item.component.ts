import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Item } from 'src/app/core/models/item';
import { environment } from 'src/environments/environment';
import { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-create-item',
  templateUrl: './create-item.component.html',
  styleUrls: ['./create-item.component.scss'],
})
export class CreateItemComponent implements OnInit {
  env = environment.assetsUrl;
  defaultImages: (string | ArrayBuffer)[] = [''];
  imagesAlreadyLoaded: boolean;
  item: Item;
  disableFooter = true;

  imageField: (string | ArrayBuffer)[] = [];
  error: boolean[] = [];
  itemForm = new FormGroup({
    images: new FormControl([]),
    name: new FormControl(),
    description: new FormControl(),
    price: new FormControl(0, Validators.required)
  })

  swiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: false,
    spaceBetween: 5,
  };

  constructor(protected _DomSanitizer: DomSanitizer) {}

  ngOnInit(): void {}

  goBack() {
    //
  }

  toggleStatus() {
    //
  }

  onSubmit() {
    console.log(this.itemForm.value);
  }

  fileProgressMultiple(e: Event) {
    const fileList = (e.target as HTMLInputElement).files;
    if (fileList.length > 0) {
      this.itemForm.get('images').setValue(Array.from(fileList));
      this.imageField = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList.item(i);
        if (
          !['png', 'jpg', 'jpeg'].some((type) => file.type.includes(type)) ||
          !file.type.includes('image/')
        ) {
          if (!this.imageField[i]) this.error[i] = true;
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imageField[i] = reader.result;
        };
        reader.readAsDataURL(file);
      }
      return;
    }
  }

  sanitize(image: string | ArrayBuffer) {
    return this._DomSanitizer.bypassSecurityTrustStyle(
      `url(${image}) no-repeat center center / cover #E9E371`
    );
  }
}
