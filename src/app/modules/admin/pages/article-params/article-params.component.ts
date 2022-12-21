import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { ItemsService } from 'src/app/core/services/items.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { AnexosDialogComponent } from 'src/app/shared/dialogs/anexos-dialog/anexos-dialog.component';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
import { Item } from 'src/app/core/models/item';
import { ToastrService } from 'ngx-toastr';
import { PostsService } from 'src/app/core/services/posts.service';
import { EntityTemplateService } from 'src/app/core/services/entity-template.service';
import { ArticleDialogComponent } from 'src/app/shared/dialogs/article-dialog/article-dialog.component';
import { SettingsComponent } from 'src/app/shared/dialogs/settings/settings.component';
import { SingleActionDialogComponent } from 'src/app/shared/dialogs/single-action-dialog/single-action-dialog.component';

@Component({
  selector: 'app-article-params',
  templateUrl: './article-params.component.html',
  styleUrls: ['./article-params.component.scss'],
})
export class ArticleParamsComponent implements OnInit {
  steps: 'price' | 'images' | 'save' = 'price';
  selectedImages: (string | ArrayBuffer)[] = [];
  models: string[] = ['Modelo sin nombre'];
  options: string[] = ['Perfil del Articulo', 'Perfil de las Facturas'];
  default: boolean;
  searchValue: string;
  items: any;
  itemId: string;
  item: Item;
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
  updated: boolean = false;
  blockSubmitButton: boolean = false;
  parseFloat = parseFloat;

  card1: boolean = false;
  card2: boolean = false;

  constructor(
    protected _DomSanitizer: DomSanitizer,
    private dialog: DialogService,
    private _ItemsService: ItemsService,
    private _HeaderService: HeaderService,
    private _MerchantsService: MerchantsService,
    private _SaleflowService: SaleFlowService,
    private _Router: Router,
    private _Route: ActivatedRoute,
    private _PostsService: PostsService,
    private _EntityTemplateService: EntityTemplateService,
    private _ToastrService: ToastrService
  ) {}

  async ngOnInit(): Promise<void> {
    this.itemId = this._Route.snapshot.paramMap.get('itemId');
    if (this.itemId) {
      this.item = await this._ItemsService.item(this.itemId);
      if (this.item.merchant._id !== this._MerchantsService.merchantData._id) {
        this._Router.navigate(['../../'], {
          relativeTo: this._Route,
        });
        return;
      }
      this.price.setValue(this.item.pricing);
      this.name.setValue(this.item.name);
      if (this.item.name?.trim()) this.models[0] = this.item.name;
      else this.models[0] = 'Modelo sin nombre';
      if (this.item.images.length && !this._ItemsService.itemImages.length) {
        const multimedia: File[] = [];
        this.item.images.forEach(async (image, index) => {
          const response = await fetch(image);
          const blob = await response.blob();
          const file = new File([blob], `item_image_${index}.jpeg`, {
            type: 'image/jpeg',
          });
          multimedia.push(file);
        });
        this._ItemsService.itemImages = multimedia;
      }
    } else {
      if (this._ItemsService.itemName)
        this.name.setValue(this._ItemsService.itemName);
      if (this._ItemsService.itemPrice)
        this.price.setValue(this._ItemsService.itemPrice);
    }
    this._MerchantsService.merchantData =
      await this._MerchantsService.merchantDefault();
    if (this._MerchantsService.merchantData) {
      this._SaleflowService.saleflowData =
        await this._SaleflowService.saleflowDefault(
          this._MerchantsService.merchantData._id
        );
      if (this._SaleflowService.saleflowData) this.obtainLasts();
    }
    this._ItemsService.itemImages?.forEach((file) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        this.selectedImages.push(reader.result);
      };
    });
  }

  iconCallback = async () => {
    // this._ItemsService.itemName = this.name.value;
    // this._ItemsService.itemPrice = this.price.value;

    const itemInput = {
      name: this.name.value || null,
      // description: description || null,
      pricing: this.price.value,
      images: this._ItemsService.itemImages,
      merchant: this._MerchantsService.merchantData?._id,
      content: [],
      currencies: [],
      hasExtraPrice: false,
      purchaseLocations: [],
      showImages: this._ItemsService.itemImages.length > 0,
    };
    this._ItemsService.itemPrice = null;
    this._ItemsService.itemName = null;

    if (this.item) {
      if (this.updated || this._ItemsService.changedImages) {
        lockUI();
        delete itemInput.images;
        delete itemInput.merchant;
        const { updateItem: updatedItem } = await this._ItemsService.updateItem(
          itemInput,
          this.item._id
        );
        if (this._ItemsService.changedImages) {
          await this._ItemsService.deleteImageItem(
            this.item.images,
            updatedItem._id
          );
          await this._ItemsService.addImageItem(
            this._ItemsService.itemImages,
            updatedItem._id
          );
          this._ItemsService.itemImages = [];
          this._ItemsService.changedImages = false;
        }
      }
      unlockUI();
      this._ItemsService.removeTemporalItem();
      this._Router.navigate([
        `admin/create-article${this.item ? '/' + this.item._id : ''}`,
      ]);
    } else {
      if (this.price.value) {
        lockUI();
        console.log(this.price.value);
        const { createItem } = await this._ItemsService.createItem(itemInput);
        await this._SaleflowService.addItemToSaleFlow(
          {
            item: createItem._id,
          },
          this._SaleflowService.saleflowData._id
        );
        unlockUI();
        this._ToastrService.success('Producto creado satisfactoriamente!');
        this._Router.navigate([`/admin/create-article/${createItem._id}`]);
      } else {
        this._Router.navigate([`/admin/create-article`]);
      }
    }
  };

  dotsCallback = () => {
    // console.log('Dots');
  };

  countDecimals(value: number) {
    if (!value) return;
    if (Math.floor(value) === value) return 0;
    return value.toString().split('.')[1]?.length || 0;
  }

  startDragging(e: MouseEvent, el: HTMLDivElement) {
    this.mouseDown = true;
    this.startX = e.pageX - el.offsetLeft;
    this.scrollLeft = el.scrollLeft;
  }

  changeStep(index: number) {
    this.activeStep = index;
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
    if (!this.items?.length) return;
    const items: {
      option: string;
      subOption: string;
      index?: number;
      callback?: () => void;
    }[] = [];
    for (const item of this.items) {
      items.push({
        option: item.name,
        subOption: `$${item.pricing.toLocaleString('es-MX')}`,
        callback: () => {
          this.models.pop();
          this.models.push(item.name);
          this.name.setValue(item.name);
          this.changeModel(0);
          this.default ? (this.default = false) : (this.default = true);
          this.handleCurrencyInput(item.pricing);
        },
      });
    }
    this.dialog.open(AnexosDialogComponent, {
      props: {
        title: 'Previamente Usados',
        options: items,
      },
      type: 'fullscreen-translucent',
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  obtainLasts() {
    this._Route.params.subscribe(async (params) => {
      const saleflowItems = this._SaleflowService.saleflowData.items.map(
        (saleflowItem) => ({
          item: saleflowItem.item._id,
        })
      );
      this.items = await this._SaleflowService.listItems({
        findBy: {
          _id: {
            __in: ([] = saleflowItems.map((items) => items.item)),
          },
        },
        options: {
          sortBy: 'createdAt:desc',
          limit: 60,
        },
      });
      this.items = this.items.listItems.filter((item) => {
        return item.params == null || undefined || item.params.length == 0;
      });
      this.items.length <= 6 ? null : (this.items.length = 6);
    });
  }

  onChangeName(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    if (value.trim()) this.models[0] = value;
    else this.models[0] = 'Modelo sin nombre';
  }

  async toSave() {
    if (this.steps === 'price') {
      this.changeStep(1);
      return;
    }
    if (this.steps === 'images') {
      this.blockSubmitButton = true;
      const itemInput = {
        name: this.name.value || null,
        // description: description || null,
        pricing: this.price.value,
        images: this._ItemsService.itemImages,
        merchant: this._MerchantsService.merchantData?._id,
        content: [],
        currencies: [],
        hasExtraPrice: false,
        purchaseLocations: [],
        showImages: this._ItemsService.itemImages.length > 0,
      };
      this._ItemsService.itemPrice = null;
      this._ItemsService.itemName = null;
      if (this.item) {
        delete itemInput.images;
        delete itemInput.merchant;
        const { updateItem: updatedItem } = await this._ItemsService.updateItem(
          itemInput,
          this.item._id
        );
        if (this._ItemsService.changedImages) {
          await this._ItemsService.deleteImageItem(
            this.item.images,
            updatedItem._id
          );
          await this._ItemsService.addImageItem(
            this._ItemsService.itemImages,
            updatedItem._id
          );
          this._ItemsService.itemImages = [];
          this._ItemsService.changedImages = false;
        }

        this._ItemsService.removeTemporalItem();
        this._Router.navigate([`/admin/merchant-items`]);
        return;
      }

      if (this._MerchantsService.merchantData) {
        const { createItem } = await this._ItemsService.createItem(itemInput);
        await this._SaleflowService.addItemToSaleFlow(
          {
            item: createItem._id,
          },
          this._SaleflowService.saleflowData._id
        );

        const storedTemplateData = localStorage.getItem(
          'entity-template-creation-data'
        );
        const entityTemplateData = storedTemplateData
          ? JSON.parse(storedTemplateData)
          : null;

        if (entityTemplateData) {
          try {
            const { entity, entityTemplateId } = entityTemplateData;

            const result =
              await this._EntityTemplateService.entityTemplateSetData(
                entityTemplateId,
                {
                  entity: 'item',
                  reference: createItem._id,
                }
              );

            localStorage.removeItem('entity-template-creation-data');
          } catch (error) {
            this._ToastrService.error('Ocurrió un error al crear el simbolo');
            return;
          }
        }

        this._ToastrService.success('Producto creado satisfactoriamente!');
        this._Router.navigate([`/admin/create-article/${createItem._id}`]);
      } else {
        const { createPreItem } = await this._ItemsService.createPreItem(
          itemInput
        );

        if ('_id' in createPreItem) {
          const storedTemplateData = localStorage.getItem(
            'entity-template-creation-data'
          );
          const entityTemplateData = storedTemplateData
            ? JSON.parse(storedTemplateData)
            : null;

          if (entityTemplateData) {
            try {
              const { entity, entityTemplateId } = entityTemplateData;

              const result =
                await this._EntityTemplateService.entityTemplateSetData(
                  entityTemplateId,
                  {
                    entity: 'item',
                    reference: createPreItem?._id,
                  }
                );

              localStorage.removeItem('entity-template-creation-data');
            } catch (error) {
              this._ToastrService.error('Ocurrió un error al crear el simbolo');
            }
          }

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

  deleteImage(index: number) {
    this.selectedImages.splice(index, 1);
    this._ItemsService.itemImages.splice(index, 1);
    this._ItemsService.changedImages = true;
  }

  changeModel(index: number) {
    this.active = index;
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
      this._ItemsService.changedImages = true;
    }
  }

  sanitize(image: string | ArrayBuffer) {
    return this._DomSanitizer.bypassSecurityTrustStyle(
      `url(${image}) no-repeat center center / cover #E9E371`
    );
  }

  handleCurrencyInput(value: number) {
    this.updated = true;
    this.price.setValue(value);
  }

  handleNameInput(value: any) {
    this.updated = true;
  }

  openImageModal(imageSourceURL: string | ArrayBuffer) {
    this.dialog.open(ImageViewComponent, {
      type: 'fullscreen-translucent',
      props: {
        imageSourceURL,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  card1Clicked() {
    this.card1 = !this.card1;
  }

  card2Clicked() {
    this.card2 = !this.card2;
  }

  openAuxDialog(index: number):void {
    const list = [
      {
        text: 'Textos del Articulo',
        callback: async () => {
          
        },
      },
      {
        text: 'Eliminar',
        callback: async () => {
          this.dialog.open(SingleActionDialogComponent, {
            type: 'fullscreen-translucent',
            props: {
              title: 'Eliminar este slide del simbolo',
              buttonText: 'Si, borrar',
              mainButton: ()=>{
                this.deleteImage(index);
              },
              btnBackgroundColor: '#272727',
              btnMaxWidth: '133px',
              btnPadding: '7px 2px'
            }
          });
        },
      },
      {
        text: 'Cambiar el orden de los slides',
        callback: async () => {
          
        },
      }
    ];
    this.dialog.open(SettingsComponent, {
       type: 'fullscreen-translucent',
       props: {
          optionsList: list,
          closeEvent: ()=> {
          },
          shareBtn: false,
          title: ''
       },
       customClass: 'app-dialog',
       flags: ['no-header']
    });
  }
}
