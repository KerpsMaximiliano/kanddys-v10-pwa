import { DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Item } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import {
  StoreShareComponent,
  StoreShareList,
} from 'src/app/shared/dialogs/store-share/store-share.component';
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
  imageField: (string | ArrayBuffer)[] = [];
  item: Item;
  disableFooter = true;
  user: User;
  merchant: Merchant;
  saleflow: SaleFlow;
  changedImages = false;
  error: boolean[] = [];
  itemForm = new FormGroup({
    images: new FormControl([]),
    name: new FormControl(),
    description: new FormControl(),
    pricing: new FormControl(null, [Validators.required, Validators.min(1)]),
  });
  formattedPricing = '$0.00';
  curencyFocused = false;
  swiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: false,
    spaceBetween: 5,
  };

  constructor(
    protected _DomSanitizer: DomSanitizer,
    private authService: AuthService,
    private merchantService: MerchantsService,
    private saleflowService: SaleFlowService,
    private route: ActivatedRoute,
    private router: Router,
    private itemService: ItemsService,
    private headerService: HeaderService,
    private decimalPipe: DecimalPipe,
    private dialogService: DialogService
  ) {}

  async ngOnInit(): Promise<void> {
    const itemId = this.route.snapshot.paramMap.get('itemId');
    const promises: Promise<User | Merchant | Item>[] = [
      this.authService.me(),
      this.merchantService.merchantDefault(),
    ];
    if (itemId && !this.itemService.temporalItem)
      promises.push(this.itemService.item(itemId));
    const [user, userMerchant, item] = await Promise.all(promises);
    if (!user || !userMerchant) return;
    this.user = user as User;
    this.merchant = userMerchant as Merchant;
    this.saleflow = await this.saleflowService.saleflowDefault(
      this.merchant._id
    );
    if (!item && !this.itemService.temporalItem) return;
    this.item = item as Item;
    const { images, name, description, merchant } =
      this.item || this.itemService.temporalItem;
    let { pricing } = this.item || this.itemService.temporalItem;
    if (merchant && this.user._id !== merchant.owner._id)
      throw new Error('No eres el merchant dueño de este item');
    this.imageField = images;
    if (this.itemService.temporalItem?.images) this.changedImages = true;
    if (
      this.item?.images?.length > 1 ||
      this.itemService.temporalItem?.images?.length > 1
    )
      this.swiperConfig.pagination = {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true,
      };
    this.itemForm.get('name').setValue(name);
    this.itemForm.get('pricing').setValue(pricing);
    this.formatNumber(pricing);
    this.itemForm.get('description').setValue(description);
  }

  goBack() {
    this.router.navigate(['/admin/merchant-items']);
  }

  toggleStatus() {
    //
  }

  async onSubmit() {
    const { images, name, description } = this.itemForm.value;
    const pricing = parseFloat(this.formattedPricing.replace(/\$|,/g, ''));
    try {
      if (this.item || this.itemService.temporalItem?._id) {
        const itemInput = {
          name: name || null,
          description: description || null,
          pricing,
          content: [],
          currencies: [],
          hasExtraPrice: false,
          purchaseLocations: [],
          showImages: this.changedImages
            ? this.itemService.temporalImages?.new.length > 0 ||
              images.length > 0
            : this.itemService.temporalItem?.images?.length > 0 ||
              this.item.images.length > 0,
        };
        const { updateItem: updatedItem } = await this.itemService.updateItem(
          itemInput,
          this.item?._id || this.itemService.temporalItem?._id
        );

        if (updatedItem) {
          if (this.changedImages) {
            await this.itemService.deleteImageItem(
              this.item?.images || this.itemService.temporalImages.old,
              updatedItem._id
            );
            await this.itemService.addImageItem(
              images.length ? images : this.itemService.temporalImages.new,
              updatedItem._id
            );
          }
          this.itemService.removeTemporalItem();
          this.router.navigate([`/admin/merchant-items`]);
        }
      } else {
        const itemInput = {
          name: name || null,
          description: description || null,
          pricing,
          images: images,
          merchant: this.merchant?._id,
          content: [],
          currencies: [],
          hasExtraPrice: false,
          purchaseLocations: [],
          showImages:
            images.length > 0 || this.itemService.temporalImages.new.length > 0,
        };
        if (this.user) {
          const { createItem } = await this.itemService.createItem(itemInput);
          await this.saleflowService.addItemToSaleFlow(
            {
              item: createItem._id,
            },
            this.saleflow._id
          );
          if ('_id' in createItem) {
            this.headerService.flowRoute = this.router.url;
            this.itemService.removeTemporalItem();
            this.router.navigate([`/admin/merchant-items`]);
          }
        } else {
          const { createPreItem } = await this.itemService.createPreItem(
            itemInput
          );

          if ('_id' in createPreItem) {
            this.headerService.flowRoute = this.router.url;
            this.itemService.removeTemporalItem();
            this.router.navigate(
              [`/auth/authentication/${createPreItem?._id}`],
              {
                queryParams: {
                  type: 'create-item',
                },
              }
            );
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  formatNumber(event: Event | number) {
    let value: string;
    if (typeof event === 'number') value = `${event}`;
    else value = (<HTMLInputElement>event.target).value;
    if (value.includes('.')) {
      value = value
        .split('')
        .filter((char) => char !== '.')
        .join('');
      const convertedNumber = Number(value);
      this.itemForm.get('pricing').setValue(convertedNumber, {
        emitEvent: false,
      });
    }
    const plainNumber = value.split(',').join('');
    if (plainNumber[0] === '0') {
      const formatted =
        plainNumber.length > 3
          ? this.decimalPipe.transform(
              Number(plainNumber.slice(0, -2) + '.' + plainNumber.slice(-2)),
              '1.2'
            )
          : this.decimalPipe.transform(
              Number(
                '0.' +
                  (plainNumber.length <= 2
                    ? '0' + plainNumber.slice(1)
                    : plainNumber.slice(1))
              ),
              '1.2'
            );
      this.formattedPricing = '$' + formatted;
    } else {
      const formatted =
        plainNumber.length > 2
          ? this.decimalPipe.transform(
              Number(plainNumber.slice(0, -2) + '.' + plainNumber.slice(-2)),
              '1.2'
            )
          : this.decimalPipe.transform(
              Number(
                '0.' +
                  (plainNumber.length === 1 ? '0' + plainNumber : plainNumber)
              ),
              '1.2'
            );
      this.formattedPricing = '$' + formatted;
    }
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
      this.changedImages = true;
      if (fileList.length > 1)
        this.swiperConfig.pagination = {
          el: '.swiper-pagination',
          type: 'bullets',
          clickable: true,
        };
      else
        this.swiperConfig = {
          ...this.swiperConfig,
          pagination: {},
        };
      return;
    }
  }

  sanitize(image: string | ArrayBuffer) {
    return this._DomSanitizer.bypassSecurityTrustStyle(
      `url(${image}) no-repeat center center / cover #E9E371`
    );
  }

  onOpenDialog = () => {
    const list: StoreShareList[] = [
      {
        title: 'Sobre ' + this.merchant.name,
        options: [
          {
            text: 'Vista del comprador',
            mode: 'func',
            func: () => {
              const { images, name, description } = this.itemForm.value;
              const pricing = parseFloat(
                this.formattedPricing.replace(/\$|,/g, '')
              );
              this.itemService.storeTemporalItem({
                ...this.item,
                _id: this.item?._id,
                name,
                description,
                images: this.imageField,
                pricing: pricing,
              });
              this.itemService.temporalImages = {
                old: this.item?.images,
                new: images,
              };
              this.router.navigate(['/ecommerce/item-detail']);
            },
          },
        ],
      },
    ];

    this.dialogService.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list,
        buttonText: 'Cerrar Sesión',
        buttonCallback: () => {
          this.authService.signoutThree();
          this.router.navigate([`auth/login`]);
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  };
}
