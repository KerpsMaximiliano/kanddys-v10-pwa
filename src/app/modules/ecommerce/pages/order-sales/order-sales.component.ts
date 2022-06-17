import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { AppService } from 'src/app/app.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { searchInput } from 'src/app/shared/components/see-filters/see-filters.component';
import { CustomFieldsComponent } from '../../../../shared/dialogs/custom-fields/custom-fields.component';
import { CodeSearchByKeyword } from 'src/app/core/graphql/codes.gql';
import { ItemList } from 'src/app/shared/components/item-list/item-list.component';
import { Tag } from 'src/app/core/models/tags';
import { TagsService } from 'src/app/core/services/tags.service';
import { ItemOrder } from 'src/app/core/models/order';
import { formatID } from 'src/app/core/helpers/strings.helpers';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';

interface CustomItemList extends ItemList {
  tags?: string[]
};

@Component({
  selector: 'app-order-sales',
  templateUrl: './order-sales.component.html',
  styleUrls: ['./order-sales.component.scss']
})
export class OrderSalesComponent implements OnInit {
  env: string = environment.assetsUrl;
  inSearch: boolean = false;
  merchantID: string;
  tags: {
    orders: number,
    tags: Tag
  }[];
  auxNumbers: string = '';
  active: boolean = true;
  selectedOption: number = 0
  allOrders: ItemOrder[] = [];
  orders: Array<CustomItemList> = [
    // {
    //   visible: true,
    //   id: 'adsadasdasdsa',
    //   image: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1648833244956.png',
    //   title: 'Order ID',
    //   subtitle: 'Custom Field',
    //   text_left: 'Hace 2 dias',
    //   text_right: '4 etiqueta(s)',
    //   text_style: true,
    //   phone: '534534534534675',
    //   add_tag: true,
    // },
  ];



  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private merchantService: MerchantsService,
    private dialog: DialogService,
    private headerSevice: HeaderService,
    private authService: AuthService,
    private tagsService: TagsService,
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.route.params.subscribe(async (params) => {
      this.merchantID = params.id
    });
    lockUI();
    const user = await this.authService.me();
    if(!user) return this.errorScreen();
    await this.getMerchants();
    unlockUI();
  }

  async getTagsOptions() {
    this.tags = (await this.merchantService.tagsByMerchant(this.merchantID))?.tagsByMerchant;
  }

  async getMerchants() {
    const merchants = await this.merchantService.myMerchants({});
    if(!merchants.length) return this.errorScreen();
    let merchant = merchants.find(element => element._id === this.merchantID)
    this.headerSevice.merchantInfo = merchant;
    if(!merchant) return this.errorScreen();
    await Promise.all([
      this.getOrdersByMerchant(),
      this.getTagsOptions()
    ]);
  }

  async getOrdersByMerchant() {
    const orders = (await this.merchantService
      .ordersByMerchant(this.merchantID, {
        options: {
          limit: 100,
          sortBy: 'createdAt:asc'
        },
      }))?.ordersByMerchant;
    if(!orders) return;
    this.allOrders = orders;
    this.orders = orders.map((order) => {
      let today = moment()
      let daysAgo = today.diff(order.createdAt, 'days');
      let timeAgo = "Today"
      if (daysAgo) timeAgo = "Hace " + daysAgo + " dias."

      return {
        visible: true,
        id: order._id,
        image: order.items[0].item.images[0],
        eventImage: () => this.goToOderinfo(order._id),
        title: formatID(order.dateId),
        eventTitle: () => this.goToOderinfo(order._id),
        subtitle: order.user.name,
        text_middle: '$' + order.subtotals[0].amount.toLocaleString('es-MX'),
        text_left: timeAgo,
        text_right: order.tags.length && order.tags.length + ' etiqueta(s)',
        text_style: true,
        phone: order.user.phone,
        tags: order.tags,
        add_tag: true,
        tag_function: () => this.router.navigate([`ecommerce/data-list/${order._id}`], { queryParams: { viewtype: 'merchant', mode: 'tag' } }),
      }
    });
  }

  openTagsDialog(orderID: string, tags: any, dateID: string) {
    console.log(this.merchantID)
    console.log('Uso de Dialog para autenticacion')
    /* 
        const dialogRef = this.dialog.open(AddNewTagComponent, {
          type: 'fullscreen',
          flags:['no-header'],
          customClass: 'app-dialog',
          notCancellable: true,
          props:{ orderID: orderID, tagsUsed: tags, dateID: dateID, merchantID: this.merchantID}
        })
        const sub = dialogRef.events 
          .pipe(filter((e) => e.type === 'result')) 
          .subscribe(async (e) => { 
            if(e.data.changed){
              this.orders = []
              await this.getOrdersByMerchant(this.merchantID)
              await this.getTagsOptions()
            }
            sub.unsubscribe(); 
          });  */
  }

  goToOderinfo(orderID: string) {
    this.router.navigate([`ecommerce/sale-detail/${orderID}`]);
  }

  searchToggle() {
    this.inSearch = !this.inSearch;
  }

  openDialog() {
    this.dialog.open(CustomFieldsComponent, {
      type: 'flat-action-sheet',
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  tagFunction() {
    this.router.navigate([`ecommerce/tags-edit`]);
  }

  toggleNotification() {
    this.tagsService.updateTag({
      notify: !this.tags[this.activeTag].tags.notify
    }, this.tags[this.activeTag].tags._id);
    this.tags[this.activeTag].tags.notify = !this.tags[this.activeTag].tags.notify;
    this.active = !this.active;
  }

  showAll() {
    this.activeTag = null;
  }

  errorScreen() {
    unlockUI();
    this.router.navigate([`ecommerce/error-screen/`]);
  }

  activeTag: number;
  mouseDown: boolean;
  startX: number;
  scrollLeft: number;
  changeTab(index: number) {
    this.activeTag = index;
    this.active = this.tags[index].tags.notify;
  }

  startDragging(e: MouseEvent, el: HTMLDivElement) {
    this.mouseDown = true;
    this.startX = e.pageX - el.offsetLeft;
    this.scrollLeft = el.scrollLeft;
  }

  stopDragging() {
    this.mouseDown = false;
  }

  moveEvent(e: MouseEvent, el: HTMLDivElement) {
    e.preventDefault();
    if (!this.mouseDown) {
      return;
    }
    const x = e.pageX - el.offsetLeft;
    const scroll = x - this.startX;
    el.scrollLeft = this.scrollLeft - scroll;
  }

}

/* en addTagsInMerchant esta la mutation para adicionar tags a un merchant, addTagsInOrder lo utilizamos para agregar tags a una orden*/


