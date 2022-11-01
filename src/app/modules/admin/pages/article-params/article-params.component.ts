import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { AnexosDialogComponent } from 'src/app/shared/dialogs/anexos-dialog/anexos-dialog.component';

@Component({
  selector: 'app-article-params',
  templateUrl: './article-params.component.html',
  styleUrls: ['./article-params.component.scss'],
})
export class ArticleParamsComponent implements OnInit {
  steps: 'price' | 'images' | 'save' = 'price';
  selectedImages: (string | ArrayBuffer)[] = [];
  models: string[] = [
    'Modelo sin nombre',
    'Modelo sin nombre',
    'Modelo sin nombre',
  ];
  options: string[] = ['Precio', 'Imagen o imágenes'];
  searchValue: string;
  mouseDown: boolean;
  startX: number;
  scrollLeft: number;
  active: number;
  activeStep: number = 0;
  price = new FormControl('', [
    Validators.required,
    Validators.min(0.01),
    Validators.pattern(/[\S]/),
  ]);
  name = new FormControl('', [
    Validators.minLength(2),
    Validators.pattern(/[\S]/),
  ]);

  constructor(
    protected _DomSanitizer: DomSanitizer,
    private dialog: DialogService,
    private _ItemsService: ItemsService,
    private _MerchantService: MerchantsService,
    private _SaleflowService: SaleFlowService,
    private _Router: Router
  ) {}

  ngOnInit(): void {
    this._ItemsService.itemImages?.forEach((file) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        this.selectedImages.push(reader.result);
      };
    });
  }

  iconCallback = () => {
    console.log('string');
  };

  dotsCallback = () => {
    console.log('Dots');
  };

  startDragging(e: MouseEvent, el: HTMLDivElement) {
    this.mouseDown = true;
    this.startX = e.pageX - el.offsetLeft;
    this.scrollLeft = el.scrollLeft;
  }

  changeStep(index: number) {
    this.activeStep = index;
    console.log(index);
    switch (this.activeStep) {
      case 0:
        this.steps = 'price';
        break;

      case 1:
        this.steps = 'images';
        break;
    }
  }

  openDialog() {
    this.dialog.open(AnexosDialogComponent, {
      props: {
        title: 'Previamente Usados',
        options: [
          {
            option: 'NAMEID',
            subOption: '$priceId',
            callback: () => {
              console.log('primero');
            },
          },
          {
            option: 'NAMEID',
            subOption: '$priceId',
            callback: () => {
              console.log('segundo');
            },
          },
          {
            option: 'NAMEID',
            subOption: '$priceId',
            callback: () => {
              console.log('tercero');
            },
          },
          {
            option: 'NAMEID',
            subOption: '$priceId',
            callback: () => {
              console.log('sublime');
            },
          },
          {
            option: 'NAMEID',
            subOption: '$priceId',
            callback: () => {
              console.log('quinto');
            },
          },
          {
            option: 'NAMEID',
            subOption: '$priceId',
            callback: () => {
              console.log('sexto');
            },
          },
        ],
      },
      type: 'fullscreen-translucent',
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  async toSave() {
    if (this.steps === 'price') {
      this.steps = 'images';
      return;
    }
    if (this.steps === 'images') {
      const itemInput = {
        name: this.name.value || null,
        // description: description || null,
        pricing: this.price.value,
        images: this._ItemsService.itemImages,
        merchant: this._MerchantService.merchantData?._id,
        content: [],
        currencies: [],
        hasExtraPrice: false,
        purchaseLocations: [],
        showImages: this._ItemsService.itemImages.length > 0,
      };

      if (this._MerchantService.merchantData) {
        const { createItem } = await this._ItemsService.createItem(itemInput);
        await this._SaleflowService.addItemToSaleFlow(
          {
            item: createItem._id,
          },
          this._SaleflowService.saleflowData._id
        );
        this._Router.navigate([`/admin/options/${createItem._id}`]);
      } else {
        const { createPreItem } = await this._ItemsService.createPreItem(
          itemInput
        );

        if ('_id' in createPreItem) {
          localStorage.setItem('flowRoute', this._Router.url);
          this._Router.navigate([`/auth/login`], {
            queryParams: {
              itemId: createPreItem?._id,
              hasParams: '',
              action: 'precreateitem',
            },
          });
        }
      }
    }
  }

  goBack() {
    this.steps = 'price';
  }

  changeModel(index: number) {
    this.active = index;
    console.log(index);
  }

  stopDragging() {
    this.mouseDown = false;
  }

  moveEvent(e: MouseEvent, el: HTMLDivElement) {
    e.preventDefault();
    if (!this.mouseDown) {
      return;
    }
    const x = e.pageX - el.offsetLeft;
    const scroll = x - this.startX;
    el.scrollLeft = this.scrollLeft - scroll;
  }

  fileProgressMultiple(e: Event) {
    const fileList = (e.target as HTMLInputElement).files;
    if (!fileList.length) return;
    // this.itemForm.get('images').setValue(Array.from(fileList));
    // this.imageField = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList.item(i);
      this._ItemsService.itemImages.push(file);
      if (
        !['png', 'jpg', 'jpeg'].some((type) => file.type.includes(type)) ||
        !file.type.includes('image/')
      ) {
        // if (!this.imageField[i]) this.error[i] = true;
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImages.push(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  sanitize(image: string | ArrayBuffer) {
    return this._DomSanitizer.bypassSecurityTrustStyle(
      `url(${image}) no-repeat center center / cover #E9E371`
    );
  }
}
