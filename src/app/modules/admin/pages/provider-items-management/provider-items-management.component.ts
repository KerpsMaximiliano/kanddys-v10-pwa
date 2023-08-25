import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Item, ItemInput } from 'src/app/core/models/item';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { FormComponent, FormData } from 'src/app/shared/dialogs/form/form.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-provider-items-management',
  templateUrl: './provider-items-management.component.html',
  styleUrls: ['./provider-items-management.component.scss'],
})
export class ProviderItemsManagementComponent implements OnInit {
  URI: string = environment.uri;
  assetsURL: string = environment.assetsUrl;
  drawerOpened: boolean = false;
  items: Array<Item> = [];
  itemSearchbar: FormControl = new FormControl('');
  searchOpened: boolean = false;
  searchFilters: Array<{
    label: string;
    key: string;
  }> = [
    {
      label: 'Creados por mi',
      key: 'mine',
    },
    {
      label: 'Expuestos por otros',
      key: 'notMine',
    },
    {
      label: 'En espera de aprobación',
      key: 'toBeApproved',
    },
    {
      label: 'Ocultos',
      key: 'hidden',
    },
  ];
  activatedSearchFilters: Record<string, boolean> = {};
  metrics: {
    mine: number;
    notMine: number;
    toBeApproved: number;
    hidden: 0;
  } = {
    mine: 0,
    notMine: 0,
    toBeApproved: 0,
    hidden: 0,
  };
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
  itemsSelledCountByItemId: Record<string, number> = {};
  renderItemsPromise: Promise<{ listItems: Item[] }>;

  constructor(
    private itemsService: ItemsService,
    private saleflowService: SaleFlowService,
    public merchantsService: MerchantsService,
    private router: Router,
    private matDialog: MatDialog,
    private headerService: HeaderService
  ) {}

  async ngOnInit() {
    const isTheUserAnAdmin = this.headerService.user.roles.find(
      (role) => role.code === 'ADMIN'
    );

    if (!isTheUserAnAdmin) this.router.navigate(['auth/login']);

    for (const filter of this.searchFilters) {
      this.activatedSearchFilters[filter.key] = false;
    }

    this.metrics = await this.itemsService.providersItemMetrics();

    await this.inicializeItems(true, false);

    this.itemSearchbar.valueChanges.subscribe(
      async (change) => await this.inicializeItems(true, false)
    );
  }

  redirectToItemEdition(item: Item) {
    if (!this.headerService.flowRouteForEachPage)
      this.headerService.flowRouteForEachPage = {};
    this.headerService.flowRouteForEachPage['provider-items-management'] =
      this.router.url;

    this.router.navigate(['/ecommerce/item-management/', item._id], {
      queryParams: { isAdminFlow: true }
    });
  }

  addProviderItem() {
    let fieldsToCreate: FormData = {
      fields: [],
    };

    fieldsToCreate.fields = [
      {
        label: 'Nombre del producto',
        name: 'product-name',
        type: 'text',
        validators: [Validators.pattern(/[\S]/)],
      },
    ];

    const dialogRef = this.matDialog.open(FormComponent, {
      data: fieldsToCreate,
    });

    dialogRef.afterClosed().subscribe((result: FormGroup) => {
      if (result && result.value['product-name']) {
        this.itemsService.temporalItemInput = {
          name: result.value['product-name'],
        };

        this.router.navigate(['/ecommerce/inventory-creator']);
      }
    });
  }

  async approveItem(item: Item, index: number) {
    lockUI();

    try {
      const itemInput: ItemInput = {
        approvedByAdmin: true,
      };

      const updatedItem = await this.itemsService.updateItem(
        itemInput,
        item._id
      );

      if (updatedItem) this.items[index].approvedByAdmin = true;

      unlockUI();
    } catch (error) {
      unlockUI();
      this.headerService.showErrorToast();
      console.error(error);
    }
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
        // this.tagsLoaded &&
        !this.reachTheEndOfPagination
      ) {
        await this.inicializeItems(false, true, true);
      }
    }
  }

  activateOrDeactivateFilters(filterKey: string) {
    this.activatedSearchFilters[filterKey] =
      !this.activatedSearchFilters[filterKey];

    this.inicializeItems(true, false);
  }

  async inicializeItems(
    restartPagination = false,
    triggeredFromScroll = false,
    getTotalNumberOfItems = false,
    createCopyOfAllItems = false
  ) {
    this.paginationState.status = 'loading';

    if (restartPagination) {
      this.reachTheEndOfPagination = false;
      this.paginationState.page = 1;
      this.items = [];
    } else {
      this.paginationState.page++;
    }

    const pagination: PaginationInput = {
      findBy: {
        type: 'supplier',
        parentItem: null,
        merchant: {
          $ne: null,
        },
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: this.paginationState.pageSize,
        page: this.paginationState.page,
      },
    };

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
        this.items = [];
      }

      if (itemsQueryResult.length === 0 && this.paginationState.page !== 1) {
        this.paginationState.page--;
        this.reachTheEndOfPagination = true;
      }

      if (itemsQueryResult && itemsQueryResult.length > 0) {
        if (this.paginationState.page === 1) {
          this.items = itemsQueryResult.map((item) => ({
            images: item.images.sort(({ index: a }, { index: b }) =>
              a > b ? 1 : -1
            ),
            ...item,
          }));
        } else {
          this.items = this.items.concat(itemsQueryResult).map((item) => ({
            images: item.images.sort(({ index: a }, { index: b }) =>
              a > b ? 1 : -1
            ),
            ...item,
          }));
        }
      }

      this.paginationState.status = 'complete';

      if (itemsQueryResult.length === 0 && !triggeredFromScroll) {
        this.items = [];
      }
    });
  }

  async getSoldItems() {
    /*
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
    }*/
  }

  async showSearch() {
    this.searchOpened = true;
    setTimeout(() => {
      (
        document.querySelector('#search-from-results-view') as HTMLInputElement
      )?.focus();
    }, 100);
  }
}
