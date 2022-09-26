import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
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
import { Item, ItemPackage, ItemParamValue } from '../models/item';
import { MerchantsService } from './merchants.service';
import { OrderService } from './order.service';
import { PostsService } from './posts.service';
import { SaleFlowService } from './saleflow.service';
import { WalletService } from './wallet.service';

class OrderProgress {
  qualityQuantity: boolean;
  customizer: boolean;
  scenarios: boolean;
  reservation: boolean;
  message: boolean;
  delivery: boolean;
}

class SaleflowData {
  order: ItemOrderInput;
  itemData: any[];
  post: {
    option: number;
    data: PostInput;
  };
  deliveryOption: number;
  orderProgress: OrderProgress;
  customizer: CustomizerValueInput;
  customizerPreviewBase64: string;
  anonymous: boolean;
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
  items: Item[] = [];
  order: ItemOrderInput;
  post: PostInput;
  flowId: string;
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
  isComplete: OrderProgress = {
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
          });
        } else {
          this.user = null;
          this.walletData = null;
          this.savedBookmarks = null;
          this.myMerchants = null;
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

  isDataComplete(): boolean {
    if (!this.saleflow) return;
    if (
      this.saleflow.module.delivery &&
      this.saleflow.module.delivery.isActive
    ) {
      if (!this.isComplete.delivery) return;
    }
    if (this.items.some((item) => item.customizerId)) {
      if (!this.isComplete.qualityQuantity) return;
      if (!this.isComplete.customizer) return;
    }
    if (
      this.saleflow.module.appointment &&
      this.saleflow.module.appointment.isActive
    ) {
      if (!this.isComplete.reservation) return;
    }
    if (this.hasScenarios) {
      if (!this.isComplete.scenarios) return;
    }
    if (this.saleflow.module.post && this.saleflow.module.post.isActive) {
      if (!this.isComplete.message) return;
    }
    return true;
  }

  resetIsComplete() {
    this.isComplete = {
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
    this.storeSaleflow(this.saleflow);
    return this.saleflow;
  }

  storeSaleflow(saleflow: SaleFlow) {
    localStorage.setItem('saleflow-data', JSON.stringify(saleflow));
  }

  getSaleflow(): SaleFlow {
    const saleflow = JSON.parse(localStorage.getItem('saleflow-data'));
    this.saleflow = saleflow;
    return saleflow;
  }

  // Stores order product data in localStorage
  storeOrderProduct(saleflow: string, product: ItemSubOrderInput) {
    let { order, ...rest }: SaleflowData =
      JSON.parse(localStorage.getItem(saleflow)) || {};
    if (!order) order = {};
    if (!order.products) order.products = [];
    const index = order.products.findIndex(
      (subOrder) =>
        (!product.params?.length && subOrder.item === product.item) ||
        (product.params?.length &&
          subOrder.params?.[0]?.paramValue === product.params[0].paramValue)
    );
    console.log(this.order);
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
    localStorage.setItem(saleflow, JSON.stringify({ order, ...rest }));
  }

  // Stores item data in localStorage
  storeItem(saleflow: string, product: Item | ItemPackage | ItemParamValue) {
    let { itemData, ...rest }: SaleflowData =
      JSON.parse(localStorage.getItem(saleflow)) || {};
    if (!itemData) itemData = [];
    const index = itemData.findIndex((item) => item._id === product._id);
    if (index >= 0) itemData.splice(index, 1);
    else itemData.push(product);
    localStorage.setItem(saleflow, JSON.stringify({ itemData, ...rest }));
  }

  // Adds params to first order product in localStorage
  addParams(saleflow: string, params: ItemSubOrderParamsInput) {
    let { order, ...rest }: SaleflowData =
      JSON.parse(localStorage.getItem(saleflow)) || {};
    if (!order) return;
    if (!order.products || order.products.length === 0) return;
    order.products[0].params[1] = params;
    localStorage.setItem(saleflow, JSON.stringify({ order, ...rest }));
  }

  // Stores order package data in localStorage
  storeOrderPackage(
    saleflow: string,
    itemPackage: string,
    products: ItemSubOrderInput[]
  ) {
    let { order, ...rest }: SaleflowData =
      JSON.parse(localStorage.getItem(saleflow)) || {};
    if (!order) order = {};
    if (!this.order) {
      this.order = {
        itemPackage,
        products,
      };
    }
    order.itemPackage = itemPackage;
    order.products = products;
    localStorage.setItem(saleflow, JSON.stringify({ order, ...rest }));
  }

  // Stores amount to first order product in localStorage
  storeAmount(saleflow: string, amount: number) {
    let { order, ...rest }: SaleflowData =
      JSON.parse(localStorage.getItem(saleflow)) || {};
    if (!order) return;
    if (!order.products || order.products.length === 0) return;
    order.products[0].amount = amount;
    localStorage.setItem(saleflow, JSON.stringify({ order, ...rest }));
  }

  // Stores reservation to first order product in localStorage
  storeReservation(saleflow: string, reservation: ReservationInput) {
    let { order, ...rest }: SaleflowData =
      JSON.parse(localStorage.getItem(saleflow)) || {};
    if (!order) order = {};
    if (!order.products || order.products.length === 0) return;
    order.products[0].reservation = reservation;
    localStorage.setItem(saleflow, JSON.stringify({ order, ...rest }));
  }

  // Stores post data in localStorage
  storePost(saleflow: string, data: PostInput, option?: number) {
    let { post, ...rest }: SaleflowData =
      JSON.parse(localStorage.getItem(saleflow)) || {};
    post = {
      data,
      option,
    };
    localStorage.setItem(saleflow, JSON.stringify({ post, ...rest }));
  }

  // Stores location to first order product in localStorage
  storeLocation(
    saleflow: string,
    deliveryLocation: DeliveryLocationInput,
    option?: number
  ) {
    let { order, deliveryOption, ...rest }: SaleflowData =
      JSON.parse(localStorage.getItem(saleflow)) || {};
    if (!order) order = {};
    if (!order.products || order.products.length === 0) return;
    order.products[0].deliveryLocation = deliveryLocation;
    deliveryOption = option;
    localStorage.setItem(
      saleflow,
      JSON.stringify({ order, deliveryOption, ...rest })
    );
  }

  storeOrderProgress(saleflow: string) {
    let { orderProgress, ...rest }: SaleflowData =
      JSON.parse(localStorage.getItem(saleflow)) || {};
    orderProgress = this.isComplete;
    localStorage.setItem(saleflow, JSON.stringify({ orderProgress, ...rest }));
  }

  storeOrderAnonymous(saleflow: string) {
    let { anonymous, ...rest }: SaleflowData =
      JSON.parse(localStorage.getItem(saleflow)) || {};
    anonymous = true;
    localStorage.setItem(saleflow, JSON.stringify({ anonymous, ...rest }));
  }

  storeCustomizer(saleflow: string, customizer: CustomizerValueInput) {
    delete customizer?.preview;
    let saleflowData: SaleflowData =
      JSON.parse(localStorage.getItem(saleflow)) || {};
    saleflowData.customizer = customizer;

    localStorage.setItem(saleflow, JSON.stringify(saleflowData));
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
  getOrder(saleflow: string) {
    let { order }: SaleflowData =
      JSON.parse(localStorage.getItem(saleflow)) || {};
    return order;
  }

  // Returns items data from localStorage
  getItems(saleflow: string) {
    let { itemData }: SaleflowData =
      JSON.parse(localStorage.getItem(saleflow)) || {};
    return itemData;
  }

  // Returns post data and option from provider-store
  getPost(saleflow: string) {
    let { post }: SaleflowData =
      JSON.parse(localStorage.getItem(saleflow)) || {};
    return post;
  }

  // Returns delivery option from provider-store
  getDeliveryOption(saleflow: string) {
    let { deliveryOption }: SaleflowData =
      JSON.parse(localStorage.getItem(saleflow)) || {};
    return deliveryOption;
  }

  getLocation(saleflow: string) {
    let { order }: SaleflowData =
      JSON.parse(localStorage.getItem(saleflow)) || {};
    return order?.products?.[0]?.deliveryLocation;
  }

  // Returns order creation progress
  getOrderProgress(saleflow: string) {
    let { orderProgress }: SaleflowData =
      JSON.parse(localStorage.getItem(saleflow)) || {};
    if (orderProgress) {
      this.hasScenarios = orderProgress.scenarios;
      this.isComplete = orderProgress;
    }
  }

  // Returns order auth type
  getOrderAnonymous(saleflow: string) {
    let { anonymous }: SaleflowData =
      JSON.parse(localStorage.getItem(saleflow)) || {};
    return anonymous;
  }

  // Returns CustomizerValueInput from saleflow
  getCustomizer(saleflow: string) {
    let { customizer }: SaleflowData =
      JSON.parse(localStorage.getItem(saleflow)) || {};
    return customizer;
  }

  // Removes order product from localStorage
  removeOrderProduct(saleflow: string, id: string) {
    let { order, ...rest }: SaleflowData =
      JSON.parse(localStorage.getItem(saleflow)) || {};
    if (!order) return;
    if (!order.products) return;
    const index = order.products.findIndex(
      (subOrder) => subOrder.item === id || subOrder.params[0].paramValue === id
    );
    if (index >= 0) {
      order.products.splice(index, 1);
      this.order.products.splice(index, 1);
    } else return;
    localStorage.setItem(saleflow, JSON.stringify({ order, ...rest }));
  }

  // Removes item data from localStorage
  removeItem(saleflow: string, id: string) {
    let { itemData, ...rest }: SaleflowData =
      JSON.parse(localStorage.getItem(saleflow)) || {};
    if (!itemData) return;
    const index = itemData.findIndex((product) => product._id === id);
    if (index >= 0) itemData.splice(index, 1);
    else return;
    localStorage.setItem(saleflow, JSON.stringify({ itemData, ...rest }));
  }

  // Empties post data and option from localStorage
  emptyPost(saleflow: string) {
    let { post, ...rest }: SaleflowData =
      JSON.parse(localStorage.getItem(saleflow)) || {};
    localStorage.setItem(saleflow, JSON.stringify(rest));
  }

  // Empties delivery option from localStorage
  emptyDeliveryOption(saleflow: string) {
    let { deliveryOption, ...rest }: SaleflowData =
      JSON.parse(localStorage.getItem(saleflow)) || {};
    localStorage.setItem(saleflow, JSON.stringify(rest));
  }

  // Deletes anonymous property from order
  deleteOrderAnonymous(saleflow: string) {
    let { anonymous, ...rest }: SaleflowData =
      JSON.parse(localStorage.getItem(saleflow)) || {};
    localStorage.setItem(saleflow, JSON.stringify(rest));
  }

  // Empties order products from localStorage
  emptyOrderProducts(saleflow: string) {
    let { order, ...rest }: SaleflowData =
      JSON.parse(localStorage.getItem(saleflow)) || {};
    order = {};
    localStorage.setItem(saleflow, JSON.stringify({ order, ...rest }));
    this.emptyDeliveryOption(saleflow);
  }

  // Empties item data from localStorage
  emptyItems(saleflow: string) {
    let { itemData, ...rest }: SaleflowData =
      JSON.parse(localStorage.getItem(saleflow)) || {};
    itemData = [];
    localStorage.setItem(saleflow, JSON.stringify({ itemData, ...rest }));
  }

  // Deletes saleflow order object from localStorage
  deleteSaleflowOrder(saleflow: string) {
    localStorage.removeItem(saleflow);
  }

  storeNewItemTemporarily(item: any, prevRoute: string) {
    this.newTempItem = item;
    this.newTempItemRoute = prevRoute;
  }

  removeTempNewItem() {
    this.newTempItem = null;
    this.newTempItemRoute = null;
  }

  newCreatePreOrder = async () => {
    const saleflow = this.saleflow || this.getSaleflow();
    this.order = this.getOrder(saleflow._id);
    this.order.products.forEach((product) => {
      delete product.isScenario;
      delete product.limitScenario;
      delete product.name;
    });
    // ---------------------- Managing Customizer ----------------------
    let customizer = this.customizer;
    if (!customizer) {
      const customizerPreview: {
        base64: string;
        filename: string;
        type: string;
      } = JSON.parse(localStorage.getItem('customizerFile'));
      localStorage.removeItem('customizerFile');
      customizer = this.getCustomizer(saleflow._id);
      if (customizer) {
        const res: Response = await fetch(customizerPreview.base64);
        const blob: Blob = await res.blob();

        customizer.preview = new File([blob], customizerPreview.filename, {
          type: customizerPreview.type,
        });
      }
    }

    if (customizer) {
      const customizerId =
        await this.customizerValueService.createCustomizerValue(customizer);
      this.order.products[0].customizer = customizerId;
      this.customizer = null;
      this.customizerData = null;
    }
    // ++++++++++++++++++++++ Managing Customizer ++++++++++++++++++++++
    // ---------------------- Managing Post ----------------------------
    if (saleflow.module?.post) {
      const postResult = (await this.postsService.createPost(this.post))
        ?.createPost?._id;

      this.order.products.forEach((product) => {
        product.post = postResult;
      });
    }
    // ++++++++++++++++++++++ Managing Post ++++++++++++++++++++++++++++
    // ---------------------- Managing Delivery ----------------------------
    if (saleflow.module?.delivery) {
      this.order.products.forEach((product) => {
        product.deliveryLocation = this.order.products[0].deliveryLocation;
      });
    }
    // ++++++++++++++++++++++ Managing Delivery ++++++++++++++++++++++++++++
    try {
      const { createPreOrder } = await this.orderService.createPreOrder(
        this.order
      );
      this.deleteSaleflowOrder(saleflow._id);
      this.resetIsComplete();
      this.orderId = createPreOrder._id;
      this.currentMessageOption = undefined;
      this.post = undefined;
      this.app.events.emit({ type: 'order-done', data: true });
      return createPreOrder._id;
    } catch (error) {
      console.log(error);
    }
  };
}
