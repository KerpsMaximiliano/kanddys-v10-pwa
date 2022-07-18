import { Injectable, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { DialogService } from './../../libs/dialog/services/dialog.service';
import { CommunityPreviewComponent } from '../../shared/dialogs/community-preview/community-preview.component';
import { SearchHashtagComponent } from '../../shared/dialogs/search-hashtag/search-hashtag.component';
import { Location } from '@angular/common';
import { AuthService } from './auth.service';
import { AppService } from 'src/app/app.service';
import { OrderService } from './order.service';
import { filter } from 'rxjs/operators';
import { User } from '../models/user';
import { WalletService } from './wallet.service';
import { Session } from '../models/session';
import { BookmarksService } from './bookmarks.service';
import { CustomizerValueInput } from '../models/customizer-value';
import { Merchant } from '../models/merchant';
import { DeliveryLocationInput, SaleFlow } from '../models/saleflow';
import { CustomizerValueService } from './customizer-value.service';
import { ProviderStoreComponent } from 'src/app/modules/ecommerce/pages/provider-store/provider-store.component';
import {
  ItemOrderInput,
  ItemSubOrderInput,
  ItemSubOrderParamsInput,
} from '../models/order';
import { ReservationInput } from '../models/reservation';
import { PostInput } from '../models/post';
import { Item, ItemPackage } from '../models/item';
import { MerchantsService } from './merchants.service';
import { SaleFlowService } from './saleflow.service';

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
}

@Injectable({
  providedIn: 'root',
})
export class HeaderService {
  isLogged: boolean = false;
  orderId: string;
  user: User;
  visible: boolean = false;
  navBarVisible: boolean = false;
  loaderVisible: boolean = false;
  walletData: any;
  datePreview: any;
  locationData: DeliveryLocationInput;
  flowImage: any = [];
  savedBookmarks: any;
  invokeFirstComponentFunction = new EventEmitter();
  subsVar: Subscription;
  items: Item[] = [];
  orders: any[] = [];
  order: ItemOrderInput;
  postMultimedia: any[] = [];
  userId: string;
  pack: any;
  packId: number;
  post: PostInput;
  comingFromPayments: boolean = false;
  checkData: any;
  flowId: string;
  saleflow: SaleFlow;
  categoryId: string;
  ids: any;
  saleflowIdKey = 'saleflow-token';
  productsSelected: any = [];
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
  isEditing: boolean = false;
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
  storedDeliveryLocation: string = null;
  disableGiftMessageTextarea: boolean = false;
  // createdOrderWithDelivery: boolean = false;
  createdOrderWithoutDelivery: boolean = false;
  newTempItem: Item;
  newTempItemRoute: string = null;

  public session: Session;
  constructor(
    private dialog: DialogService,
    private location: Location,
    private app: AppService,
    private auth: AuthService,
    public wallet: WalletService,
    private bookmark: BookmarksService,
    private merchantService: MerchantsService,
    private customizerValueService: CustomizerValueService,
    private orderService: OrderService,
    private saleflowService: SaleFlowService,
  ) {
    this.visible = false;
    this.auth.me().then((data) => {
      if (data != undefined) {
        this.isLogged = true;
      } else {
        this.isLogged = false;
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
          this.isLogged = true;
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
          sub.unsubscribe();
        }
      });
    const sub1 = this.app.events
      .pipe(filter((e) => e.type === 'singleAuth'))
      .subscribe((e) => {
        if (e.data) {
          this.isLogged = true;
          this.user = e.data.user;
          this.wallet.globalWallet().then((data) => {
            this.walletData = data.globalWallet;
          });
          this.bookmark.bookmarkByUser().then((data) => {
            if (data.bookmarkByUser) {
              this.savedBookmarks = data.bookmarkByUser;
            }
          });
          sub1.unsubscribe();
        }
      });
  }
  hide() {
    this.visible = false;
  }
  show() {
    this.visible = true;
  }
  toggleNav() {
    this.navBarVisible = !this.navBarVisible;
  }
  showNav() {
    this.navBarVisible = true;
  }
  disableNav() {
    this.navBarVisible = false;
  }
  toggle() {
    this.visible = !this.visible;
  }
  goBack() {
    this.location.back();
  }

  isDataComplete(): boolean {
    // console.log('Saleflow check');
    if (!this.saleflow) return;
    if (
      this.saleflow.module.delivery &&
      this.saleflow.module.delivery.isActive
    ) {
      // console.log('Delivery check');
      if (!this.isComplete.delivery) return;
    }
    if (this.items.some((item) => item.customizerId)) {
      // console.log('qualityQuantity check');
      if (!this.isComplete.qualityQuantity) return;
      // console.log('Customizer');
      if (!this.isComplete.customizer) return;
    }
    if (
      this.saleflow.module.appointment &&
      this.saleflow.module.appointment.isActive
    ) {
      // console.log('Reservation check');
      if (!this.isComplete.reservation) return;
    }
    if (this.hasScenarios) {
      // console.log('Scenarios check');
      if (!this.isComplete.scenarios) return;
    }
    if (this.saleflow.module.post && this.saleflow.module.post.isActive) {
      // console.log('Post check');
      if (!this.isComplete.message) return;
    }
    // console.log('Data complete!');
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
    if(!this.saleflow || this.saleflow._id !== id) this.saleflow = (await this.saleflowService.saleflow(id))?.saleflow;
    this.storeSaleflow(this.saleflow);
    return this.saleflow;
  }

  storeSaleflow(saleflow: SaleFlow) {
    localStorage.setItem('saleflow-data', JSON.stringify(saleflow));
  }

  getSaleflow(): SaleFlow {
    return JSON.parse(localStorage.getItem('saleflow-data'));
  }

  // Stores order product data in localStorage
  storeOrderProduct(saleflow: string, product: ItemSubOrderInput) {
    let { order, ...rest }: SaleflowData =
      JSON.parse(localStorage.getItem(saleflow)) || {};
    if (!order) order = {};
    if (!order.products) order.products = [];
    const index = order.products.findIndex(
      (subOrder) => subOrder.item === product.item
    );
    if (index >= 0) order.products.splice(index, 1);
    else order.products.push(product);
    localStorage.setItem(saleflow, JSON.stringify({ order, ...rest }));
  }

  // Stores item data in localStorage
  storeItem(saleflow: string, product: Item | ItemPackage) {
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

  storeCustomizer(saleflow: string, customizer: CustomizerValueInput) {
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

  getOrderProgress(saleflow: string) {
    let { orderProgress }: SaleflowData =
      JSON.parse(localStorage.getItem(saleflow)) || {};
    if (orderProgress) {
      this.hasScenarios = orderProgress.scenarios;
      this.isComplete = orderProgress;
    }
  }

  // Removes order product from localStorage
  removeOrderProduct(saleflow: string, id: string) {
    let { order, ...rest }: SaleflowData =
      JSON.parse(localStorage.getItem(saleflow)) || {};
    if (!order) return;
    if (!order.products) return;
    const index = order.products.findIndex((subOrder) => subOrder.item === id);
    if (index >= 0) order.products.splice(index, 1);
    else return;
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
    localStorage.setItem(saleflow, JSON.stringify({ ...rest }));
  }

  // Empties delivery option from localStorage
  emptyDeliveryOption(saleflow: string) {
    let { deliveryOption, ...rest }: SaleflowData =
      JSON.parse(localStorage.getItem(saleflow)) || {};
    localStorage.setItem(saleflow, JSON.stringify({ ...rest }));
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


  createPreOrder = () => {
    const saleflow = this.saleflow || this.getSaleflow();

    this.order = this.getOrder(saleflow._id);

    this.order.products.forEach((product) => {
      delete product.isScenario;
      delete product.limitScenario;
      delete product.name;
    });

    return new Promise(async (resolve, reject) => {
      let customizer = this.customizer;

      if (!this.customizer) {
        const customizerPreview = JSON.parse(
          localStorage.getItem('customizerFile')
        );

        let order = JSON.parse(localStorage.getItem(saleflow._id));
        if ('customizer' in order) {
          customizer = order.customizer;

          const res: Response = await fetch(customizerPreview.base64);
          const blob: Blob = await res.blob();

          customizer.preview = new File([blob], customizerPreview.fileName, {
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

      if (saleflow.module.post) {
        // if (!this.comesFromMagicLink) this.header.emptyPost(saleflow._id);
        if (saleflow.canBuyMultipleItems)
          this.order.products.forEach((product) => {
            const createdPostId = localStorage.getItem('createdPostId');

            product.deliveryLocation = this.order.products[0].deliveryLocation;
            product.post = createdPostId;
          });

        try {
          const { createPreOrder } = await this.orderService.createPreOrder(
            this.order
          );

          this.orderId = createPreOrder._id;
          this.currentMessageOption = undefined;
          this.post = undefined;
          this.locationData = undefined;
          this.app.events.emit({ type: 'order-done', data: true });
          resolve(createPreOrder._id);
        } catch (error) {
          console.log(error);
          reject('Error creando la orden');
        }
      } else {
        try {
          const { createPreOrder } = await this.orderService.createPreOrder(
            this.order
          );
          this.deleteSaleflowOrder(saleflow._id);
          this.resetIsComplete();
          this.orderId = createPreOrder._id;
          this.app.events.emit({ type: 'order-done', data: true });
          resolve(createPreOrder._id);
        } catch (error) {
          console.log(error);
          reject('Error creando la orden');
        }
      }
    }).catch((err) => {
      console.log(err);
    });
  };
}
