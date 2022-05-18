import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { Item, ItemPackage } from 'src/app/core/models/item';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { WarningStepsComponent } from 'src/app/shared/dialogs/warning-steps/warning-steps.component';
import { lockUI } from 'src/app/core/helpers/ui.helpers';
import { ItemsService } from 'src/app/core/services/items.service';
import { ItemSubOrderParamsInput } from 'src/app/core/models/order';

@Component({
  selector: 'app-provider-store',
  templateUrl: './provider-store.component.html',
  styleUrls: ['./provider-store.component.scss'],
})
export class ProviderStoreComponent implements OnInit {
  constructor(
    private header: HeaderService,
    private saleflow: SaleFlowService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: DialogService,
    private itemService: ItemsService,
    private readonly app: AppService
  ) {
    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        for (let i = 0; i < this.options.length; i++) {
          this.options[i].active = false;
        }
        if (this.router.url.includes('select-pack')) {
          for (var i = 0; i < this.options.length; i++) {
            if (this.options[i].link == 'select-pack') {
              this.options[i].active = true;
              break;
            }
          }
        }
        if (this.router.url.includes('quantity-and-quality')) {
          for (var i = 0; i < this.options.length; i++) {
            if (this.options[i].link == 'quantity-and-quality') {
              this.options[i].active = true;
              break;
            }
          }
        }
        if (this.router.url.includes('redirect-to-customizer')) {
          for (var i = 0; i < this.options.length; i++) {
            if (this.options[i].link == 'redirect-to-customizer') {
              this.options[i].active = true;
              break;
            }
          }
        }
        if (this.router.url.includes('reservation')) {
          for (var i = 0; i < this.options.length; i++) {
            if (this.options[i].option == 'Reservación') {
              this.options[i].active = true;
              break;
            }
          }
        }
        if (this.router.url.includes('gift-message')) {
          for (var i = 0; i < this.options.length; i++) {
            if (this.options[i].link == 'gift-message') {
              this.options[i].active = true;
              break;
            }
          }
        }
        if (this.router.url.includes('pick-location')) {
          for (var i = 0; i < this.options.length; i++) {
            if (this.options[i].link == 'pick-location') {
              this.options[i].active = true;
              break;
            }
          }
        }
        if (this.router.url.includes('user-info')) {
          for (var i = 0; i < this.options.length; i++) {
            if (this.options[i].link == 'user-info') {
              this.options[i].active = true;
              break;
            }
          }
        }
        if (this.router.url.includes('payment-methods')) {
          for (var i = 0; i < this.options.length; i++) {
            if (this.options[i].link == 'payment-methods') {
              this.options[i].active = true;
              break;
            }
          }
        }
      }
    });
    const sub = this.app.events
      .pipe(filter((e) => e.type === 'order-done'))
      .subscribe((e) => {
        if (e.data) {
          this.deleteRoutes();
          sub.unsubscribe();
        }
      });
  }

  applyAnimations: boolean = false;

  options: any[] = [];

  products: (Item | ItemPackage)[] = [];

  mouseDown = false;
  startX: any;
  scrollLeft: any;
  headline: string;
  finalizacion: boolean = false;
  aux: any;
  aux2: any;
  status: 'idle' | 'loading' | 'done' = 'idle';

  async fillData() {
    this.status = 'loading';
    this.headline = this.header.saleflow?.merchant?.name;
    if (this.header.items.length > 0 && this.header.items[0].customizerId) {
      this.options.push({
        option: 'Calidades',
        link: 'quantity-and-quality',
        active: false,
      });
      // this.options.push({
      //   option: 'Personalización',
      //   link: 'redirect-to-customizer',
      //   active: false,
      // });
    }
    if (this.header.order.itemPackage) {
      this.options.push({
        option: 'Escenarios',
        link: 'select-pack',
        active: false,
      });
    }
    if (this.header.saleflow?.module.appointment) {
      if (this.header.saleflow.module.appointment.isActive) {
        this.options.push({
          option: 'Reservación',
          link: 'reservation/' + this.header.saleflow._id,
          active: false,
        });
      }
    }
    if (this.header.saleflow?.module.post) {
      if (this.header.saleflow.module.post.isActive) {
        this.options.push({
          option: 'Mensaje',
          link: 'gift-message',
          active: false,
        });
      }
    }
    if (this.header.saleflow?.module.delivery) {
      if (this.header.saleflow.module.delivery.isActive) {
        if (this.header.saleflow.module.delivery.deliveryLocation) {
          this.options.push({
            option: 'Entrega',
            link: 'pick-location',
            active: false,
          });
        } else {
          if (this.header.saleflow.module.delivery.pickUpLocations.length > 1) {
            this.options.push({
              option: 'Entrega',
              link: 'pick-location',
              active: false,
            });
          } else {
            if (
              this.header.saleflow.module.delivery.pickUpLocations.length === 1
            ) {
              this.header.locationData =
                this.header.saleflow.module.delivery.pickUpLocations[0];
              this.header.order.products[0].deliveryLocation =
                this.header.saleflow.module.delivery.pickUpLocations[0];
              this.header.isComplete.delivery = true;
              this.header.storeOrderProgress(this.header.saleflow._id);
              this.header.storeLocation(
                this.header.getSaleflow()._id,
                this.header.saleflow.module.delivery.pickUpLocations[0]
              );
            }
          }
        }
      }
    }
    this.options.push({
      option: 'Info',
      link: 'user-info',
      active: false,
    });

    if (this.header.saleflow?._id === '61b8df151e8962cdd6f30feb') {
      this.aux = this.options.find((el) => (el.option = 'Reservación'));
      this.options.splice(
        this.options.findIndex((el) => (el.option = 'Reservación')),
        1
      );
      this.aux2 = this.options.pop();

      this.options.push(this.aux);
      this.options.push(this.aux2);
    }

    if (this.options.some((option) => this.router.url.includes(option.link))) {
      const index = this.options.findIndex((option) =>
        this.router.url.includes(option.link)
      );
      this.changeOption(index);
    } else if (this.options.length > 0) {
      this.changeOption(0);
      this.router.navigate([this.options[0].link], { relativeTo: this.route });
    }
    if (this.header.items.length > 0) {
      this.products = this.header.items;
      this.status = 'done';
    } else {
      let products: string[] = [];
      let packages: string[] = [];
      if (this.header.order.itemPackage) {
        packages.push(this.header.order.itemPackage);
        const listPackages = (
          await this.saleflow.listPackages({
            findBy: {
              _id: {
                __in: ([] = packages),
              },
            },
          })
        ).listItemPackage;
        this.products = listPackages;
        this.status = 'done';
      } else {
        for (let i = 0; i < this.header.order.products.length; i++) {
          products.push(this.header.order.products[i].item);
        }
        this.findItemData(products);
      }
    }
  }

  async getData(saleflowId: string, itemId: string) {
    try {
      const saleflow = (await this.saleflow.saleflow(saleflowId)).saleflow;
      this.header.saleflow = saleflow;
      this.header.storeSaleflow(saleflow);
      const saleflowItem = saleflow.items.find(
        (item) => item.item._id === itemId
      );
      if (saleflowItem)
        this.getItemData(saleflowId, itemId, saleflowItem.customizer._id);
    } catch (error) {
      console.log(error);
      this.router.navigate([`/ecommerce/trivias`]);
    }
  }

  async getItemData(saleflowId: string, itemId: string, customizerId: string) {
    try {
      const item = await this.itemService.item(itemId);
      this.header.emptyOrderProducts(saleflowId);
      this.header.emptyItems(saleflowId);
      this.header.resetIsComplete();
      item.customizerId = customizerId;
      this.header.items = [item];
      let itemParams: ItemSubOrderParamsInput[];
      if (item.params.length > 0) {
        itemParams = [
          {
            param: item.params[0]._id,
            paramValue: item.params[0].values[0]._id,
          },
        ];
      }
      const product = {
        item: item._id,
        customizer: customizerId,
        params: itemParams,
        amount: item.customizerId ? undefined : 1,
        saleflow: saleflowId,
        name: item.name,
      };
      this.header.order = {
        products: [product],
      };
      this.header.storeOrderProduct(saleflowId, product);
      this.header.storeItem(saleflowId, item);
      return lockUI(this.fillData());
    } catch (error) {
      console.log(error);
      this.router.navigate([`/ecommerce/trivias`]);
    }
  }

  async ngOnInit() {
    if (this.header.orderId) return this.router.navigate([`/ecommerce/order-info/${this.header.orderId}`]);
    let saleflowId: string;
    let itemId: string;
    this.route.params.subscribe((params) => {
      saleflowId = params.saleflowId;
      itemId = params.itemId;
      this.header.flowRoute = `provider-store/${saleflowId}/${itemId}`;
      localStorage.setItem(
        'flowRoute',
        `provider-store/${saleflowId}/${itemId}`
      );
    });
    if (!this.header.saleflow) {
      const saleflow = this.header.getSaleflow();
      if(!saleflow) return this.getData(saleflowId, itemId);
      this.header.saleflow = saleflow;
      this.header.order = this.header.getOrder(saleflow._id);
      if(!this.header.order) return this.getData(saleflowId, itemId);
      this.header.getOrderProgress(saleflow._id);
      const items: Item[] = this.header.getItems(saleflow._id);
      if (
        items &&
        items.length > 0 &&
        this.header.order.products.length > 0 &&
        this.header.order.products[0].item === items[0]._id &&
        items[0]._id === itemId
      ) {
        this.header.items = items;
        return lockUI(this.fillData());
      }
      else return this.getData(saleflowId, itemId);
    }
    if(this.header.saleflow._id !== saleflowId) return this.getData(saleflowId, itemId);
    this.header.order = this.header.getOrder(this.header.saleflow._id);
    if(!this.header.order) return this.getData(saleflowId, itemId);
    const items: Item[] = this.header.getItems(this.header.saleflow._id);
    if (
      items &&
      items.length > 0 &&
      this.header.order.products.length > 0 &&
      this.header.order.products[0].item === items[0]._id &&
      items[0]._id === itemId
    ) {
      this.header.items = items;
      return lockUI(this.fillData());
    }
    else return this.getData(saleflowId, itemId);
  }

  changeOption(index: any) {
    for (let i = 0; i < this.options.length; i++) {
      if (i == index) {
        this.options[i].active = true;
      } else {
        this.options[i].active = false;
      }
    }
  }

  findItemData(products) {
    this.saleflow
      .listItems({
        findBy: {
          _id: {
            __in: ([] = products),
          },
        },
      })
      .then((data) => {
        this.products = data.listItems;
        this.status = 'done';
      });
  }

  openDialog() {
    this.dialog.open(WarningStepsComponent, {
      type: 'action-sheet',
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  startDragging(e, flag, el) {
    this.mouseDown = true;
    this.startX = e.pageX - el.offsetLeft;
    this.scrollLeft = el.scrollLeft;
  }

  stopDragging(e, flag) {
    this.mouseDown = false;
  }

  moveEvent(e, el) {
    e.preventDefault();
    if (!this.mouseDown) {
      return;
    }
    const x = e.pageX - el.offsetLeft;
    const scroll = x - this.startX;
    el.scrollLeft = this.scrollLeft - scroll;
  }

  deleteRoutes() {
    this.options = [];
    this.options.push({
      option: 'Finalización',
      link: 'payment-methods',
      active: false,
    });
    this.router.navigate([
      `/ecommerce/provider-store/${this.header.saleflow?._id}/${this.header.items[0]._id}/payment-methods`,
    ]);
    this.finalizacion = true;
  }

  goback() {
    /*if (this.header.categoryId) {
      this.router.navigate([`ecommerce/category-items/${this.header.saleflow._id}/${this.header.categoryId}`])
    } else {
      this.router.navigate([
        '/ecommerce/megaphone-v3/' + this.header.saleflow._id,
      ]);
    }*/
    //this.location.back();
    this.router.navigate([
      '/ecommerce/megaphone-v3/' + this.header.saleflow._id,
    ]);
  }
}
