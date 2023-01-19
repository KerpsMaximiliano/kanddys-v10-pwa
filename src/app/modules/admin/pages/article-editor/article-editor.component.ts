import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Item } from 'src/app/core/models/item';
import { SlideInput } from 'src/app/core/models/post';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { CurrencyInputComponent } from 'src/app/shared/components/currency-input/currency-input.component';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
import {
  SettingsComponent,
  SettingsDialogButton,
} from 'src/app/shared/dialogs/settings/settings.component';
import { SingleActionDialogComponent } from 'src/app/shared/dialogs/single-action-dialog/single-action-dialog.component';
import { TagAsignationComponent } from 'src/app/shared/dialogs/tag-asignation/tag-asignation.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-article-editor',
  templateUrl: './article-editor.component.html',
  styleUrls: ['./article-editor.component.scss'],
})
export class ArticleEditorComponent implements OnInit {
  env: string = environment.assetsUrl;
  @ViewChild('inputName') inputName: ElementRef<HTMLInputElement>;
  @ViewChild('inputDescription')
  inputDescription: ElementRef<HTMLTextAreaElement>;
  @ViewChild(CurrencyInputComponent)
  currencyInputcomponent: CurrencyInputComponent;

  price = new FormControl('', [
    Validators.required,
    Validators.min(0.01),
    Validators.pattern(/[\S]/),
  ]);
  name = new FormControl('', [
    Validators.minLength(2),
    Validators.pattern(/[\S]/),
  ]);
  description = new FormControl('', [
    Validators.minLength(2),
    Validators.pattern(/[\S]/),
  ]);

  editingPrice: boolean = false;
  editingName: boolean = false;
  editingDescription: boolean = false;
  editingSlides: boolean = false;

  item: Item;
  selectedImages: (string | ArrayBuffer)[] = [];
  items: any;

  updated: boolean = false;

  selectedTags: Array<string>;

  slides: SlideInput[];
  math = Math;

  constructor(
    private _ItemsService: ItemsService,
    private _MerchantsService: MerchantsService,
    private _DialogService: DialogService,
    private _Router: Router,
    private _Route: ActivatedRoute,
    private _SaleflowService: SaleFlowService,
    private _TagsService: TagsService,
    private _ToastrService: ToastrService,
    private dialog: DialogService,
    protected _DomSanitizer: DomSanitizer
  ) {}

  async ngOnInit() {
    const itemId = this._Route.snapshot.paramMap.get('articleId');
    if (itemId) {
      this.item = await this._ItemsService.item(itemId);
      if (this.item.merchant._id !== this._MerchantsService.merchantData._id) {
        this._Router.navigate(['../../'], {
          relativeTo: this._Route,
        });
        return;
      }
      this.price.setValue(this.item.pricing);
      this.name.setValue(this.item.name);
      this.description.setValue(this.item.description);
      if (this.item.images.length) {
        // if (!this._ItemsService.itemImages.length) {
        const imagesPromises = this.item.images.map(async (image, index) => {
          const response = await fetch(image);
          const blob = await response.blob();
          return new File([blob], `item_image_${index}.jpeg`, {
            type: 'image/jpeg',
          });
        });
        Promise.all(imagesPromises).then((result) => {
          this._ItemsService.itemImages = result;
          this.slides = this._ItemsService.itemImages.map((image) => {
            return {
              media: image,
              index: 0,
              type: 'poster',
              text: '',
            };
          });
          if (!this.selectedImages.length) this.loadImages();
        });
        // } else this.loadImages();
      }
    }
    if (this._ItemsService.itemName)
      this.name.setValue(this._ItemsService.itemName);
    if (this._ItemsService.itemDesc)
      this.description.setValue(this._ItemsService.itemDesc);
    if (this._ItemsService.itemPrice)
      this.price.setValue(this._ItemsService.itemPrice);
    this._MerchantsService.merchantData =
      await this._MerchantsService.merchantDefault();
    if (this._MerchantsService.merchantData) {
      this._SaleflowService.saleflowData =
        await this._SaleflowService.saleflowDefault(
          this._MerchantsService.merchantData._id
        );
      if (this._SaleflowService.saleflowData) this.obtainLasts();
    }
  }

  loadImages() {
    this._ItemsService.itemImages?.forEach((file) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        this.selectedImages.push(reader.result);
      };
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
          limit: -1,
        },
      });
      this.items = this.items.listItems.filter((item) => {
        return item.params == null || undefined || item.params.length == 0;
      });
      this.items.length <= 6 ? null : (this.items.length = 6);
    });
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

  handleCurrencyInput(value: number) {
    this.updated = true;
    this.price.setValue(value);
  }

  countDecimals(value: number) {
    if (!value) return;
    if (Math.floor(value) === value) return 0;
    return value.toString().split('.')[1]?.length || 0;
  }

  openAuxDialog(index: number): void {
    const list: Array<SettingsDialogButton> = [
      {
        text: 'Edita este slide (crop, etc..)',
        callback: async () => {
          this._ItemsService.editingImageIndex = index;
          this._ItemsService.editingImage = this.selectedImages[
            index
          ] as string;
          this._Router.navigate([`admin/create-article/${this.item._id}`]);
        },
      },
      {
        text: 'Eliminar',
        callback: async () => {
          this.dialog.open(SingleActionDialogComponent, {
            type: 'fullscreen-translucent',
            props: {
              title: 'Eliminar este slide del símbolo',
              buttonText: 'Sí, borrar',
              mainButton: () => {
                this.deleteImage(index);
              },
              btnBackgroundColor: '#272727',
              btnMaxWidth: '133px',
              btnPadding: '7px 2px',
            },
            customClass: 'app-dialog',
            flags: ['no-header'],
          });
        },
      },
      // {
      //   text: 'Cambiar el orden de los slides',
      //   // TODO
      //   callback: async () => {},
      // },
    ];
    list.forEach((option) => (option.styles = { color: '#383838' }));
    this.dialog.open(SettingsComponent, {
      type: 'fullscreen-translucent',
      props: {
        optionsList: list,
        closeEvent: () => {},
        shareBtn: false,
        title: '',
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  async deleteImage(index: number) {
    this.selectedImages.splice(index, 1);
    this._ItemsService.itemImages.splice(index, 1);
    this._ItemsService.changedImages = true;
    if (this.item.images.length === 1) {
      await this._ItemsService.updateItem(
        {
          showImages: false,
        },
        this.item._id
      );
    }
    await this._ItemsService.deleteImageItem(
      [this.item.images[index]],
      this.item._id
    );
  }

  iconCallback = async () => {
    if (this.name.dirty || this.description.dirty || this.price.dirty) {
      this.updated = true;
    }

    const itemInput = {
      name: this.name.value || null,
      description: this.description.value || null,
      pricing: this.price.value,
      content: [],
      currencies: [],
      hasExtraPrice: false,
      purchaseLocations: [],
      showImages: this._ItemsService.itemImages.length > 0,
    };
    this._ItemsService.itemPrice = null;
    this._ItemsService.itemName = null;

    if (this.updated || this._ItemsService.changedImages) {
      lockUI();
      if (this.name.invalid) delete itemInput.name;
      if (this.description.invalid) delete itemInput.description;
      if (this.price.invalid) delete itemInput.pricing;
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
    this._Router.navigate([`admin/entity-detail-metrics`]);
  };

  openTagDialog = async () => {
    this._ItemsService.itemName = this.name.value;
    this._ItemsService.itemDesc = this.description.value;
    this._ItemsService.itemPrice = this.price.value;
    this._ItemsService.itemUrls = this.selectedImages as string[];
    const userTags = await this._TagsService.tagsByUser({
      options: {
        limit: -1,
      },
      findBy: {
        entity: 'item',
      },
    });

    const itemTags = (
      await this._TagsService.tags({
        options: {
          limit: -1,
        },
        findBy: {
          id: {
            __in: this.item.tags,
          },
          entity: 'item',
        },
      })
    ).tags;

    this._DialogService.open(TagAsignationComponent, {
      type: 'fullscreen-translucent',
      props: {
        tags: userTags,
        //orderId: this.order._id,
        colorTheme: 'admin',
        entity: 'item',
        entityId: this.item._id,
        redirectToArticleParams: true,
        outputAllSelectedTags: true,
        activeTags:
          itemTags && Array.isArray(itemTags)
            ? itemTags.map((tag) => tag._id)
            : null,
        tagAction: async ({ selectedTags }) => {
          this.selectedTags = selectedTags;

          try {
            const response = await this._ItemsService.updateItem(
              {
                tags: this.selectedTags,
              },
              this.item._id
            );

            if (response) {
              this.item.tags = this.selectedTags;
            }
          } catch (error) {
            this._ToastrService.error('Error al asignar tags', null, {
              timeOut: 1000,
            });
          }
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  };

  openOptionsForThisArticle() {
    const toggleStatus = () => {
      return new Promise((resolve, reject) => {
        this.toggleActivateItem(this.item).then((newStatus) => {
          newStatus === 'disabled'
            ? (number = 2)
            : newStatus === 'active'
            ? (number = 0)
            : (number = 1);

          resolve(true);
        });
      });
    };

    let number: number =
      this.item.status === 'disabled'
        ? 2
        : this.item.status === 'active'
        ? 0
        : 1;
    const statuses = [
      {
        text: 'VISIBLE (NO DESTACADO)',
        backgroundColor: '#82F18D',
        color: '#174B72',
        asyncCallback: toggleStatus,
      },
      {
        text: 'VISIBLE (Y DESTACADO)',
        backgroundColor: '#82F18D',
        color: '#174B72',
        asyncCallback: toggleStatus,
      },
      {
        text: 'INVISIBLE',
        backgroundColor: '#B17608',
        color: 'white',
        asyncCallback: toggleStatus,
      },
    ];

    const list: Array<SettingsDialogButton> = [
      {
        text: 'Crea un nuevo artículo',
        callback: async () => {
          // TODO: Añadir nuevo flow de creación de artículo
          // this._Router.navigate([`admin/create-article`]);
        },
      },
      {
        text: 'Archiva este artículo',
        callback: async () => {
          const response = await this._ItemsService.updateItem(
            {
              status: 'archived',
            },
            this.item._id
          );

          this._ToastrService.info('¡Item archivado exitosamente!');

          this._Router.navigate([`admin/entity-detail-metrics`]);
        },
      },
      {
        text: 'Elimina este artículo',
        callback: () => {
          this.dialog.open(SingleActionDialogComponent, {
            type: 'fullscreen-translucent',
            props: {
              title: 'Elimina este artículo',
              buttonText: 'Sí, borrar',
              mainButton: async () => {
                const removeItemFromSaleFlow =
                  await this._SaleflowService.removeItemFromSaleFlow(
                    this.item._id,
                    this._SaleflowService.saleflowData._id
                  );

                if (!removeItemFromSaleFlow) return;
                const deleteItem = await this._ItemsService.deleteItem(
                  this.item._id
                );
                if (!deleteItem) return;
                else {
                  this._ToastrService.info('¡Item eliminado exitosamente!');

                  this._SaleflowService.saleflowData =
                    await this._SaleflowService.saleflowDefault(
                      this._MerchantsService.merchantData._id
                    );

                  this._Router.navigate(['/admin/entity-detail-metrics']);
                }
              },
              btnBackgroundColor: '#272727',
              btnMaxWidth: '133px',
              btnPadding: '7px 2px',
            },
            customClass: 'app-dialog',
            flags: ['no-header'],
          });
        },
      },
      {
        text: 'Adiciona un tag a este artículo',
        callback: async () => this.openTagDialog(),
      },
    ];

    list.forEach((option) => (option.styles = { color: '#383838' }));

    this.dialog.open(SettingsComponent, {
      type: 'fullscreen-translucent',
      props: {
        statuses,
        indexValue: number,
        optionsList: list,
        hideNavigation: true,
        hideCloseBtn: true,
        closeEvent: () => {},
        shareBtn: false,
        title: this.item.name,
        titleStyles: {
          fontFamily: 'SfProRegular',
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  toggleActivateItem = async (item: Item): Promise<string> => {
    try {
      this._ItemsService.updateItem(
        {
          status:
            item.status === 'disabled'
              ? 'active'
              : item.status === 'active'
              ? 'featured'
              : 'disabled',
        },
        item._id
      );

      item.status =
        item.status === 'disabled'
          ? 'active'
          : item.status === 'active'
          ? 'featured'
          : 'disabled';

      return item.status;
    } catch (error) {
      console.log(error);
    }
  };

  previewItem = () => {
    this._ItemsService.itemName = this.name.value;
    this._ItemsService.itemDesc = this.description.value;
    this._ItemsService.itemPrice = this.price.value;
    this._ItemsService.itemUrls = this.selectedImages as string[];
    this._Router.navigate(
      [
        `ecommerce/${this._SaleflowService.saleflowData.merchant.slug}/article-detail/item/${this.item._id}`,
      ],
      {
        queryParams: {
          mode: 'preview',
        },
      }
    );
  };

  setFocus(field: 'name' | 'description' | 'pricing') {
    switch (field) {
      case 'name':
        setTimeout(() => {
          this.inputName.nativeElement.focus();
        }, 100);
        break;
      case 'description':
        setTimeout(() => {
          this.inputDescription.nativeElement.focus();
        }, 100);
        break;
      case 'pricing':
        // setTimeout(() => {
        //   this.currencyInputcomponent.currencyInput.nativeElement.focus();
        // }, 100);
        break;
    }
  }

  goEditSlides() {
    this._Router.navigate([`admin/slides-editor/${this.item._id}`]);
  }

  goBack() {
    // TODO
  }
}
