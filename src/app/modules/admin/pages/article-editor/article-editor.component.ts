import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
  completeImageURL,
  getExtension,
  isVideo,
} from 'src/app/core/helpers/strings.helpers';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Item, ItemInput } from 'src/app/core/models/item';
import { SlideInput } from 'src/app/core/models/post';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { CurrencyInputComponent } from 'src/app/shared/components/currency-input/currency-input.component';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
import { LinksDialogComponent } from 'src/app/shared/dialogs/links-dialog/links-dialog.component';
import {
  SettingsComponent,
  SettingsDialogButton,
} from 'src/app/shared/dialogs/settings/settings.component';
import { SingleActionDialogComponent } from 'src/app/shared/dialogs/single-action-dialog/single-action-dialog.component';
import { TagAsignationComponent } from 'src/app/shared/dialogs/tag-asignation/tag-asignation.component';
import { environment } from 'src/environments/environment';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import { Merchant } from 'src/app/core/models/merchant';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { HeaderService } from 'src/app/core/services/header.service';

@Component({
  selector: 'app-article-editor',
  templateUrl: './article-editor.component.html',
  styleUrls: ['./article-editor.component.scss'],
})
export class ArticleEditorComponent implements OnInit {
  env: string = environment.assetsUrl;
  URI: string = environment.uri;
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
  loadingSlides: boolean;

  editingPrice: boolean = false;
  editingName: boolean = false;
  editingDescription: boolean = false;
  editingSlides: boolean = false;
  imageFiles: string[] = ['image/png', 'image/jpg', 'image/jpeg'];
  videoFiles: string[] = ['video/mp4', 'video/webm'];

  item: Item;
  selectedImages: (string | ArrayBuffer)[] = [];
  items: any;

  updated: boolean = false;

  selectedTags: Array<string>;

  slides: SlideInput[];
  math = Math;

  itemParamsForm = new FormGroup({
    params: new FormArray([]),
  });
  submitEventFinished: boolean = true;

  itemForm = new FormGroup({
    name: new FormControl(),
  });
  merchant: Merchant;
  hasParams: boolean;
  saleflow: SaleFlow;
  params;
  productName: string = '';
  productDescription: string = '';

  content: string[] = [];

  menuOptions = [
    {
      text: 'Compartelo',
      callback: async () => {
        const link = `${this.URI}/ecommerce/${this._MerchantsService.merchantData.slug}/store`;
        const bottomSheetRef = this._bottomSheet.open(LinksDialogComponent, {
          data: [
            {
              title: 'Links de Visitantes',
              options: [
                {
                  title: 'Ver como lo verá el visitante',
                  callback: () => {
                    this._Router.navigate([
                      `/ecommerce/${this._MerchantsService.merchantData.slug}/store`,
                    ]);
                  },
                },
                {
                  title: 'Compartir el Link',
                  callback: () => {
                    this.ngNavigatorShareService.share({
                      title: '',
                      url: link,
                    });
                  },
                },
                {
                  title: 'Copiar el Link',
                  callback: () => {
                    this.clipboard.copy(link);
                    this.snackBar.open(
                      'Enlace copiado en el portapapeles',
                      '',
                      {
                        duration: 2000,
                      }
                    );
                  },
                },
                {
                  title: 'Descargar el qrCode',
                  link,
                },
              ],
            },
            {
              title: 'Links de admins',
              options: [
                {
                  title: 'Descargar el qrCode del admin',
                  link: `${this.URI}/admin/dashboard`,
                },
                {
                  title: 'Lo vendido',
                  callback: () => {
                    this._Router.navigate(['/admin/order-status-view']);
                  },
                },
              ],
            },
          ],
        });
      },
    },
    {
      text: 'Exhibido en tienda',
      callback: async () => {
        this.previewItem();
      },
    },
  ];

  status: 'idle' | 'loading' | 'complete' | 'error' = 'idle';

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
    protected _DomSanitizer: DomSanitizer,
    private _bottomSheet: MatBottomSheet,
    private ngNavigatorShareService: NgNavigatorShareService,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private itemService: ItemsService,
    private saleflowService: SaleFlowService,
    private headerService: HeaderService
  ) {}

  async ngOnInit() {
    const itemId = this._Route.snapshot.paramMap.get('articleId');

    this.headerService.flowRoute = this._Router.url;
    // const itemId = this.route.snapshot.paramMap.get('itemId');
    const justdynamicmode =
      this._Route.snapshot.queryParamMap.get('justdynamicmode');

    const promises: Promise<Merchant | Item>[] = [
      this._MerchantsService.merchantDefault(),
    ];
    if (itemId && !this.itemService.temporalItem)
      promises.push(this.itemService.item(itemId));
    this.status = 'loading';
    const [userMerchant, item] = await Promise.all(promises);

    this.generateFields();
    this.generateFields();

    const paramsFormArray = this.itemParamsForm.get('params') as FormArray;
    const valuesArray = paramsFormArray.at(0).get('values') as FormArray;

    // valuesArray.at(0).patchValue({
    //   name: 'Alegria sin Chinoski',
    //   price: 1275.0,
    // });
    // this.formattedPricing.values[0] = '$127500';
    // valuesArray.at(1).patchValue({
    //   name: 'Alegria con Chinoski',
    //   price: 1675.0,
    // });
    // this.formattedPricing.values[1] = '$167500';

    if (!userMerchant) {
      this.status = 'complete';
      return;
    }
    this.merchant = userMerchant as Merchant;
    this.saleflow = await this.saleflowService.saleflowDefault(
      this.merchant._id
    );
    if (!item && !this.itemService.temporalItem) {
      this.status = 'complete';
      return;
    }
    this.item = item as Item;
    const { name, merchant, params } =
      this.item || this.itemService.temporalItem;
    if (merchant && this.merchant.owner._id !== merchant.owner._id) {
      this.status = 'error';
      this._Router.navigate(['/admin/merchant-items']);
      return;
    }

    this.itemForm.get('name').setValue(name);

    if (params?.[0]?.values?.length) {
      params[0].values.forEach(() => {
        if (!this.item) this.generateFields();
      });

      this.itemParamsForm.get('params').patchValue(params);
      (
        (this.itemParamsForm.get('params') as FormArray)
          .at(0)
          .get('values') as FormArray
      ).controls.forEach((control, index) => {});
      this.hasParams = true;
    }

    this.status = 'complete';

    this.loadingSlides = true;
    // const itemId = this._Route.snapshot.paramMap.get('articleId');

    // ------------------------AQUI ESTABA ANTES--------------------------

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
        this.loadingSlides = false;

        this.slides = this.item.images
          .sort(({ index: a }, { index: b }) => (a > b ? 1 : -1))
          .map(({ index, ...image }) => {
            return {
              url: completeImageURL(image.value),
              index,
              type: 'poster',
              text: '',
            };
          });

        // if (!this._ItemsService.itemImages.length) {
        const imagesPromises = this.item.images.map(async (image, index) => {
          let imageURL = image.value;
          imageURL = completeImageURL(imageURL);

          const response = await fetch(imageURL);
          const blob = await response.blob();
          return new File(
            [blob],
            `item_image_${index}.${getExtension(imageURL)}`,
            {
              type: `${isVideo(image.value) ? `video` : `image`}/${getExtension(
                imageURL
              )}`,
            }
          );
        });
        Promise.all(imagesPromises).then((result) => {
          console.log(result);
          // this.loadingSlides = false;
          this._ItemsService.itemImages = result;
          // this.slides = this._ItemsService.itemImages.map((image) => {
          //   return {
          //     media: image,
          //     index: 0,
          //     type: 'poster',
          //     text: '',
          //   };
          // });
          if (!this.selectedImages.length) this.loadImages();
        });
        // } else this.loadImages();
      }
      this.loadingSlides = false;
    }
    if (this._ItemsService.itemName) {
      this.name.setValue(this._ItemsService.itemName);
      this.name.markAsDirty();
    }
    if (this._ItemsService.itemDesc) {
      this.description.setValue(this._ItemsService.itemDesc);
      this.description.markAsDirty();
    }
    if (this._ItemsService.itemPrice) {
      this.price.setValue(this._ItemsService.itemPrice);
      this.price.markAsDirty();
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

  iconCallback = async (ignore?: boolean) => {
    if (this.name.dirty || this.description.dirty || this.price.dirty) {
      this.updated = true;
    }

    const itemInput = {
      name: this.name.value || null,
      description: this.description.value || null,
    };
    this._ItemsService.itemPrice = null;
    this._ItemsService.itemName = null;
    this._ItemsService.itemDesc = null;

    if (this.updated) {
      if (!ignore) lockUI();
      if (this.name.invalid) delete itemInput.name;
      if (this.description.invalid) delete itemInput.description;
      await this._ItemsService.updateItem(itemInput, this.item._id);
    }
    if (!ignore) {
      unlockUI();
      this._ItemsService.removeTemporalItem();
      this._Router.navigate([`admin/dashboard`]);
    }
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

          this._Router.navigate([`admin/dashboard`]);
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

                  this._Router.navigate(['/admin/dashboard']);
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
    this.iconCallback(true);
    this._Router.navigate([`admin/slides-editor/${this.item._id}`]);
  }

  goBack() {
    this._Router.navigate(['/admin/dashboard']);
  }

  dynamicInputKeyPress(index: number) {
    this.params = (<FormArray>this.itemParamsForm.get('params')).at(0);
    const valuesLength = this.getArrayLength(this.params, 'values');
    if (index === valuesLength - 1) {
      console.log(this.params);
      console.log(this.params.value.values);
      this.generateFields();
    }
  }

  async send() {
    if (this.params) {
      for (let i = 0; i < this.params.value.values.length; i++) {
        let name = await this.params.value.values[i].name;
        if (name !== null && name !== '') {
          this.content.push(name);
          console.log(this.content);
        }
      }
    }

    const itemId = this._Route.snapshot.paramMap.get('articleId');
    const itemInput = {
      pricing: this.price.value,
      name: this.productName,
      description: this.productDescription,
      content: this.content,
    };

    const updatedItem = await this.itemService.updateItem(itemInput, itemId);
    console.log(updatedItem);

    this.goBack();
  }

  generateFields() {
    const paramValueFormGroupInput: {
      name: FormControl;
    } = {
      name: new FormControl(),
    };

    const params = <FormArray>this.itemParamsForm.get('params');
    if (this.getArrayLength(this.itemParamsForm, 'params') === 0) {
      params.push(
        new FormGroup({
          name: new FormControl('name', Validators.required),
          values: new FormArray([]),
        })
      );
    }
    const newFormGroup = new FormGroup(paramValueFormGroupInput);

    const values = <FormArray>params.at(0).get('values');
    values.push(newFormGroup);
  }

  getControls(form: FormGroup | AbstractControl, controlName: string) {
    return (form.get(controlName) as FormArray).controls;
  }

  getArrayLength(form: FormGroup | AbstractControl, controlName: string) {
    return (form.get(controlName) as FormArray).length;
  }
}
