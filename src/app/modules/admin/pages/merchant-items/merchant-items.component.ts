// import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Item, ItemStatus } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ItemSettingsComponent } from 'src/app/shared/dialogs/item-settings/item-settings.component';
import {
  StoreShareComponent,
  StoreShareList,
} from 'src/app/shared/dialogs/store-share/store-share.component';
interface ExtendedItem extends Item {
  selected?: boolean;
  changedSelection?: boolean;
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
  highlightedItems: ExtendedItem[] = [];
  ordersTotal: {
    total: number;
    length: number;
  };
  hasSalesData: boolean = false;
  status: 'idle' | 'loading' | 'complete' | 'error' = 'idle';
  selectionConfiguration: {
    mode: 'DELETE' | 'HIDE' | 'SHOW' | 'HIGHLIGHT' | 'NONE';
    active: boolean;
  } = {
    active: false,
    mode: 'NONE',
  };
  selectedItemsCounter: number = 0;
  statusQueryParam: ItemStatus;
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
    const status = this.route.snapshot.queryParamMap.get(
      'status'
    ) as ItemStatus;
    if (status) this.statusQueryParam = status;
    this.authService.ready.subscribe(async (observer) => {
      if (observer != undefined) {
        this.status = 'loading';

        await this.getMerchant();
        if (!this.merchant) {
          this.headerService.flowRoute = this.router.url;
          this.router.navigate([`auth/login/`]);
          unlockUI();
          return;
        }

        await Promise.all([
          this.getOrderTotal(this.merchant._id),
          this.getItems(this.merchant._id, status),
        ]);

        this.highlightedItems = [];
        for (const item of this.items) {
          if (item.status === 'featured') {
            this.highlightedItems.push(item);
          }
        }
        this.status = 'complete';
        if (this.ordersTotal?.total) this.hasSalesData = true;
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

  async getItems(merchantID: string, status?: ItemStatus) {
    try {
      const items = (await this.itemsService.itemsByMerchant(merchantID, true))
        .itemsByMerchant;

      if (status === 'active') {
        this.items = items.filter(
          (item) => item.status === 'active' || item.status === 'featured'
        );
      } else if (status === 'featured') {
        this.items = items.filter((item) => item.status === 'featured');
      } else if (status === 'disabled') {
        this.items = items.filter((item) => item.status === 'disabled');
      } else this.items = items;
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
    this.items[targetItemData.index].changedSelection = this.items[
      targetItemData.index
    ].changedSelection
      ? !this.items[targetItemData.index].changedSelection
      : true;

    this.selectedItemsCounter = this.items.reduce((total, number, index) => {
      return this.items[index].selected ? total + 1 : total + 0;
    }, 0);
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
    // this.router.navigate([`others/error-screen/`]);
    this.router.navigate([`auth/login`]);
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
        : ['HIDE', 'SHOW'].includes(this.selectionConfiguration.mode) &&
          this.selectionConfiguration.active
        ? this.hideMultipleItems
        : this.selectionConfiguration.mode === 'HIGHLIGHT' &&
          this.selectionConfiguration.active
        ? this.highlightMultipleItems
        : null;

    const list: StoreShareList[] = [
      {
        title:
          this.selectionConfiguration.mode === 'DELETE'
            ? `¿Eliminar los productos seleccionados?`
            : this.selectionConfiguration.mode === 'HIDE'
            ? `¿Esconder los productos seleccionados?`
            : this.selectionConfiguration.mode === 'SHOW'
            ? `¿Mostrar en la tienda los productos seleccionados?`
            : this.selectionConfiguration.mode === 'HIGHLIGHT'
            ? `¿Destacar en la tienda los productos seleccionados?`
            : null,
        titleStyles: {
          margin: 0,
        },
        description:
          this.selectionConfiguration.mode === 'DELETE'
            ? 'Estos cambios serán permanantes'
            : '',
        descriptionPosition: 'BOTTOM',
        message:
          this.selectionConfiguration.mode === 'DELETE'
            ? `Si, Eliminar`
            : this.selectionConfiguration.mode === 'HIDE'
            ? `Si, Esconder`
            : this.selectionConfiguration.mode === 'SHOW'
            ? `Si, Mostrar`
            : this.selectionConfiguration.mode === 'HIGHLIGHT'
            ? `Si, Destacar`
            : null,
        messageCallback: operationFunction,
      },
    ];

    this.dialog.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list,
        hideCancelButtton: true,
        alternate: true,
        dynamicStyles: {
          container: {
            paddingBottom: '45px',
          },
          dialogCard: {
            borderRadius: '25px',
            paddingTop: '47px',
            paddingBottom: '30px',
          },
          titleWrapper: {
            margin: 0,
            marginBottom: '42px',
          },
          description: {
            marginTop: '12px',
          },
          button: {
            border: 'none',
            margin: '0px',
          },
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  };

  deleteMultipleItems = async () => {
    const selectedItems = this.items.filter((item) => item.selected);

    try {
      if (selectedItems.length > 0) {
        const arrayOfResults = [];

        let itemIndex = 0;

        for (const item of selectedItems) {
          const deletedItem = await this.deleteItem(item);

          if (deletedItem) {
            arrayOfResults.push(deletedItem);
            console.log('Se borro este', deletedItem, 'index', itemIndex);
          }

          itemIndex += 1;
        }

        if (arrayOfResults.length > 0) {
          let objectOfItemsToDelete = {};

          for (const result of arrayOfResults) {
            if (result.success) {
              objectOfItemsToDelete[result.id] = true;
            }
          }

          this.items = this.items.filter(
            (item) => objectOfItemsToDelete[item._id] !== true
          );
          this.selectedItemsCounter = 0;
          this.selectionConfiguration.mode = 'NONE';
          this.selectionConfiguration.active = false;
          this.items.forEach((item) => {
            item.changedSelection = false;
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  hideMultipleItems = async () => {
    const selectedItems = this.items.filter((item) => item.selected);

    if (selectedItems.length > 0) {
      const arrayOfMutationsForHidingItemsPromises = [];

      selectedItems.forEach((item, index) => {
        if (item.changedSelection) {
          arrayOfMutationsForHidingItemsPromises.push(this.hideItem(item));
        }
      });

      Promise.all(arrayOfMutationsForHidingItemsPromises)
        .then(async (arrayOfResults) => {
          let objectOfItemsToHide = {};

          for (const result of arrayOfResults) {
            if (result.success) {
              objectOfItemsToHide[result.id] = true;
            }
          }

          if (this.statusQueryParam) {
            await this.getItems(this.merchant._id, this.statusQueryParam);
          } else {
            await this.getItems(this.merchant._id, null);
          }

          this.highlightedItems = [];
          for (const item of this.items) {
            if (item.status === 'featured') {
              this.highlightedItems.push(item);
            }
          }

          this.selectedItemsCounter = 0;
          this.selectionConfiguration.mode = 'NONE';
          this.selectionConfiguration.active = false;
        })
        .catch((arrayOfErrors) => {
          console.log(arrayOfErrors);
        });
    }
  };

  hideItem = (item: ExtendedItem): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        const updatedItem = await this.itemsService.updateItem(
          {
            status:
              item.status === 'active' || item.status === 'featured'
                ? 'disabled'
                : item.status === 'disabled'
                ? 'active'
                : 'draft',
          },
          item._id
        );

        if (updatedItem)
          resolve({
            success: true,
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

  deleteItem = (item: ExtendedItem): Promise<any> => {
    console.log('item to delete', item._id);

    return new Promise(async (resolve, reject) => {
      try {
        const removedItemFromSaleFlow =
          await this.saleflowService.removeItemFromSaleFlow(
            item._id,
            this.saleflow._id
          );

        if (!removedItemFromSaleFlow) return;
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

  highlightMultipleItems = async () => {
    const selectedItems = this.items.filter((item) => item.selected);

    if (selectedItems.length > 0) {
      const arrayOfMutationsForHightlightItemsPromises = [];

      selectedItems.forEach((item, index) => {
        if (item.changedSelection) {
          arrayOfMutationsForHightlightItemsPromises.push(
            this.hightlightItem(item)
          );
        }
      });

      Promise.all(arrayOfMutationsForHightlightItemsPromises)
        .then(async (arrayOfResults) => {
          if (this.statusQueryParam) {
            await this.getItems(this.merchant._id, this.statusQueryParam);
          } else {
            await this.getItems(this.merchant._id, null);
          }

          this.highlightedItems = [];
          for (const item of this.items) {
            if (item.status === 'featured') {
              this.highlightedItems.push(item);
            }
          }

          this.selectedItemsCounter = 0;
          this.selectionConfiguration.mode = 'NONE';
          this.selectionConfiguration.active = false;
        })
        .catch((arrayOfErrors) => {
          console.log(arrayOfErrors);
        });
    }
  };

  hightlightItem = (item: ExtendedItem): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        const updatedItem = await this.itemsService.updateItem(
          {
            status: 'featured',
          },
          item._id
        );

        if (updatedItem)
          resolve({
            success: true,
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
        titleStyles: {
          margin: '0px',
          marginTop: '15px',
          marginBottom: '25px',
        },
        options: [
          {
            text: 'ADICIONAR',
            mode: 'func',
            func: () => {
              this.router.navigate(['admin/create-item/']);
            },
          },
          {
            text: 'DESTACAR',
            mode: 'func',
            func: async () => {
              this.selectedItemsCounter = 0;

              await this.getItems(this.merchant._id, null);
              this.items = this.items.filter((item) => {
                if (item.status === 'featured') return false;
                else {
                  item.selected = false;
                  item.changedSelection = false;
                  return true;
                }
              });

              this.selectionConfiguration.mode = 'HIGHLIGHT';
              this.selectionConfiguration.active = true;
            },
          },
          {
            text: 'ESCONDER',
            mode: 'func',
            func: async () => {
              this.selectionConfiguration.mode = 'HIDE';
              this.selectionConfiguration.active = true;
              this.selectedItemsCounter = 0;

              await this.getItems(this.merchant._id, null);

              this.items = this.items.filter((item) => {
                if (item.status === 'disabled') return false;
                else {
                  item.selected = false;
                  item.changedSelection = false;
                  return true;
                }
              });
            },
          },
          /*{
            text: 'MOSTRAR ITEMS INVISIBLES EN LA TIENDA',
            mode: 'func',
            func: async () => {
              this.selectionConfiguration.mode = 'SHOW';
              this.selectionConfiguration.active = true;
              this.selectedItemsCounter = 0;

              await this.getItems(this.merchant._id, null);

              this.items = this.items.filter((item) => {
                if (item.status === 'disabled') {
                  item.selected = false;
                  item.changedSelection = false;
                  return true;
                } else {
                  return false;
                }
              });
            },
          },*/
          {
            text: 'BORRAR (ELIMINA LA DATA)',
            mode: 'func',
            func: async () => {
              this.selectedItemsCounter = 0;

              await this.getItems(this.merchant._id, null);

              this.items.forEach((item) => {
                item.selected = false;
                item.changedSelection = false;
              });

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
        hideCancelButtton: true,
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

  quitItemSelection = async () => {
    if (this.selectionConfiguration.active) {
      this.selectedItemsCounter = 0;

      if (this.statusQueryParam)
        await this.getItems(this.merchant._id, this.statusQueryParam);
      else await this.getItems(this.merchant._id, null);

      this.items.forEach((item) => {
        item.selected = false;
        item.changedSelection = false;
      });

      this.selectionConfiguration.active = false;
      this.selectionConfiguration.mode = 'NONE';
    }
  };

  goToEntityDetailMetrics = () => {
    this.router.navigate(['admin/entity-detail-metrics']);
  };
}
