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
import { Location } from '@angular/common';
import { lockUI } from 'src/app/core/helpers/ui.helpers';
import { environment } from 'src/environments/environment';

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
    private location: Location,
    private authService: AuthService,
    private dialog: DialogService,
    private readonly app: AppService
  ) {
    router.events.subscribe((val) => {
      // see also
      // console.log(val instanceof NavigationEnd);
      // console.log(this.router.url);
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
          console.log('entré');

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
        console.log(e.data);
        if (e.data) {
          console.log('entré');
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
      this.options.push({
        option: 'Personalización',
        link: 'redirect-to-customizer',
        active: false,
      });
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
              this.header.storeLocation(this.header.getSaleflow()._id, this.header.saleflow.module.delivery.pickUpLocations[0]);
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

    if(this.header.saleflow?._id === '61b8df151e8962cdd6f30feb') {
      this.aux = this.options.find(el => el.option = 'Reservación');
      this.options.splice(this.options.findIndex(el => el.option = 'Reservación'), 1);
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
        console.log(listPackages);
        this.products = listPackages;
        this.status = 'done';
      } else {
        for (let i = 0; i < this.header.order.products.length; i++) {
          products.push(this.header.order.products[i].item);
        }
        console.log(this.products);
        this.findItemData(products);
      }
    }
  }

  async ngOnInit(): Promise<void> {
    this.header.flowRoute = 'provider-store';
    if (this.header.orderId) {
      this.router.navigate([`/ecommerce/order-info/${this.header.orderId}`]);
      return;
    };
    if(!this.header.saleflow) {
      const saleflow = this.header.getSaleflow();
      if(saleflow) {
        this.header.saleflow = saleflow;
        this.header.order = this.header.getOrder(saleflow._id);
        if(!this.header.order) {
          this.router.navigate([`/ecommerce/trivias`]);
          return;
        }
        this.header.getOrderProgress(saleflow._id);
        const items = this.header.getItems(saleflow._id);
        if(items && items.length > 0) this.header.items = items;
        else this.router.navigate([`/ecommerce/trivias`]);
        lockUI(this.fillData());
      } else this.router.navigate([`/ecommerce/trivias`]);
    } else {
      this.header.order = this.header.getOrder(this.header.saleflow._id);
      if(!this.header.order) this.router.navigate([`/ecommerce/trivias`]);
      else lockUI(this.fillData());
    }
  }

  changeOption(index: any) {
    for (let i = 0; i < this.options.length; i++) {
      if (i == index) {
        this.options[i].active = true;
      } else {
        this.options[i].active = false;
      }
    }
    console.log(this.options);
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
        console.log(this.products);
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
    console.log(e);
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
    this.router.navigate(['/ecommerce/provider-store/payment-methods']);
    console.log(this.options);
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
