// import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Item } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { StoreShareComponent } from 'src/app/shared/dialogs/store-share/store-share.component';
import { StoreShareList } from 'src/app/shared/dialogs/store-share/store-share.component';
import { ItemSettingsComponent } from 'src/app/shared/dialogs/item-settings/item-settings.component';

interface ExtendedItem extends Item {
  selected?: boolean;
}

@Component({
  selector: 'app-merchant-items',
  templateUrl: './merchant-items.component.html',
  styleUrls: ['./merchant-items.component.scss'],
})
export class MerchantItemsComponent implements OnInit {
  merchant: Merchant;
  saleflow: SaleFlow;
  items: ExtendedItem[] = [];
  ordersTotal: {
    total: number;
    length: number;
  };
  hasSalesData: boolean = false;
  status: 'idle' | 'loading' | 'complete' | 'error' = 'idle';
  selectionConfiguration: {
    mode: 'DELETE' | 'HIDE' | 'NONE';
    active: boolean;
  } = {
    active: false,
    mode: 'NONE',
  };

  // Dummy Data
  itemList: Array<any> = [
    {
      price: 0.0,
      quantity: 0,
    },
    {
      price: 0.01,
      quantity: 0,
    },
    {
      price: 0.02,
      quantity: 0,
    },
    {
      price: 0.03,
      quantity: 0,
    },
    {
      price: 0.04,
      quantity: 0,
    },
    {
      price: 0.05,
      quantity: 0,
    },
  ];

  constructor(
    private merchantsService: MerchantsService,
    private saleflowService: SaleFlowService,
    private itemsService: ItemsService,
    private ordersService: OrderService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    // private location: Location,
    private dialog: DialogService,
    private headerService: HeaderService
  ) {}

  async ngOnInit(): Promise<void> {
    lockUI();
    const status = this.route.snapshot.queryParamMap.get('status') as
      | 'active'
      | 'disabled';
    this.authService.ready.subscribe(async (observer) => {
      if (observer != undefined) {
        this.status = 'loading';
        const user = await this.authService.me();
        console.log(user);
        if (!user) this.errorScreen();

        // TODO: Replace this with a header service  call to get the merchant ID
        // const merchantID = "616a13a527bcf7b8ba3ac312";

        await this.getMerchant();

        await Promise.all([
          this.getOrderTotal(this.merchant._id),
          this.getItems(this.merchant._id, status),
        ]);
        this.status = 'complete';
        if (this.ordersTotal.total) this.hasSalesData = true;
        unlockUI();
      } else {
        this.errorScreen();
      }
    });
  }

  async getMerchant() {
    try {
      this.merchant = await this.merchantsService.merchantDefault();
      this.saleflow = await this.saleflowService.saleflowDefault(
        this.merchant._id
      );
    } catch (error) {
      this.status = 'error';
      console.log(error);
    }
  }

  async getItems(merchantID: string, status?: 'active' | 'disabled') {
    try {
      const items = (await this.itemsService.itemsByMerchant(merchantID, true))
        .itemsByMerchant;
      if (status === 'active')
        this.items = items.filter((item) => item.status === 'active');
      else if (status === 'disabled')
        this.items = items.filter((item) => item.status === 'disabled');
      else this.items = items;
    } catch (error) {
      this.status = 'error';
      console.log(error);
    }
  }

  markItemAsSelectedOrRemoveItsSelection = (targetItemData: {
    id: string | number;
    index: number;
    selected: boolean;
  }) => {
    this.items[targetItemData.index].selected = targetItemData.selected;
  };

  testing = () => {
    console.log('test');
  };

  async getOrderTotal(merchantID: string) {
    try {
      this.ordersTotal = await this.ordersService.ordersTotal(
        ['in progress', 'to confirm', 'completed'],
        merchantID
      );
    } catch (error) {
      this.status = 'error';
      console.log(error);
    }
  }

  goToDetail(id: string) {
    this.router.navigate([`admin/item-display/${id}`]);
  }

  errorScreen() {
    unlockUI();
    this.status = 'error';
    this.router.navigate([`others/error-screen/`]);
  }

  goToMetrics = () => {
    this.router.navigate([`admin/entity-detail-metrics`]);
  };

  back() {
    this.router.navigate([`admin/entity-detail-metrics`]);
  }

  createItem() {
    this.headerService.flowRoute = this.router.url;
    this.router.navigate([`admin/create-item/`]);
  }

  openDeleteDialog(item: Item) {
    const list: StoreShareList[] = [
      {
        title: `Eliminar ${item.name || 'producto'}?`,
        description:
          'Esta acción es irreversible, estás seguro que deseas eliminar este producto?',
        message: 'Eliminar',
        messageCallback: async () => {
          const removeItemFromSaleFlow =
            await this.saleflowService.removeItemFromSaleFlow(
              item._id,
              this.saleflow._id
            );
          if (!removeItemFromSaleFlow) return;
          const deleteItem = await this.itemsService.deleteItem(item._id);
          if (!deleteItem) return;
          this.items = this.items.filter(
            (listItem) => listItem._id !== item._id
          );
        },
      },
    ];

    this.dialog.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list,
        alternate: true,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  openSelectionDialog = () => {
    const operationFunction =
      this.selectionConfiguration.mode === 'DELETE' &&
      this.selectionConfiguration.active
        ? this.deleteMultipleItems
        : null;

    const list: StoreShareList[] = [
      {
        title: `¿Eliminar los productos seleccionados?`,
        description: 'Lorem ipsum',
        message: 'Si, Eliminar',
        messageCallback: operationFunction,
      },
    ];

    this.dialog.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list,
        alternate: true,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  };

  deleteMultipleItems = async () => {
    const selectedItems = this.items.filter((item) => item.selected);

    if (selectedItems.length > 0) {
      const arrayOfItemDeletionsFromSaleflowMutationPromises = [];

      selectedItems.forEach((item, index) => {
        arrayOfItemDeletionsFromSaleflowMutationPromises.push(
          this.deleteItem(item)
        );
      });

      Promise.all(arrayOfItemDeletionsFromSaleflowMutationPromises)
        .then((arrayOfResults) => {
          let objectOfItemsToDelete = {};

          for (const result of arrayOfResults) {
            if (result.success) {
              objectOfItemsToDelete[result.id] = true;
            }
          }

          this.items = this.items.filter(
            (item) => objectOfItemsToDelete[item._id] !== true
          );
          this.selectionConfiguration.mode = 'NONE';
          this.selectionConfiguration.active = false;
        })
        .catch((arrayOfErrors) => {
          console.log(arrayOfErrors);
        });
    }
  };

  deleteItem = (item: ExtendedItem): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        const removeItemFromSaleFlow =
          await this.saleflowService.removeItemFromSaleFlow(
            item._id,
            this.saleflow._id
          );
        if (!removeItemFromSaleFlow) return;
        const deletedItem = await this.itemsService.deleteItem(item._id);

        if (deletedItem)
          resolve({
            success: deletedItem,
            id: item._id,
          });
      } catch (error) {
        reject({
          success: false,
          id: null,
        });
      }
    });
  };

  openDialog = () => {
    const list: StoreShareList[] = [
      {
        title: 'GESTIÓN DE ITEMS',
        options: [
          {
            text: 'ADICIONAR',
            mode: 'func',
            func: () => {
              this.router.navigate(['admin/create-item/']);
            },
          },
          {
            text: 'BORRAR (ELIMINA LA DATA)',
            mode: 'func',
            func: () => {
              this.selectionConfiguration.mode = 'DELETE';
              this.selectionConfiguration.active = true;
            },
          },
        ],
      },
    ];

    this.dialog.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list,
        alternate: true,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  };

  editArticles = () => {
    const content: any = [
      {
        text: 'Adicionar nuevo artículo',
        callback: () => {
          this.router.navigate(['admin/create-item']);
        },
      },
      {
        text: 'Incluir artículos en otras categorias',
        callback: () => {
          console.log('opcion 2');
        },
      },
      {
        text: 'Eliminar artículos',
        callback: () => {
          console.log('opcion 3');
        },
      },
      {
        text: 'Compartir un grupo de artículos',
        callback: () => {
          console.log('opcion 4');
        },
      },
    ];

    this.dialog.open(ItemSettingsComponent, {
      type: 'fullscreen-translucent',
      customClass: 'app-dialog',
      flags: ['no-header'],
      props: {
        header: { text: 'Artículos' },
        content,
      },
    });
  };

  quitItemSelection = () => {
    if (this.selectionConfiguration.active) {
      this.items.forEach((item) => (item.selected = false));

      this.selectionConfiguration.active = false;
      this.selectionConfiguration.mode = 'NONE';
    }
  };
}
