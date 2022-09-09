import { DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Item, ItemInput } from 'src/app/core/models/item';
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
  status: 'idle' | 'loading' | 'complete' | 'error' = 'idle';
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
    params: new FormArray([]),
  });
  formattedPricing = {
    item: '$0.00',
    values: [],
  };
  curencyFocused = false;
  swiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: false,
    spaceBetween: 5,
  };
  hasParams: boolean;
  parseFloat = parseFloat;

  constructor(
    protected _DomSanitizer: DomSanitizer,
    private authService: AuthService,
    private merchantService: MerchantsService,
    private saleflowService: SaleFlowService,
    private route: ActivatedRoute,
    private router: Router,
    private itemService: ItemsService,
    private headerService: HeaderService,
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
    this.status = 'loading';
    const [user, userMerchant, item] = await Promise.all(promises);
    if (!user || !userMerchant) {
      this.status = 'complete';
      return;
    }
    this.user = user as User;
    this.merchant = userMerchant as Merchant;
    this.saleflow = await this.saleflowService.saleflowDefault(
      this.merchant._id
    );
    if (!item && !this.itemService.temporalItem) {
      this.status = 'complete';
      return;
    }
    this.item = item as Item;
    const { images, name, description, merchant, params, pricing } =
      this.item || this.itemService.temporalItem;
    if (merchant && this.user._id !== merchant.owner._id) {
      this.status = 'error';
      throw new Error('No eres el merchant dueño de este item');
    }
    this.imageField = images;
    if (this.itemService.temporalImages?.new?.length) this.changedImages = true;
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
    this.itemForm.get('description').setValue(description);
    this.handleCurrencyInput(this.itemForm, 'pricing', pricing);
    if (params?.[0]?.values?.length) {
      params[0].values.forEach(() => {
        this.generateFields();
      });
      this.itemForm.get('params').patchValue(params);
      (
        (this.itemForm.get('params') as FormArray)
          .at(0)
          .get('values') as FormArray
      ).controls.forEach((control, index) => {
        this.handleCurrencyInput(
          control,
          'price',
          params[0].values[index].price,
          index
        );
      });
    }
    this.status = 'complete';
  }

  goBack() {
    if (this.hasParams) {
      this.hasParams = false;
      return;
    }
    this.itemService.removeTemporalItem();
    this.router.navigate(['/admin/merchant-items']);
  }

  toggleStatus() {
    //
  }

  async onSubmit() {
    const { images, name, description, params, pricing } = this.itemForm
      .value as ItemInput;
    params?.forEach((param) => {
      param.values = param.values.filter(
        (values) => values.name || values.price || values.description
      );
    });
    try {
      if (this.item || this.itemService.temporalItem?._id) {
        const itemInput: ItemInput = {
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
          params: params[0]?.values.length ? params : null,
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
            images.length > 0 ||
            this.itemService.temporalImages?.new?.length > 0,
          params: params[0]?.values.length ? params : null,
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

  handleCurrencyInput(
    form: FormGroup | AbstractControl,
    controlName: string,
    value: number,
    index?: number
  ) {
    form.get(controlName).setValue(value, {
      emitEvent: false,
    });
    if (value % 1 === 0) value = value * 100;
    if (index == null) this.formattedPricing.item = '$' + value;
    else {
      this.formattedPricing.values[index] = '$' + value;
      this.dynamicInputKeyPress(index);
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
        title: 'Articulo',
        options: [
          {
            text: 'Simple',
            mode: 'func',
            func: () => {
              //this.router.navigate(['/ecommerce/item-detail']);
            },
          },
          {
            text: 'WhatsApp Form',
            mode: 'func',
            func: () => {
              this.headerService.flowRoute = this.router.url;
              this.router.navigate(['/webforms/webform-questions']);
            },
          },
          {
            text: 'Vista del comprador',
            mode: 'func',
            func: () => {
              const { images, name, description, params } = this.itemForm
                .value as ItemInput;
              const pricing = parseFloat(
                this.formattedPricing.item.replace(/\$|,/g, '')
              );
              params?.forEach((param) => {
                param.values = param.values.filter(
                  (values) => values.name || values.price || values.description
                );
              });
              this.itemService.storeTemporalItem({
                ...this.item,
                _id: this.item?._id,
                name,
                description,
                params,
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
          {
            text: !this.hasParams ? 'Dinámico' : 'Estático',
            mode: 'func',
            func: () => {
              if (!this.hasParams) {
                if (!this.getArrayLength(this.itemForm, 'params')) {
                  this.generateFields();
                  this.generateFields();
                }
              }
              this.hasParams = !this.hasParams;
            },
          },
        ],
      },
    ];

    this.dialogService.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  };

  dynamicInputKeyPress(index: number) {
    const params = (<FormArray>this.itemForm.get('params')).at(0);
    const valuesLength = this.getArrayLength(params, 'values');
    if (index === valuesLength - 1) {
      this.generateFields();
    }
  }

  generateFields() {
    const newFormGroup = new FormGroup({
      name: new FormControl(),
      description: new FormControl(),
      price: new FormControl(null, [Validators.required, Validators.min(1)]),
      quantity: new FormControl(),
      image: new FormControl(),
    });
    const params = <FormArray>this.itemForm.get('params');
    if (this.getArrayLength(this.itemForm, 'params') === 0) {
      params.push(
        new FormGroup({
          name: new FormControl('Tipos', Validators.required),
          category: new FormControl('', Validators.required),
          formType: new FormControl('color', Validators.required),
          values: new FormArray([]),
        })
      );
    }
    const values = <FormArray>params.at(0).get('values');
    values.push(newFormGroup);
    this.formattedPricing.values.push('$0.00');
  }

  getControls(form: FormGroup | AbstractControl, controlName: string) {
    return (form.get(controlName) as FormArray).controls;
  }

  getArrayLength(form: FormGroup | AbstractControl, controlName: string) {
    return (form.get(controlName) as FormArray).length;
  }
}
