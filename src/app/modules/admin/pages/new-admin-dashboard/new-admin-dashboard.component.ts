import { Clipboard } from '@angular/cdk/clipboard';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { Subscription } from 'rxjs';
import { base64ToBlob } from 'src/app/core/helpers/files.helpers';
import { isVideo } from 'src/app/core/helpers/strings.helpers';
import {
  lockUI,
  playVideoOnFullscreen,
  unlockUI,
} from 'src/app/core/helpers/ui.helpers';
import { Item, ItemCategory } from 'src/app/core/models/item';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { Tag } from 'src/app/core/models/tags';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { QueryparametersService } from 'src/app/core/services/queryparameters.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { WebformsService } from 'src/app/core/services/webforms.service';
import { ConfirmationDialogComponent } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import {
  FormComponent,
  FormData,
} from 'src/app/shared/dialogs/form/form.component';
import { LinksDialogComponent } from 'src/app/shared/dialogs/links-dialog/links-dialog.component';
import { ListRemoval } from 'src/app/shared/dialogs/listRemoval/listRemoval.component';
import { OptionsMenuComponent } from 'src/app/shared/dialogs/options-menu/options-menu.component';
import { TagFilteringComponent } from 'src/app/shared/dialogs/tag-filtering/tag-filtering.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-new-admin-dashboard',
  templateUrl: './new-admin-dashboard.component.html',
  styleUrls: ['./new-admin-dashboard.component.scss'],
})
export class NewAdminDashboardComponent implements OnInit, OnDestroy {
  drawerOpened: boolean = false;
  mode: 'STANDARD' | 'SUPPLIER' = 'STANDARD';
  view: 'LIST' | 'SEARCH' = 'LIST';
  URI: string = environment.uri;
  assetsURL: string = environment.assetsUrl;
  itemSearchbar: FormControl = new FormControl('');
  showSearchbar: boolean = true;
  layout: 'simple-card' | 'description-card' | 'image-full-width';
  playVideoOnFullscreen = playVideoOnFullscreen;

  itemsMetricsToDisplay: {
    all: number;
    archived: number;
    commissionable: number;
    hidden: number;
    lowStock: number;
    noSale: number;
  } = {
    all: 0,
    archived: 0,
    commissionable: 0,
    hidden: 0,
    lowStock: 0,
    noSale: 0,
  };
  itemsSelledCountByItemId: Record<string, number> = {};

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
  renderItemsPromise: Promise<{ listItems: Item[] }>;
  selectedTags: String[] = [];
  allItems: Item[] = [];
  allItemsId: string[] = [];
  allItemsFiltered: Item[] = [];
  allItemsCopy: Item[] = [];
  soldItems: Item[] = [];

  //Tags variables
  allTags: Array<Tag> = [];
  tagsbyId: Record<string, Tag> = {};
  tagsDialogListSelectionSubscription: Subscription;
  tagsRemovalListSubscription: Subscription;

  //Categories variables
  allCategories: Array<ItemCategory> = [];
  categoryById: Record<string, ItemCategory> = {};
  categoriesDialogListSelectionSubscription: Subscription;
  categoriesRemovalListSubscription: Subscription;

  //Subscriptions
  queryParamsSubscription: Subscription;
  saleflowLoadedSubscription: Subscription;

  //magicLink-specific variables
  encodedJSONData: string;
  fetchedItemsFromMagicLink: Array<Item> = [];

  //clipboard and share options
  @ViewChild('storeQrCode', { read: ElementRef }) storeQrCode: ElementRef;

  constructor(
    public merchantsService: MerchantsService,
    public saleflowService: SaleFlowService,
    public router: Router,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private authService: AuthService,
    private tagsService: TagsService,
    private ordersService: OrderService,
    private webformsService: WebformsService,
    private itemsService: ItemsService,
    private snackBar: MatSnackBar,
    private bottomSheet: MatBottomSheet,
    private headerService: HeaderService,
    private ngNavigatorShareService: NgNavigatorShareService,
    private queryParameterService: QueryparametersService,
    private clipboard: Clipboard,
    private _bottomSheet: MatBottomSheet
  ) {}

  async ngOnInit() {
    //TODO: Delete this
    // this.authService.signin('584242630354', '123', true);

    this.queryParamsSubscription = this.route.queryParams.subscribe(
      async ({ view, showItems, jsondata, supplierMode }) => {
        supplierMode = JSON.parse(supplierMode || 'false');
        this.encodedJSONData = jsondata;
        this.mode = !supplierMode ? 'STANDARD' : 'SUPPLIER';

        if (this.encodedJSONData) {
          this.parseMagicLinkData();
        }

        await this.getItemMetrics();

        if (this.saleflowService.saleflowData) {
          await this.initializeItemsAndTagsData();
        }
        this.saleflowLoadedSubscription =
          this.saleflowService.saleflowLoaded.subscribe({
            next: async (value) => {
              if (value) {
                this.initializeItemsAndTagsData();
              }
            },
          });
      }
    );
  }

  async ngOnDestroy() {
    this.queryParamsSubscription?.unsubscribe();
    this.saleflowLoadedSubscription?.unsubscribe();
    this.tagsDialogListSelectionSubscription?.unsubscribe();
    this.tagsRemovalListSubscription?.unsubscribe();
  }

  initializeItemsAndTagsData = async () => {
    Promise.all([this.getTags(), this.getCategories()]);

    this.getSoldItems();

    await this.inicializeItems(true, false, true, true);
    this.getSoldItems();
    
    /*
    this.getTags();
    this.getQueryParameters();
    this.getHiddenItems();
    this.getItemsThatHaventBeenSold();*/
    this.itemSearchbar.valueChanges.subscribe(
      async (change) => await this.inicializeItems(true, false)
    );
  };

  async parseMagicLinkData() {
    if (this.encodedJSONData) {
      let parsedData = JSON.parse(decodeURIComponent(this.encodedJSONData));

      if (parsedData.createdItem) {
        await this.authenticateItemFromMagicLinkData(parsedData);
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

  async infinitePagination(trigger: 'SEARCH-VIEW' | 'LIST-VIEW') {
    const targetClass =
      trigger === 'LIST-VIEW' ? '.dashboard-page' : '.search-container';
    const page = document.querySelector(targetClass);
    const pageScrollHeight = page.scrollHeight;
    const verticalScroll = window.innerHeight + page.scrollTop;
    const difference = Math.abs(verticalScroll - pageScrollHeight);

    if (verticalScroll >= pageScrollHeight || difference <= 50) {
      if (
        this.paginationState.status === 'complete' &&
        // this.tagsLoaded &&
        !this.reachTheEndOfPagination
      ) {
        await this.inicializeItems(false, true, true);
      }
    }
  }

  async inicializeItems(
    restartPagination = false,
    triggeredFromScroll = false,
    getTotalNumberOfItems = false,
    createCopyOfAllItems = false
  ) {
    const saleflowItems = this.saleflowService.saleflowData.items.map(
      (saleflowItem) => ({
        itemId: saleflowItem.item._id,
        customizer: saleflowItem.customizer?._id,
        index: saleflowItem.index,
      })
    );

    this.paginationState.status = 'loading';

    if (restartPagination) {
      this.reachTheEndOfPagination = false;
      this.paginationState.page = 1;
      this.allItems = [];
    } else {
      this.paginationState.page++;
    }

    this.allItemsId = saleflowItems.map((items) => items.itemId);

    const pagination: PaginationInput = {
      findBy: {
        _id: {
          __in: ([] = this.allItemsId),
        },
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: this.paginationState.pageSize,
        page: this.paginationState.page,
      },
    };

    if (this.mode === 'SUPPLIER') {
      pagination.findBy.type = 'supplier';
      pagination.findBy.merchant = this.merchantsService.merchantData._id;
    } else {
      pagination.findBy['$or'] = [
        {
          type: 'default',
        },
        {
          type: null,
        },
      ];
    }

    if (this.selectedTags.length) pagination.findBy.tags = this.selectedTags;

    if (this.itemSearchbar.value !== '') {
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
          'params.values.name': {
            __regex: {
              pattern: this.itemSearchbar.value,
              options: 'gi',
            },
          },
        },
      ];

      if (this.mode !== 'SUPPLIER') {
        let regexQueryWithTypeNull = JSON.parse(JSON.stringify(regexQueries));
        let regexQueryWithTypeDefault = JSON.parse(
          JSON.stringify(regexQueries)
        );

        regexQueryWithTypeNull = regexQueryWithTypeNull.map((query) => {
          query.type = null;

          return query;
        });

        regexQueryWithTypeDefault = regexQueryWithTypeDefault.map((query) => {
          query.type = 'default';

          return query;
        });

        console.log(regexQueryWithTypeDefault, regexQueryWithTypeNull);

        regexQueries = regexQueryWithTypeNull.concat(regexQueryWithTypeDefault);
      }

      pagination.findBy = {
        ...pagination.findBy,
        $or: regexQueries,
      };
    }

    this.renderItemsPromise = this.saleflowService.listItems(pagination, true);
    this.layout = this.saleflowService.saleflowData.layout;

    return this.renderItemsPromise.then(async (response) => {
      const items = response;
      let itemsQueryResult = items?.listItems;

      if (this.mode === 'SUPPLIER') {
        itemsQueryResult = itemsQueryResult.filter((item) => item.parentItem);
      } else {
        itemsQueryResult = itemsQueryResult.filter(
          (item) => item.type !== 'supplier'
        );
      }

      if (itemsQueryResult.length === 0 && this.paginationState.page === 1) {
        this.allItems = [];
      }

      if (itemsQueryResult.length === 0 && this.paginationState.page !== 1) {
        this.paginationState.page--;
        this.reachTheEndOfPagination = true;
      }

      if (itemsQueryResult && itemsQueryResult.length > 0) {
        if (this.paginationState.page === 1) {
          this.allItems = itemsQueryResult.map((item) => ({
            images: item.images.sort(({ index: a }, { index: b }) =>
              a > b ? 1 : -1
            ),
            ...item,
          }));
        } else {
          this.allItems = this.allItems
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
        this.allItems = [];
      }

      if (createCopyOfAllItems) {
        this.allItemsCopy = JSON.parse(JSON.stringify(this.allItems));
      }
    });
  }

  async getSoldItems() {
    try {
      const pagination: PaginationInput = {
        findBy: {
          merchant: this.merchantsService.merchantData._id,
        },
        options: {
          limit: -1,
        },
      };

      if (this.selectedTags.length) pagination.findBy.tags = this.selectedTags;

      const result = (await this.itemsService.bestSellersByMerchant(
        false,
        pagination
      )) as any[];

      result.forEach((item) => {
        this.itemsSelledCountByItemId[item.item._id] = item.count;
      });

      if (this.mode === 'SUPPLIER') {
        this.soldItems = this.soldItems.filter((item) => item.parentItem);
      } else {
        this.soldItems = this.soldItems.filter(
          (item) => item.type !== 'supplier'
        );
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getItemMetrics() {
    const queryResponse = await this.itemsService.itemsQuantityOfFilters(
      this.merchantsService.merchantData._id,
      this.mode === 'STANDARD' ? null : 'supplier'
    );

    this.itemsMetricsToDisplay = queryResponse
      ? queryResponse
      : this.itemsMetricsToDisplay;
  }

  openAddButtonOptionsMenu() {
    this.bottomSheet.open(OptionsMenuComponent, {
      data: {
        title: `¿Que crearás?`,
        options: [
          {
            value: `Un artículo para vender al detalle`,
            callback: async () => {
              const isUserAMerchant = (this.headerService.flowRouteForEachPage[
                'quotations-link'
              ] = this.router.url);

              this.router.navigate(['ecommerce/item-management']);
            },
          },
          {
            value: `Un artículo para vender al por mayor`,
            callback: async () => {
              this.router.navigate(['/ecommerce/inventory-creator']);
            },
          },
          {
            value: `Un carrito de proveedores (yo compro)`,
            callback: async () => {
              this.router.navigate(['/ecommerce/supplier-items-selector'], {
                queryParams: {
                  supplierMode: true,
                },
              });
            },
          },
        ],
        styles: {
          fullScreen: true,
        },
      },
    });
  }

  async addNewArticle() {
    if (!this.headerService.flowRouteForEachPage)
      this.headerService.flowRouteForEachPage = {};

    this.headerService.flowRouteForEachPage['dashboard-to-supplier-creation'] =
      this.router.url;

    if (this.mode === 'STANDARD')
      this.router.navigate(['ecommerce/item-management']);
    else this.router.navigate(['ecommerce/inventory-creator']);
  }

  async openHeaderDotOptions() {
    const link = `${this.URI}/ecommerce/${this.merchantsService.merchantData.slug}/store`;
    this.bottomSheet.open(LinksDialogComponent, {
      data: [
        {
          title: 'Posibles acciones con los Artículos de tu KiosKo:',
          options: [
            {
              title: 'Adiciona un nuevo artículo',
              callback: async () => {
                this.addNewArticle();
              },
            },
            {
              title: 'Edita la carta de los artículos',
              callback: () => {
                this.router.navigate(['/admin/mode-configuration-cards']);
              },
            },
            {
              title:
                'Edita cuentas sociales y WhatsApp de contacto al footer de la tienda',
              callback: () => {
                this.router.navigate([
                  `/ecommerce/link-register/${this.headerService.user._id}`,
                ]);
              },
            },
          ],
          secondaryOptions: [
            {
              title: 'Mira como lo ven otros',
              callback: () => {
                this.router.navigate(
                  [
                    `/ecommerce/${this.merchantsService.merchantData.slug}/store`,
                  ],
                  { queryParams: { adminmode: true } }
                );
              },
            },
            {
              title: 'Comparte el Link',
              callback: () => {
                this.ngNavigatorShareService.share({
                  title: '',
                  url: link,
                });
              },
            },
            {
              title: 'Copiar el Link de compradores',
              callback: () => {
                this.clipboard.copy(
                  `${this.URI}/ecommerce/${this.merchantsService.merchantData.slug}/store`
                );
                this.snackBar.open('Enlace copiado en el portapapeles', '', {
                  duration: 2000,
                });
              },
            },
            {
              title: 'Descargar el QR',
              link,
            },
          ],
          styles: {
            fullScreen: true,
          },
        },
      ],
    });
  }

  shareStore() {
    this.bottomSheet.open(OptionsMenuComponent, {
      data: {
        title: `Vista de compradores de tu KiosKo:`,
        options: [
          {
            value: `Copia el link`,
            callback: async () => {
              this.clipboard.copy(
                `${this.URI}/ecommerce/${this.merchantsService.merchantData.slug}/store`
              );
              this.snackBar.open('Enlace copiado en el portapapeles', '', {
                duration: 2000,
              });
            },
          },
          {
            value: `Descarga el QR`,
            callback: async () => {
              this.downloadQr();
            },
          },
          {
            value: `Compártela`,
            callback: async () => {
              this.ngNavigatorShareService.share({
                title: '',
                url: `${this.URI}/ecommerce/${this.merchantsService.merchantData.slug}/store`,
              });
            },
          },
          {
            value: `Mira como se ve`,
            callback: async () => {
              this.goToStore();
            },
          },
        ],
        styles: {
          fullScreen: true,
        },
      },
    });
  }

  goToStore() {
    this.router.navigate([
      `/ecommerce/${this.merchantsService.merchantData.slug}/store`,
    ]);
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

      if (parsedData.createdWebformId) {
        await this.webformsService.authWebform(parsedData.createdWebformId);

        await this.webformsService.itemAddWebForm(
          createdItemId,
          parsedData.createdWebformId
        );
      }

      //For existing tags that are going to be assigned to the item
      if (parsedData.tagsToAssignIds) {
        const tagsToAssignIds: Array<string> =
          parsedData.tagsToAssignIds.split('-');

        await Promise.all(
          tagsToAssignIds.map((tagId) =>
            this.tagsService.itemAddTag(tagId, createdItemId)
          )
        );
      }

      //For tags the user created while not being logged-in
      if (parsedData.itemTagsToCreate?.length > 0) {
        const createdTags: Array<Tag> = [];

        for await (const tagName of parsedData.itemTagsToCreate) {
          const createdTag = await this.tagsService.createTag({
            entity: 'item',
            merchant: this.merchantsService.merchantData._id,
            name: tagName,
            status: 'active',
          });

          createdTags.push(createdTag);
        }

        let tagIndex = 0;
        for await (const createdTag of createdTags) {
          if (
            parsedData.tagsIndexesToAssignAfterCreated?.length > 0 &&
            parsedData.tagsIndexesToAssignAfterCreated.includes(tagIndex)
          ) {
            await this.tagsService.itemAddTag(
              createdTags[tagIndex]._id,
              createdItemId
            );
          }
          tagIndex++;
        }
      }

      //For itemCategories the user created while not being logged-in
      if (parsedData.itemCategoriesToCreate?.length > 0) {
        const createdCategories: Array<ItemCategory> = [];

        for await (const categoryName of parsedData.itemCategoriesToCreate) {
          const createdCategory = await this.itemsService.createItemCategory(
            {
              merchant: this.merchantsService.merchantData?._id,
              name: categoryName,
              active: true,
            },
            false
          );

          createdCategories.push(createdCategory);
        }

        if (parsedData.categoriesIndexesToAssignAfterCreated?.length > 0) {
          await this.itemsService.updateItem(
            {
              category: createdCategories
                .filter((category, index) =>
                  parsedData.categoriesIndexesToAssignAfterCreated.includes(
                    index
                  )
                )
                .map((category) => category._id),
            },
            createdItemId
          );
        }
      }

      unlockUI();

      window.location.href =
        environment.uri +
        (item.type !== 'supplier'
          ? '/admin/dashboard'
          : '/admin/supplier-dashboard?supplierMode=true');
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
        window.location.href =
          environment.uri + '/admin/supplier-dashboard?supplierMode=true';
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
      window.location.href =
        environment.uri + '/admin/supplier-dashboard?supplierMode=true';
    } catch (error) {
      unlockUI();

      console.error(error);
    }
  };

  //QrCode
  downloadQr() {
    const parentElement =
      this.storeQrCode.nativeElement.querySelector('img').src;
    let blobData = base64ToBlob(parentElement);
    if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
      //IE
      (window.navigator as any).msSaveOrOpenBlob(
        blobData,
        'Enlace a vista de compradores de mi KiosKo'
      );
    } else {
      // chrome
      const blob = new Blob([blobData], { type: 'image/png' });
      const url = window.URL.createObjectURL(blob);
      // window.open(url);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Enlace a vista de compradores de mi KiosKo';
      link.click();
    }
  }

  async toggleStoreVisibility() {
    const newStatus =
      !this.saleflowService.saleflowData.status ||
      this.saleflowService.saleflowData.status === 'open'
        ? 'closed'
        : 'open';

    const oldStatus = this.saleflowService.saleflowData.status;

    try {
      await this.saleflowService.updateSaleflow(
        {
          status: newStatus,
        },
        this.saleflowService.saleflowData._id
      );

      this.saleflowService.saleflowData.status = newStatus;
    } catch (error) {
      console.error(error);
      this.saleflowService.saleflowData.status = oldStatus;

      this.headerService.showErrorToast(
        'Ocurrió un error al intentar cambiar la visibilidad de tu tienda, intenta más tarde'
      );
    }
  }

  changeView = async (newView: 'LIST' | 'SEARCH') => {
    this.view = newView;

    if (newView === 'SEARCH') {
      setTimeout(() => {
        (
          document.querySelector(
            '#search-from-results-view'
          ) as HTMLInputElement
        )?.focus();
      }, 100);
    }
  };

  isVideoWrapper(filename: string) {
    return isVideo(filename);
  }

  openTagsDialog = () => {
    const bottomSheetRef = this.bottomSheet.open(TagFilteringComponent, {
      data: {
        title: '🏷️ Tags de artículos',
        titleIcon: {
          show: false,
        },
        categories: this.allTags.map((tag) => ({
          _id: tag._id,
          name: tag.name,
          selected: this.selectedTags.includes(tag._id),
        })),
        rightIcon: {
          iconName: 'add',
          callback: (data) => {
            let fieldsToCreate: FormData = {
              fields: [
                {
                  name: 'new-tag',
                  placeholder: 'Nuevo tag',
                  type: 'text',
                  validators: [Validators.pattern(/[\S]/), Validators.required],
                },
              ],
            };

            unlockUI();

            bottomSheetRef.dismiss();

            const dialogRef = this.dialog.open(FormComponent, {
              data: fieldsToCreate,
              disableClose: true,
            });

            if (this.tagsDialogListSelectionSubscription)
              this.tagsDialogListSelectionSubscription.unsubscribe();

            this.tagsDialogListSelectionSubscription = dialogRef
              .afterClosed()
              .subscribe(async (result: FormGroup) => {
                if (!result?.controls['new-tag'].valid) {
                  this.headerService.showErrorToast('Tag inválido');
                } else {
                  const tagToCreate = result?.value['new-tag'];

                  lockUI();
                  await this.tagsService.createTag({
                    entity: 'item',
                    name: tagToCreate,
                    merchant: this.merchantsService.merchantData?._id,
                  });

                  await this.getTags();

                  unlockUI();

                  this.openTagsDialog();
                }
              });
          },
        },
        leftIcon: {
          iconName: 'remove',
          styles: {
            marginLeft: 'auto',
            marginRight: '29.05px',
          },
          callback: (data) => {
            const tagRemovalRef = this.bottomSheet.open(ListRemoval, {
              data: {
                title: 'Eliminar Tags',
                titleIcon: {
                  show: false,
                },
                categories: this.allTags.map((tag) => ({
                  _id: tag._id,
                  name: tag.name,
                  selected: false,
                })),
              },
            });

            if (this.tagsRemovalListSubscription)
              this.tagsRemovalListSubscription.unsubscribe();

            this.tagsRemovalListSubscription =
              tagRemovalRef.instance.selectionOutput.subscribe(
                async (tagToRemove: string) => {
                  let dialogRef = this.dialog.open(
                    ConfirmationDialogComponent,
                    {
                      data: {
                        title: `Borrar Tag`,
                        description: `Estás seguro que deseas borrar ${this.tagsbyId[tagToRemove]?.name}?`,
                      },
                    }
                  );
                  dialogRef.afterClosed().subscribe(async (result) => {
                    if (result === 'confirm') {
                      tagRemovalRef.dismiss();

                      try {
                        lockUI();
                        const { deleteTag: success } =
                          await this.tagsService.deleteTag(tagToRemove);

                        if (success) {
                          delete this.tagsbyId[tagToRemove];

                          this.snackBar.open('Tag eliminado exitosamente', '', {
                            duration: 2000,
                          });

                          await this.getTags();

                          unlockUI();

                          this.openTagsDialog();
                        }
                        unlockUI();
                      } catch (error) {
                        unlockUI();
                        console.log(error);
                        this.headerService.showErrorToast(
                          'Ocurrió un error al intentar borrar el tag'
                        );
                      }
                    }
                  });
                }
              );
          },
        },
      },
      panelClass: ['tag-filtering'],
    });

    this.tagsDialogListSelectionSubscription =
      bottomSheetRef.instance.selectionOutput.subscribe(
        async (tagsAdded: Array<string>) => {
          this.selectedTags = tagsAdded;

          await this.inicializeItems(true, false, true);
        }
      );
  };

  openCategoriesDialog = () => {
    const bottomSheetRef = this.bottomSheet.open(TagFilteringComponent, {
      data: {
        title: '🖇️️ Categorias de artículos',
        titleIcon: {
          show: false,
        },
        categories: this.allCategories.map((category) => ({
          _id: category._id,
          name: category.name,
          selected: false,
        })),
        rightIcon: {
          iconName: 'add',
          callback: (data) => {
            let fieldsToCreate: FormData = {
              fields: [
                {
                  name: 'new-category',
                  placeholder: 'Nueva categoría',
                  type: 'text',
                  validators: [Validators.pattern(/[\S]/), Validators.required],
                },
              ],
            };

            unlockUI();

            bottomSheetRef.dismiss();

            const dialogRef = this.dialog.open(FormComponent, {
              data: fieldsToCreate,
              disableClose: true,
            });

            dialogRef.afterClosed().subscribe(async (result: FormGroup) => {
              if (!result?.controls['new-category'].valid) {
                this.headerService.showErrorToast('Categoría inválida');
              } else {
                const categoryName = result?.value['new-category'];

                lockUI();
                await this.itemsService.createItemCategory(
                  {
                    merchant: this.merchantsService.merchantData?._id,
                    name: categoryName,
                    active: true,
                  },
                  false
                );

                await this.getCategories();

                unlockUI();

                this.openCategoriesDialog();
              }
            });
          },
        },
        leftIcon: {
          iconName: 'remove',
          styles: {
            marginLeft: 'auto',
            marginRight: '29.05px',
          },
          callback: (data) => {
            const categoryRemovalRef = this.bottomSheet.open(ListRemoval, {
              data: {
                title: 'Eliminar categorías',
                titleIcon: {
                  show: false,
                },
                categories: this.allCategories.map((itemCategory) => ({
                  _id: itemCategory._id,
                  name: itemCategory.name,
                  selected: false,
                })),
              },
            });

            if (this.categoriesRemovalListSubscription)
              this.categoriesRemovalListSubscription.unsubscribe();

            this.categoriesRemovalListSubscription =
              categoryRemovalRef.instance.selectionOutput.subscribe(
                async (categoryToRemove: string) => {
                  let dialogRef = this.dialog.open(
                    ConfirmationDialogComponent,
                    {
                      data: {
                        title: `Borrar categoría`,
                        description: `Estás seguro que deseas borrar ${this.categoryById[categoryToRemove]?.name}?`,
                      },
                    }
                  );
                  dialogRef.afterClosed().subscribe(async (result) => {
                    if (result === 'confirm') {
                      categoryRemovalRef.dismiss();

                      try {
                        lockUI();
                        const success = (
                          await this.itemsService.deleteItemCategory(
                            categoryToRemove
                          )
                        )?.deleteItemCategory;

                        if (success) {
                          delete this.categoryById[categoryToRemove];

                          this.snackBar.open(
                            'Categoría eliminada exitosamente',
                            '',
                            {
                              duration: 2000,
                            }
                          );

                          await this.getCategories();

                          unlockUI();

                          this.openCategoriesDialog();
                        }
                        unlockUI();
                      } catch (error) {
                        unlockUI();
                        console.log(error);
                        this.headerService.showErrorToast(
                          'Ocurrió un error al intentar borrar la categoría'
                        );
                      }
                    }
                  });
                }
              );
          },
        },
      },
    });

    bottomSheetRef.instance.selectionOutput.subscribe(
      async (categoriesAdded: Array<string>) => {}
    );
  };

  async getTags() {
    const tagsByUser = await this.tagsService.tagsByUser({
      findBy: {
        entity: 'item',
      },
      options: {
        limit: -1,
      },
    });
    this.allTags = tagsByUser ? tagsByUser : [];

    for (const tag of this.allTags) {
      this.tagsbyId[tag._id] = tag;
    }
  }

  async getCategories() {
    const categories = (
      await this.itemsService.itemCategories(
        this.merchantsService.merchantData._id,
        {
          options: {
            limit: -1,
          },
        }
      )
    )?.itemCategoriesList;

    this.allCategories = categories;

    for (const category of this.allCategories) {
      this.categoryById[category._id] = category;
    }
  }

  openEstimatedDeliveryDialog() {
    this._bottomSheet.open(OptionsMenuComponent, {
      data: {
        title: `⏰ Artículos según la hora de entrega en Santo Domingo`,
        options: [
          {
            value: `En menos de 2 horas`,
            callback: async () => {
              const itemsFiltered = await this.saleflowService.listItems({
                findBy: {
                  estimatedDeliveryTime: {
                    until: 2,
                  },
                  _id: {
                    __in: this.allItemsId,
                  },
                },
              });
              this.allItemsFiltered = itemsFiltered.listItems;
            },
          },
          {
            value: `En menos de 8 horas`,
            callback: async () => {
              const itemsFiltered = await this.saleflowService.listItems({
                findBy: {
                  estimatedDeliveryTime: {
                    until: 8,
                  },
                  _id: {
                    __in: this.allItemsId,
                  },
                },
              });
              this.allItemsFiltered = itemsFiltered.listItems;
            },
          },
          {
            value: `En menos de 30 horas`,
            callback: async () => {
              const itemsFiltered = await this.saleflowService.listItems({
                findBy: {
                  estimatedDeliveryTime: {
                    until: 30,
                  },
                  _id: {
                    __in: this.allItemsId,
                  },
                },
              });
              this.allItemsFiltered = itemsFiltered.listItems;
            },
          },
          {
            value: `Entre 30 a 48 horas`,
            callback: async () => {
              const itemsFiltered = await this.saleflowService.listItems({
                findBy: {
                  estimatedDeliveryTime: {
                    from: 30,
                    until: 48,
                    _id: {
                      __in: this.allItemsId,
                    },
                  },
                },
              });
              this.allItemsFiltered = itemsFiltered.listItems;
            },
          },
          {
            value: `Más de 48 horas`,
            callback: async () => {
              const itemsFiltered = await this.saleflowService.listItems({
                findBy: {
                  estimatedDeliveryTime: {
                    from: 48,
                  },
                  _id: {
                    __in: this.allItemsId,
                  },
                },
              });
              this.allItemsFiltered = itemsFiltered.listItems;
            },
          },
        ],
        styles: {
          fullScreen: true,
        },
      },
    });
  }

  openPriceRangeDialog() {
    this._bottomSheet.open(OptionsMenuComponent, {
      data: {
        title: `💰 Artículos según el precio`,
        options: [
          {
            value: `$0.00 - $2,000`,
            callback: async () => {
              const itemsFiltered = await this.saleflowService.listItems({
                filter: {
                  maxPricing: 2000,
                },
                findBy: {
                  _id: {
                    __in: this.allItemsId,
                  },
                },
              });
              this.allItemsFiltered = itemsFiltered.listItems;
            },
          },
          {
            value: `$2,000 - $4,000`,
            callback: async () => {
              const itemsFiltered = await this.saleflowService.listItems({
                filter: {
                  minPricing: 2000,
                  maxPricing: 4000,
                },
                findBy: {
                  _id: {
                    __in: this.allItemsId,
                  },
                },
              });
              this.allItemsFiltered = itemsFiltered.listItems;
            },
          },
          {
            value: `$4,000 - $6,000`,
            callback: async () => {
              const itemsFiltered = await this.saleflowService.listItems({
                filter: {
                  minPricing: 4000,
                  maxPricing: 6000,
                },
                findBy: {
                  _id: {
                    __in: this.allItemsId,
                  },
                },
              });
              this.allItemsFiltered = itemsFiltered.listItems;
            },
          },
          {
            value: `$6,000 - $8,000`,
            callback: async () => {
              const itemsFiltered = await this.saleflowService.listItems({
                filter: {
                  minPricing: 6000,
                  maxPricing: 8000,
                },
                findBy: {
                  _id: {
                    __in: this.allItemsId,
                  },
                },
              });
              this.allItemsFiltered = itemsFiltered.listItems;
            },
          },
          {
            value: `$8,000+`,
            callback: async () => {
              const itemsFiltered = await this.saleflowService.listItems({
                filter: {
                  minPricing: 8000,
                },
                findBy: {
                  _id: {
                    __in: this.allItemsId,
                  },
                },
              });
              this.allItemsFiltered = itemsFiltered.listItems;
            },
          },
        ],
        styles: {
          fullScreen: true,
        },
      },
    });
  }
  
  goToOrderFilters() {
    return this.router.navigate(['/admin/order-filtering',]);
  }

  goToOrderProgress() {
    return this.router.navigate(['/admin/order-progress',]);
  }
}
