import { Component, OnInit } from '@angular/core';
import { ItemOrder } from 'src/app/core/models/order';
import { OrderService } from 'src/app/core/services/order.service';
import { formatID, isVideo } from 'src/app/core/helpers/strings.helpers';
import { ActivatedRoute } from '@angular/router';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-gift-detail',
  templateUrl: './gift-detail.component.html',
  styleUrls: ['./gift-detail.component.scss'],
})
export class GiftDetailComponent implements OnInit {
  env: string = environment.assetsUrl;
  order: ItemOrder;
  orderDate: string;
  redirectTo: string = null;
  notify: boolean = false;
  default: boolean = true;
  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(async (queryParams) => {
      const { notify: notification, redirectTo } = queryParams;
      this.notify = Boolean(notification);
      this.redirectTo = redirectTo;

      if (typeof redirectTo === 'undefined') this.redirectTo = null;

      this.route.params.subscribe(async (params) => {
        const { orderId } = params;

        await this.executeProcessesAfterLoading(orderId, notification);
      });
    });
  }

  async executeProcessesAfterLoading(orderId: string, notification?: string) {
    this.order = (await this.orderService.order(orderId))?.order;

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

    const today = new Date(this.order.createdAt);
    const utcOffset = today.getTimezoneOffset() / 60;
    const todayFromISO = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ).toISOString();
  }

  formatId(dateId: string) {
    return formatID(dateId);
  }

  urlIsVideo(url: string) {
    return isVideo(url);
  }

  openImageModal(imageSourceURL: string) {
    this.dialogService.open(ImageViewComponent, {
      type: 'fullscreen-translucent',
      props: {
        imageSourceURL,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }
}
