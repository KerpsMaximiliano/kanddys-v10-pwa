import { Clipboard } from '@angular/cdk/clipboard';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepicker } from '@angular/material/datepicker';
import { ActivatedRoute, Router } from '@angular/router';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { Subscription } from 'rxjs';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import {
  Item,
  ItemCategory,
  ItemImageInput,
  ItemInput,
} from 'src/app/core/models/item';
import { ItemOrder } from 'src/app/core/models/order';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { Tag } from 'src/app/core/models/tags';
import { AuthService } from 'src/app/core/services/auth.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import {
  BarOptions,
  MenuEvent,
} from 'src/app/shared/components/options-bar/options-bar.component';
import { StepperFormComponent } from 'src/app/shared/components/stepper-form/stepper-form.component';
import { LinksDialogComponent } from 'src/app/shared/dialogs/links-dialog/links-dialog.component';
import { environment } from 'src/environments/environment';
import { SwiperOptions } from 'swiper';
import { FormControl, FormGroup } from '@angular/forms';
import { QueryparametersService } from 'src/app/core/services/queryparameters.service';
import { QueryParameter } from 'src/app/core/models/query-parameters';
import * as moment from 'moment';
import { base64ToBlob, fileToBase64 } from 'src/app/core/helpers/files.helpers';
import { formatID } from 'src/app/core/helpers/strings.helpers';
import { SingleActionDialogComponent } from 'src/app/shared/dialogs/single-action-dialog/single-action-dialog.component';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ToastrService } from 'ngx-toastr';
import { ExtendedItem } from '../items-dashboard/items-dashboard.component';
import { TagsService } from 'src/app/core/services/tags.service';
import { OrderService } from 'src/app/core/services/order.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { WebformsService } from 'src/app/core/services/webforms.service';

export class FilterCriteria {
  _id?: string;
  type: 'all' | 'tag' | 'queryParameter';
  tag?: Tag;
  queryParameter?: QueryParameter;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('orderQrCode', { read: ElementRef }) orderQrCode: ElementRef;
  URI: string = environment.uri;
  environment: string = environment.assetsUrl;
  formatId = formatID;

  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    freeMode: true,
    spaceBetween: 1,
  };

  cardSwiperConfig: SwiperOptions = {
    slidesPerView: 1,
    freeMode: false,
    spaceBetween: 4,
    watchSlidesProgress: true,
    watchSlidesVisibility: true,
  };

  layout: 'simple-card' | 'description-card' | 'image-full-width';
  items: Item[] = [];
  allItems: Item[] = [];
  allItemsCopy: Item[] = [];
  recentlySoldItems: Item[] = [];
  soldItems: Item[] = [];
  lessSoldItems: Item[] = [];
  mostSoldItems: Item[] = [];
  detailedItemsList: Item[] = [];
  detailedItemsSubList: Item[] = [];
  itemsBoughtByMe: Item[] = [];
  itemsIndexesByList: Record<string, Record<string, number>> = {};
  myOrders: Array<ItemOrder> = [];
  itemsSelledCountByItemId: Record<string, number> = {};
  hiddenItems: Item[] = [];
  orders: Array<ItemOrder> = [];

  articleId: string = '';

  ordersToConfirm: ItemOrder[] = [];

  itemStatus: 'active' | 'disabled' | '' | null = 'active';
  renderItemsPromise: Promise<{ listItems: Item[] }>;
  subscription: Subscription;
  allItemsIds: Array<string> = [];

  // Pagination
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
  // Pagination
  startDate: Date = null;
  endDate: Date = null;
  tags: Tag[] = [];
  selectedTags: Tag[] = [];
  filters: FilterCriteria[] = [];
  selectedFilter: FilterCriteria;
  openNavigation: boolean = false;
  options: BarOptions[] = [
    {
      title: 'articulos',
      menu: [
        {
          title: 'Nuevo Artículo',
          icon: 'chevron_right',
          callback: () => {
            let dialogRef = this.dialog.open(StepperFormComponent);
            dialogRef
              .afterClosed()
              .subscribe(
                async (result: { pricing: number; images: File[] }) => {
                  if (!result) return;
                  const { pricing, images: imagesResult } = result;
                  let images: ItemImageInput[] = imagesResult.map((file) => {
                    return {
                      file: file,
                      index: 0,
                      active: true,
                    };
                  });
                  console.log(images);
                  if (!pricing) return;
                  lockUI();
                  const itemInput: ItemInput = {
                    name: null,
                    description: null,
                    pricing: pricing,
                    images,
                    merchant: this._MerchantsService.merchantData?._id,
                    content: [],
                    currencies: [],
                    hasExtraPrice: false,
                    purchaseLocations: [],
                    showImages: images.length > 0,
                  };
                  this._ItemsService.itemPrice = null;

                  const { createItem } = await this._ItemsService.createItem(
                    itemInput
                  );
                  await this._SaleflowService.addItemToSaleFlow(
                    {
                      item: createItem._id,
                    },
                    this._SaleflowService.saleflowData._id
                  );

                  this._SaleflowService.saleflowData.items.push({
                    item: createItem,
                    customizer: null,
                    index: null,
                  } as any);

                  this.snackBar.open(
                    'Producto creado satisfactoriamente!',
                    '',
                    {
                      duration: 5000,
                    }
                  );
                  unlockUI();
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    this._ItemsService.editingImageId =
                      createItem.images[0]._id;
                    this.router.navigate([
                      `ecommerce/item-management/${createItem._id}`,
                    ]);
                  };
                  reader.readAsDataURL(images[0].file as File);
                }
              );
          },
        },
        {
          title: 'Todos los artículos',
          icon: 'chevron_right',
          callback: () => {
            if (
              this.itemStatus === 'active' ||
              this.itemStatus === 'disabled'
            ) {
              this.itemStatus = '';
            }
            this.inicializeItems(true, false, true);
          },
        },
        {
          title: 'Artículos exhibiéndose',
          icon: 'chevron_right',
          callback: () => {},
        },
        {
          title: 'Organización de artículos',
          icon: 'chevron_right',
          callback: () => {},
        },
        {
          title: 'Artículos invisibles',
          icon: 'chevron_right',
          callback: () => {
            if (this.itemStatus === 'active') {
              this.itemStatus = 'disabled';
              this.options[0].menu[2].title = 'Artículos visibles';
            } else {
              this.itemStatus = 'active';
              this.options[0].menu[2].title = 'Artículos invisibles';
            }
            this.inicializeItems(true, false, true);
          },
        },
        {
          title: 'Estilo de cartas',
          icon: 'chevron_right',
          callback: () => {
            this.router.navigate([`admin/view-configuration-cards`]);
          },
        },
        {
          title: 'Pantalla Inicial',
          icon: 'check',
          callback: () => {},
        },
      ],
    },
  ];
  income: number = 0;

  typeOfView: 'SHOW_LISTS' | 'LIST_DETAILED' | 'SUBLIST_DETAILED' =
    'SHOW_LISTS';
  detailedList: 'SOLD' | 'HIDDEN' | 'NOT_SOLD' | 'ALL';
  detailedSubList: 'MOST_SOLD' | 'LESS_SOLD' | 'FULL';
  detailedHeaderTitle: string = 'Todos los artículos';

  //Estilos para el dashboardLibrary
  dashboardLibrarySectionHeaderStyles = { marginTop: '0px' };

  queryParamaters: QueryParameter[] = [];

  range = new FormGroup({
    start: new FormControl(''),
    end: new FormControl(''),
  });

  dateString: string = 'Aún no hay filtros aplicados';
  notSoldItems: Array<Item>;

  @ViewChild('picker') datePicker: MatDatepicker<Date>;

  qrLink: string = '';

  view: 'sold' | 'notSold' | 'hidden' | 'all' | 'default' = 'default';
  showItems: string = null;
  supplierMode: boolean = false;

  constructor(
    public _MerchantsService: MerchantsService,
    public _SaleflowService: SaleFlowService,
    public router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private tagsService: TagsService,
    private ordersService: OrderService,
    private webformsService: WebformsService,
    private _ItemsService: ItemsService,
    private snackBar: MatSnackBar,
    private _bottomSheet: MatBottomSheet,
    public dialog: MatDialog,
    private headerService: HeaderService,
    private ngNavigatorShareService: NgNavigatorShareService,
    private queryParameterService: QueryparametersService,
    private clipboard: Clipboard
  ) {}

  async ngOnInit() {
    //await this.getItemsBoughtByMe();
    this.route.queryParams.subscribe(async ({ view, showItems, jsondata }) => {
      this.showItems = showItems;
      this.supplierMode = JSON.parse(
        this.route.snapshot.queryParamMap.get('supplierMode') || 'false'
      );

      if (jsondata) {
        let parsedData = JSON.parse(decodeURIComponent(jsondata));

        if (parsedData.createdItem) {
          try {
            lockUI();
            const createdItemId = parsedData.createdItem;

            const item = await this._ItemsService.item(createdItemId);

            const saleflowDefault = await this._SaleflowService.saleflowDefault(
              this._MerchantsService.merchantData._id
            );

            await this._ItemsService.authItem(
              this._MerchantsService.merchantData._id,
              createdItemId
            );

            await this._SaleflowService.addItemToSaleFlow(
              {
                item: createdItemId,
              },
              saleflowDefault._id
            );

            if (parsedData.createdWebformId) {
              await this.webformsService.authWebform(
                parsedData.createdWebformId
              );

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
                  merchant: this._MerchantsService.merchantData._id,
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
                const createdCategory =
                  await this._ItemsService.createItemCategory(
                    {
                      merchant: this._MerchantsService.merchantData?._id,
                      name: categoryName,
                      active: true,
                    },
                    false
                  );

                createdCategories.push(createdCategory);
              }

              if (
                parsedData.categoriesIndexesToAssignAfterCreated?.length > 0
              ) {
                await this._ItemsService.updateItem(
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
        }

        if (parsedData.itemsToUpdate) {
          try {
            lockUI();
            await this.headerService.checkIfUserIsAMerchantAndFetchItsData();

            await Promise.all(Object.keys(parsedData.itemsToUpdate).map(itemId => this._ItemsService.updateItem(parsedData.itemsToUpdate[itemId], itemId)));

            if(!parsedData.quotationItems) {
              unlockUI();
              window.location.href =
                environment.uri + '/admin/supplier-dashboard?supplierMode=true';
            }
          } catch (error) {
            unlockUI();

            console.error(error);
          }
        }

        if (parsedData.quotationItems) {
          try {
            lockUI();
            await this.headerService.checkIfUserIsAMerchantAndFetchItsData();

            const saleflow = await this._SaleflowService.saleflowDefault(
              this._MerchantsService.merchantData?._id
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
              await this._ItemsService.listItems(supplierSpecificItemsInput)
            )?.listItems;

            if (quotationItems?.length) {
              this.items = quotationItems;

              if (!this.items[0].merchant) {
                await Promise.all(
                  this.items.map((item) =>
                    this._ItemsService.authItem(
                      this._MerchantsService.merchantData._id,
                      item._id
                    )
                  )
                );

                await Promise.all(
                  this.items.map((item) =>
                    this._SaleflowService.addItemToSaleFlow(
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
        }

        return;
      }

      if (view)
        this.view = view as 'sold' | 'notSold' | 'hidden' | 'all' | 'default';

        this._ItemsService.temporalItem = null;
        this._ItemsService.temporalItemInput = null;
        this._ItemsService.temporalItem = null;

      if (this._SaleflowService.saleflowData) {
        await this.inicializeItems(true, false, true, true);
        this.getTags();
        this.getQueryParameters();
        this.getHiddenItems();
        this.getSoldItems();
        this.getItemsThatHaventBeenSold();
      }
      this.subscription = this._SaleflowService.saleflowLoaded.subscribe({
        next: async (value) => {
          if (value) {
            await this.inicializeItems(true, false, true, true);
            this.getTags();
            this.getQueryParameters();
            this.getHiddenItems();
            this.getSoldItems();
            this.getItemsThatHaventBeenSold();
          }
        },
      });
    });
  }

  async getItemsBoughtByMe() {
    if (!this.myOrders.length) {
      this.myOrders = (
        await this.ordersService.ordersByUser({
          options: {
            limit: -1,
          },
        })
      )?.ordersByUser;
    }

    const haveYouBuyedAnItemByItsID = {};

    for (const order of this.myOrders) {
      order.items.forEach((item) => {
        if (!haveYouBuyedAnItemByItsID[item.item._id]) {
          haveYouBuyedAnItemByItsID[item.item._id] = true;

          this.itemsBoughtByMe.push(item.item);
        }
      });
    }
  }

  async getItemsThatHaventBeenSold() {
    const pagination: PaginationInput = {
      options: {
        sortBy: 'createdAt:asc',
        limit: -1,
        page: 1,
        range: {},
      },
      findBy: {
        merchant: this._MerchantsService.merchantData._id,
      },
    };

    if (this.selectedTags.length)
      pagination.findBy.tags = this.selectedTags.map((tag) => tag._id);

    const notSoldItems = await this._ItemsService.itemsByMerchantNosale(
      pagination
    );
    this.notSoldItems = Object.values(notSoldItems)[0] as Array<Item>;
    this.itemsIndexesByList['NOT_SOLD'] = {};

    if (this.supplierMode) {
      this.notSoldItems = this.notSoldItems.filter((item) => item.parentItem);
    } else {
      this.notSoldItems = this.notSoldItems.filter(
        (item) => item.type !== 'supplier'
      );
    }

    this.notSoldItems.forEach((item, index) => {
      this.itemsIndexesByList['NOT_SOLD'][item._id] = index;
    });

    if (this.showItems === 'notSold') {
      this.goToDetail('NOT_SOLD', true, 'FULL_LIST');
    }
  }

  async getItemsThatWerentSoldOnDateRange() {
    try {
      const soldItemsObject = {};

      this.soldItems.forEach((item) => {
        soldItemsObject[item._id] = true;
      });

      const itemsThatWerentSold = this.allItems.filter(
        (item) => !soldItemsObject[item._id]
      );

      this.notSoldItems = itemsThatWerentSold;
    } catch (error) {
      console.log(error);
    }
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }

  selected: number;

  async infinitePagination() {
    const targetClass =
      this.layout === 'simple-card' || !this.layout
        ? '.saleflows-item-grid'
        : '.description-card-grid';
    const page = document.querySelector(targetClass);
    const pageScrollHeight = page.scrollHeight;
    const verticalScroll = window.innerHeight + page.scrollTop;

    if (verticalScroll >= pageScrollHeight) {
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
    const saleflowItems = this._SaleflowService.saleflowData.items.map(
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

    const pagination: PaginationInput = {
      findBy: {
        _id: {
          __in: ([] = saleflowItems.map((items) => items.itemId)),
        },
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: this.paginationState.pageSize,
        page: this.paginationState.page,
      },
    };

    if (this.supplierMode) {
      pagination.findBy.type = 'supplier';
      pagination.findBy.merchant = this._MerchantsService.merchantData._id;
    }

    if (this.selectedTags.length)
      pagination.findBy.tags = this.selectedTags.map((tag) => tag._id);

    this.renderItemsPromise = this._SaleflowService.listItems(pagination, true);
    this.layout = this._SaleflowService.saleflowData.layout;

    return this.renderItemsPromise.then(async (response) => {
      const items = response;
      let itemsQueryResult = items?.listItems;

      if (this.supplierMode) {
        itemsQueryResult = itemsQueryResult.filter((item) => item.parentItem);
      } else {
        itemsQueryResult = itemsQueryResult.filter(
          (item) => item.type !== 'supplier'
        );
      }

      /*
      if (getTotalNumberOfItems) {
        pagination.options.limit = -1;
        const { listItems: allItems } =
          await this._SaleflowService.hotListItems(pagination);
      }*/

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

      this.itemsIndexesByList['ALL'] = {};

      this.allItems.forEach((item, index) => {
        this.itemsIndexesByList['ALL'][item._id] = index;
      });

      if (createCopyOfAllItems) {
        this.allItemsCopy = JSON.parse(JSON.stringify(this.allItems));
      }
    });
  }

  async getTags() {
    const tagsByUser = await this.tagsService.tagsByUser({
      findBy: {
        entity: 'item',
      },
      options: {
        limit: -1,
      },
    });
    this.tags = tagsByUser;
    if (this.tags.length) {
      this.options.push({
        title: 'categorias',
      });

      // const filters: FilterCriteria[] = this.tags.map((tag) => {
      //   return {
      //     type: "tag",
      //     tag: tag,
      //     _id: tag._id
      //   }
      // });
      // this.filters.push(...filters);
    }
  }

  async getSoldItems() {
    try {
      const pagination: PaginationInput = {
        findBy: {
          merchant: this._MerchantsService.merchantData._id,
        },
        options: {
          limit: -1,
        },
      };

      if (this.selectedFilter) {
        pagination.options.range = {
          from: this.selectedFilter.queryParameter.from.date as any,
          to: this.selectedFilter.queryParameter.until.date as any,
        };
      }

      if (this.selectedTags.length)
        pagination.findBy.tags = this.selectedTags.map((tag) => tag._id);

      const result = (await this._ItemsService.bestSellersByMerchant(
        false,
        pagination
      )) as any[];

      this.soldItems = result.map((item) => {
        this.itemsSelledCountByItemId[item.item._id] = item.count;
        return item.item;
      });

      if (this.supplierMode) {
        this.soldItems = this.soldItems.filter((item) => item.parentItem);
      } else {
        this.soldItems = this.soldItems.filter(
          (item) => item.type !== 'supplier'
        );
      }

      this.itemsIndexesByList['SOLD'] = {};

      this.soldItems.forEach((item, index) => {
        this.itemsIndexesByList['SOLD'][item._id] = index;
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getMostSoldItems() {
    try {
      const percentageLimit = Math.round(this.detailedItemsList.length * 0.2);

      const limit = percentageLimit === 0 ? 1 : percentageLimit;

      if (this.detailedList === 'SOLD' || this.detailedList === 'ALL') {
        this.mostSoldItems = this.soldItems.slice(0, limit);
      } else if (this.detailedList === 'HIDDEN') {
        let hiddenAndSold: Array<Item> = [];

        hiddenAndSold = this.hiddenItems.filter(
          (item) => item._id in this.itemsSelledCountByItemId
        );

        this.mostSoldItems = hiddenAndSold.slice(0, limit);

        this.itemsIndexesByList['BEST_SOLD'] = {};

        this.mostSoldItems.forEach((item, index) => {
          this.itemsIndexesByList['BEST_SOLD'][item._id] = index;
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getLessSoldItems() {
    try {
      const percentageLimit = Math.round(this.detailedItemsList.length * 0.2);

      const limit = percentageLimit === 0 ? 1 : percentageLimit;

      if (this.detailedList === 'SOLD' || this.detailedList === 'ALL') {
        this.lessSoldItems = this.detailedItemsList.slice(limit * -1);
      } else if (this.detailedList === 'HIDDEN') {
        let hiddenAndSold: Array<Item> = [];

        hiddenAndSold = this.hiddenItems.filter(
          (item) => item._id in this.itemsSelledCountByItemId
        );

        this.lessSoldItems = hiddenAndSold.slice(limit * -1);

        this.itemsIndexesByList['LESS_SOLD'] = {};

        this.lessSoldItems.forEach((item, index) => {
          this.itemsIndexesByList['LESS_SOLD'][item._id] = index;
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getIncomeMerchant() {
    const pagination: PaginationInput = {
      findBy: {
        merchant: this._MerchantsService.merchantData._id,
      },
      options: {},
    };

    if (this.selectedFilter) {
      pagination.options.range = {
        from: this.selectedFilter.queryParameter.from.date as any,
        to: this.selectedFilter.queryParameter.until.date as any,
      };
    }

    if (this.selectedTags.length)
      pagination.findBy.tags = this.selectedTags.map((tag) => tag._id);

    this.income = await this._MerchantsService.incomeMerchant(pagination);

    pagination.findBy = {};

    this.orders = (
      await this._MerchantsService.ordersByMerchant(
        this._MerchantsService.merchantData._id,
        pagination
      )
    )?.ordersByMerchant;
  }

  settings() {
    const link = `${this.URI}/ecommerce/${this._MerchantsService.merchantData.slug}/store`;
    const bottomSheetRef = this._bottomSheet.open(LinksDialogComponent, {
      data: [
        {
          title: 'Del vendedor',
          options: [
            {
              title: 'Nuevo artículo',
              callback: () => {
                let dialogRef = this.dialog.open(StepperFormComponent);
                dialogRef
                  .afterClosed()
                  .subscribe(
                    async (result: { pricing: number; images: File[] }) => {
                      if (!result) return;
                      const { pricing, images: imagesResult } = result;
                      let images: ItemImageInput[] = imagesResult.map(
                        (file) => {
                          return {
                            file: file,
                            index: 0,
                            active: true,
                          };
                        }
                      );
                      //console.log(images);
                      if (!pricing) return;
                      lockUI();
                      const itemInput: ItemInput = {
                        name: null,
                        description: null,
                        pricing: pricing,
                        images,
                        merchant: this._MerchantsService.merchantData?._id,
                        content: [],
                        currencies: [],
                        hasExtraPrice: false,
                        purchaseLocations: [],
                        showImages: images.length > 0,
                      };
                      this._ItemsService.itemPrice = null;

                      const { createItem } =
                        await this._ItemsService.createItem(itemInput);
                      await this._SaleflowService.addItemToSaleFlow(
                        {
                          item: createItem._id,
                        },
                        this._SaleflowService.saleflowData._id
                      );

                      this._SaleflowService.saleflowData.items.push({
                        item: createItem,
                        customizer: null,
                        index: null,
                      } as any);

                      this.snackBar.open(
                        'Producto creado satisfactoriamente!',
                        '',
                        {
                          duration: 5000,
                        }
                      );
                      unlockUI();
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        this._ItemsService.editingImageId =
                          createItem.images[0]._id;
                        this.router.navigate([
                          `ecommerce/item-management/${createItem._id}`,
                        ]);
                      };
                      reader.readAsDataURL(images[0].file as File);
                    }
                  );
              },
            },
            {
              title: `Mira los ${this.hiddenItems.length} artículos ocultos`,
              callback: () => {
                // TODO
              },
            },
          ],
        },
        {
          title: 'Del exhibidor',
          options: [
            {
              title: 'Cambia el contenedor de los artículos',
              callback: () => {
                this.router.navigate(['/admin/view-configuration-cards']);
              },
            },
            {
              title: 'Crea exhibidores',
              callback: () => {
                this.router.navigate(['/admin/create-tag']);
              },
            },
          ],
        },
      ],
    });
  }

  async headerSettings() {
    const link = `${this.URI}/ecommerce/${this._MerchantsService.merchantData.slug}/store`;
    this._bottomSheet.open(LinksDialogComponent, {
      data: [
        {
          title: 'Posibles acciones con los Artículos de tu KiosKo:',
          options: [
            {
              title: 'Adiciona un nuevo artículo',
              callback: async () => {
                this.newArticle();
              },
            },
            {
              title: 'Edita la carta de los artículos',
              callback: () => {
                this.router.navigate(['/admin/view-configuration-cards']);
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
            // {
            //   title: 'Ve a las configuraciones de las categorias',
            //   callback: () => {
            //     this.router.navigate(['/admin/tags']);
            //   },
            // },
          ],
          secondaryOptions: [
            {
              title: 'Mira como lo ven otros',
              callback: () => {
                this.router.navigate(
                  [
                    `/ecommerce/${this._MerchantsService.merchantData.slug}/store`,
                  ],
                  { queryParams: { adminView: true } }
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
                  `${this.URI}/ecommerce/${this._MerchantsService.merchantData.slug}/store`
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

  async newArticle() {
    if (!this.supplierMode) this.router.navigate(['ecommerce/item-management']);
    else this.router.navigate(['ecommerce/inventory-creator']);

    /*
    let dialogRef = this.dialog.open(StepperFormComponent);
    dialogRef
      .afterClosed()
      .subscribe(async (result: { pricing: number; images: File[] }) => {
        if (!result) return;
        const { pricing, images: imagesResult } = result;
        let images: ItemImageInput[] = imagesResult.map((file) => {
          return {
            file: file,
            index: 0,
            active: true,
          };
        });
        console.log(images);
        if (!pricing) return;
        lockUI();
        const itemInput: ItemInput = {
          name: null,
          description: null,
          pricing: pricing,
          images,
          merchant: this._MerchantsService.merchantData?._id,
          content: [],
          currencies: [],
          hasExtraPrice: false,
          purchaseLocations: [],
          showImages: images.length > 0,
        };
        this._ItemsService.itemPrice = null;

        const { createItem } = await this._ItemsService.createItem(itemInput);
        await this._SaleflowService.addItemToSaleFlow(
          {
            item: createItem._id,
          },
          this._SaleflowService.saleflowData._id
        );

        this._SaleflowService.saleflowData.items.push({
          item: createItem,
          customizer: null,
          index: null,
        } as any);

        this.snackBar.open('Producto creado satisfactoriamente!', '', {
          duration: 5000,
        });
        unlockUI();
        const reader = new FileReader();
        reader.onload = (e) => {
          this._ItemsService.editingImageId = createItem.images[0]._id;
          this.router.navigate([`ecommerce/item-management/${createItem._id}`]);
        };
        reader.readAsDataURL(images[0].file as File);
      });*/
  }

  async getHiddenItems() {
    //Ocutar la seccion de ocultos cuando haya un rango de fecha seleccionados

    try {
      this.hiddenItems = this.allItems.filter(
        (item) => item.status === 'disabled'
      );

      this.itemsIndexesByList['HIDDEN'] = {};

      this.hiddenItems.forEach((item, index) => {
        this.itemsIndexesByList['HIDDEN'][item._id] = index;
      });
    } catch (error) {
      console.log(error);
    }
  }

  logout() {
    this.authService.signouttwo();
  }

  selectTag(index: number) {
    if (index != this.selected) {
      this.selected = index;
    }
    if (index === 1) this.router.navigate([`admin/tags-view`]);
  }

  async filterTag(index: number) {
    const selectedTag = this.tags[index];
    const tagFound = this.selectedTags.find(
      (tag) => tag._id === selectedTag._id
    );

    if (tagFound) {
      const tagIndex = this.selectedTags.findIndex(
        (tag) => tag._id === selectedTag._id
      );

      this.selectedTags.splice(tagIndex, 1);
    } else {
      this.selectedTags.push(selectedTag);
    }

    await this.inicializeItems(true, false, true);
    await this.getSoldItems();
    //await this.getLessSoldItems();
    await this.getHiddenItems();
    if (!this.selectedFilter) {
      await this.getItemsThatHaventBeenSold();
    } else {
      await this.getItemsThatWerentSoldOnDateRange();
    }

    if (
      this.typeOfView === 'LIST_DETAILED' &&
      ['SOLD', 'HIDDEN', 'ALL'].includes(this.detailedList)
    ) {
      this.detailedItemsList =
        this.detailedList === 'HIDDEN'
          ? this.hiddenItems
          : this.detailedList === 'SOLD'
          ? this.soldItems
          : this.allItems;

      if (this.selectedTags.length) {
        this.detailedItemsList = (
          JSON.parse(JSON.stringify(this.detailedItemsList)) as Array<Item>
        ).filter((item) =>
          this.selectedTags.some((tag) => item.tags.includes(tag._id))
        );
      }

      await this.getMostSoldItems();
      await this.getLessSoldItems();

      if (this.detailedItemsSubList.length) {
        this.detailedItemsSubList =
          this.detailedSubList === 'MOST_SOLD'
            ? this.mostSoldItems
            : this.detailedSubList === 'LESS_SOLD'
            ? this.lessSoldItems
            : this.detailedItemsList;

        if (this.selectedTags.length) {
          this.detailedItemsSubList = (
            JSON.parse(JSON.stringify(this.detailedItemsSubList)) as Array<Item>
          ).filter((item) =>
            this.selectedTags.some((tag) => item.tags.includes(tag._id))
          );
        }
      }
    }

    if (
      this.typeOfView === 'LIST_DETAILED' &&
      this.detailedList === 'NOT_SOLD'
    ) {
      this.detailedItemsList = this.notSoldItems;

      if (this.selectedTags.length) {
        this.detailedItemsList = (
          JSON.parse(JSON.stringify(this.detailedItemsList)) as Array<Item>
        ).filter((item) =>
          this.selectedTags.some((tag) => item.tags.includes(tag._id))
        );
      }
    }
  }

  async isFilterActive(filter: FilterCriteria) {
    if (this.selectedFilter && filter._id === this.selectedFilter._id) {
      this.selectedFilter = null;
      await this.queryParameterService.deleteQueryParameter(filter._id);

      this.filters = this.filters.filter(
        (filterInList) => filterInList._id !== filter._id
      );
    } else {
      this.selectedFilter = filter;
    }

    await this.inicializeItems(true, false, true);
    await this.getSoldItems();
    await this.getItemsThatWerentSoldOnDateRange();
    await this.getHiddenItems();

    if (
      this.typeOfView === 'LIST_DETAILED' &&
      ['SOLD', 'HIDDEN', 'ALL'].includes(this.detailedList)
    ) {
      this.detailedItemsList =
        this.detailedList === 'HIDDEN'
          ? this.hiddenItems
          : this.detailedList === 'SOLD'
          ? this.soldItems
          : this.allItems;

      if (this.selectedTags.length) {
        this.detailedItemsList = (
          JSON.parse(JSON.stringify(this.detailedItemsList)) as Array<Item>
        ).filter((item) =>
          this.selectedTags.some((tag) => item.tags.includes(tag._id))
        );
      }

      if (this.selectedFilter) {
        this.detailedItemsList = (
          JSON.parse(JSON.stringify(this.detailedItemsList)) as Array<Item>
        ).filter((item) =>
          this.soldItems.some((itemInList) => itemInList._id === item._id)
        );
      }

      await this.getMostSoldItems();
      await this.getLessSoldItems();

      if (this.detailedItemsSubList.length) {
        this.detailedItemsSubList =
          this.detailedSubList === 'MOST_SOLD'
            ? this.mostSoldItems
            : this.detailedSubList === 'LESS_SOLD'
            ? this.lessSoldItems
            : this.detailedItemsList;

        if (this.selectedTags.length) {
          this.detailedItemsSubList = (
            JSON.parse(JSON.stringify(this.detailedItemsSubList)) as Array<Item>
          ).filter((item) =>
            this.selectedTags.some((tag) => item.tags.includes(tag._id))
          );
        }

        if (this.selectedFilter) {
          this.detailedItemsSubList = (
            JSON.parse(JSON.stringify(this.detailedItemsSubList)) as Array<Item>
          ).filter((item) =>
            this.soldItems.some((itemInList) => itemInList._id === item._id)
          );
        }
      }
    }

    if (this.selectedFilter) {
      await this.getIncomeMerchant();

      this.dateString =
        this.orders.length +
        ' facturas, RD$' +
        this.income +
        ' desde ' +
        this.formatDate(
          new Date(this.selectedFilter.queryParameter.from.date)
        ) +
        ' hasta ' +
        this.formatDate(
          new Date(this.selectedFilter.queryParameter.until.date)
        );
    } else this.dateString = 'Aún no hay filtros aplicados';
  }

  isTagActive(tag: Tag) {
    return this.selectedTags.find((selectedTag) => selectedTag._id === tag._id);
  }

  selectedMenuOption(selected: MenuEvent) {
    this.options[selected.index].menu[selected.menuIndex].callback();
  }

  openDatePicker() {
    this.datePicker.open();
  }
  
  async onDateChange() {
    if (this.range.get('start').value && this.range.get('end').value) {
      lockUI();
      try {
        const result = await this.queryParameterService.createQueryParameter(
          this._MerchantsService.merchantData._id,
          {
            from: {
              date: this.range.get('start').value,
            },
            until: {
              date: this.range.get('end').value,
            },
          }
        );

        if (result) {
          this.queryParamaters.unshift(result);

          this.filters.push({
            type: 'queryParameter',
            queryParameter: result,
            _id: result._id,
          });

          this.isFilterActive(this.filters[this.filters.length - 1]);
        }

        this.startDate = new Date(result.from.date);
        this.endDate = new Date(result.until.date);

        unlockUI();
      } catch (error) {
        unlockUI();
        console.log(error);
      }
    }
  }

  async getQueryParameters() {
    try {
      const result = await this.queryParameterService.queryParameters({
        options: {
          limit: 10,
          sortBy: 'createdAt:desc',
        },
        findBy: {
          merchant: this._MerchantsService.merchantData._id,
        },
      });
      this.queryParamaters = result;

      if (this.queryParamaters.length > 0) {
        this.startDate = new Date(this.queryParamaters[0].from.date);
        this.endDate = new Date(this.queryParamaters[0].until.date);

        const filters: FilterCriteria[] = this.queryParamaters.map(
          (queryParameter) => {
            return {
              type: 'queryParameter',
              queryParameter: queryParameter,
              _id: queryParameter._id,
            };
          }
        );

        this.filters.push(...filters);
      }
    } catch (error) {
      console.log(error);
    }
  }

  formatDate(date: Date, short?: boolean) {
    if (!short) return moment(date).format('DD/MM/YYYY');
    else
      return `${moment(date).locale('es-es').format('MMM')} ${moment(date)
        .locale('es-es')
        .format('DD')}`;
  }

  async goToDetail(
    dataToRequest: string,
    resetScroll: boolean = false,
    typeOfSubList: string = null
  ) {
    this.typeOfView = 'LIST_DETAILED';
    this.detailedList = dataToRequest as any;

    if (resetScroll) window.scroll(0, 0);

    switch (dataToRequest) {
      case 'SOLD':
        this.detailedItemsList = this.soldItems;
        this.detailedHeaderTitle = 'Artículos Vendidos';
        lockUI();

        await this.getMostSoldItems();
        await this.getLessSoldItems();

        unlockUI();
        break;
      case 'NOT_SOLD':
        this.detailedItemsList = this.notSoldItems;

        this.detailedHeaderTitle = 'Sin venderse';
        break;
      case 'HIDDEN':
        this.detailedItemsList = this.hiddenItems;

        await this.getMostSoldItems();
        await this.getLessSoldItems();

        this.detailedHeaderTitle = 'Artículos ocultos';
        break;
      case 'ALL':
        this.detailedItemsList = this.allItems;

        await this.getMostSoldItems();
        await this.getLessSoldItems();

        this.detailedHeaderTitle = 'Todos los artículos';
        break;
    }

    switch (typeOfSubList) {
      case 'MOST_SOLD':
        this.detailedItemsSubList = this.mostSoldItems;
        break;
      case 'LESS_SOLD':
        this.detailedItemsSubList = this.lessSoldItems;
        break;
      case 'FULL_LIST':
        this.detailedItemsSubList = this.detailedItemsList;
        break;
    }

    if (this.detailedItemsSubList) this.detailedSubList = typeOfSubList as any;
  }

  changeItemStatus = (type: string, item: Item, newStatus: string) => {
    let list: Array<Item> = null;

    if (type === 'ALL') list = this.allItems;
    else if (type === 'NOT_SOLD') list = this.notSoldItems;
    else if (type === 'SOLD') list = this.soldItems;
    else if (type === 'HIDDEN') {
      this.removeItemFromTheHiddenItemsList(item);
    }

    let statusesToUpdate: Array<string> = [];

    if (type !== 'HIDDEN') {
      if (!(item._id in this.itemsIndexesByList['HIDDEN'])) {
        this.hiddenItems.push(item);

        this.itemsIndexesByList['HIDDEN'] = {};

        this.hiddenItems.forEach((item, index) => {
          this.itemsIndexesByList['HIDDEN'][item._id] = index;
        });
      } else {
        this.removeItemFromTheHiddenItemsList(item);
      }

      statusesToUpdate = ['SOLD', 'NOT_SOLD', 'ALL', 'HIDDEN'];
    } else {
      statusesToUpdate = ['SOLD', 'NOT_SOLD', 'ALL'];
    }

    statusesToUpdate.forEach((typeOfList) => {
      if (typeOfList === 'ALL') list = this.allItems;
      else if (typeOfList === 'NOT_SOLD') list = this.notSoldItems;
      else if (typeOfList === 'SOLD') list = this.soldItems;
      else if (typeOfList === 'HIDDEN') list = this.hiddenItems;

      if (list[this.itemsIndexesByList[typeOfList][item._id]]) {
        list[this.itemsIndexesByList[typeOfList][item._id]].status =
          newStatus as any;
      }
    });

    if (this.detailedList !== null) {
      this.goToDetail(this.detailedList, false, this.detailedSubList);
    }
  };

  removeItemFromTheHiddenItemsList = (item: Item) => {
    const itemIndex = this.hiddenItems.findIndex(
      (itemInList) => item._id === itemInList._id
    );

    this.hiddenItems = this.hiddenItems.filter(
      (item, index) => itemIndex !== index
    );

    this.itemsIndexesByList['HIDDEN'] = {};

    this.hiddenItems.forEach((item, index) => {
      this.itemsIndexesByList['HIDDEN'][item._id] = index;
    });
  };

  downloadQr(id: string) {
    const parentElement =
      this.orderQrCode.nativeElement.querySelector('img').src;
    let blobData = base64ToBlob(parentElement);
    if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
      //IE
      (window.navigator as any).msSaveOrOpenBlob(blobData, this.formatId(id));
    } else {
      // chrome
      const blob = new Blob([blobData], { type: 'image/png' });
      const url = window.URL.createObjectURL(blob);
      // window.open(url);
      const link = document.createElement('a');
      link.href = url;
      link.download = this.formatId(id);
      link.click();
    }
  }

  showAllLists = () => {
    if (this.detailedItemsSubList.length) {
      this.detailedItemsSubList = [];
      return;
    }

    this.typeOfView = 'SHOW_LISTS';
    this.detailedList = null;
    this.detailedItemsList = [];
    this.detailedHeaderTitle = 'Todos los Artículos';
  };
}
