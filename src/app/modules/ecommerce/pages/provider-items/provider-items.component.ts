import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { urltoFile } from 'src/app/core/helpers/files.helpers';
import {
  completeImageURL,
  isVideo,
} from 'src/app/core/helpers/strings.helpers';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Item, ItemImageInput, ItemInput } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { SlideInput } from 'src/app/core/models/post';
import { PaginationInput, SaleFlow } from 'src/app/core/models/saleflow';
import { User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { QuotationItem } from 'src/app/core/services/quotations.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import {
  FormComponent,
  FormData,
} from 'src/app/shared/dialogs/form/form.component';
import { GeneralFormSubmissionDialogComponent } from 'src/app/shared/dialogs/general-form-submission-dialog/general-form-submission-dialog.component';
import {
  OptionsDialogComponent,
  OptionsDialogTemplate,
} from 'src/app/shared/dialogs/options-dialog/options-dialog.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-provider-items',
  templateUrl: './provider-items.component.html',
  styleUrls: ['./provider-items.component.scss'],
})
export class ProviderItemsComponent implements OnInit {
  drawerOpened: boolean = false;
  assetsFolder: string = environment.assetsUrl;
  presentationOpened: boolean = false;

  //Searchbar variables
  searchOpened: boolean = false;
  itemSearchbar: FormControl = new FormControl('');
  searchFilters: Array<{
    label: string;
    key: string;
  }> = [
    {
      label: 'Los necesitan pero no tienen tus precios (78)',
      key: 'neededButNotYours',
    },
    {
      label: 'Articulos que estoy exhibiendo',
      key: 'providedByMe',
    },
  ];
  activatedSearchFilters: Record<string, boolean> = {};

  //Pagination-specific variables
  paginationState: {
    pageSize: number;
    page: number;
    status: 'loading' | 'complete';
  } = {
    page: 1,
    pageSize: 15,
    status: 'complete',
  };
  reachTheEndOfPagination: boolean = false;

  //Items variables
  itemsISell: Array<Item> = [];
  itemsIDontSell: Array<Item> = [];
  renderItemsPromise: Promise<{ listItems: Item[] }>;
  unitsForItemsThatYouDontSell: Record<string, number> = {};

  //userSpecific variables
  isTheUserAMerchant: boolean = null;

  //Subscriptions
  queryParamsSubscription: Subscription;
  saleflowLoadedSubscription: Subscription;

  //magicLink-specific variables
  encodedJSONData: string;
  fetchedItemsFromMagicLink: Array<Item> = [];

  //Tutorial-specific variables
  searchTutorialsOpened: boolean = false;
  itemsTutorialOpened: boolean = false;
  itemsTutorialCardsOpened: Record<string, boolean> = {
    price: true,
    stock: true,
  };
  searchTutorialCardsOpened: Record<string, boolean> = {
    searchbar: true,
    sold: true,
    orders: true,
  };

  constructor(
    private headerService: HeaderService,
    private itemsService: ItemsService,
    private appService: AppService,
    private saleflowService: SaleFlowService,
    public merchantsService: MerchantsService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private bottomSheet: MatBottomSheet,
    private dialogService: DialogService,
    private authService: AuthService,
    private snackbar: MatSnackBar
  ) {}

  async ngOnInit() {
    if (localStorage.getItem('session-token')) {
      if (!this.headerService.user) {
        let sub = this.appService.events
          .pipe(filter((e) => e.type === 'auth'))
          .subscribe((e) => {
            this.executeInitProcesses();

            sub.unsubscribe();
          });
      } else this.executeInitProcesses();
    } else this.executeInitProcesses();
  }

  async executeInitProcesses() {
    this.queryParamsSubscription = this.route.queryParams.subscribe(
      async ({ jsondata, supplierMode }) => {
        supplierMode = JSON.parse(supplierMode || 'false');
        this.encodedJSONData = jsondata;
        if (this.encodedJSONData) {
          this.parseMagicLinkData();
        }
        await this.getItemsISell();

        this.checkIfPresentationWasClosedBefore();

        await this.getNewPageOfItemsIDontSell(true, false);

        this.itemSearchbar.valueChanges.subscribe(async (change) => {
          await this.getItemsISell();
          await this.getNewPageOfItemsIDontSell(true, false);
        });
      }
    );
  }

  async infinitePagination() {
    const targetClass = '.dashboard-page';
    const page = document.querySelector(targetClass);
    const pageScrollHeight = page.scrollHeight;
    const verticalScroll = window.innerHeight + page.scrollTop;
    const difference = Math.abs(verticalScroll - pageScrollHeight);

    if (verticalScroll >= pageScrollHeight || difference <= 50) {
      if (
        this.paginationState.status === 'complete' &&
        !this.reachTheEndOfPagination
      ) {
        await this.getNewPageOfItemsIDontSell(false, true, true);
      }
    }
  }

  checkIfPresentationWasClosedBefore = () => {
    let providersPresentationClosed = localStorage.getItem(
      'providersPresentationClosed'
    );
    providersPresentationClosed = providersPresentationClosed
      ? JSON.parse(providersPresentationClosed)
      : false;

    if (!providersPresentationClosed && !this.headerService.user) {
      this.presentationOpened = true;
    } else {
      this.openTutorials();
    }
  };

  openTutorials = () => {
    this.presentationOpened = false;
    localStorage.setItem('providersPresentationClosed', 'true');

    if (this.itemsISell.length === 0) {
      this.itemsTutorialOpened = true;
    } /* else if (
      this.headerService.user &&
      this.merchantsService.merchantData &&
      this.itemsISell.length > 0
    ) {
      this.searchTutorialsOpened = true;
    }*/
  };

  activateOrDeactivateFilters(filterKey: string) {
    this.activatedSearchFilters[filterKey] =
      !this.activatedSearchFilters[filterKey];

    //this.inicializeItems(true, false);
  }

  async getItemsISell() {
    if (this.isTheUserAMerchant === null) {
      const isAMerchant =
        await this.headerService.checkIfUserIsAMerchantAndFetchItsData();

      this.isTheUserAMerchant = isAMerchant;
    }

    if (this.isTheUserAMerchant) {
      const supplierSpecificItemsPagination: PaginationInput = {
        findBy: {
          parentItem: {
            $ne: null,
          },
          merchant: this.merchantsService.merchantData._id,
        },
        options: {
          sortBy: 'createdAt:desc',
          limit: -1,
          page: 1,
        },
      };

      if (this.itemSearchbar.value && this.itemSearchbar.value !== '') {
        let regexQueries: Array<any> = [
          {
            name: {
              __regex: {
                pattern: this.itemSearchbar.value,
                options: 'gi',
              },
            },
          },
          {
            description: {
              __regex: {
                pattern: this.itemSearchbar.value,
                options: 'gi',
              },
            },
          },
        ];

        supplierSpecificItemsPagination.findBy = {
          ...supplierSpecificItemsPagination.findBy,
          $or: regexQueries,
        };
      }

      const supplierSpecificItems: Array<Item> = (
        await this.itemsService.listItems(supplierSpecificItemsPagination)
      )?.listItems;

      this.itemsISell = supplierSpecificItems;
    }
  }

  async getNewPageOfItemsIDontSell(
    restartPagination = false,
    triggeredFromScroll = false,
    getTotalNumberOfItems = false,
    createCopyOfAllItems = false
  ) {
    this.paginationState.status = 'loading';

    if (restartPagination) {
      this.reachTheEndOfPagination = false;
      this.paginationState.page = 1;
      this.itemsIDontSell = [];
    } else {
      this.paginationState.page++;
    }

    const pagination: PaginationInput = {
      findBy: {
        type: 'supplier',
        parentItem: null,
        _id: {
          $nin: this.itemsISell.map((item) => item.parentItem),
        },
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: this.paginationState.pageSize,
        page: this.paginationState.page,
      },
    };

    if (this.isTheUserAMerchant) {
      pagination.findBy.merchant = {
        $ne: this.merchantsService.merchantData._id,
      };
    }

    if (this.activatedSearchFilters['hidden']) {
      pagination.findBy.status = 'hidden';
    }

    if (this.activatedSearchFilters['toBeApproved']) {
      pagination.findBy.approvedByAdmin = {
        $ne: true,
      };
    }

    if (
      this.activatedSearchFilters['notMine'] &&
      !this.activatedSearchFilters['mine']
    ) {
      pagination.findBy.merchant = {
        $ne: this.merchantsService.merchantData._id,
      };
    }

    if (
      this.activatedSearchFilters['mine'] &&
      !this.activatedSearchFilters['notMine']
    ) {
      pagination.findBy.merchant = this.merchantsService.merchantData._id;
    }

    if (
      this.activatedSearchFilters['mine'] &&
      this.activatedSearchFilters['notMine']
    )
      pagination.findBy.merchant = {
        $ne: null,
      };

    if (this.itemSearchbar.value && this.itemSearchbar.value !== '') {
      let regexQueries: Array<any> = [
        {
          name: {
            __regex: {
              pattern: this.itemSearchbar.value,
              options: 'gi',
            },
          },
        },
        {
          description: {
            __regex: {
              pattern: this.itemSearchbar.value,
              options: 'gi',
            },
          },
        },
      ];

      pagination.findBy = {
        ...pagination.findBy,
        $or: regexQueries,
      };
    }

    this.renderItemsPromise = this.saleflowService.listItems(pagination, true);

    return this.renderItemsPromise.then(async (response) => {
      const items = response;
      let itemsQueryResult = items?.listItems;

      itemsQueryResult.forEach((item, itemIndex) => {
        item.images.forEach((image) => {
          if (!image.value.includes('http'))
            image.value = 'https://' + image.value;
        });
        itemsQueryResult[itemIndex].images = item.images.sort(
          ({ index: a }, { index: b }) => (a > b ? 1 : -1)
        );
      });

      if (itemsQueryResult.length === 0 && this.paginationState.page === 1) {
        this.itemsIDontSell = [];
      }

      if (itemsQueryResult.length === 0 && this.paginationState.page !== 1) {
        this.paginationState.page--;
        this.reachTheEndOfPagination = true;
      }

      if (itemsQueryResult && itemsQueryResult.length > 0) {
        if (this.paginationState.page === 1) {
          this.itemsIDontSell = itemsQueryResult.map((item) => ({
            images: item.images.sort(({ index: a }, { index: b }) =>
              a > b ? 1 : -1
            ),
            ...item,
          }));
        } else {
          this.itemsIDontSell = this.itemsIDontSell
            .concat(itemsQueryResult)
            .map((item) => ({
              images: item.images.sort(({ index: a }, { index: b }) =>
                a > b ? 1 : -1
              ),
              ...item,
            }));
        }
      }

      this.paginationState.status = 'complete';

      if (itemsQueryResult.length === 0 && !triggeredFromScroll) {
        this.itemsIDontSell = [];
      }
    });
  }

  createItemBasedOnExistingSupplierItems(item: Item) {
    this.itemsService.temporalItemInput = {
      name: item.name,
      layout: item.layout,
      description: item.description,
    };
    this.itemsService.temporalItem = item;

    if (!this.headerService.flowRouteForEachPage)
      this.headerService.flowRouteForEachPage = {};

    this.headerService.flowRouteForEachPage['provider-items'] = this.router.url;

    return this.router.navigate(['/ecommerce/inventory-creator'], {
      queryParams: {
        existingItem: true,
      },
    });
  }

  async changeAmount(
    item: Item,
    type: 'add' | 'subtract',
    itemIndex: number,
    providedByMe: boolean
  ) {
    try {
      let newAmount: number;
      if (type === 'add' && providedByMe) {
        newAmount = item.stock >= 0 ? item.stock + 1 : 1;
      } else if (type === 'subtract' && providedByMe) {
        newAmount = item.stock >= 1 ? item.stock - 1 : 0;
      }

      if (type === 'add' && !providedByMe) {
        newAmount = !this.unitsForItemsThatYouDontSell[item._id]
          ? 1
          : this.unitsForItemsThatYouDontSell[item._id] + 1;
      } else if (type === 'subtract' && !providedByMe) {
        newAmount =
          this.unitsForItemsThatYouDontSell[item._id] >= 1
            ? this.unitsForItemsThatYouDontSell[item._id] - 1
            : 0;
      }

      if (providedByMe) {
        this.itemsService.updateItem(
          {
            stock: newAmount,
          },
          item._id
        );

        this.itemsISell[itemIndex].stock = newAmount;
      } else {
        this.itemsIDontSell[itemIndex].stock = newAmount;
        this.unitsForItemsThatYouDontSell[item._id] = newAmount;
      }
    } catch (error) {
      this.headerService.showErrorToast();
    }
  }

  async showSearch() {
    this.searchOpened = true;
    setTimeout(() => {
      (
        document.querySelector('#search-from-results-view') as HTMLInputElement
      )?.focus();
    }, 100);
  }

  urlIsVideo(url: string) {
    return isVideo(url);
  }

  async parseMagicLinkData() {
    if (this.isTheUserAMerchant === null) {
      const isAMerchant =
        await this.headerService.checkIfUserIsAMerchantAndFetchItsData();

      this.isTheUserAMerchant = isAMerchant;
    }

    if (this.encodedJSONData) {
      let parsedData = JSON.parse(decodeURIComponent(this.encodedJSONData));

      if (parsedData.createdItem) {
        await this.authenticateItemFromMagicLinkData(parsedData);
      }

      if (parsedData.updateItem) {
        await this.updateSingleItemFromMagicLinkData(parsedData);
      }

      if (parsedData.itemsToUpdate) {
        await this.updateItemsFromMagicLinkData(parsedData);
      }

      if (parsedData.quotationItems) {
        await this.authenticateSupplierQuotationItems(parsedData);
      }

      return;
    }
  }

  //MAGIC LINK SPECIFIC METHODS
  authenticateItemFromMagicLinkData = async (
    parsedData: Record<string, any>
  ) => {
    try {
      lockUI();
      const createdItemId = parsedData.createdItem;

      const item = await this.itemsService.item(createdItemId);

      const saleflowDefault = await this.saleflowService.saleflowDefault(
        this.merchantsService.merchantData._id
      );

      await this.itemsService.authItem(
        this.merchantsService.merchantData._id,
        createdItemId
      );

      await this.saleflowService.addItemToSaleFlow(
        {
          item: createdItemId,
        },
        saleflowDefault._id
      );

      unlockUI();

      window.location.href = environment.uri + '/ecommerce/provider-items';
    } catch (error) {
      unlockUI();

      console.error(error);
    }
  };

  updateSingleItemFromMagicLinkData = async (
    parsedData: Record<string, any>
  ) => {
    try {
      lockUI();
      await this.headerService.checkIfUserIsAMerchantAndFetchItsData();

      const { _id: itemToUpdate, ...rest } = parsedData.updateItem;

      await this.itemsService.updateItem(rest, itemToUpdate);

      unlockUI();
      window.location.href = environment.uri + '/ecommerce/provider-items';
    } catch (error) {
      unlockUI();

      console.error(error);
    }
  };

  updateItemsFromMagicLinkData = async (parsedData: Record<string, any>) => {
    try {
      lockUI();
      await this.headerService.checkIfUserIsAMerchantAndFetchItsData();

      await Promise.all(
        Object.keys(parsedData.itemsToUpdate).map((itemId) =>
          this.itemsService.updateItem(parsedData.itemsToUpdate[itemId], itemId)
        )
      );

      if (!parsedData.quotationItems) {
        unlockUI();
        window.location.href = environment.uri + '/ecommerce/provider-items';
      }
    } catch (error) {
      unlockUI();

      console.error(error);
    }
  };

  authenticateSupplierQuotationItems = async (
    parsedData: Record<string, any>
  ) => {
    try {
      lockUI();
      await this.headerService.checkIfUserIsAMerchantAndFetchItsData();

      const saleflow = await this.saleflowService.saleflowDefault(
        this.merchantsService.merchantData?._id
      );

      const quotationItemsIDs = parsedData.quotationItems.split('-');

      this.headerService.saleflow = saleflow;
      this.headerService.storeSaleflow(saleflow);

      const supplierSpecificItemsInput: PaginationInput = {
        findBy: {
          _id: {
            __in: ([] = quotationItemsIDs),
          },
        },
        options: {
          sortBy: 'createdAt:desc',
          limit: -1,
          page: 1,
        },
      };

      //Fetches supplier specfic items, meaning they already are on the saleflow
      let quotationItems: Array<Item> = [];

      quotationItems = (
        await this.itemsService.listItems(supplierSpecificItemsInput)
      )?.listItems;

      if (quotationItems?.length) {
        this.fetchedItemsFromMagicLink = quotationItems;

        if (!this.fetchedItemsFromMagicLink[0].merchant) {
          await Promise.all(
            this.fetchedItemsFromMagicLink.map((item) =>
              this.itemsService.authItem(
                this.merchantsService.merchantData._id,
                item._id
              )
            )
          );

          await Promise.all(
            this.fetchedItemsFromMagicLink.map((item) =>
              this.saleflowService.addItemToSaleFlow(
                {
                  item: item._id,
                },
                this.headerService.saleflow._id
              )
            )
          );
        }
      }

      unlockUI();
      window.location.href = environment.uri + '/ecommerce/provider-items';
    } catch (error) {
      unlockUI();

      console.error(error);
    }
  };

  async addPrice(item: Item) {
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

    const dialogRef = this.dialog.open(FormComponent, {
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

          this.openMagicLinkDialog(itemInput);
        } else {
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

          this.itemsISell.unshift(createdItem);

          const itemIndex = this.itemsIDontSell.findIndex(
            (itemInList) => item._id === itemInList._id
          );

          this.itemsIDontSell.splice(itemIndex, 1);

          this.snackbar.open('Ahora estás exhibiendo el producto!', '', {
            duration: 5000,
          });

          unlockUI();
        }
      }
    });
  }

  determineIfItemNeedsToBeUpdatedOrCreated = async (
    merchantDefault: Merchant,
    parentItemId: string
  ): Promise<{
    operation: 'UPDATE' | 'CREATE';
    itemId?: string;
  }> => {
    lockUI();

    const supplierSpecificItemsInput: PaginationInput = {
      findBy: {
        parentItem: {
          $in: ([] = [parentItemId]),
        },
        merchant: merchantDefault?._id,
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: -1,
        page: 1,
      },
    };

    //Fetches supplier specfic items, meaning they already are on the saleflow
    let itemsAlreadyProviderByTheMerchant: Array<QuotationItem> = [];

    itemsAlreadyProviderByTheMerchant = (
      await this.itemsService.listItems(supplierSpecificItemsInput)
    )?.listItems;

    unlockUI();

    return {
      operation:
        itemsAlreadyProviderByTheMerchant.length > 0 ? 'UPDATE' : 'CREATE',
      itemId:
        itemsAlreadyProviderByTheMerchant.length > 0
          ? itemsAlreadyProviderByTheMerchant[0]._id
          : null,
    };
  };

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

    const dialogRef = this.dialog.open(FormComponent, {
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

          this.itemsISell[itemIndex].pricing = price;

          unlockUI();
        } catch (error) {
          unlockUI();
          this.headerService.showErrorToast();
          console.error(error);
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

  async openMagicLinkDialog(itemInput: ItemInput) {
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

    const emailDialogRef = this.dialog.open(FormComponent, {
      data: fieldsToCreateInEmailDialog,
      disableClose: true,
    });

    emailDialogRef.afterClosed().subscribe(async (result: FormGroup) => {
      if (result?.controls?.magicLinkEmailOrPhone.valid) {
        const emailOrPhone = result?.value['magicLinkEmailOrPhone'];

        let optionsDialogTemplate: OptionsDialogTemplate = {
          options: [
            {
              value: 'Accederé con la clave',
              callback: async () => {
                await addPassword(emailOrPhone);
              },
            },
            {
              value: 'Prefiero recibir el enlace de acceso en mi correo',
              callback: async () => {
                const myUser = await this.authService.checkUser(emailOrPhone);
                const merchantDefault = myUser
                  ? await this.merchantsService.merchantDefault(myUser._id)
                  : null;

                let toBeDone: {
                  operation: 'UPDATE' | 'CREATE';
                  itemId?: string;
                } = {
                  operation: 'CREATE',
                };

                if (merchantDefault) {
                  toBeDone =
                    await this.determineIfItemNeedsToBeUpdatedOrCreated(
                      merchantDefault,
                      itemInput.parentItem
                    );
                }

                lockUI();

                if (toBeDone.operation === 'CREATE') {
                  const createdItem = (
                    await this.itemsService.createPreItem(itemInput)
                  )?.createPreItem;

                  let redirectionRoute = '/ecommerce/provider-items';

                  await this.authService.generateMagicLink(
                    emailOrPhone,
                    redirectionRoute,
                    null,
                    'MerchantAccess',
                    {
                      jsondata: JSON.stringify({
                        createdItem: createdItem._id,
                      }),
                    },
                    []
                  );
                } else if (toBeDone.operation === 'UPDATE') {
                  let redirectionRoute = '/ecommerce/provider-items';

                  await this.authService.generateMagicLink(
                    emailOrPhone,
                    redirectionRoute,
                    null,
                    'MerchantAccess',
                    {
                      jsondata: JSON.stringify({
                        updateItem: {
                          _id: toBeDone.itemId,
                          stock: itemInput.stock,
                          pricing: itemInput.pricing,
                        },
                      }),
                    },
                    []
                  );
                }

                unlockUI();

                this.dialogService.open(GeneralFormSubmissionDialogComponent, {
                  type: 'centralized-fullscreen',
                  props: {
                    icon: 'check-circle.svg',
                    showCloseButton: false,
                    message:
                      'Se ha enviado un link mágico a tu correo electrónico',
                  },
                  customClass: 'app-dialog',
                  flags: ['no-header'],
                });
              },
            },
          ],
        };

        this.dialog.open(OptionsDialogComponent, {
          data: optionsDialogTemplate,
          disableClose: true,
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

      const dialog2Ref = this.dialog.open(FormComponent, {
        data: fieldsToCreate,
        disableClose: true,
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

            const { merchantDefault, saleflowDefault } =
              await this.getDefaultMerchantAndSaleflows(session.user);

            itemInput.merchant = merchantDefault._id;

            const createdItem = (await this.itemsService.createItem(itemInput))
              ?.createItem;

            await this.saleflowService.addItemToSaleFlow(
              {
                item: createdItem._id,
              },
              saleflowDefault._id
            );

            window.location.href =
              environment.uri + '/ecommerce/provider-items';

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
        return this.openMagicLinkDialog(itemInput);
      };
    };
  }

  closeSearchTutorial = (cardName: string) => {
    this.searchTutorialCardsOpened[cardName] = false;

    if (
      !this.searchTutorialCardsOpened['searchbar'] &&
      !this.searchTutorialCardsOpened['sold'] &&
      !this.searchTutorialCardsOpened['orders']
    ) {
      this.searchTutorialsOpened = false;
    }
  };

  closeItemsTutorial = (cardName: string) => {
    this.itemsTutorialCardsOpened[cardName] = false;

    if (!this.itemsTutorialCardsOpened['price']) {
      this.itemsTutorialOpened = false;
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

  sendWhatsappToAppOwner() {
    let message = `Hola, quiero agregar un artículo como proveedor de www.floristerias.club`;

    const whatsappLink = `https://api.whatsapp.com/send?phone=19188156444&text=${encodeURIComponent(
      message
    )}`;

    window.location.href = whatsappLink;
  }
}
