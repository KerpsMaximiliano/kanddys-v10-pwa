import { Location } from '@angular/common';
import { EventEmitter, Injectable } from '@angular/core';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { Contact } from '../models/contact';
import { CustomizerValueInput } from '../models/customizer-value';
import { DeliveryZoneInput } from '../models/deliveryzone';
import { Item } from '../models/item';
import { Merchant } from '../models/merchant';
import {
  ItemOrderInput,
  ItemSubOrderInput,
  ItemSubOrderParamsInput,
  ReceiverDataInput,
} from '../models/order';
import { PostInput } from '../models/post';
import { ReservationInput } from '../models/reservation';
import { DeliveryLocationInput, SaleFlow } from '../models/saleflow';
import { Session } from '../models/session';
import { User } from '../models/user';
import { AuthService } from './auth.service';
import { MerchantsService } from './merchants.service';
import { SaleFlowService } from './saleflow.service';
import { WalletService } from './wallet.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { ConfirmationDialogComponent } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  merchantContact: Contact;
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
  alreadyInputtedloginDialogUser: User = null;
  orderReceiverData: ReceiverDataInput = null;
  receiverDataNew: boolean = false;
  changedItemAmountSubject = new Subject<Array<ItemSubOrderInput>>();
  ecommerceDataLoaded = new Subject<boolean>();
  navigationTabState: any = null;
  redirectFromFlowRoute: boolean = false;
  flowRouteForEachPage: Record<string, string> = {};


  public session: Session;
  constructor(
    private location: Location,
    private app: AppService,
    private auth: AuthService,
    public wallet: WalletService,
    private merchantService: MerchantsService,
    private saleflowService: SaleFlowService,
    private authService: AuthService,
    public matDialog: MatDialog,
    private matSnackBar: MatSnackBar,
    private router: Router
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
          // this.wallet.globalWallet().then((data) => {
          //   this.walletData = data.globalWallet;
          // });
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

  isUserLogged() {
    if (this.user) return true;
    else return false;
  }

  /**
   * Verifica si el usuario es un merchant.
   *
   * @returns {Boolean} un verdadero o false segun si el merchant tiene data
   */
  async checkIfUserIsAMerchantAndFetchItsData() {
    if (this.user && !this.merchantService.merchantData) {
      const myMerchants = await this.merchantService.myMerchants();

      if (myMerchants.length === 0) return false;

      const merchantDefault = myMerchants.find((merchant) => merchant.default);

      if (merchantDefault) this.merchantService.merchantData = merchantDefault;
      else {
        this.merchantService.merchantData = myMerchants[0];
      }

      return true;
    }

    if (this.user && this.merchantService.merchantData) {
      return true;
    }

    return false;
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
  // async saveBookmarks() {
  //   await this.bookmark.bookmarkByUser().then((data) => {
  //     this.savedBookmarks = data.bookmarkByUser;
  //   });
  //   return this.savedBookmarks;
  // }

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
  storeOrderProduct(
    product: ItemSubOrderInput,
    removeSameProductIfIsFound: boolean = true
  ) {
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
    if (index >= 0 && removeSameProductIfIsFound) {
      order.products.splice(index, 1);
      this.order?.products?.splice(index, 1);
    } else if (index >= 0 && !removeSameProductIfIsFound) {
      //if vacio, para evitar el caso
    } else if (index < 0) {
      order.products.push(product);
      this.order?.products?.push(product);
    }
    this.order = order;
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

    if (type === 'subtract' && order.products[index].amount === 1) {
      return this.deleteProduct(this.order.products[index].item);
    }

    if (type === 'subtract' && order.products[index].amount > 1) {
      order.products[index].amount--;
      this.order.products[index].amount--;
    }

    this.changedItemAmountSubject.next(this.order.products);

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

  deleteProduct(itemId: string) {
    let dialogRef = this.matDialog.open(ConfirmationDialogComponent, {
      data: {
        title: `Borrar producto`,
        description: `¿Estás seguro que deseas borrar este producto?`,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirm') {
        this.removeOrderProduct(itemId);
      }
    });
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

    this.changedItemAmountSubject.next(this.order.products);
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
    console.log(this.saleflow._id);
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

  showErrorToast(
    message: string = 'Ocurrió un error',
    duration: number = 3000,
    optionalErrorCssClass: string = 'snack-toast-error'
  ) {
    this.matSnackBar.open(message, '', {
      duration,
      panelClass: optionalErrorCssClass,
    });
  }

  buildURL(url, queryParams = null) {
    // Check if queryParams is defined and is an object
    if (queryParams && typeof queryParams === "object") {
      // Get an array of keys from the queryParams object
      const keys = Object.keys(queryParams);

      // Check if there are any query parameters to append
      if (keys.length > 0) {
        // Initialize an array to hold the query parameters
        const queryArr = [];

        // Loop through the keys and build the query parameter string
        keys.forEach((key) => {
          const value = queryParams[key];
          const encodedValue = encodeURIComponent(value); // URL-encode the value
          queryArr.push(`${key}=${encodedValue}`);
        });

        // Join the queryArr with "&" to create the final query parameter string
        const queryString = queryArr.join("&");

        // Append the query string to the URL
        url += `?${queryString}`;
      }
    }

    return url;
  }

  redirectFromQueryParams() {
    let redirectionRoute = this.flowRoute;

    if (!redirectionRoute) redirectionRoute = localStorage.getItem('flowRoute');

    if (redirectionRoute.includes('?')) {
      const redirectURL: { url: string; queryParams: Record<string, string> } =
        {
          url: null,
          queryParams: {},
        };
      const routeParts = redirectionRoute.split('?');
      const redirectionURL = routeParts[0];
      const routeQueryStrings = routeParts[1].split('&').map((queryString) => {
        const queryStringElements = queryString.split('=');

        return { [queryStringElements[0]]: queryStringElements[1] };
      });

      redirectURL.url = redirectionURL;
      redirectURL.queryParams = {};

      routeQueryStrings.forEach((queryString) => {
        const key = Object.keys(queryString)[0];
        redirectURL.queryParams[key] = queryString[key];
      });

      this.router.navigate([redirectURL.url], {
        queryParams: redirectURL.queryParams,
        replaceUrl: true,
      });
    } else {
      this.router.navigate([redirectionRoute], {
        replaceUrl: true,
      });
    }
  }
}
