import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Quotation, QuotationInput } from 'src/app/core/models/quotations';
import { Item, ItemImageInput, ItemInput } from 'src/app/core/models/item';
import { PaginationInput, SaleFlow } from 'src/app/core/models/saleflow';
import {
  QuotationItem,
  QuotationsService,
} from 'src/app/core/services/quotations.service';
import { ItemsService } from 'src/app/core/services/items.service';
import {
  LoginDialogComponent,
  LoginDialogData,
} from 'src/app/modules/auth/pages/login-dialog/login-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { User } from 'src/app/core/models/user';
import { UsersService } from 'src/app/core/services/users.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { Merchant, MerchantInput } from 'src/app/core/models/merchant';
import { AuthService } from 'src/app/core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { completeImageURL } from 'src/app/core/helpers/strings.helpers';
import { SlideInput } from 'src/app/core/models/post';
import { urltoFile } from 'src/app/core/helpers/files.helpers';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { FormComponent, FormData } from '../../dialogs/form/form.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GeneralFormSubmissionDialogComponent } from '../../dialogs/general-form-submission-dialog/general-form-submission-dialog.component';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { environment } from 'src/environments/environment';
import {
  ConfirmationSimpleComponent,
  DialogData,
} from '../../dialogs/confirmation-simple/confirmation-simple.component';
import {
  OptionsDialogComponent,
  OptionsDialogTemplate,
} from '../../dialogs/options-dialog/options-dialog.component';

@Component({
  selector: 'app-supplier-registration',
  templateUrl: './supplier-registration.component.html',
  styleUrls: ['./supplier-registration.component.scss'],
})
export class SupplierRegistrationComponent implements OnInit, OnDestroy {
  queryParamsSubscription: Subscription;
  routeParamsSubscription: Subscription;
  quotation: Quotation;
  requester: Merchant = null;
  quotationItems: Array<QuotationItem> = [];
  quotationItemsToShow: Array<QuotationItem> = [];
  quotationItemsIds: Array<string> = [];
  authorized: boolean = false;
  quotationId: string = null;
  queryParams: Record<string, any> = {};
  newMerchantMode: boolean = false;
  currentUser: User = null;
  temporalQuotation: QuotationInput = null;
  adjustmentsReady: boolean = false;
  onlyItemsThatAreOnTheSupplierSaleflow: boolean = false;
  completeImageURLWrapper = completeImageURL;
  itemSearchbar: FormControl = new FormControl('');
  unitsForItemsThatYouDontSell: Record<string, number> = {};
  quotationName: string = null;
  tutorialOpened: boolean = false;
  itemsTutorialCardsOpened: Record<string, boolean> = {
    price: true,
    stock: true,
    welcome: true,
  };
  searchbarPlaceholder: string = 'Buscar...';
  assetsFolder: string = environment.assetsUrl;
  atLeastOneHasPriceAdded: boolean = false;
  logged: boolean = false;
  notASingleItemOnMerchantSaleflow: boolean = false;

  //New variables
  typeOfRequester: 'UNSPECIFIED_USER' | 'REGISTERED_USER' = 'UNSPECIFIED_USER';
  globalSupplieritemIdsInQuotation: Array<string> = [];
  typeOfQuotation: 'DATABASE_QUOTATION' | 'TEMPORAL_QUOTATION' =
    'DATABASE_QUOTATION';
  showAllProviderItems: boolean = false;

  constructor(
    private route: ActivatedRoute,
    public quotationsService: QuotationsService,
    private itemsService: ItemsService,
    private merchantsService: MerchantsService,
    public headerService: HeaderService,
    private saleflowService: SaleFlowService,
    private authService: AuthService,
    private dialogService: DialogService,
    private router: Router,
    public matDialog: MatDialog,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.routeParamsSubscription = this.route.params.subscribe(
      async ({ quotationId }) => {
        this.queryParamsSubscription = this.route.queryParams.subscribe(
          async (queryParams) => {
            let { jsondata, rambo, overwriteItems } = queryParams;
            let parsedData = jsondata
              ? JSON.parse(decodeURIComponent(jsondata))
              : null;
            let requesterId;
            let quotationName;
            let temporalQuotation = false;
            let items;
            this.quotationId = quotationId;
            this.showAllProviderItems = JSON.parse(rambo || 'false');

            if (!parsedData) {
              const lastCurrentQuotationRequest: {
                requesterId: string;
                items: string;
                temporalQuotation?: boolean;
                quotationName?: string;
                rambo?: boolean;
              } = JSON.parse(
                localStorage.getItem('lastCurrentQuotationRequest')
              );

              requesterId = lastCurrentQuotationRequest?.requesterId;
              items = lastCurrentQuotationRequest?.items;
              temporalQuotation =
                lastCurrentQuotationRequest?.temporalQuotation;
              quotationName = lastCurrentQuotationRequest?.quotationName;

              this.queryParams = {
                requesterId,
                items,
                temporalQuotation,
                quotationName,
                rambo: this.showAllProviderItems,
              };

              if (this.showAllProviderItems) {
                this.storeQueryParams(this.queryParams as any);
              } else {
                this.showAllProviderItems = lastCurrentQuotationRequest?.rambo;
              }

              if (overwriteItems) {
                items = overwriteItems;
                this.queryParams.items = items;
                this.storeQueryParams(this.queryParams as any);
              }
            } else {
              requesterId = parsedData.requesterId;
              items = parsedData.items;
              temporalQuotation = parsedData.temporalQuotation;
              quotationName = parsedData.quotationName;

              this.storeQueryParams(parsedData as any);
            }

            this.quotationName = quotationName;

            if (
              !items &&
              !temporalQuotation &&
              !requesterId &&
              !this.showAllProviderItems
            ) {
              return this.router.navigate(['others/error-screen']);
            }

            if (!items && temporalQuotation && requesterId) {
              return this.router.navigate(['others/error-screen']);
            }

            this.typeOfRequester = !requesterId
              ? 'UNSPECIFIED_USER'
              : 'REGISTERED_USER';
            this.globalSupplieritemIdsInQuotation = items
              ? items.split('-')
              : [];
            this.requester = requesterId
              ? await this.merchantsService.merchant(requesterId)
              : null;
            if (this.requester)
              this.searchbarPlaceholder =
                'Artículos que necesita ' + this.requester.name;
            this.typeOfQuotation = temporalQuotation
              ? 'TEMPORAL_QUOTATION'
              : 'DATABASE_QUOTATION';

            await this.headerService.checkIfUserIsAMerchantAndFetchItsData();
            await this.fetchItems();

            let adjustmentsReady = true;
            let onlyItemsThatAreOnTheSupplierSaleflow = true;
            this.quotationItems.forEach((item) => {
              adjustmentsReady = adjustmentsReady && item.valid;
              onlyItemsThatAreOnTheSupplierSaleflow =
                onlyItemsThatAreOnTheSupplierSaleflow && item.inSaleflow;
            });
            this.adjustmentsReady = adjustmentsReady;
            this.onlyItemsThatAreOnTheSupplierSaleflow =
              onlyItemsThatAreOnTheSupplierSaleflow;

            this.quotationItemsToShow = JSON.parse(
              JSON.stringify(this.quotationItems)
            );

            this.checkIfTutorialsWereSeenAlready();

            this.logged = this.headerService.user ? true : false;
            this.tutorialOpened =
              !this.logged || this.notASingleItemOnMerchantSaleflow;

            this.itemSearchbar.valueChanges.subscribe(async (change) => {
              this.quotationItemsToShow = JSON.parse(
                JSON.stringify(this.quotationItems)
              ).filter(
                (item) =>
                  item.name?.toLowerCase().includes(change.toLowerCase()) ||
                  item.description?.toLowerCase().includes(change.toLowerCase())
              );
            });
          }
        );
      }
    );
    const urlWithoutQueryParams = this.router.url.split('?')[0];

    window.history.replaceState({}, 'SaleFlow', urlWithoutQueryParams);
  }

  storeQueryParams(queryParams: {
    requesterId: string;
    items: string;
    temporalQuotation?: boolean;
    quotationName?: string;
    rambo?: boolean;
  }) {
    const { requesterId, items, temporalQuotation, quotationName, rambo } =
      queryParams;

    this.queryParams = {
      requesterId,
      items,
      temporalQuotation,
      quotationName,
      rambo,
    };

    localStorage.setItem(
      'lastCurrentQuotationRequest',
      JSON.stringify({
        requesterId,
        items,
        temporalQuotation,
        quotationName,
        rambo,
      })
    );
  }

  checkIfTutorialsWereSeenAlready = () => {
    const tutorialsConfig = JSON.parse(
      localStorage.getItem('tutorials-config')
    );

    if (
      tutorialsConfig &&
      'provider-items' in tutorialsConfig &&
      tutorialsConfig['supplier-registration']
    ) {
      this.tutorialOpened = false;
    }
  };

  async fetchItems() {
    lockUI();
    let itemIdsOnTheSaleflow: Record<string, boolean> = {}; //Keeps thrack of which itemIds are already being sold on suppliers saleflow
    const itemIdsArentOnTheSaleflowArray: Array<string> = []; //Keeps thrack of which itemIds arent being sold on suppliers saleflow

    const globalSupplieritemIdsInQuotation =
      this.globalSupplieritemIdsInQuotation;

    if (this.merchantsService.merchantData) {
      //Fetches all items that are specific to merchant's saleflow
      const supplierSpecificItemsInput: PaginationInput = {
        findBy: {
          parentItem: {
            $in: ([] = globalSupplieritemIdsInQuotation),
          },
          merchant: this.merchantsService.merchantData._id,
        },
        options: {
          sortBy: 'createdAt:desc',
          limit: -1,
          page: 1,
        },
      };

      //Fetches supplier specfic items, meaning they already are on the saleflow
      let supplierSpecificItems: Array<QuotationItem> = [];

      supplierSpecificItems = (
        await this.itemsService.listItems(supplierSpecificItemsInput)
      )?.listItems;

      globalSupplieritemIdsInQuotation.forEach((itemId) => {
        itemIdsOnTheSaleflow[itemId] = false;
      });

      supplierSpecificItems.forEach((item) => {
        item.inSaleflow = true;
        itemIdsOnTheSaleflow[item.parentItem] = true;
        if (item.pricing > 0 && item.stock >= 0) item.valid = true;

        if (item.pricing >= 0) {
          this.atLeastOneHasPriceAdded = true;
        }
      });

      this.notASingleItemOnMerchantSaleflow =
        supplierSpecificItems.length === 0;

      Object.keys(itemIdsOnTheSaleflow).forEach((itemId) => {
        if (!itemIdsOnTheSaleflow[itemId]) {
          itemIdsArentOnTheSaleflowArray.push(itemId);
        }
      });

      //Fetches all items that arent on merchant's saleflow
      let itemsThatArentOnTheSaleflowArray: Array<QuotationItem> = [];

      if (
        itemIdsArentOnTheSaleflowArray.length > 0 ||
        this.showAllProviderItems
      ) {
        const itemsThatArentInSuppliersSaleflowQueryPagination: PaginationInput =
          {
            findBy: {
              _id: {
                __in: ([] = itemIdsArentOnTheSaleflowArray),
              },
            },
            options: {
              sortBy: 'createdAt:desc',
              limit: -1,
              page: 1,
            },
          };

        if (this.showAllProviderItems) {
          itemsThatArentInSuppliersSaleflowQueryPagination.findBy = {
            _id: {
              $nin: supplierSpecificItems.map((item) => item._id),
            },
            type: 'supplier',
            parentItem: null,
          };
        }

        const itemsThatArentOnTheSaleflow = (
          await this.itemsService.listItems(
            itemsThatArentInSuppliersSaleflowQueryPagination
          )
        )?.listItems;

        itemsThatArentOnTheSaleflowArray = itemsThatArentOnTheSaleflow;

        itemsThatArentOnTheSaleflowArray.forEach((item, index) => {
          item.pricing = null;
          item.merchant = null;
          item.stock = null;
          item.useStock = false;
          item.inSaleflow = false;
          item.notificationStockLimit = null;
          item.notificationStockPhoneOrEmail = null;
        });
      }

      this.quotationItems = supplierSpecificItems.concat(
        itemsThatArentOnTheSaleflowArray
      );
    } else {
      //Fetches all items that are specific to merchant's saleflow
      const globalItemsInputPagination: PaginationInput = {
        findBy: {
          _id: {
            __in: ([] = globalSupplieritemIdsInQuotation),
          },
        },
        options: {
          sortBy: 'createdAt:desc',
          limit: -1,
          page: 1,
        },
      };

      if (this.showAllProviderItems) {
        globalItemsInputPagination.findBy = {
          type: 'supplier',
          parentItem: null,
        };
      }

      //Fetches supplier specfic items, meaning they already are on the saleflow
      let globalItems: Array<QuotationItem> = [];

      globalItems = (
        await this.itemsService.listItems(globalItemsInputPagination)
      )?.listItems;

      globalItems.forEach((item) => {
        item.pricing = null;
        item.merchant = null;
        item.stock = null;
        item.inSaleflow = false;
        item.notificationStockLimit = null;
        item.notificationStockPhoneOrEmail = null;
        item.useStock = false;
      });

      this.quotationItems = globalItems;
    }

    unlockUI();
  }

  convertItemIntoItemInput = async (
    items: Array<Item>
  ): Promise<ItemInput[]> => {
    return await Promise.all(
      items.map(async (item, itemIndex) => {
        const itemSlides: Array<any> = item.images
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

        let images: ItemImageInput[] = await Promise.all(
          itemSlides.map(async (slide: SlideInput, index: number) => {
            return {
              file: await urltoFile(slide.url, 'file' + index, null, true),
              index,
              active: true,
            };
          })
        );

        const itemInput: ItemInput = {
          name: item.name,
          description: item.description,
          pricing: item.pricing,
          stock: item.stock,
          useStock: true,
          notificationStock: true,
          notificationStockLimit: Number(item.notificationStockLimit),
          notificationStockPhoneOrEmail: item.notificationStockPhoneOrEmail,
          images,
          layout: 'EXPANDED-SLIDE',
        };

        return itemInput;
      })
    );
  };

  async notifyAdjustments() {
    if (this.typeOfQuotation === 'DATABASE_QUOTATION') {
      this.router.navigate(
        ['ecommerce/confirm-quotation/' + this.quotationId],
        {
          queryParams: {
            jsondata: JSON.stringify({
              quotationItems: this.quotationItems
                .map((item) => item._id)
                .join('-'),
              requesterPhone: this.requester.owner.phone,
              requesterEmail: this.requester.owner.email,
            }),
          },
        }
      );
    } else {
      this.router.navigate(['ecommerce/confirm-quotation'], {
        queryParams: {
          jsondata: JSON.stringify({
            quotationItems: this.quotationItems
              .map((item) => item._id)
              .join('-'),
            requesterPhone: this.requester.owner.phone,
            requesterEmail: this.requester.owner.email,
          }),
        },
      });
    }
  }

  goBack() {
    if (this.quotationId) {
      return this.router.navigate([
        '/ecommerce/quotation-bids/' + this.quotationId,
      ]);
    }

    if (!this.currentUser) {
      return this.router.navigate(['/ecommerce/quotations/']);
    }

    if (this.currentUser) this.router.navigate(['/admin/dashboard']);
  }

  ngOnDestroy(): void {
    this.queryParamsSubscription.unsubscribe();
    this.routeParamsSubscription.unsubscribe();
  }

  async generateMagicLinkFor(
    emailOrPhone: string,
    idsOfCreatedItems: Array<string>,
    itemsToUpdate?: Record<string, ItemInput>,
    openSuccessDialog: boolean = true,
    merchantInput?: Record<string, any>,
    redirectionRoute?: string,
    redirectionRouteQueryParams?: Record<string, any>
  ) {
    const magicLinkParams: any = {
      quotationItems: idsOfCreatedItems.join('-'),
      fromProviderAdjustments: true,
    };

    if (itemsToUpdate) {
      magicLinkParams.itemsToUpdate = itemsToUpdate;
    }

    if (!this.quotationId) {
      magicLinkParams.itemsForTemporalQuotation = this.quotationItems.map(
        (item) => item._id
      );
    }

    if (merchantInput) magicLinkParams.merchantInput = merchantInput;

    lockUI();

    await this.authService.generateMagicLink(
      emailOrPhone,
      `ecommerce/quotation-bids/` + (this.quotationId ? this.quotationId : ''),
      null,
      'MerchantAccess',
      {
        jsondata: JSON.stringify(magicLinkParams),
      },
      []
    );

    unlockUI();

    if (redirectionRoute)
      return this.router.navigate([redirectionRoute], {
        queryParams: redirectionRouteQueryParams,
      });

    if (openSuccessDialog) {
      this.dialogService.open(GeneralFormSubmissionDialogComponent, {
        type: 'centralized-fullscreen',
        props: {
          icon: 'check-circle.svg',
          showCloseButton: false,
          message: 'Se ha enviado un link mágico a tu correo electrónico',
        },
        customClass: 'app-dialog',
        flags: ['no-header'],
      });
    }
  }

  determineWhichItemsNeedToBeUpdatedAndWhichNeedToBeCreated = async (
    merchantDefault: Merchant,
    itemsThatArentOnSupplierSaleflow: Array<QuotationItem>,
    createItemsAndAuthThem: boolean = false
  ): Promise<{
    createdItems: Array<string>;
    itemsToUpdate: Record<string, ItemInput>;
  }> => {
    const idsOfCreatedItems: Array<string> = [];

    lockUI();

    const supplierSpecificItemsInput: PaginationInput = {
      findBy: {
        parentItem: {
          $in: ([] = this.quotationItems.map((quotation) => quotation._id)),
        },
        merchant: merchantDefault?._id,
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: -1,
        page: 1,
      },
    };

    const itemsToUpdateOrToCreateById: Record<
      string,
      {
        data: ItemInput;
        operation: 'CREATE' | 'UPDATE';
      }
    > = {};
    const itemsToUpdate: Record<string, boolean> = {};
    const parentItemsAndChildItems: Record<string, string> = {};
    const itemsToCreateIds: Array<string> = [];
    let itemsToUpdateObjects: Record<string, ItemInput> = null;

    //Fetches supplier specfic items, meaning they already are on the saleflow
    let itemsAlreadyProviderByTheMerchant: Array<QuotationItem> = [];

    itemsAlreadyProviderByTheMerchant = (
      await this.itemsService.listItems(supplierSpecificItemsInput)
    )?.listItems;

    itemsAlreadyProviderByTheMerchant.forEach((item) => {
      itemsToUpdate[item.parentItem] = true;
      parentItemsAndChildItems[item.parentItem] = item._id;
    });

    for await (const item of itemsThatArentOnSupplierSaleflow) {
      const itemSlides: Array<any> = item.images
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

      let images: ItemImageInput[] = await Promise.all(
        itemSlides.map(async (slide: SlideInput, index: number) => {
          return {
            file: await urltoFile(slide.url, 'file' + index, null, true),
            index,
            active: true,
          };
        })
      );

      itemsToUpdateOrToCreateById[item._id] = {
        operation: itemsToUpdate[item._id] ? 'UPDATE' : 'CREATE',
        data: {
          name: item.name,
          description: item.description,
          pricing: item.pricing !== null ? item.pricing : 0,
          stock: item.stock !== null ? item.stock : 0,
          useStock: true,
          notificationStock: true,
          notificationStockLimit: item.notificationStockLimit,
          notificationStockPhoneOrEmail: item.notificationStockPhoneOrEmail,
          images: images,
          merchant: this.merchantsService.merchantData._id,
          content: [],
          currencies: [],
          hasExtraPrice: false,
          parentItem: item._id,
          purchaseLocations: [],
          showImages: images.length > 0,
          type: 'supplier',
        },
      };

      if (itemsToUpdateOrToCreateById[item._id].operation === 'UPDATE')
        delete itemsToUpdateOrToCreateById[item._id].data.images;

      if (!itemsToUpdate[item._id]) itemsToCreateIds.push(item._id);
      else {
        if (!itemsToUpdateObjects) itemsToUpdateObjects = {};

        itemsToUpdateObjects[parentItemsAndChildItems[item._id]] =
          itemsToUpdateOrToCreateById[item._id].data;
      }
    }

    if (!createItemsAndAuthThem) {
      const precreatedItemsResponse = await Promise.all(
        itemsToCreateIds.map((idOfItemToCreate) =>
          this.itemsService.createPreItem(
            itemsToUpdateOrToCreateById[idOfItemToCreate].data
          )
        )
      );

      precreatedItemsResponse.forEach((promiseResponse) => {
        idsOfCreatedItems.push(promiseResponse?.createPreItem._id);
      });
    } else {
      const createdItemsResponse = await Promise.all(
        itemsToCreateIds.map((idOfItemToCreate) =>
          this.itemsService.createItem(
            itemsToUpdateOrToCreateById[idOfItemToCreate].data
          )
        )
      );

      createdItemsResponse.forEach((promiseResponse) => {
        idsOfCreatedItems.push(promiseResponse?.createItem._id);
      });
    }

    unlockUI();

    return {
      createdItems: idsOfCreatedItems,
      itemsToUpdate: itemsToUpdateObjects,
    };
  };

  async changeAmount(
    item: Item,
    type: 'add' | 'subtract' | 'infinite',
    itemIndex: number,
    providedByMe: boolean
  ) {
    const itemIndexInFullList = this.quotationItems.findIndex(
      (itemInList) => item._id === itemInList._id
    );

    if (itemIndexInFullList >= 0) {
      try {
        let newAmount: number;
        if (type === 'add' && providedByMe) {
          newAmount = item.stock >= 0 ? item.stock + 1 : 1;
          item.useStock = true;
        } else if (type === 'subtract' && providedByMe) {
          newAmount = item.stock >= 1 ? item.stock - 1 : 0;
          item.useStock = true;
        }

        if (type === 'add' && !providedByMe) {
          newAmount = !this.unitsForItemsThatYouDontSell[item._id]
            ? 1
            : this.unitsForItemsThatYouDontSell[item._id] + 1;
          item.useStock = true;
        } else if (type === 'subtract' && !providedByMe) {
          newAmount =
            this.unitsForItemsThatYouDontSell[item._id] >= 1
              ? this.unitsForItemsThatYouDontSell[item._id] - 1
              : 0;
          item.useStock = true;
        }

        if (type === 'infinite' && providedByMe) {
          this.itemsService.updateItem(
            {
              useStock: false,
            },
            item._id
          );
          this.quotationItems[itemIndexInFullList].useStock = false;
          this.setQuotationItemsToShow();
          return;
        } else if (type === 'infinite' && !providedByMe) {
          this.quotationItems[itemIndexInFullList].useStock = false;
          this.setQuotationItemsToShow();
          return;
        }

        if (providedByMe) {
          this.itemsService.updateItem(
            {
              stock: newAmount,
              useStock: true,
            },
            item._id
          );

          this.quotationItems[itemIndexInFullList].stock = newAmount;
          this.quotationItems[itemIndexInFullList].useStock = true;
        } else {
          this.quotationItems[itemIndexInFullList].stock = newAmount;
          this.quotationItems[itemIndexInFullList].useStock = true;
          this.unitsForItemsThatYouDontSell[item._id] = newAmount;
        }

        this.setQuotationItemsToShow();
      } catch (error) {
        this.headerService.showErrorToast();
      }
    } else {
      console.error('Item not in quotation items');
    }
  }

  setQuotationItemsToShow = () => {
    this.quotationItemsToShow = JSON.parse(
      JSON.stringify(this.quotationItems)
    ).filter(
      (item) =>
        item.name
          ?.toLowerCase()
          .includes(this.itemSearchbar.value.toLowerCase()) ||
        item.description
          ?.toLowerCase()
          .includes(this.itemSearchbar.value.toLowerCase())
    );
  };

  async addPrice(item: QuotationItem) {
    let fieldsToCreate: FormData = {
      fields: [
        {
          label:
            '¿Cuál es el precio de venta de' +
            (item.name
              ? ' ' +
                item.name +
                (item.description ? '(' + item.description + ')?' : '')
              : 'l articulo?'),
          name: 'price',
          type: 'currency',
          validators: [Validators.pattern(/[\S]/), Validators.min(0)],
        },
      ],
      buttonsTexts: {
        accept: 'Exhibirlo a los Miembros',
        cancel: 'Cancelar',
      },
      automaticallyFocusFirstField: true,
    };

    const dialogRef = this.matDialog.open(FormComponent, {
      data: fieldsToCreate,
    });

    dialogRef.afterClosed().subscribe(async (result: FormGroup) => {
      if (result.controls.price.valid) {
        const price = Number(result.value['price']);

        if (!this.headerService.user) {
          lockUI();
          const itemInput = await this.getItemInputForItemsThatYouDontSell(
            price,
            item
          );

          unlockUI();

          const itemIndexInFullList = this.quotationItems.findIndex(
            (itemInList) => itemInput.parentItem === itemInList._id
          );

          if (itemIndexInFullList >= 0) {
            this.quotationItems[itemIndexInFullList].pricing =
              itemInput.pricing;
            this.quotationItems[itemIndexInFullList].stock = itemInput.stock;
            this.quotationItemsToShow = JSON.parse(
              JSON.stringify(this.quotationItems)
            );
            this.atLeastOneHasPriceAdded = true;
          } else {
            console.error('item not in the list');
          }
        } else {
          if (!item.inSaleflow) {
            lockUI();

            const itemInput = await this.getItemInputForItemsThatYouDontSell(
              price,
              item
            );

            const saleflowDefault = await this.saleflowService.saleflowDefault(
              this.merchantsService.merchantData._id
            );

            const createdItem = (await this.itemsService.createItem(itemInput))
              ?.createItem;

            await this.saleflowService.addItemToSaleFlow(
              {
                item: createdItem._id,
              },
              saleflowDefault._id
            );

            this.snackbar.open('Ahora estás exhibiendo el producto!', '', {
              duration: 5000,
            });

            const itemIndexInFullList = this.quotationItems.findIndex(
              (itemInList) => itemInput.parentItem === itemInList._id
            );

            if (itemIndexInFullList >= 0) {
              this.quotationItems[itemIndexInFullList] = {
                ...item,
                ...createdItem,
              };
              this.quotationItems[itemIndexInFullList].inSaleflow = true;
              this.quotationItemsToShow = JSON.parse(
                JSON.stringify(this.quotationItems)
              );
              this.atLeastOneHasPriceAdded = true;
            } else {
              console.error('item not in the list');
            }

            unlockUI();
          } else {
            const price = Number(result.value['price']);

            await this.itemsService.updateItem(
              {
                pricing: price,
              },
              item._id
            );

            const itemIndexInFullList = this.quotationItems.findIndex(
              (itemInList) => item._id === itemInList._id
            );

            if (itemIndexInFullList >= 0) {
              this.quotationItems[itemIndexInFullList] = {
                ...item,
                pricing: price,
              };
              this.quotationItems[itemIndexInFullList].inSaleflow = true;
              this.quotationItemsToShow = JSON.parse(
                JSON.stringify(this.quotationItems)
              );
            } else {
              console.error('item not in the list');
            }
          }
        }
      }
    });
  }

  getItemInputForItemsThatYouDontSell = async (
    price: number,
    item: Item
  ): Promise<ItemInput> => {
    const itemInput: ItemInput = {
      name: item.name,
      layout: item.layout,
      description: item.description,
      pricing: price,
      stock:
        this.unitsForItemsThatYouDontSell[item._id] >= 0
          ? this.unitsForItemsThatYouDontSell[item._id]
          : 0,
      notificationStock: true,
      notificationStockLimit: item.notificationStockLimit,
      useStock: true,
      type: 'supplier',
    };

    if (this.merchantsService.merchantData) {
      itemInput.merchant = this.merchantsService.merchantData._id;
    }

    const slides: any[] = item.images
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

    let itemSlideIndex = 0;

    for await (const slide of slides) {
      if (slide.url && !slide.media) {
        slides[itemSlideIndex].media = await urltoFile(
          slide.url,
          'file' + itemSlideIndex
        );
      }

      itemSlideIndex++;
    }

    let images: ItemImageInput[] = slides.map(
      (slide: SlideInput, index: number) => {
        return {
          file: slide.media,
          index,
          active: true,
        };
      }
    );

    itemInput.images = images;

    itemInput.parentItem = item._id;

    return itemInput;
  };

  /*
  askToTheUserIfHeFinishedAlready = async (itemInput: ItemInput) => {
    let dialogData: DialogData = {
      styles: {
        dialogContainer: {
          padding: '25px 20px',
        },
        title: {
          marginBottom: '0px',
        },
        buttonsContainer: {
          marginTop: '0px',
          padding: '0px',
        },
        button: {
          width: '41.07%',
        },
      },
      texts: {
        accept: 'Sí',
        cancel: 'Quedarme aquí',
      },
      title: {
        text: '¿Quieres salvar los cambios(Serás redirigido a tu dashboard)?',
      },
    };

    const dialogRef = this.matDialog.open(ConfirmationSimpleComponent, {
      data: dialogData,
    });

    return dialogRef.afterClosed().subscribe(async (accepted: boolean) => {
      const itemIndexInFullList = this.quotationItems.findIndex(
        (itemInList) => itemInput.parentItem === itemInList._id
      );

      if (itemIndexInFullList >= 0) {
        this.quotationItems[itemIndexInFullList].pricing = itemInput.pricing;
        this.quotationItems[itemIndexInFullList].stock = itemInput.stock;
        this.quotationItemsToShow = JSON.parse(
          JSON.stringify(this.quotationItems)
        );
      } else {
        console.error('item not in the list');
      }

      if (accepted) {
        return await this.openMagicLinkDialog(itemInput);
      } else {
        dialogRef.close();
      }
    });
  };*/

  async openMagicLinkDialog() {
    let fieldsToCreateInEmailDialog: FormData = {
      title: {
        text: 'Acceso al Club:',
      },
      buttonsTexts: {
        accept: 'Recibir el enlace con acceso',
        cancel: 'Cancelar',
      },
      containerStyles: {
        padding: '35px 23px 38px 18px',
      },
      hideBottomButtons: true,
      fields: [
        {
          name: 'magicLinkEmailOrPhone',
          type: 'email',
          placeholder: 'Escribe el correo electrónico..',
          validators: [Validators.pattern(/[\S]/), Validators.required],
          inputStyles: {
            padding: '11px 1px',
          },
          styles: {
            gap: '0px',
          },
          bottomTexts: [
            {
              text: 'Este correo también sirve para accesar al Club y aprovechar todas las herramientas que se están creando.',
              styles: {
                color: '#FFF',
                fontFamily: 'InterLight',
                fontSize: '19px',
                fontStyle: 'normal',
                fontWeight: '300',
                lineHeight: 'normal',
                marginBottom: '28px',
                marginTop: '36px',
              },
            },
            {
              text: 'La promesa del Club es desarrollar funcionalidades que necesites.',
              styles: {
                color: '#FFF',
                fontFamily: 'InterLight',
                fontSize: '19px',
                fontStyle: 'normal',
                fontWeight: '300',
                lineHeight: 'normal',
                margin: '0px',
                padding: '0px',
              },
            },
          ],
          submitButton: {
            text: '>',
            styles: {
              borderRadius: '8px',
              background: '#87CD9B',
              padding: '6px 15px',
              color: '#181D17',
              textAlign: 'center',
              fontFamily: 'InterBold',
              fontSize: '17px',
              fontStyle: 'normal',
              fontWeight: '700',
              lineHeight: 'normal',
              position: 'absolute',
              right: '1px',
              top: '8px',
            },
          },
        },
      ],
    };

    const emailDialogRef = this.matDialog.open(FormComponent, {
      data: fieldsToCreateInEmailDialog,
      disableClose: true,
      panelClass: 'login',
    });

    emailDialogRef.afterClosed().subscribe(async (result: FormGroup) => {
      if (result?.controls?.magicLinkEmailOrPhone.valid) {
        const emailOrPhone = result?.value['magicLinkEmailOrPhone'];
        const myUser = await this.authService.checkUser(emailOrPhone);
        const myMerchant = !myUser
          ? null
          : await this.merchantsService.merchantDefault(myUser._id);

        let optionsDialogTemplate: OptionsDialogTemplate = null;

        if (!myUser) {
          optionsDialogTemplate = {
            title:
              'Notamos que es la primera vez que intentas acceder con este correo, prefieres:',
            options: [
              {
                value:
                  'Empezar mi Membresía al Club con este correo electrónico',
                callback: async () => {
                  let fieldsToCreateInMerchantRegistrationDialog: FormData = {
                    buttonsTexts: {
                      accept: 'Confirmar mi correo',
                      cancel: 'Cancelar',
                    },
                    containerStyles: {
                      padding: '39.74px 17px 47px 24px',
                    },
                    fields: [
                      {
                        label: 'Nombre Comercial que verán tus compradores:',
                        name: 'merchantName',
                        type: 'text',
                        placeholder: 'Escribe el nombre comercial',
                        validators: [
                          Validators.pattern(/[\S]/),
                          Validators.required,
                        ],
                        inputStyles: {
                          padding: '11px 1px',
                        },
                      },
                      {
                        label:
                          'WhatsApp que recibirá las facturas que te mandarán los compradores:',
                        name: 'merchantPhone',
                        type: 'phone',
                        placeholder: 'Escribe el nombre comercial',
                        validators: [
                          Validators.pattern(/[\S]/),
                          Validators.required,
                        ],
                        inputStyles: {
                          padding: '11px 1px',
                        },
                      },
                    ],
                  };

                  const merchantRegistrationDialogRef = this.matDialog.open(
                    FormComponent,
                    {
                      data: fieldsToCreateInMerchantRegistrationDialog,
                      disableClose: true,
                      panelClass: ['login', 'merchant-registration'],
                    }
                  );

                  merchantRegistrationDialogRef
                    .afterClosed()
                    .subscribe(async (result: FormGroup) => {
                      if (
                        result?.controls?.merchantName.valid &&
                        result?.controls?.merchantPhone.valid
                      ) {
                        const merchantInput: Record<string, any> = {
                          name: result?.value['merchantName'],
                          phone: result?.value['merchantPhone'],
                        };

                        lockUI();
                        const itemsThatArentOnSupplierSaleflow =
                          this.quotationItems.filter(
                            (item) => !item.inSaleflow && item.pricing !== null
                          );
                        const idsOfCreatedItems: Array<string> = [];

                        const inputArray: Array<ItemInput> = [];

                        for await (const item of itemsThatArentOnSupplierSaleflow) {
                          const itemSlides: Array<any> = item.images
                            .sort(({ index: a }, { index: b }) =>
                              a > b ? 1 : -1
                            )
                            .map(({ index, ...image }) => {
                              return {
                                url: completeImageURL(image.value),
                                index,
                                type: 'poster',
                                text: '',
                                _id: image._id,
                              };
                            });

                          let images: ItemImageInput[] = await Promise.all(
                            itemSlides.map(
                              async (slide: SlideInput, index: number) => {
                                return {
                                  file: await urltoFile(
                                    slide.url,
                                    'file' + index,
                                    null,
                                    true
                                  ),
                                  index,
                                  active: true,
                                };
                              }
                            )
                          );

                          const input: ItemInput = {
                            name: item.name,
                            description: item.description,
                            pricing: item.pricing,
                            stock: item.stock,
                            useStock: true,
                            notificationStock: true,
                            notificationStockLimit: item.notificationStockLimit,
                            notificationStockPhoneOrEmail:
                              item.notificationStockPhoneOrEmail,
                            images: images,
                            merchant: this.merchantsService.merchantData._id,
                            content: [],
                            currencies: [],
                            hasExtraPrice: false,
                            parentItem: item._id,
                            purchaseLocations: [],
                            showImages: images.length > 0,
                            type: 'supplier',
                          };

                          inputArray.push(input);
                        }

                        for await (const itemInput of inputArray) {
                          //console.log('itemInput', itemInput);

                          const createdItem = (
                            await this.itemsService.createPreItem(itemInput)
                          )?.createPreItem;

                          idsOfCreatedItems.push(createdItem._id);
                        }

                        await this.generateMagicLinkFor(
                          emailOrPhone,
                          idsOfCreatedItems,
                          null,
                          true,
                          merchantInput,
                          '/ecommerce/confirm-club-registration',
                          {
                            merchantName: merchantInput.name,
                          }
                        );
                        unlockUI();
                      }
                    });
                },
              },
              {
                value: 'Intentar con otro correo electrónico.',
                callback: async () => {
                  return this.openMagicLinkDialog();
                },
              },
              {
                value:
                  'Algo anda mal porque no es la primera vez que trato de acceder con este correo',
                callback: async () => {
                  this.sendWhatsappToAppOwner(emailOrPhone);
                },
              },
            ],
          };
        } else {
          optionsDialogTemplate = {
            title:
              'Bienvenido de vuelta ' +
              (myMerchant
                ? myMerchant.name
                : myUser.name || myUser.email || myUser.phone) +
              ', prefieres:',
            options: [
              {
                value: 'Prefiero acceder con la clave',
                callback: () => {
                  addPassword(emailOrPhone);
                },
              },
              {
                value: 'Prefiero recibir el enlace de acceso en mi correo',
                callback: async () => {
                  if (result?.controls?.magicLinkEmailOrPhone.valid) {
                    let emailOrPhone = result?.value['magicLinkEmailOrPhone'];

                    lockUI();

                    const merchantDefaullt = myUser
                      ? await this.merchantsService.merchantDefault(myUser._id)
                      : null;

                    const itemsThatArentOnSupplierSaleflow =
                      this.quotationItems.filter(
                        (item) => !item.inSaleflow && item.pricing !== null
                      );

                    if (!myUser && !merchantDefaullt) {
                      const idsOfCreatedItems: Array<string> = [];

                      const inputArray: Array<ItemInput> = [];

                      for await (const item of itemsThatArentOnSupplierSaleflow) {
                        const itemSlides: Array<any> = item.images
                          .sort(({ index: a }, { index: b }) =>
                            a > b ? 1 : -1
                          )
                          .map(({ index, ...image }) => {
                            return {
                              url: completeImageURL(image.value),
                              index,
                              type: 'poster',
                              text: '',
                              _id: image._id,
                            };
                          });

                        let images: ItemImageInput[] = await Promise.all(
                          itemSlides.map(
                            async (slide: SlideInput, index: number) => {
                              return {
                                file: await urltoFile(
                                  slide.url,
                                  'file' + index,
                                  null,
                                  true
                                ),
                                index,
                                active: true,
                              };
                            }
                          )
                        );

                        const input: ItemInput = {
                          name: item.name,
                          description: item.description,
                          pricing: item.pricing,
                          stock: item.stock,
                          useStock: true,
                          notificationStock: true,
                          notificationStockLimit: item.notificationStockLimit,
                          notificationStockPhoneOrEmail:
                            item.notificationStockPhoneOrEmail,
                          images: images,
                          merchant: this.merchantsService.merchantData._id,
                          content: [],
                          currencies: [],
                          hasExtraPrice: false,
                          parentItem: item._id,
                          purchaseLocations: [],
                          showImages: images.length > 0,
                          type: 'supplier',
                        };

                        inputArray.push(input);
                      }

                      for await (const itemInput of inputArray) {
                        //console.log('itemInput', itemInput);

                        const createdItem = (
                          await this.itemsService.createPreItem(itemInput)
                        )?.createPreItem;

                        idsOfCreatedItems.push(createdItem._id);
                      }

                      await this.generateMagicLinkFor(
                        emailOrPhone,
                        idsOfCreatedItems,
                        null,
                        true
                      );
                      unlockUI();
                    } else {
                      const { createdItems, itemsToUpdate } =
                        await this.determineWhichItemsNeedToBeUpdatedAndWhichNeedToBeCreated(
                          merchantDefaullt,
                          itemsThatArentOnSupplierSaleflow
                        );

                      await this.generateMagicLinkFor(
                        emailOrPhone,
                        createdItems,
                        itemsToUpdate,
                        true
                      );
                      unlockUI();
                    }
                  } else if (
                    result?.controls?.magicLinkEmailOrPhone.valid === false
                  ) {
                    unlockUI();
                    this.snackbar.open('Datos invalidos', 'Cerrar', {
                      duration: 3000,
                    });
                  }
                },
              },
              {
                value:
                  'Algo anda mal porque no es la primera vez que trato de acceder con este correo',
                callback: async () => {
                  this.sendWhatsappToAppOwner(emailOrPhone);
                },
              },
            ],
          };
        }

        this.matDialog.open(OptionsDialogComponent, {
          data: optionsDialogTemplate,
          disableClose: true,
          panelClass: 'login'
        });
      } else if (result?.controls?.magicLinkEmailOrPhone.valid === false) {
        unlockUI();
        this.snackbar.open('Datos invalidos', 'Cerrar', {
          duration: 3000,
        });
      }
    });

    const addPassword = async (emailOrPhone: string) => {
      emailDialogRef.close();

      let fieldsToCreate: FormData = {
        title: {
          text: 'Clave de Acceso:',
        },
        buttonsTexts: {
          accept: 'Accesar al Club',
          cancel: 'Cancelar',
        },
        fields: [
          {
            name: 'password',
            type: 'password',
            placeholder: 'Escribe la contraseña',
            validators: [Validators.pattern(/[\S]/)],
            bottomButton: {
              text: 'Prefiero recibir el correo con el enlace de acceso',
              callback: () => {
                //Cerrar 2do dialog

                return switchToMagicLinkDialog();
              },
            },
          },
        ],
      };

      const dialog2Ref = this.matDialog.open(FormComponent, {
        data: fieldsToCreate,
        disableClose: true,
        panelClass: 'login'
      });

      dialog2Ref.afterClosed().subscribe(async (result: FormGroup) => {
        try {
          if (result?.controls?.password.valid) {
            let password = result?.value['password'];

            lockUI();

            const session = await this.authService.signin(
              emailOrPhone,
              password,
              true
            );

            if (!session) throw new Error('invalid credentials');

            const { merchantDefault } =
              await this.getDefaultMerchantAndSaleflows(session.user);

            const itemsThatArentOnSupplierSaleflow = this.quotationItems.filter(
              (item) => !item.inSaleflow && item.pricing !== null
            );

            const { itemsToUpdate } =
              await this.determineWhichItemsNeedToBeUpdatedAndWhichNeedToBeCreated(
                merchantDefault,
                itemsThatArentOnSupplierSaleflow,
                true
              );

            if (itemsToUpdate && Object.keys(itemsToUpdate).length > 0) {
              await Promise.all(
                Object.keys(itemsToUpdate).map((itemId) =>
                  this.itemsService.updateItem(itemsToUpdate[itemId], itemId)
                )
              );
            }

            this.router.navigate(['/ecommerce/provider-items']);

            unlockUI();
          } else if (result?.controls?.password.valid === false) {
            unlockUI();
            this.snackbar.open('Datos invalidos', 'Cerrar', {
              duration: 3000,
            });
          }
        } catch (error) {
          unlockUI();
          console.error(error);
          this.headerService.showErrorToast();
        }
      });

      const switchToMagicLinkDialog = () => {
        dialog2Ref.close();
        return this.openMagicLinkDialog();
      };
    };
  }

  sendWhatsappToAppOwner(emailOrPhone: string) {
    let message =
      `Algo anda mal porque es la primera vez que trato de acceder con este correo: ` +
      emailOrPhone;

    const whatsappLink = `https://api.whatsapp.com/send?phone=19188156444&text=${encodeURIComponent(
      message
    )}`;

    window.location.href = whatsappLink;
  }

  async editPrice(item: Item, itemIndex: number) {
    let fieldsToCreate: FormData = {
      fields: [
        {
          label:
            '¿Cuál es el precio de venta de' +
            (item.name ? ' ' + item.name : 'l articulo?'),
          name: 'price',
          type: 'currency',
          validators: [Validators.pattern(/[\S]/), Validators.min(0)],
        },
      ],
      buttonsTexts: {
        accept: 'Actualizar precio',
        cancel: 'Cancelar',
      },
      automaticallyFocusFirstField: true,
    };

    const dialogRef = this.matDialog.open(FormComponent, {
      data: fieldsToCreate,
    });

    dialogRef.afterClosed().subscribe(async (result: FormGroup) => {
      if (result.controls.price.valid) {
        lockUI();

        try {
          const price = Number(result.value['price']);

          await this.itemsService.updateItem(
            {
              pricing: price,
            },
            item._id
          );

          const itemIndexInFullList = this.quotationItems.findIndex(
            (itemInList) => item._id === itemInList._id
          );

          if (itemIndexInFullList >= 0) {
            this.quotationItems[itemIndexInFullList].pricing = price;
            this.quotationItemsToShow = JSON.parse(
              JSON.stringify(this.quotationItems)
            );
          } else {
            console.error('item not in the list');
          }

          unlockUI();
        } catch (error) {
          unlockUI();
          this.headerService.showErrorToast();
          console.error(error);
        }
      }
    });
  }

  closeItemsTutorial = (cardName: string) => {
    this.itemsTutorialCardsOpened[cardName] = false;

    const shouldTheTutorialBeClosed = !this.showAllProviderItems
      ? !this.itemsTutorialCardsOpened['price'] &&
        !this.itemsTutorialCardsOpened['stock']
      : !this.itemsTutorialCardsOpened['price'] &&
        !this.itemsTutorialCardsOpened['stock'] &&
        !this.itemsTutorialCardsOpened['welcome'];

    if (shouldTheTutorialBeClosed) {
      this.tutorialOpened = false;

      let tutorialsConfig = JSON.parse(
        localStorage.getItem('tutorials-config')
      );

      if (!tutorialsConfig) tutorialsConfig = {};

      localStorage.setItem(
        'tutorials-config',
        JSON.stringify({
          ...tutorialsConfig,
          'supplier-registration': true,
        })
      );
    }
  };

  async getDefaultMerchantAndSaleflows(user: User): Promise<{
    merchantDefault: Merchant;
    saleflowDefault: SaleFlow;
  }> {
    if (!user?._id) return null;

    let userMerchantDefault = await this.merchantsService.merchantDefault(
      user._id
    );

    if (!userMerchantDefault) {
      const merchants = await this.merchantsService.myMerchants();

      if (merchants.length === 0) {
        const { createMerchant: createdMerchant } =
          await this.merchantsService.createMerchant({
            owner: user._id,
            name:
              user.email?.split('@')[0] + '-saleflow' ||
              user.phone + '-saleflow',
            slug: user.email?.split('@')[0] || user.phone,
          });

        const { merchantSetDefault: defaultMerchant } =
          await this.merchantsService.setDefaultMerchant(createdMerchant._id);

        if (defaultMerchant) userMerchantDefault = defaultMerchant;
      }
    }

    let userSaleflowDefault = await this.saleflowService.saleflowDefault(
      userMerchantDefault._id
    );

    if (!userSaleflowDefault) {
      const { createSaleflow: createdSaleflow } =
        await this.saleflowService.createSaleflow({
          merchant: userMerchantDefault._id,
          name:
            user.email?.split('@')[0] + '-saleflow' || user.phone + '-saleflow',
          items: [],
        });

      const { saleflowSetDefault: defaultSaleflow } =
        await this.saleflowService.setDefaultSaleflow(
          userMerchantDefault._id,
          createdSaleflow._id
        );

      await this.saleflowService.createSaleFlowModule({
        saleflow: createdSaleflow._id,
        delivery: {
          deliveryLocation: true,
          isActive: true,
          moduleOrder: 0,
        } as any,
        post: {
          isActive: true,
          post: true,
          moduleOrder: 1,
        } as any,
      });

      userSaleflowDefault = defaultSaleflow;
    }

    return {
      merchantDefault: userMerchantDefault,
      saleflowDefault: userSaleflowDefault,
    };
  }
}
