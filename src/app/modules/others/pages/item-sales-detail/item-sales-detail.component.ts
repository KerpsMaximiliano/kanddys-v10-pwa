import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { formatID } from 'src/app/core/helpers/strings.helpers';
import { Item } from 'src/app/core/models/item';
import { ItemOrder } from 'src/app/core/models/order';
import { User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { OrderService } from 'src/app/core/services/order.service';
import { UsersService } from 'src/app/core/services/users.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ItemList } from 'src/app/shared/components/item-list/item-list.component';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
import { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-item-sales-detail',
  templateUrl: './item-sales-detail.component.html',
  styleUrls: ['./item-sales-detail.component.scss']
})
export class ItemSalesDetailComponent implements OnInit {
  itemData: Item;
  swiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: true,
    spaceBetween: 5,
  };
  tabs: string[] = ["0 Compradores", "0 Ventas"];
  dummyOrders: ItemList[] = [
    {
      visible: true,
      id: 'adsadasdasdsa',
      image: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1648833244956.png',
      title: '$9000',
      subtitle: 'Custom Field',
      text_left: 'Hace 2 dias' ,
      text_right: '4 etiqueta(s)',
      text_style: true,
      phone: '534534534534675',
      add_tag: true,
      description2: 'dasdasdas',
      description: 'gdgdfgfdg',
      text_middle: 'ddddddd',
      bonus: '50'
    },
    {
      visible: true,
      id: 'adsadasdasdsa',
      image: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1648833244956.png',
      title: '$9000',
      subtitle: 'Custom Field',
      text_left: 'Hace 2 dias' ,
      text_right: '4 etiqueta(s)',
      text_style: true,
      phone: '534534534534675',
      add_tag: true,
    },
    {
      visible: true,
      id: 'adsadasdasdsa',
      image: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1648833244956.png',
      title: '$9000',
      subtitle: 'Custom Field',
      text_left: 'Hace 2 dias' ,
      text_right: '4 etiqueta(s)',
      text_style: true,
      phone: '534534534534675',
      add_tag: true,
    },
  ];

  ordersList: ItemList[];
  buyersList: ItemList[];

  ordersByItem: ItemOrder[];
  buyersByItem: User[];
  currentTab: 'Compradores' | 'Ventas' = 'Compradores';
  currentUser: User;
  isLogged: boolean = false;
  canShowItems: boolean = false;

  constructor(
    private dialog: DialogService,
    private itemService: ItemsService,
    private ordersService: OrderService,
    private usersService: UsersService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
  ) { }

  async ngOnInit(): Promise<void> {
    // this.itemData = await this.itemService.item("628d47985d291213549ccb50");

    await this.authService.me().then(data => {
      if (data && data != undefined) {
        this.isLogged = true;
        this.currentUser = data;
      };
    });

    if(!this.isLogged) return this.redirect();
    this.route.params.subscribe(async routeParams => {
      const itemId = routeParams.itemId;
      await Promise.all([
        this.getItem(itemId),
        this.getOrdersByItem(itemId),
        this.getBuyersByItem(itemId)
      ]);
      this.canShowItems = true;
      this.filterData();
      this.tabs = [`${this.buyersByItem.length} Compradores`, `${this.ordersByItem.length} Ventas`];
    });
  }

  openImageModal(imageSourceURL: string) {
    this.dialog.open(ImageViewComponent, {
      type: 'fullscreen-translucent',
      props: {
        imageSourceURL,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  async getItem(itemID: string) {
    try {
      this.itemData = await this.itemService.item(itemID);
      if (this.itemData.merchant.owner._id !== this.currentUser._id) this.redirect("error");
    } catch (error) {
      console.log(error);
    }
  }

  async getOrdersByItem(itemID: string) {
    try {
      this.ordersByItem = (await this.ordersService.ordersByItem(itemID)).ordersByItem; 
    } catch (error) {
      console.log(error);
    }
  }

  async getBuyersByItem(itemID: string) {
    try {
      this.buyersByItem = (await this.usersService.buyersByItem(itemID)).buyersByItem;
    } catch (error) {
      console.log(error);
    }
  }

  filterData() {
   this.ordersList = this.ordersByItem.map(order => ({
    visible: true,
    id: order._id,
    // image: order.items[0].item?.images[0],
    title: formatID(order.dateId),
    text_left: `${moment().diff(order.createdAt, "days")}`,
    text_middle: `${order.subtotals[0].amount}`,
    description: 'Custom Field 1',
    description2: 'Custom Field 2',
   }));

   this.buyersList = this.buyersByItem.map(buyer => ( {
    visible: true,
    id: buyer._id,
    image: buyer.image,
    title: buyer.name || buyer.phone || buyer.email,
    text_left: `${moment().diff(buyer.createdAt, "days")}`,
    description: 'Custom Field 1',
    description2: 'Custom Field 2',
   }));
  }

  tabTrigger(e) {
    if ((String(e)).includes('Compradores')) 
      this.currentTab = 'Compradores';
    else if ((String(e)).includes('Ventas')) 
      this.currentTab = 'Ventas';
  }

  redirect(customRoute?: string) {
    if(customRoute == "error") this.router.navigate(['/others/error-screen']);
    else this.router.navigate(['/']);
  }

  back() {
    this.location.back();
  }
 
}
