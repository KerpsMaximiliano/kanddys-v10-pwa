import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { urltoFile } from 'src/app/core/helpers/files.helpers';
import { completeImageURL } from 'src/app/core/helpers/strings.helpers';
import {
  lockUI,
  playVideoOnFullscreen,
  unlockUI,
} from 'src/app/core/helpers/ui.helpers';
import { Item, ItemImageInput, ItemInput } from 'src/app/core/models/item';
import { SlideInput } from 'src/app/core/models/post';
import { HeaderService } from 'src/app/core/services/header.service';
import {
  ExtendedItemInput,
  ItemsService,
} from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { QuotationsService } from 'src/app/core/services/quotations.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import {
  FormComponent,
  FormData,
} from 'src/app/shared/dialogs/form/form.component';
import { isVideo } from 'src/app/core/helpers/strings.helpers';
import { environment } from 'src/environments/environment';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { Merchant } from 'src/app/core/models/merchant';
import {
  LoginDialogComponent,
  LoginDialogData,
} from 'src/app/modules/auth/pages/login-dialog/login-dialog.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { GeneralFormSubmissionDialogComponent } from 'src/app/shared/dialogs/general-form-submission-dialog/general-form-submission-dialog.component';

@Component({
  selector: 'app-inventory-creator',
  templateUrl: './inventory-creator.component.html',
  styleUrls: ['./inventory-creator.component.scss'],
})
export class InventoryCreatorComponent implements OnInit, OnDestroy {
  itemSlides: Array<any> = [];
  assetsFolder: string = environment.assetsUrl;
  imageFiles: string[] = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
  videoFiles: string[] = [
    'video/mp4',
    'video/webm',
    'video/m4v',
    'video/mpg',
    'video/mp4',
    'video/mpeg',
    'video/mpeg4',
    'video/mov',
    'video/3gp',
    'video/mts',
    'video/m2ts',
    'video/mxf',
  ];
  audioFiles: string[] = [];
  itemFormData: FormGroup;
  layout: 'EXPANDED-SLIDE' | 'ZOOMED-OUT-INFO' = 'EXPANDED-SLIDE';
  renderQrContent: boolean = true;
  showIntroParagraph: boolean = true;
  reminderToast: {
    message: string;
    warning?: boolean;
    secondsTrigger: number;
    timeoutId?: ReturnType<typeof setTimeout>;
  } = {
    message: 'Los campos que tienen (*) son obligatorios',
    secondsTrigger: 30,
    warning: false,
  };
  queryParamsSubscription: Subscription = null;
  routerParamsSubscription: Subscription = null;
  existingItem: boolean = false;
  updateItem: boolean = false;
  merchantRegistration: boolean = false;
  itemId: string = null;
  quotationId: string = null;
  requesterId: string = null;
  playVideoOnFullscreen = playVideoOnFullscreen;
  supplierEdition: boolean = false;
  supplierItem: Item = null;
  loggedMerchant: Merchant = null;

  constructor(
    private fb: FormBuilder,
    public itemsService: ItemsService,
    private headerService: HeaderService,
    private merchantsService: MerchantsService,
    private saleflowService: SaleFlowService,
    public quotationsService: QuotationsService,
    private authService: AuthService,
    public dialog: MatDialog,
    public dialogService: DialogService,
    private snackbar: MatSnackBar,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.routerParamsSubscription = this.route.params.subscribe(
      ({ itemId }) => {
        this.queryParamsSubscription = this.route.queryParams.subscribe(
          async ({
            existingItem,
            updateItem,
            merchantRegistration,
            quotationId,
            requesterId,
            supplierEdition,
          }) => {
            this.existingItem = JSON.parse(existingItem || 'false');
            this.supplierEdition = JSON.parse(existingItem || 'false');
            this.updateItem = Boolean(updateItem);
            this.quotationId = quotationId;
            this.requesterId = requesterId;

            this.merchantRegistration = JSON.parse(
              merchantRegistration || 'false'
            );
            this.itemId = itemId;

            this.loggedMerchant = await this.merchantsService.merchantDefault();

            //If a supplier enters the page directly from a link
            if (
              this.supplierEdition &&
              this.itemId &&
              !this.itemsService.temporalItemInput
            ) {
              this.existingItem = true;

              const item = await this.itemsService.item(this.itemId);
              this.itemsService.temporalItem = item;
              this.itemsService.temporalItemInput = {
                name: item.name,
                description: item.description,
                notificationStock: true,
                notificationStockLimit: item.notificationStockLimit,
                useStock: true,
              };

              if (this.loggedMerchant) {
                const supplierSpecificItemsPagination: PaginationInput = {
                  findBy: {
                    parentItem: {
                      $in: ([] = [item._id]),
                    },
                    merchant: this.loggedMerchant._id,
                  },
                  options: {
                    sortBy: 'createdAt:desc',
                    limit: -1,
                    page: 1,
                  },
                };

                const supplierSpecificItems: Array<Item> = (
                  await this.itemsService.listItems(
                    supplierSpecificItemsPagination
                  )
                )?.listItems;

                if (supplierSpecificItems?.length > 0) {
                  this.router.navigate([
                    '/admin/item-creation/' + supplierSpecificItems[0]._id,
                  ]);
                }

                this.quotationsService.fetchSupplierItem = false;
              }
            }

            if (
              !this.itemsService.temporalItemInput?.name &&
              !this.existingItem &&
              !merchantRegistration
            ) {
              this.router.navigate(['/ecommerce/supplier-items-selector']);
            }

            this.itemFormData = this.fb.group({
              title: [
                this.itemsService.temporalItemInput?.name || '',
                Validators.compose([Validators.required]),
              ],
              description: [
                this.itemsService.temporalItemInput?.description || '',
                Validators.compose([Validators.required]),
              ],
              pricing: [
                this.itemsService.temporalItemInput?.pricing || 0,
                Validators.compose([Validators.required, Validators.min(0.1)]),
              ],
              defaultLayout: [
                this.itemsService.temporalItemInput?.layout || this.layout,
              ],
              stock: [
                this.itemsService.temporalItemInput?.stock || '',
                Validators.compose([Validators.required]),
              ],
              notificationStockLimit: [
                this.itemsService.temporalItemInput?.notificationStockLimit ||
                  '',
                Validators.compose([Validators.min(1)]),
              ],
            });

            if (
              this.itemsService.temporalItemInput?.slides &&
              !this.existingItem
            ) {
              this.itemSlides = this.itemsService.temporalItemInput?.slides;
            }

            if (
              this.existingItem &&
              !this.itemsService.modifiedImagesFromExistingItem
            ) {
              this.itemSlides = this.itemsService.temporalItem.images
                .sort(({ index: a }, { index: b }) => (a > b ? 1 : -1))
                .map(({ index, ...image }) => {
                  return {
                    url: completeImageURL(image.value),
                    index,
                    type: 'poster',
                    text: '',
                    _id: image._id,
                  };
                });
            } else if (
              this.existingItem &&
              this.itemsService.modifiedImagesFromExistingItem
            ) {
              this.itemSlides = this.itemsService.temporalItemInput.slides;
            }

            this.addToastReminder(true);
          }
        );
      }
    );
  }

  async loadFile(event: Event) {
    const fileList = (event.target as HTMLInputElement).files;
    if (!fileList.length) return;
    let index = this.itemSlides.length - 1;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList.item(i);

      if (
        ![...this.imageFiles, ...this.videoFiles, ...this.audioFiles].includes(
          file.type
        )
      )
        return;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async (e) => {
        let result = reader.result;
        const content: SlideInput = {
          text: 'test',
          title: 'test',
          media: file,
          type: 'poster',
          index: this.itemSlides.length,
        };
        content['background'] = result;
        content['_type'] = file.type;
        this.itemSlides.push(content);

        this.saveTemporalItemInMemory();

        if (this.existingItem) {
          this.itemsService.modifiedImagesFromExistingItem = true;
        }

        this.itemsService.editingSlide = this.itemSlides.length - 1;

        let routeForItemEntity;

        const queryParams: any = {
          entity: 'item',
          redirectFromFlowRoute: true,
          useSlidesInMemory: this.existingItem && !this.updateItem,
        };

        if (this.itemSlides.length === 1 && !file.type.includes('video')) {
          routeForItemEntity = 'admin/items-slides-editor';

          if (this.existingItem && this.itemId)
            routeForItemEntity += '/' + this.itemId;

          queryParams.redirectFromFlowRoute = true;
          queryParams.addEditingImageToExistingItem =
            this.existingItem && this.itemId && this.updateItem;
        } else if (
          this.itemSlides.length === 1 &&
          file.type.includes('video')
        ) {
          routeForItemEntity = 'admin/slides-editor';
          queryParams.addEditingImageToExistingItem =
            this.existingItem && this.itemId && this.updateItem;

          await this.itemsService.itemAddImage(
            [
              {
                file,
                index,
              },
            ],
            this.itemId
          );

          if (this.updateItem) routeForItemEntity += '/' + this.itemId;
        } else if (this.itemSlides.length > 1) {
          routeForItemEntity = 'admin/slides-editor';

          if (this.updateItem) routeForItemEntity += '/' + this.itemId;
        }

        if (this.itemSlides.length === 1 && fileList.length === 1) {
          this.router.navigate([routeForItemEntity], {
            queryParams,
          });
        } else if (this.itemSlides.length > 1) {
          this.router.navigate([routeForItemEntity], {
            queryParams,
          });
        } else if (fileList.length > 1 && i === fileList.length - 1) {
          this.router.navigate(['admin/slides-editor'], {
            queryParams,
          });
        }

        this.renderQrContent = false;

        setTimeout(() => {
          this.renderQrContent = true;
        }, 50);
      };
      index++;
    }
  }

  emitFileInputClick() {
    (document.querySelector('#file') as HTMLElement).click();
  }

  goToReorderMedia() {
    this.saveTemporalItemInMemory();

    if (this.updateItem) {
      const queryParams = {
        entity: 'item',
        redirectFromFlowRoute: true,
        useSlidesInMemory: false,
      };

      return this.router.navigate(['admin/slides-editor/' + this.itemId], {
        queryParams,
      });
    }

    this.router.navigate(['admin/slides-editor'], {
      queryParams: {
        entity: 'item',
        redirectFromFlowRoute: true,
        useSlidesInMemory: this.existingItem,
      },
    });
  }

  updateItemPrice(newPrice: number) {
    this.itemFormData.patchValue({
      pricing: newPrice,
    });
  }

  saveTemporalItemInMemory() {
    let images: ItemImageInput[] = this.itemSlides.map(
      (slide: SlideInput, index: number) => {
        return {
          file: slide.media,
          index,
          active: true,
          _id: slide._id,
        };
      }
    );
    const itemInput: ExtendedItemInput = {
      name: this.itemsService.temporalItemInput?.name,
      description: this.itemFormData.value['description'],
      pricing: this.itemFormData.value['pricing'],
      images,
      stock: this.itemFormData.value['stock'],
      notificationStockLimit: this.itemFormData.value['notificationStockLimit'],
      slides: this.itemSlides,
    };

    this.itemsService.temporalItemInput = itemInput;

    this.headerService.flowRoute = this.router.url;
    localStorage.setItem('flowRoute', this.router.url);
  }

  openFormForField = (
    fieldName: 'TITLE' | 'DESCRIPTION' | 'PRICE' | 'STOCK'
  ) => {
    let fieldsToCreate: FormData = {
      fields: [],
      automaticallyFocusFirstField: true,
    };
    if (fieldName === 'TITLE') {
      fieldsToCreate.fields = [
        {
          label: 'Texto principal y centralizado',
          name: 'title',
          type: 'text',
          validators: [Validators.pattern(/[\S]/)],
        },
      ];
    } else if (fieldName === 'PRICE') {
      fieldsToCreate.fields = [
        {
          label: 'Precio',
          name: 'price',
          type: 'currency',
          validators: [Validators.pattern(/[\S]/)],
        },
      ];
    } else if (fieldName === 'STOCK') {
      fieldsToCreate.fields = [
        {
          label: 'Cantidad disponible para vender',
          name: 'initial-stock',
          type: 'number',
          validators: [Validators.pattern(/[\S]/)],
        },
        {
          label: 'Cantidad mínima para recibir notificación',
          name: 'minimal-stock-notification',
          type: 'number',
          validators: [Validators.pattern(/[\S]/)],
        },
      ];
    } else {
      fieldsToCreate.fields = [
        {
          label: 'Texto mas largo (que incluye?)',
          name: 'description',
          type: 'text',
          validators: [Validators.pattern(/[\S]/)],
        },
      ];
    }

    const dialogRef = this.dialog.open(FormComponent, {
      data: fieldsToCreate,
    });

    dialogRef.afterClosed().subscribe((result: FormGroup) => {
      const fields = [
        {
          fieldName: 'title',
          fieldKey: 'title',
        },
        {
          fieldName: 'description',
          fieldKey: 'description',
        },

        {
          fieldName: 'pricing',
          fieldKey: 'price',
        },
        {
          fieldName: 'stock',
          fieldKey: 'initial-stock',
        },
        {
          fieldName: 'notificationStockLimit',
          fieldKey: 'minimal-stock-notification',
        },
      ];

      fields.forEach((field) => {
        //console.log(field);
        if (result?.value[field.fieldKey]) {
          this.itemFormData.patchValue({
            [field.fieldName]: result?.value[field.fieldKey],
          });
        }
      });
    });
  };

  isVideoWrapper(filename: string) {
    return isVideo(filename);
  }

  async saveItem() {
    let itemSlideIndex = 0;

    if (this.existingItem) {
      lockUI();
      for await (const slide of this.itemSlides) {
        if (slide.url && !slide.media) {
          this.itemSlides[itemSlideIndex].media = await urltoFile(
            slide.url,
            'file' + itemSlideIndex
          );
        }

        itemSlideIndex++;
      }
      unlockUI();
    }

    try {
      let images: ItemImageInput[] = this.itemSlides.map(
        (slide: SlideInput, index: number) => {
          return {
            file: slide.media,
            index,
            active: true,
          };
        }
      );
      lockUI();

      if (this.updateItem) {
        try {
          const itemInput: ItemInput = {
            pricing: Number(this.itemFormData.value['pricing']),
            stock: Number(this.itemFormData.value['stock']),
            description: this.itemFormData.value['description'],
            useStock: true,
            notificationStock: true,
            notificationStockLimit: Number(
              this.itemFormData.value['notificationStockLimit']
            ),
          };

          await this.itemsService.updateItem(itemInput, this.itemId);
          this.itemsService.modifiedImagesFromExistingItem = false;

          this.snackbar.open('Producto actualizado satisfactoriamente!', '', {
            duration: 5000,
          });

          unlockUI();

          if (
            this.quotationsService.supplierItemsAdjustmentsConfig
              .quotationItemBeingEdited
          ) {

            return this.router.navigate(
              [
                this.quotationId
                  ? `ecommerce/supplier-register/${this.quotationId}`
                  : `ecommerce/supplier-register`,
              ],
              {
                queryParams: {
                  supplierMerchantId: this.merchantsService.merchantData?._id,
                  requesterId: this.requesterId,
                },
              }
            );
          }

          this.router.navigate(['/admin/dashboard']);
        } catch (error) {
          this.snackbar.open('Ocurrió un error al actualizar el producto', '', {
            duration: 5000,
          });
          unlockUI();
        }

        return;
      }

      if (
        this.quotationsService.supplierItemsAdjustmentsConfig
          ?.quotationItemBeingEdited.quotationItemInMemory
      ) {
        const itemInput: ItemInput = {
          pricing: Number(this.itemFormData.value['pricing']),
          stock: Number(this.itemFormData.value['stock']),
          description: this.itemFormData.value['description'],
          useStock: true,
          notificationStock: true,
          notificationStockLimit: Number(
            this.itemFormData.value['notificationStockLimit']
          ),
        };

        const itemInQuotation =
          this.quotationsService.supplierItemsAdjustmentsConfig?.quotationItems[
            this.quotationsService.supplierItemsAdjustmentsConfig
              ?.quotationItemBeingEdited.indexInQuotations
          ];

        itemInQuotation.pricing = itemInput.pricing;
        itemInQuotation.stock = itemInput.stock;
        itemInQuotation.description = itemInput.description;
        itemInQuotation.notificationStockLimit = itemInput.notificationStockLimit;

        this.quotationsService.supplierItemsAdjustmentsConfig.quotationItems[
          this.quotationsService.supplierItemsAdjustmentsConfig?.quotationItemBeingEdited.indexInQuotations
        ] = itemInQuotation;

        unlockUI();

        return this.router.navigate([
          this.quotationId
            ? `ecommerce/supplier-register/${this.quotationId}`
            : `ecommerce/supplier-register`,
        ]);
      }

      const itemInput: ItemInput = {
        name: this.itemFormData.value['title'],
        description: this.itemFormData.value['description'],
        pricing: Number(this.itemFormData.value['pricing']),
        stock: Number(this.itemFormData.value['stock']),
        useStock: true,
        notificationStock: true,
        notificationStockLimit: Number(
          this.itemFormData.value['notificationStockLimit']
        ),
        images,
        content: [],
        currencies: [],
        hasExtraPrice: false,
        purchaseLocations: [],
        showImages: images.length > 0,
        layout: this.itemFormData.value['defaultLayout'],
        ctaText:
          this.itemFormData.value['ctaName'] !== ''
            ? this.itemFormData.value['ctaName']
            : 'Agregar al carrito',
        ctaBehavior: 'ADD_TO_CART',
        type: 'supplier',
      };
      this.itemsService.itemPrice = null;

      if (this.loggedMerchant) {
        itemInput.merchant = this.merchantsService.merchantData?._id;

        const saleflowDefault = await this.saleflowService.saleflowDefault(
          this.merchantsService.merchantData._id
        );

        if (!this.existingItem) {
          const createdItem = (await this.itemsService.createItem(itemInput))
            ?.createItem;

          itemInput.parentItem = createdItem._id;

          const createdItem2 = (await this.itemsService.createItem(itemInput))
            ?.createItem;

          await this.saleflowService.addItemToSaleFlow(
            {
              item: createdItem2._id,
            },
            saleflowDefault._id
          );

          this.snackbar.open('Item creado exitosamente', 'Cerrar', {
            duration: 3000,
          });

          this.itemsService.temporalItem = null;
          this.itemsService.temporalItemInput = null;
          this.itemsService.modifiedImagesFromExistingItem = false;

          this.router.navigate(['/admin/dashboard']);
        } else {
          itemInput.parentItem = this.itemsService.temporalItem._id;

          const createdItem2 = (await this.itemsService.createItem(itemInput))
            ?.createItem;

          await this.saleflowService.addItemToSaleFlow(
            {
              item: createdItem2._id,
            },
            saleflowDefault._id
          );

          this.snackbar.open('Producto creado satisfactoriamente!', '', {
            duration: 5000,
          });

          this.itemsService.temporalItem = null;
          this.itemsService.temporalItemInput = null;
          this.itemsService.modifiedImagesFromExistingItem = false;

          this.router.navigate(['/admin/dashboard']);
        }
      } else {
        let fieldsToCreate: FormData = {
          title: {
            text: '¿Dónde recibirás las facturas y órdenes?',
          },
          fields: [
            {
              name: 'whatsapp',
              placeholder: 'Escribe el WhatsApp..',
              type: 'phone',
              validators: [Validators.pattern(/[\S]/)],
            },
            {
              name: 'email',
              placeholder: 'Escribe el correo electrónico..',
              type: 'email',
              validators: [Validators.pattern(/[\S]/)],
            },
          ],
        };
        const dialogRef = this.dialog.open(FormComponent, {
          data: fieldsToCreate,
          disableClose: true,
        });

        dialogRef.afterClosed().subscribe(async (result: FormGroup) => {
          if (!result?.value['whatsapp'] && !result?.value['email']) {
            this.snackbar.open('Error al crear el producto', 'Cerrar', {
              duration: 4000,
            });
          } else {
            const phone = result?.value['whatsapp']
              ? result?.value['whatsapp'].e164Number.split('+')[1]
              : null;
            const email = result?.value['email']
              ? result?.value['email']
              : null;

            if (result.controls.email.valid || result.controls.phone.valid) {
              itemInput.parentItem = this.itemId;

              lockUI();
              const createdItem = (
                await this.itemsService.createPreItem(itemInput)
              )?.createPreItem;

              await this.authService.generateMagicLink(
                phone || email,
                '/admin/dashboard',
                null,
                'MerchantAccess',
                {
                  jsondata: JSON.stringify({
                    createdItem: createdItem._id,
                  }),
                },
                []
              );

              unlockUI();

              this.dialogService.open(GeneralFormSubmissionDialogComponent, {
                type: 'centralized-fullscreen',
                props: {
                  icon: 'check-circle.svg',
                  showCloseButton: false,
                  message:
                    'Se ha enviado un link mágico a tu teléfono o a tu correo electrónico',
                },
                customClass: 'app-dialog',
                flags: ['no-header'],
              });
            } else {
              unlockUI();
              this.snackbar.open('Datos invalidos', 'Cerrar', {
                duration: 3000,
              });
            }
          }
        });
      }

      unlockUI();
    } catch (error) {
      unlockUI();
      this.snackbar.open('Error al crear el producto', 'Cerrar', {
        duration: 3000,
      });
    }
  }

  back() {
    if (
      this.quotationsService.supplierItemsAdjustmentsConfig
        ?.quotationItemBeingEdited.quotationItemInMemory
    ) {
      return this.router.navigate([
        this.quotationId
          ? `ecommerce/supplier-register/${this.quotationId}`
          : `ecommerce/supplier-register`,
      ]);
    }

    if (this.updateItem) {
      return this.router.navigate(
        [
          this.quotationId
            ? `ecommerce/supplier-register/${this.quotationId}`
            : `ecommerce/supplier-register`,
        ],
        {
          queryParams: {
            supplierMerchantId: this.merchantsService.merchantData?._id,
            requesterId: this.requesterId,
          },
        }
      );
    }

    this.router.navigate(['ecommerce/supplier-items-selector']);
  }

  addToastReminder(firstLoad: boolean = false) {
    if (this.reminderToast) {
      this.reminderToast.timeoutId = setTimeout(
        () => {
          if (!this.reminderToast.warning) {
            this.toastr.info(this.reminderToast.message, null, {
              timeOut: 1500,
              tapToDismiss: true,
              positionClass: 'toast-top-center',
            });
          } else {
            this.toastr.warning(this.reminderToast.message, null, {
              timeOut: 1500,
              tapToDismiss: true,
              positionClass: 'toast-top-center',
            });
          }

          this.addToastReminder();
        },
        !firstLoad ? this.reminderToast.secondsTrigger * 1000 : 3000
      );
    }
  }

  ngOnDestroy(): void {
    if (this.reminderToast.timeoutId)
      clearTimeout(this.reminderToast.timeoutId);

    this.queryParamsSubscription.unsubscribe();
  }
}
