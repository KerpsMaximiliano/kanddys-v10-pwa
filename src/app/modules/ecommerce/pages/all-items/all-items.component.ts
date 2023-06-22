import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { AppService } from 'src/app/app.service';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Item } from 'src/app/core/models/item';
import { ItemSubOrderInput } from 'src/app/core/models/order';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { HeaderService } from 'src/app/core/services/header.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-all-items',
  templateUrl: './all-items.component.html',
  styleUrls: ['./all-items.component.scss'],
})
export class AllItemsComponent implements OnInit {
  URI: string = environment.uri;
  env: string = environment.assetsUrl;
  status: 'idle' | 'loading' | 'complete' | 'error' = 'idle';

  items: Item[] = [];
  renderItemsPromise: Promise<{
    listItems: Item[];
  }>;

  paginationState: {
    pageSize: number;
    page: number;
    status: 'loading' | 'complete';
  } = {
    page: 1,
    pageSize: 15,
    status: 'loading',
  };
  reachedTheEndOfPagination = false;

  constructor(
    public headerService: HeaderService,
    private appService: AppService,
    private saleflowService: SaleFlowService,
    private ngNavigatorShareService: NgNavigatorShareService,
    private router: Router
  ) {}

  async ngOnInit() {
    const saleflowItems = this.headerService.saleflow.items.map(
      (saleflowItem) => ({
        item: saleflowItem.item._id,
        customizer: saleflowItem.customizer?._id,
        index: saleflowItem.index,
      })
    );
    const items = await this.saleflowService.listItems({
      findBy: {
        _id: {
          __in: ([] = saleflowItems.map((items) => items.item)),
        },
        $or: [
          {
            status: 'active',
          },
          {
            status: 'featured',
          },
        ],
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: this.paginationState.pageSize,
      },
    });
    const { listItems: allItems } = await this.saleflowService.hotListItems({
      findBy: {
        _id: {
          __in: ([] = saleflowItems.map((items) => items.item)),
        },
        $or: [
          {
            status: 'active',
          },
          {
            status: 'featured',
          },
        ],
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: -1,
      },
    });
    const selectedItems = this.headerService.order?.products?.length
      ? this.headerService.order.products.map((subOrder) => subOrder.item)
      : [];
    this.items = items?.listItems
      .filter((item) => item.status === 'active' || item.status === 'featured')
      .map((item) => ({
        images: item.images.sort(({ index: a }, { index: b }) =>
          a > b ? 1 : -1
        ),
        ...item,
      }));
    for (let i = 0; i < this.items?.length; i++) {
      // Asignando el status a los items del saleflow
      const item = this.headerService.saleflow.items.find(
        (saleflowItem) => saleflowItem.item._id === this.items[i]._id
      );
      item.item.status = this.items[i].status;
      // Si la tienda permite compra múltiple, marcar items seleccionados
      if (this.headerService.saleflow.canBuyMultipleItems)
        this.items[i].isSelected = selectedItems.includes(this.items[i]._id);
    }
    if (this.headerService.order?.products?.length) {
      let itemIDs: string[] = [];
      this.headerService.order.products.forEach((item) => {
        if (!allItems.some((product) => product._id === item.item)) {
          itemIDs.push(item.item);
          this.headerService.removeOrderProduct(item.item);
        }
      });
      this.headerService.order.products =
        this.headerService.order.products.filter(
          (product) => !itemIDs.includes(product.item)
        );
    }

    this.status = 'complete';
    this.paginationState.status = 'complete';
  }

  async infinitePagination() {
    const page = document.querySelector('.store-page');
    const pageScrollHeight = page.scrollHeight;
    const verticalScroll = window.innerHeight + page.scrollTop;

    if (verticalScroll >= pageScrollHeight) {
      if (
        this.paginationState.status === 'complete' &&
        !this.reachedTheEndOfPagination
      ) {
        await this.getItems();
      }
    }

    const topBar = document.querySelector('.top-bar') as HTMLElement;

    if (page.scrollTop > 10 && topBar) {
      topBar.style.display = 'none';
    } else if (topBar) {
      topBar.style.display = 'block';
    }
  }

  async getItems(restartPagination = false) {
    this.paginationState.status = 'loading';

    const saleflowItems = this.headerService.saleflow.items.map(
      (saleflowItem) => ({
        item: saleflowItem.item._id,
        customizer: saleflowItem.customizer?._id,
        index: saleflowItem.index,
      })
    );

    if (restartPagination) {
      this.paginationState.page = 1;
    } else {
      this.paginationState.page++;
    }

    const pagination: PaginationInput = {
      findBy: {
        _id: {
          __in: ([] = saleflowItems.map((items) => items.item)),
        },
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: this.paginationState.pageSize,
        page: this.paginationState.page,
      },
    };

    this.renderItemsPromise = this.saleflowService.listItems(pagination, true);
    this.renderItemsPromise
      .then((response) => {
        const items = response;
        const itemsQueryResult = items.listItems.filter((item) => {
          return item.status === 'active' || item.status === 'featured';
        });

        if (this.paginationState.page === 1) {
          this.items = itemsQueryResult;
        } else {
          this.items = this.items.concat(itemsQueryResult);
        }

        if (itemsQueryResult.length === 0) {
          this.reachedTheEndOfPagination = true;
        }

        this.paginationState.status = 'complete';
      })
      .catch((err) => {
        console.log(err);
      });
  }

  toggleItemInCart(index: number) {
    const item = this.items[index];

    /* Validaciones para saleflows donde solo se puede comprar un item a la vez */
    if (!item.isSelected && !this.headerService.saleflow.canBuyMultipleItems)
      this.headerService.emptyOrderProducts();
    /* ... */

    const product: ItemSubOrderInput = {
      item: item._id,
      amount: 1,
    };
    this.headerService.storeOrderProduct(product);
    this.appService.events.emit({
      type: 'added-item',
      data: item._id,
    });

    this.items[index].isSelected = !this.items[index].isSelected;

    if (this.items[index].isSelected)
      this.router.navigate([
        `/ecommerce/${this.headerService.saleflow.merchant.slug}/checkout`,
      ]);
  }

  shareStore() {
    this.ngNavigatorShareService
      .share({
        title: '',
        url: `${this.URI}/ecommerce/${this.headerService.saleflow.merchant.slug}/store`,
      })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
