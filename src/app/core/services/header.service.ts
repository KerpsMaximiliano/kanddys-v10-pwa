import { Injectable, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { DialogService } from './../../libs/dialog/services/dialog.service';
import { CommunityPreviewComponent } from '../../shared/dialogs/community-preview/community-preview.component';
import { SearchHashtagComponent } from '../../shared/dialogs/search-hashtag/search-hashtag.component';
import { Location } from '@angular/common';
import { AuthService } from './auth.service';
import { AppService } from 'src/app/app.service';
import { filter } from 'rxjs/operators';
import { User } from '../models/user';
import { WalletService } from './wallet.service';
import { Session } from '../models/session';
import { BookmarksService } from './bookmarks.service';
import { CustomizerValueInput } from '../models/customizer-value';
import { Merchant } from '../models/merchant';
import { DeliveryLocationInput, SaleFlow } from '../models/saleflow';
import { ProviderStoreComponent } from 'src/app/modules/ecommerce/pages/provider-store/provider-store.component';
import { ItemOrderInput, ItemSubOrderInput, ItemSubOrderParamsInput } from '../models/order';
import { ReservationInput } from '../models/reservation';
import { PostInput } from '../models/post';
import { Item, ItemPackage } from '../models/item';

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
    elementList: any,
    backgroundUrl: string,
    backgroundImage: File,
    backgroundColor: string,
    stickersAmount: number,
    textsAmount: number,
    id: string,
  };
  isEditing: boolean = false;
  merchantInfo: Merchant;
  tags: any;
  isComplete = {
    qualityQuantity: false,
    customizer: false,
    scenarios: false,
    reservation: false,
    message: false,
    delivery: false,
  }
  currentMessageOption: number;
  currentDeliveryOption: number;
  hasScenarios: boolean;
  fromOrderSales: string;
  public session: Session;
  constructor(
    private dialog: DialogService,
    private location: Location,
    private app: AppService,
    private auth: AuthService,
    public wallet: WalletService,
    private bookmark: BookmarksService,
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
        if (localStorage.getItem('session-token')) {
          this.session.revoke();
        }
      }
    });
    const sub = this.app.events
      .pipe(filter((e) => e.type === 'auth'))
      .subscribe((e) => {
        console.log('aa');
        if (e.data) {
          this.isLogged = true;
          this.user = e.data.user;
          console.log(this.user);
          this.wallet.globalWallet().then((data) => {
            this.walletData = data.globalWallet;
            console.log(this.walletData);
          });
          this.bookmark.bookmarkByUser().then((data) => {
            if (data.bookmarkByUser) {
              this.savedBookmarks = data.bookmarkByUser;
              console.log(this.savedBookmarks);
            }
          });
          sub.unsubscribe();
        }
      });
      const sub1 = this.app.events
      .pipe(filter((e) => e.type === 'singleAuth'))
      .subscribe((e) => {
        console.log('aa');
        if (e.data) {
          this.isLogged = true;
          this.user = e.data.user;
          console.log(this.user);
          this.wallet.globalWallet().then((data) => {
            this.walletData = data.globalWallet;
            console.log(this.walletData);
          });
          this.bookmark.bookmarkByUser().then((data) => {
            if (data.bookmarkByUser) {              
              this.savedBookmarks = data.bookmarkByUser;
              console.log(this.savedBookmarks);
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
    if(!this.saleflow) return
    if(this.saleflow.module.delivery && this.saleflow.module.delivery.isActive) {
      if(!this.isComplete.delivery) return
    }
    if(this.items.some((item) => item.customizerId)) {
      if(!this.isComplete.qualityQuantity) return
      if(!this.isComplete.customizer) return
    }
    if(this.saleflow.module.appointment && this.saleflow.module.appointment.isActive) {
      if(!this.isComplete.reservation) return
    }
    if(this.hasScenarios) {
      if(!this.isComplete.scenarios) return
    }
    if(this.saleflow.module.post && this.saleflow.module.post.isActive) {
      if(!this.isComplete.message) return
    }
    return true
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
      console.log(data);
      this.savedBookmarks = data.bookmarkByUser;
      console.log(this.savedBookmarks);
    });
    return this.savedBookmarks;
  }

  storeFlowId(id?: string) {
    localStorage.setItem('saleflow-token', JSON.stringify(id));
  }

  getFlowId(): string {
    return JSON.parse(localStorage.getItem('saleflow-token'));
  }

  storeItems(saleflow: string, product: ItemSubOrderInput) {
    let saleflows: {[key: string]: ItemOrderInput } = JSON.parse(localStorage.getItem('orderData-token'));
    if(!saleflows) saleflows = {};
    if(!saleflows[saleflow]) saleflows[saleflow] = {};
    if(!saleflows[saleflow].products) saleflows[saleflow].products = [];
    const index = saleflows[saleflow].products.findIndex(subOrder => subOrder.item === product.item);
    if(index >= 0) saleflows[saleflow].products.splice(index, 1);
    else saleflows[saleflow].products.push(product)
    localStorage.setItem('orderData-token', JSON.stringify(saleflows));
  }

  storeItemProduct(saleflow: string, product: Item | ItemPackage) {
    let itemProduct: {[key: string]: (Item | ItemPackage)[] } = JSON.parse(localStorage.getItem('itemProductData-token'));
    if(!itemProduct) itemProduct = {};
    if(!itemProduct[saleflow]) itemProduct[saleflow] = [];
    const index = itemProduct[saleflow].findIndex(item => item._id === product._id);
    if(index >= 0) itemProduct[saleflow].splice(index, 1);
    else itemProduct[saleflow].push(product);
    localStorage.setItem('itemProductData-token', JSON.stringify(itemProduct));
  }

  addParams(saleflow: string, params: ItemSubOrderParamsInput) {
    let saleflows: {[key: string]: ItemOrderInput } = JSON.parse(localStorage.getItem('orderData-token'));
    if(!saleflows) return;
    if(!saleflows[saleflow]) return;
    if(!saleflows[saleflow].products || saleflows[saleflow].products.length === 0) return;
    saleflows[saleflow].products[0].params[1] = params;
    localStorage.setItem('orderData-token', JSON.stringify(saleflows));
  }

  storePackage(saleflow: string, itemPackage: string, products: ItemSubOrderInput[]) {
    let saleflows: {[key: string]: ItemOrderInput } = JSON.parse(localStorage.getItem('orderData-token'));
    if(!saleflows) saleflows = {};
    if(!saleflows[saleflow]) saleflows[saleflow] = {};
    saleflows[saleflow].itemPackage = itemPackage;
    saleflows[saleflow].products = products;
    localStorage.setItem('orderData-token', JSON.stringify(saleflows));
  }

  storeAmount(saleflow: string, amount: number) {
    let saleflows: {[key: string]: ItemOrderInput } = JSON.parse(localStorage.getItem('orderData-token'));
    if(!saleflows) return;
    if(!saleflows[saleflow]) return;
    if(!saleflows[saleflow].products || saleflows[saleflow].products.length === 0) return;
    saleflows[saleflow].products[0].amount = amount;
    localStorage.setItem('orderData-token', JSON.stringify(saleflows));
  }

  storeReservation(saleflow: string, reservation: ReservationInput) {
    let saleflows: {[key: string]: ItemOrderInput } = JSON.parse(localStorage.getItem('orderData-token'));
    if(!saleflows) saleflows = {};
    if(!saleflows[saleflow]) saleflows[saleflow] = {};
    if(!saleflows[saleflow].products || saleflows[saleflow].products.length === 0) return;
    saleflows[saleflow].products[0].reservation = reservation;
    localStorage.setItem('orderData-token', JSON.stringify(saleflows));
  }

  storePost(saleflow: string, data: PostInput, option?: number) {
    let post: {[key: string]: { option: number, data: PostInput} } = JSON.parse(localStorage.getItem('postData-token'));
    if(!post) post = {};
    post[saleflow] = {
      option,
      data,
    };
    localStorage.setItem('postData-token', JSON.stringify(post));
  }

  storeLocation(saleflow: string, deliveryLocation: DeliveryLocationInput, option?: number) {
    let saleflows: {[key: string]: ItemOrderInput } = JSON.parse(localStorage.getItem('orderData-token'));
    if(!saleflows) saleflows = {};
    if(!saleflows[saleflow]) saleflows[saleflow] = {};
    if(!saleflows[saleflow].products || saleflows[saleflow].products.length === 0) return;
    saleflows[saleflow].products[0].deliveryLocation = deliveryLocation;
    localStorage.setItem('orderData-token', JSON.stringify(saleflows));
    if(option) localStorage.setItem('deliveryOption-token', JSON.stringify({
      [saleflow]: option
    }));
  }

  getOrder(saleflow: string) {
    let saleflows: {[key: string]: ItemOrderInput } = JSON.parse(localStorage.getItem('orderData-token'));
    if(!saleflows) return;
    return saleflows[saleflow];
  }

  getItemProduct(saleflow: string) {
    let itemProduct: {[key: string]: Item[] } = JSON.parse(localStorage.getItem('itemProductData-token'));
    if(!itemProduct) return;
    return itemProduct[saleflow];
  }

  getPost(saleflow: string) {
    let post: {[key: string]: { option: number, data: PostInput} } = JSON.parse(localStorage.getItem('postData-token'));
    if(!post) return;
    return post[saleflow];
  }

  getDeliveryOption(saleflow: string) {
    let options: {[key: string]: number } = JSON.parse(localStorage.getItem('deliveryOption-token'));
    if(!options) return;
    return options[saleflow];
  }

  removeItem(saleflow: string, id: string) {
    let saleflows: {[key: string]: ItemOrderInput } = JSON.parse(localStorage.getItem('orderData-token'));
    if(!saleflows) return;
    if(!saleflows[saleflow]) return;
    if(!saleflows[saleflow].products) return;
    const index = saleflows[saleflow].products.findIndex(subOrder => subOrder.item === id);
    if(index >= 0) saleflows[saleflow].products.splice(index, 1);
    else return;
    localStorage.setItem('orderData-token', JSON.stringify(saleflows));
  }

  removeItemProduct(saleflow: string, id: string) {
    let itemProduct: {[key: string]: Item[] } = JSON.parse(localStorage.getItem('itemProductData-token'));
    if(!itemProduct) return;
    if(!itemProduct[saleflow]) return;
    const index = itemProduct[saleflow].findIndex(product => product._id === id);
    if(index >= 0) itemProduct[saleflow].splice(index, 1);
    else return;
    localStorage.setItem('itemProductData-token', JSON.stringify(itemProduct));
  }

  emptyPost(saleflow: string) {
    let post: {[key: string]: { option?: number, data?: PostInput} } = JSON.parse(localStorage.getItem('postData-token'));
    if(!post) return;
    post[saleflow] = {};
    localStorage.setItem('postData-token', JSON.stringify(post));
  }

  emptyDeliveryOption(saleflow: string) {
    let options: {[key: string]: number } = JSON.parse(localStorage.getItem('deliveryOption-token'));
    if(!options) return;
    if(options[saleflow] == null) return;
    delete options[saleflow];
    localStorage.setItem('deliveryOption-token', JSON.stringify(options));
  }


  emptyItems(saleflow: string) {
    let saleflows: {[key: string]: ItemOrderInput } = JSON.parse(localStorage.getItem('orderData-token'));
    if(!saleflows) return;
    if(!saleflows[saleflow]) return;
    saleflows[saleflow] = {};
    localStorage.setItem('orderData-token', JSON.stringify(saleflows));
    this.emptyDeliveryOption(saleflow);
  }

  emptyItemProducts(saleflow: string) {
    let itemProduct: {[key: string]: (Item | ItemPackage)[] } = JSON.parse(localStorage.getItem('itemProductData-token'));
    if(!itemProduct) return;
    if(!itemProduct[saleflow]) return;
    itemProduct[saleflow] = [];
    localStorage.setItem('itemProductData-token', JSON.stringify(itemProduct));
  }

  deleteSaleflow(saleflow: string) {
    let saleflows: {[key: string]: ItemOrderInput } = JSON.parse(localStorage.getItem('orderData-token'));
    if(!saleflows) return;
    if(!saleflows[saleflow]) return;
    delete saleflows[saleflow];
    localStorage.setItem('orderData-token', JSON.stringify(saleflows));
  }

  storeDataFromOrder() {
    localStorage.setItem('orderData-token', JSON.stringify(this.orders));
  }

  getDataFromOrder() {
    console.log(JSON.parse(localStorage.getItem('orderData-token')));
    return JSON.parse(localStorage.getItem('orderData-token'));
  }

  updateDataFromOrder(data: any) {
    console.log(data);
    localStorage.removeItem('orderData-token');
    localStorage.setItem('orderData-token', JSON.stringify(data));
    console.log(localStorage.getItem('orderData-token'));
  }
}
