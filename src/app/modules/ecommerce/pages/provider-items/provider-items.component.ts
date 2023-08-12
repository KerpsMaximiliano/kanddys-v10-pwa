import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { isVideo } from 'src/app/core/helpers/strings.helpers';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Item } from 'src/app/core/models/item';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-provider-items',
  templateUrl: './provider-items.component.html',
  styleUrls: ['./provider-items.component.scss'],
})
export class ProviderItemsComponent implements OnInit {
  drawerOpened: boolean = false;
  assetsFolder: string = environment.assetsUrl;

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

  //userSpecific variables
  isTheUserAMerchant: boolean = null;

  //Subscriptions
  queryParamsSubscription: Subscription;
  saleflowLoadedSubscription: Subscription;

  //magicLink-specific variables
  encodedJSONData: string;
  fetchedItemsFromMagicLink: Array<Item> = [];

  constructor(
    private headerService: HeaderService,
    private itemsService: ItemsService,
    private appService: AppService,
    private saleflowService: SaleFlowService,
    public merchantsService: MerchantsService,
    private router: Router,
    private route: ActivatedRoute
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

  async changeAmount(item: Item, type: 'add' | 'subtract', itemIndex: number) {
    try {
      let newAmount: number;
      if (type === 'add') {
        newAmount = item.stock >= 0 ? item.stock + 1 : 1;
      } else if (type === 'subtract') {
        newAmount = item.stock >= 1 ? item.stock - 1 : 0;
      }

      this.itemsService.updateItem(
        {
          stock: newAmount,
        },
        item._id
      );

      this.itemsISell[itemIndex].stock = newAmount;
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
}
