import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Merchant } from 'src/app/core/models/merchant';
import { ItemOrder, OrderStatusDeliveryType, OrderStatusNameType } from 'src/app/core/models/order';
import { Post, Slide } from 'src/app/core/models/post';
import { Tag } from 'src/app/core/models/tags';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { DropdownOptionItem } from 'src/app/shared/components/dropdown-menu/dropdown-menu.component';

@Component({
  selector: 'app-order-process',
  templateUrl: './order-process.component.html',
  styleUrls: ['./order-process.component.scss']
})
export class OrderProcessComponent implements OnInit {

  order: ItemOrder;

  orderDeliveryStatus = this.orderService.orderDeliveryStatus;
  deliveryStatusOptions: DropdownOptionItem[] = [
    {
      text: 'En preparación',
      value: 'in progress',
      selected: false,
      hide: false,
    },
  ];

  redirectTo: string = null;

  imageFiles: string[] = ['image/png', 'image/jpg', 'image/jpeg'];
  videoFiles: string[] = [
    'video/mp4',
    'video/webm',
    'video/m4v',
    'video/avi',
    'video/mpg',
    'video/mpeg',
    'video/mpeg4',
    'video/mov',
    'video/3gp',
    'video/mxf',
    'video/m2ts',
    'video/m2ts',
  ];

  orderStatus: OrderStatusNameType;
  orderDate: string;
  orderMerchant: Merchant;
  isMerchant: boolean;

  post: Post;
  slides: Slide[];

  selectedTags: {
    [key: string]: boolean;
  } = {};
  selectedTagsLength: number;
  tags: Tag[];
  tagOptions: DropdownOptionItem[];
  tagPanelState: boolean;

  constructor(
    private orderService: OrderService,
    private router: Router,
    private route: ActivatedRoute,
    private headerService: HeaderService,
    private authService: AuthService,
    private merchantsService: MerchantsService,
    private postsService: PostsService,
    private tagsService: TagsService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(async (queryParams) => {
      const {  redirectTo } = queryParams;
      this.redirectTo = redirectTo;

      if (typeof redirectTo === 'undefined') this.redirectTo = null;

      this.route.params.subscribe(async (params) => {
        const { orderId } = params;

        await this.executeProcessesAfterLoading(orderId);
      });
    });
  }

  async executeProcessesAfterLoading(orderId: string) {
    lockUI();
    this.order = (await this.orderService.order(orderId))?.order;
    if (!this.order) {
      this.router.navigate([`others/error-screen/`], {
        queryParams: { type: 'order' },
      });
      return;
    }
    if (this.order.items) {
      for (const itemSubOrder of this.order.items) {
        itemSubOrder.item.media = itemSubOrder.item.images
          .sort(({ index: a }, { index: b }) => (a > b ? 1 : -1))
          .map((image) => {
            let url = image.value;
            const fileParts = image.value.split('.');
            const fileExtension = fileParts[fileParts.length - 1].toLowerCase();
            let auxiliarImageFileExtension = 'image/' + fileExtension;
            let auxiliarVideoFileExtension = 'video/' + fileExtension;

            if (url && !url.includes('http') && !url.includes('https')) {
              url = 'https://' + url;
            }

            if (this.imageFiles.includes(auxiliarImageFileExtension)) {
              return {
                src: url,
                type: 'IMAGE',
              };
            } else if (this.videoFiles.includes(auxiliarVideoFileExtension)) {
              return {
                src: url,
                type: 'VIDEO',
              };
            }
          });
      }
    }

    this.orderStatus = this.orderService.getOrderStatusName(
      this.order.orderStatus
    );
    const temporalDate = new Date(this.order.createdAt);
    this.orderDate = temporalDate
      .toLocaleString('es-MX', {
        hour12: true,
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
      .toLocaleUpperCase();
    this.headerService.user = await this.authService.me();
    await this.isMerchantOwner(this.order.items[0].saleflow.merchant._id);

    if (this.order.items[0].post) {
      this.post = (
        await this.postsService.getPost(this.order.items[0].post._id)
      ).post;
      this.slides = await this.postsService.slidesByPost(this.post._id);
    }
    // if (this.order.items[0].reservation) {
    //   const reservation = await this.reservationService.getReservation(
    //     this.order.items[0].reservation._id
    //   );
    //   if (reservation) {
    //     const fromDate = new Date(reservation.date.from);
    //     const untilDate = new Date(reservation.date.until);
    //     this.date = {
    //       day: fromDate.getDate(),
    //       weekday: fromDate.toLocaleString('es-MX', {
    //         weekday: 'short',
    //       }),
    //       month: fromDate.toLocaleString('es-MX', {
    //         month: 'short',
    //       }),
    //       time: `De ${this.formatHour(fromDate)} a ${this.formatHour(
    //         untilDate,
    //         reservation.breakTime
    //       )}`,
    //     };
    //   }
    // }
    let address = '';
    const location = this.order.items[0].deliveryLocation;
    if (location) {
      address = '\n\nDirección: ';
      if (location.street) {
        this.deliveryStatusOptions.push(
          {
            text: 'Listo para enviarse',
            value: 'pending',
            selected: false,
            hide: false,
          },
          {
            text: 'De camino a ser entregado',
            value: 'shipped',
            selected: false,
            hide: false,
          }
        );
        if (location.houseNumber) address += '#' + location.houseNumber + ', ';
        address += location.street + ', ';
        if (location.referencePoint) address += location.referencePoint + ', ';
        address += location.city + ', República Dominicana';
        if (location.note) address += ` (${location.note})`;
      } else {
        address += location.nickName;
        this.deliveryStatusOptions.push({
          text: 'Listo para pick-up',
          value: 'pickup',
          selected: false,
          hide: false,
        });
      }
    }
    this.deliveryStatusOptions.push({
      text: 'Entregado',
      value: 'delivered',
      selected: false,
      hide: false,
    });
    if (this.isMerchant) {
      this.handleStatusOptions(this.order.orderStatusDelivery);
    }

    let giftMessage = '';
    if (this.post?.from) giftMessage += 'De: ' + this.post.from + '\n';
    if (this.post?.targets?.[0]?.name)
      giftMessage += 'Para: ' + this.post.targets[0].name + '\n';
    if (this.post?.message) giftMessage += 'Mensaje: ' + this.post.message;

    const tags =
      (await this.tagsService.tagsByUser({
        findBy: {
          entity: 'order',
        },
        options: {
          limit: -1,
        },
      })) || [];
    for (const tag of tags) {
      this.selectedTags[tag._id] = this.order.tags.includes(tag._id);
    }
    this.selectedTagsLength = Object.entries(this.selectedTags).filter(
      (value) => value[1]
    ).length;
    this.tags = tags;
    this.tagOptions = this.tags.map((tag) => {
      return {
        text: tag.name,
        value: tag._id,
        selected: this.order.tags.includes(tag._id),
      };
    });
    unlockUI();
  }

  async addTag(tagId: string) {
    if (!this.selectedTags[tagId]) {
      await this.tagsService.addTagsInOrder(
        this.order.items[0].saleflow.merchant._id,
        tagId,
        this.order._id
      );
      this.selectedTags[tagId] = true;
      this.order.tags.push(tagId);
    } else {
      await this.tagsService.removeTagsInOrder(
        this.order.items[0].saleflow.merchant._id,
        tagId,
        this.order._id
      );
      this.selectedTags[tagId] = false;
      this.order.tags = this.order.tags.filter((tag) => tag !== tagId);
    }
    this.selectedTagsLength = Object.entries(this.selectedTags).filter(
      (value) => value[1]
    ).length;
  }

  async isMerchantOwner(merchant: string) {
    this.orderMerchant = await this.merchantsService.merchantDefault();
    this.isMerchant = merchant === this.orderMerchant?._id;
  }

  async changeOrderStatus(value: OrderStatusDeliveryType) {
    this.order.orderStatusDelivery = value;
    this.handleStatusOptions(value);
    await this.orderService.orderSetStatusDelivery(value, this.order._id);
  }

  handleStatusOptions(value: OrderStatusDeliveryType) {
    this.deliveryStatusOptions.forEach((option) => {
      option.hide = option.value === value;
    });
  }

}
