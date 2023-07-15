import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { completeImageURL } from 'src/app/core/helpers/strings.helpers';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { ItemImageInput, ItemInput } from 'src/app/core/models/item';
import { SlideInput } from 'src/app/core/models/post';
import { HeaderService } from 'src/app/core/services/header.service';
import {
  ExtendedItemInput,
  ItemsService,
} from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import {
  FormComponent,
  FormData,
} from 'src/app/shared/dialogs/form/form.component';
import { environment } from 'src/environments/environment';

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
  itemId: string = null;

  constructor(
    private fb: FormBuilder,
    public itemsService: ItemsService,
    private headerService: HeaderService,
    private merchantsService: MerchantsService,
    private saleflowService: SaleFlowService,
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.routerParamsSubscription = this.route.params.subscribe(
      ({ itemId }) => {
        this.queryParamsSubscription = this.route.queryParams.subscribe(
          ({ existingItem, updateItem }) => {
            this.existingItem = Boolean(existingItem);
            this.updateItem = Boolean(updateItem);
            this.itemId = itemId;

            if (!this.itemsService.temporalItemInput?.name && !existingItem) {
              this.router.navigate(['/admin/item-selector']);
            }

            this.itemFormData = this.fb.group({
              title: [this.itemsService.temporalItemInput?.name || ''],
              pricing: [
                this.itemsService.temporalItemInput?.pricing || 0,
                Validators.compose([Validators.required, Validators.min(0.1)]),
              ],
              defaultLayout: [
                this.itemsService.temporalItemInput?.layout || this.layout,
              ],
              stock: [
                this.itemsService.temporalItemInput?.stock || '',
                Validators.compose([Validators.required, Validators.min(1)]),
              ],
              notificationStockLimit: [
                this.itemsService.temporalItemInput?.notificationStockLimit ||
                  '',
                Validators.compose([Validators.required, Validators.min(1)]),
              ],
            });

            if (this.itemsService.temporalItemInput?.slides && !existingItem) {
              this.itemSlides = this.itemsService.temporalItemInput?.slides;
            }

            if (
              existingItem &&
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
                    _id: image._id
                  };
                });
            } else if (
              existingItem &&
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

        const queryParams = {
          entity: 'item',
          redirectFromFlowRoute: true,
          useSlidesInMemory: this.existingItem && !this.updateItem,
        };

        if (this.itemSlides.length === 1 && !file.type.includes('video')) {
          routeForItemEntity = 'admin/items-slides-editor';

          queryParams.redirectFromFlowRoute = true;
        } else if (
          this.itemSlides.length === 1 &&
          file.type.includes('video')
        ) {
          routeForItemEntity = 'admin/slides-editor';

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
          _id: slide._id
        };
      }
    );
    const itemInput: ExtendedItemInput = {
      name: this.itemsService.temporalItemInput?.name,
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

  openFormForField() {
    let fieldsToCreate: FormData = {
      fields: [],
    };

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

    const dialogRef = this.dialog.open(FormComponent, {
      data: fieldsToCreate,
    });

    dialogRef.afterClosed().subscribe((result: FormGroup) => {
      if (result.value['initial-stock']) {
        this.itemFormData.patchValue({
          stock: result.value['initial-stock'],
        });
      }

      if (result.value['minimal-stock-notification']) {
        this.itemFormData.patchValue({
          notificationStockLimit: result.value['minimal-stock-notification'],
        });
      }
    });
  }

  async saveItem() {
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
            useStock: true,
            notificationStock: true,
            notificationStockLimit: Number(
              this.itemFormData.value['notificationStockLimit']
            ),
          };

          await this.itemsService.updateItem(itemInput, this.itemId);

          this.snackbar.open('Producto actualizado satisfactoriamente!', '', {
            duration: 5000,
          });

          
          unlockUI()
        } catch (error) {
          this.snackbar.open('Ocurrió un error al crear el producto', '', {
            duration: 5000,
          });
          unlockUI()
        }

        return;
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
        merchant: this.merchantsService.merchantData?._id,
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

      const createdItem = (await this.itemsService.createItem(itemInput))
        ?.createItem;

      itemInput.parentItem = createdItem._id;

      const createdItem2 = (await this.itemsService.createItem(itemInput))
        ?.createItem;

      await this.saleflowService.addItemToSaleFlow(
        {
          item: createdItem2._id,
        },
        this.saleflowService.saleflowData._id
      );
      this.snackbar.open('Producto creado satisfactoriamente!', '', {
        duration: 5000,
      });

      this.itemsService.temporalItem = null;
      this.itemsService.temporalItemInput = null;
      this.itemsService.modifiedImagesFromExistingItem = false;

      this.router.navigate(['admin/item-selector']);

      unlockUI();

      this.snackbar.open('Item creado exitosamente', 'Cerrar', {
        duration: 3000,
      });
    } catch (error) {
      this.snackbar.open('Error al crear el producto', 'Cerrar', {
        duration: 3000,
      });
    }
  }

  back() {
    this.router.navigate(['admin/item-selector']);
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
