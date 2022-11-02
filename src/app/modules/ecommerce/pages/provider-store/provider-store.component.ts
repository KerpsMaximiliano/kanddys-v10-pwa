import { LocationStrategy } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { lockUI } from 'src/app/core/helpers/ui.helpers';
import { Item } from 'src/app/core/models/item';
import { ItemSubOrderParamsInput } from 'src/app/core/models/order';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
import { WarningStepsComponent } from 'src/app/shared/dialogs/warning-steps/warning-steps.component';

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
    private readonly app: AppService,
    private location: LocationStrategy
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

  products: Item[] = [];

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
              this.header.order.products[0].deliveryLocation =
                this.header.saleflow.module.delivery.pickUpLocations[0];
              this.header.orderProgress.delivery = true;
              this.header.storeOrderProgress();
              this.header.storeLocation(
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
      for (let i = 0; i < this.header.order.products.length; i++) {
        products.push(this.header.order.products[i].item);
      }
      this.findItemData(products);
    }
  }

  async getData(itemId: string) {
    try {
      const saleflowItem = this.header.saleflow.items.find(
        (item) => item.item._id === itemId
      );
      if (saleflowItem) this.getItemData(itemId, saleflowItem.customizer._id);
    } catch (error) {
      console.log(error);
      this.router.navigate([`/ecommerce/trivias`]);
    }
  }

  async getItemData(itemId: string, customizerId: string) {
    try {
      const item = await this.itemService.item(itemId);
      this.header.emptyOrderProducts();
      this.header.emptyItems();
      this.header.resetOrderProgress();
      item.customizerId = customizerId;
      this.header.items = [item];
      this.router.navigate([
        `/ecommerce/${this.header.saleflow._id}/provider-store/${this.header.items[0]._id}/quantity-and-quality`,
      ]);
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
        saleflow: this.header.saleflow._id,
      };
      this.header.order = {
        products: [product],
      };
      this.header.storeOrderProduct(product);
      this.header.storeItem(item);
      return lockUI(this.fillData());
    } catch (error) {
      console.log(error);
      this.router.navigate([`/ecommerce/trivias`]);
    }
  }

  async ngOnInit() {
    // if (this.header.orderId) return this.router.navigate([`/ecommerce/order-info/${this.header.orderId}`]);
    const itemId = this.route.snapshot.paramMap.get('itemId');
    this.header.flowRoute = `provider-store/${itemId}`;
    localStorage.setItem('flowRoute', `provider-store/${itemId}`);
    const items: Item[] = this.header.getItems();
    if (
      items &&
      items.length > 0 &&
      this.header.order.products.length > 0 &&
      this.header.order.products[0].item === items[0]._id &&
      items[0]._id === itemId
    ) {
      this.header.items = items;
      return lockUI(this.fillData());
    } else return this.getData(itemId);
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
    this.options = [
      {
        option: 'Info',
        link: 'user-info',
        active: true,
      },
    ];
    this.finalizacion = true;
    history.pushState(null, null, window.location.href);
    this.location.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });
  }

  goback() {
    /*if (this.header.categoryId) {
      this.router.navigate([`ecommerce/${this.header.saleflow._id}/category-items/${this.header.categoryId}`])
    } else {
      this.router.navigate([
        '/ecommerce/store/' + this.header.saleflow._id,
      ]);
    }*/
    //this.location.back();
    this.router.navigate([`/ecommerce/${this.header.saleflow._id}/store`]);
  }

  openImageDetail() {
    this.dialog.open(ImageViewComponent, {
      type: 'fullscreen-translucent',
      props: {
        imageSourceURL: this.header.items[0].images[0],
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }
}
