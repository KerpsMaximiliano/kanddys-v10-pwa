import { Location } from '@angular/common';
import { Injectable, EventEmitter } from '@angular/core';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { CustomizerValueInput } from '../models/customizer-value';
import { Merchant } from '../models/merchant';
import {
  ItemOrderInput,
  ItemSubOrderInput,
  ItemSubOrderParamsInput,
} from '../models/order';
import { PostInput } from '../models/post';
import { ReservationInput } from '../models/reservation';
import { DeliveryLocationInput, SaleFlow } from '../models/saleflow';
import { Session } from '../models/session';
import { User } from '../models/user';
import { AuthService } from './auth.service';
import { BookmarksService } from './bookmarks.service';
import { CustomizerValueService } from './customizer-value.service';
import { Item, ItemParamValue } from '../models/item';
import { MerchantsService } from './merchants.service';
import { OrderService } from './order.service';
import { PostsService } from './posts.service';
import { SaleFlowService } from './saleflow.service';
import { WalletService } from './wallet.service';
import { DeliveryZoneInput } from '../models/deliveryzone';

class OrderProgress {
  qualityQuantity: boolean;
  customizer: boolean;
  scenarios: boolean;
  reservation: boolean;
  message: boolean;
  delivery: boolean;
}

export class SaleflowData {
  deliveryZone: DeliveryZoneInput;
  order: ItemOrderInput;
  post: PostInput;
  deliveryLocation: DeliveryLocationInput;
  reservation: ReservationInput;
  orderProgress: OrderProgress;
  customizer: CustomizerValueInput;
  customizerPreviewBase64: string;
  anonymous: boolean;
  date: any;
}

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  orderId: string;
  user: User;
  walletData: any;
  datePreview: any;
  flowImage: any = [];
  savedBookmarks: any;
  items: string[] = [];
  order: ItemOrderInput;
  post: PostInput;
  saleflow: SaleFlow;
  categoryId: string;
  customizer: CustomizerValueInput;
  customizerData: {
    willModify: boolean;
    route?: string;
    elementList: any;
    backgroundUrl: string;
    backgroundImage: File;
    backgroundColor: { name?: string; fixedValue?: string };
    stickersAmount: number;
    textsAmount: number;
    id: string;
  };
  merchantInfo: Merchant;
  myMerchants: Merchant[];
  tags: any;
  orderProgress: OrderProgress = {
    qualityQuantity: false,
    customizer: false,
    scenarios: false,
    reservation: false,
    message: false,
    delivery: false,
  };
  currentMessageOption: number;
  currentDeliveryOption: number;
  hasScenarios: boolean;
  fromOrderSales: string;
  flowRoute: string;
  paramHasColor: boolean;
  paramHasImage: boolean;
  newTempItem: Item;
  newTempItemRoute: string = null;
  checkoutRoute: string;
  loadedMerchants = new EventEmitter();
  colorTheme: '#2874AD' | '#272727' = '#272727';
  ordersPageTemporalData: Record<string, any> = null;
  dashboardTemporalData: Record<string, any> = null;
  storeTemporalData: Record<string, any> = null;
  entityTemplateTemporalData: Record<string, any> = null;
  aiJokes: Array<string> = [];
  selectedJoke: string = null;

  public session: Session;
  constructor(
    private location: Location,
    private app: AppService,
    private auth: AuthService,
    public wallet: WalletService,
    private bookmark: BookmarksService,
    private merchantService: MerchantsService,
    private customizerValueService: CustomizerValueService,
    private orderService: OrderService,
    private saleflowService: SaleFlowService,
    private postsService: PostsService
  ) {
    this.auth.me().then((data) => {
      if (data != undefined) {
        this.user = data;
      } else {
        this.user = undefined;
        this.walletData = undefined;
        this.savedBookmarks = undefined;

        if (this.session) this.session.revoke();
      }
    });
    const sub = this.app.events
      .pipe(filter((e) => e.type === 'auth'))
      .subscribe((e) => {
        if (e.data) {
          console.log('Autenticando o refrescando token');

          this.user = e.data.user;
          this.wallet.globalWallet().then((data) => {
            this.walletData = data.globalWallet;
          });
          this.bookmark.bookmarkByUser().then((data) => {
            if (data.bookmarkByUser) {
              this.savedBookmarks = data.bookmarkByUser;
            }
          });
          this.merchantService.myMerchants().then((data) => {
            this.myMerchants = data;
            this.loadedMerchants.emit(true);
          });
        } else {
          this.user = null;
          this.walletData = null;
          this.savedBookmarks = null;
          this.myMerchants = null;
          this.loadedMerchants.emit(false);
        }
      });
    // const sub1 = this.app.events
    //   .pipe(filter((e) => e.type === 'singleAuth'))
    //   .subscribe((e) => {
    //     if (e.data) {
    //       this.isLogged = true;
    //       this.user = e.data.user;
    //       this.wallet.globalWallet().then((data) => {
    //         this.walletData = data.globalWallet;
    //       });
    //       this.bookmark.bookmarkByUser().then((data) => {
    //         if (data.bookmarkByUser) {
    //           this.savedBookmarks = data.bookmarkByUser;
    //         }
    //       });
    //     } else {
    //       this.user = null;
    //     }
    //   });
  }
  goBack() {
    this.location.back();
  }

  orderInputComplete(): boolean {
    if (!this.saleflow) return;
    if (this.saleflow.module?.delivery?.isActive) {
      const location = this.getLocation();
      const zone = this.getZone();
      if ((!location && !zone) || !this.orderProgress.delivery) return;
    }
    if (this.saleflow.items.some((item) => item.customizer)) {
      if (!this.orderProgress.qualityQuantity) return;
      if (!this.orderProgress.customizer) return;
    }
    if (this.saleflow.module?.appointment?.isActive) {
      const reservation = this.getReservation();
      if (!reservation || !reservation.date || !this.orderProgress.reservation)
        return;
    }

    /*
    if (this.saleflow.module?.post?.isActive) {
      const post = this.getPost();
      if (!post) return;
    }*/

    if (this.hasScenarios) {
      if (!this.orderProgress.scenarios) return;
    }
    //console.log('Completo');
    return true;
  }

  isDataComplete(): boolean {
    if (!this.saleflow) return;
    if (
      this.saleflow.module.delivery &&
      this.saleflow.module.delivery.isActive
    ) {
      if (!this.orderProgress.delivery) return;
    }
    if (
      this.saleflow.module.appointment &&
      this.saleflow.module.appointment.isActive
    ) {
      if (!this.orderProgress.reservation) return;
    }
    if (this.hasScenarios) {
      if (!this.orderProgress.scenarios) return;
    }
    if (this.saleflow.module.post && this.saleflow.module.post.isActive) {
      if (!this.orderProgress.message) return;
    }
    return true;
  }

  resetOrderProgress() {
    this.orderProgress = {
      scenarios: false,
      reservation: false,
      qualityQuantity: false,
      customizer: false,
      message: false,
      delivery: false,
    };
  }
  async saveBookmarks() {
    await this.bookmark.bookmarkByUser().then((data) => {
      this.savedBookmarks = data.bookmarkByUser;
    });
    return this.savedBookmarks;
  }

  async fetchSaleflow(id: string) {
    if (!this.saleflow || this.saleflow._id !== id)
      this.saleflow = (await this.saleflowService.saleflow(id))?.saleflow;
    else this.saleflowService.saleflowLoaded.next(this.saleflow);
    this.storeSaleflow(this.saleflow);
    return this.saleflow;
  }

  storeSaleflow(saleflow: SaleFlow) {
    localStorage.setItem('saleflow-data', JSON.stringify(saleflow));
  }

  getSaleflow(): SaleFlow {
    const saleflow = JSON.parse(localStorage.getItem('saleflow-data'));
    this.saleflow = saleflow;
    this.saleflowService.saleflowLoaded.next(this.saleflow);
    return saleflow;
  }

  // Stores order input in localStorage
  storeOrder(order: ItemOrderInput) {
    let rest: SaleflowData =
      JSON.parse(localStorage.getItem(this.saleflow._id)) || {};
    localStorage.setItem(
      this.saleflow._id,
      JSON.stringify({
        ...rest,
        order,
      })
    );
  }

  // Stores order product data in localStorage
  storeOrderProduct(product: ItemSubOrderInput) {
    let { order, ...rest }: SaleflowData =
      JSON.parse(localStorage.getItem(this.saleflow._id)) || {};
    if (!order) order = {};
    if (!order.products) order.products = [];
    const index = order.products.findIndex(
      (subOrder) =>
        (!product.params?.length && subOrder.item === product.item) ||
        (product.params?.length &&
          subOrder.params?.[0]?.paramValue === product.params[0].paramValue)
    );
    if (!this.order) {
      this.order = {
        products: [],
      };
    }
    if (index >= 0) {
      order.products.splice(index, 1);
      this.order?.products?.splice(index, 1);
    } else {
      order.products.push(product);
      this.order?.products?.push(product);
    }
    localStorage.setItem(this.saleflow._id, JSON.stringify({ order, ...rest }));
  }

  // Adds params to first order product in localStorage
  addParams(params: ItemSubOrderParamsInput) {
    let { order, ...rest }: SaleflowData =
      JSON.parse(localStorage.getItem(this.saleflow._id)) || {};
    if (!order) return;
    if (!order.products || order.products.length === 0) return;
    order.products[0].params[1] = params;
    localStorage.setItem(this.saleflow._id, JSON.stringify({ order, ...rest }));
  }

  // Stores amount to first order product in localStorage
  changeItemAmount(productId: string, type: 'add' | 'subtract') {
    let { order, ...rest }: SaleflowData =
      JSON.parse(localStorage.getItem(this.saleflow._id)) || {};
    if (!order) return;
    if (!order.products || order.products.length === 0) return;
    const index = order.products.findIndex(
      (product) => product.item === productId
    );
    if (index < 0) return;
    if (type === 'add') {
      order.products[index].amount++;
      this.order.products[index].amount++;
    }
    if (type === 'subtract' && order.products[index].amount > 1) {
      order.products[index].amount--;
      this.order.products[index].amount--;
    }
    localStorage.setItem(this.saleflow._id, JSON.stringify({ order, ...rest }));
  }

  // Stores reservation to first order product in localStorage
  storeReservation(reservation: ReservationInput, date: any) {
    let rest: SaleflowData =
      JSON.parse(localStorage.getItem(this.saleflow._id)) || {};
    localStorage.setItem(
      this.saleflow._id,
      JSON.stringify({ ...rest, reservation, date })
    );
  }

  // Stores post data in localStorage
  storePost(post: PostInput) {
    let rest: SaleflowData =
      JSON.parse(localStorage.getItem(this.saleflow._id)) || {};
    localStorage.setItem(this.saleflow._id, JSON.stringify({ ...rest, post }));
  }

  // Stores location to first order product in localStorage
  storeLocation(deliveryLocation: DeliveryLocationInput) {
    let rest: SaleflowData =
      JSON.parse(localStorage.getItem(this.saleflow._id)) || {};
    localStorage.setItem(
      this.saleflow._id,
      JSON.stringify({
        ...rest,
        deliveryLocation,
      })
    );
  }

  // Stores location to first order product in localStorage
  storeZone(deliveryZone: DeliveryZoneInput) {
    let rest: SaleflowData =
      JSON.parse(localStorage.getItem(this.saleflow._id)) || {};
    localStorage.setItem(
      this.saleflow._id,
      JSON.stringify({
        ...rest,
        deliveryZone,
      })
    );
  }

  storeOrderProgress() {
    let rest: SaleflowData =
      JSON.parse(localStorage.getItem(this.saleflow._id)) || {};
    localStorage.setItem(
      this.saleflow._id,
      JSON.stringify({ ...rest, orderProgress: this.orderProgress })
    );
  }

  storeOrderAnonymous() {
    let rest: SaleflowData =
      JSON.parse(localStorage.getItem(this.saleflow._id)) || {};
    localStorage.setItem(
      this.saleflow._id,
      JSON.stringify({ ...rest, anonymous: true })
    );
  }

  storeCustomizer(customizer: CustomizerValueInput) {
    delete customizer?.preview;
    let saleflowData: SaleflowData =
      JSON.parse(localStorage.getItem(this.saleflow._id)) || {};
    saleflowData.customizer = customizer;
    localStorage.setItem(this.saleflow._id, JSON.stringify(saleflowData));
  }

  storeCustomizerPreviewBase64(
    customizerPreviewBase64: string,
    filename: string,
    type: string
  ) {
    localStorage.setItem(
      'customizerFile',
      JSON.stringify({
        base64: customizerPreviewBase64,
        filename,
        type,
      })
    );
  }

  storeMultistepFormImages(multistepFormImage: any) {
    let images: any = localStorage.getItem('multistepformimages');
    if (!images) images = [];
    images.push(multistepFormImage);
    localStorage.setItem('multistepformimages', JSON.stringify(images));
  }

  // Returns order data from localStorage
  getOrder() {
    let { order }: SaleflowData =
      JSON.parse(localStorage.getItem(this.saleflow._id)) || {};

    if (order && 'itemPackage' in order) delete order.itemPackage;

    this.order = order;
    return order;
  }

  // Returns items data from localStorage
  getItems(): string[] {
    let { order }: SaleflowData =
      JSON.parse(localStorage.getItem(this.saleflow._id)) || {};
    this.items = order?.products?.map((value) => value.item) || [];
    return this.items;
  }

  // Return order reservation
  getReservation(): {
    reservation: ReservationInput;
    date: any;
  } {
    let { reservation, date }: SaleflowData =
      JSON.parse(localStorage.getItem(this.saleflow._id)) || {};
    return {
      reservation,
      date,
    };
  }

  // Returns post data and option from provider-store
  getPost() {
    let { post }: SaleflowData =
      JSON.parse(localStorage.getItem(this.saleflow._id)) || {};
    return this.post || post;
  }

  getLocation() {
    let { deliveryLocation }: SaleflowData =
      JSON.parse(localStorage.getItem(this.saleflow._id)) || {};
    return deliveryLocation;
  }

  getZone() {
    let { deliveryZone }: SaleflowData =
      JSON.parse(localStorage.getItem(this.saleflow._id)) || {};
    return deliveryZone;
  }

  // Returns order creation progress
  getOrderProgress() {
    let { orderProgress }: SaleflowData =
      JSON.parse(localStorage.getItem(this.saleflow._id)) || {};
    if (orderProgress) {
      this.hasScenarios = orderProgress.scenarios;
      this.orderProgress = orderProgress;
    }
  }

  // Returns order auth type
  getOrderAnonymous() {
    let { anonymous }: SaleflowData =
      JSON.parse(localStorage.getItem(this.saleflow._id)) || {};
    return anonymous;
  }

  // Returns CustomizerValueInput from saleflow
  getCustomizer() {
    let { customizer }: SaleflowData =
      JSON.parse(localStorage.getItem(this.saleflow._id)) || {};
    return customizer;
  }

  // Removes order product from localStorage
  removeOrderProduct(id: string) {
    let { order, ...rest }: SaleflowData =
      JSON.parse(localStorage.getItem(this.saleflow._id)) || {};
    if (!order) return;
    if (!order.products) return;
    const index = order.products.findIndex(
      (subOrder) =>
        subOrder.item === id || subOrder.params?.[0]?.paramValue === id
    );
    if (index >= 0) {
      order.products.splice(index, 1);
      this.order.products.splice(index, 1);
    } else return;
    localStorage.setItem(this.saleflow._id, JSON.stringify({ order, ...rest }));
  }

  emptyReservation() {
    let { reservation, date, ...rest }: SaleflowData =
      JSON.parse(localStorage.getItem(this.saleflow._id)) || {};
    localStorage.setItem(this.saleflow._id, JSON.stringify(rest));
  }

  // Empties post data and option from localStorage
  emptyPost() {
    let { post, ...rest }: SaleflowData =
      JSON.parse(localStorage.getItem(this.saleflow._id)) || {};
    this.post = null;
    localStorage.setItem(this.saleflow._id, JSON.stringify(rest));
  }

  emptyMediaPost() {
    localStorage.removeItem('postReceiverNumber');
    localStorage.removeItem('privatePost');
    localStorage.removeItem('post');
  }

  // Empties order products from localStorage
  emptyOrderProducts() {
    let { order, ...rest }: SaleflowData =
      JSON.parse(localStorage.getItem(this.saleflow._id)) || {};
    order = {};
    localStorage.setItem(this.saleflow._id, JSON.stringify({ order, ...rest }));
  }

  // Deletes saleflow order object from localStorage
  deleteSaleflowOrder() {
    localStorage.removeItem(this.saleflow._id);
    this.order = null;
  }

  storeNewItemTemporarily(item: any, prevRoute: string) {
    this.newTempItem = item;
    this.newTempItemRoute = prevRoute;
  }

  removeTempNewItem() {
    this.newTempItem = null;
    this.newTempItemRoute = null;
  }
}
