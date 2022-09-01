import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { OrderService } from 'src/app/core/services/order.service';
import { environment } from 'src/environments/environment';
import { ImageViewComponent } from '../../dialogs/image-view/image-view.component';

@Component({
  selector: 'app-leadword-list',
  templateUrl: './leadword-list.component.html',
  styleUrls: ['./leadword-list.component.scss'],
})
export class LeadwordListComponent implements OnInit {
  constructor(
    private router: Router,
    public merchant: MerchantsService,
    private app: AppService,
    private route: ActivatedRoute,
    private dialog: DialogService,
    public order: OrderService,
    public auth: AuthService
  ) {}

  @Input() list: any[];
  @Input() numberMail: boolean = false;
  @Input() ignore: boolean;
  @Input() authData: boolean = false;
  @Output() authOption = new EventEmitter();
  @Output() getIndex = new EventEmitter();
  merchantID: any;
  isLogged: any;
  orderData: any;
  @Input() orderId: string;
  testID: string;
  // @Input() type: string;
  fullLink: string;
  env: string = environment.assetsUrl;

  ngOnInit(): void {
    //this.checkLogin();
  }

  goLink(i: number, type?: string) {
    this.getIndex.emit(i);
  }

  lookForOrder() {
    this.route.params.subscribe((params) => {
      this.order.order(params.id).then((data) => {
        this.orderData = data.order;
        this.merchantID = this.orderData.merchants[0]._id;
        this.testID = params.id;
        this.orderId = data.order._id;
      });
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
}
