import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { HeaderService } from 'src/app/core/services/header.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ShowItemsComponent } from 'src/app/shared/dialogs/show-items/show-items.component';

@Component({
  selector: 'app-ecommerce',
  templateUrl: './ecommerce.component.html',
  styleUrls: ['./ecommerce.component.scss'],
})
export class EcommerceComponent implements OnInit {
  itemCartAmount: number;
  itemEvent: Subscription;
  showCartButtons: boolean = false;
  activePath: string;
  allowMultipleItems: boolean;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialogService: DialogService,
    private headerService: HeaderService,
    private saleflowService: SaleFlowService,
    private appService: AppService
  ) {
    this.saleflowService.saleflowSubject.subscribe({
      next: (s) => {
        this.headerService.saleflow = s as SaleFlow;
        this.allowMultipleItems =
          this.headerService.saleflow.canBuyMultipleItems;
        this.getOrder();
      },
    });
  }

  ngOnInit(): void {
    this.activePath = this.route.firstChild.routeConfig.path;
    this.router.events
      .pipe(filter((evt) => evt instanceof NavigationEnd))
      .subscribe(() => {
        this.activePath = this.route.firstChild.routeConfig.path;
      });
    this.itemEvent = this.appService.events
      .pipe(filter((e) => e.type === 'deleted-item' || e.type === 'added-item'))
      .subscribe((e) => {
        this.getItemsAmount();
      });
  }

  getOrder() {
    this.headerService.order = this.headerService.getOrder(
      this.headerService.saleflow?._id
    );
    this.getItemsAmount();
  }

  getItemsAmount() {
    this.itemCartAmount = this.headerService.order?.products?.length;
  }

  ngOnDestroy() {
    this.itemEvent.unsubscribe();
  }

  showShoppingCartDialog = () => {
    this.dialogService.open(ShowItemsComponent, {
      type: 'flat-action-sheet',
      props: {
        orderFinished: !(
          this.activePath === 'item-detail/:saleflow/:id' ||
          this.activePath === 'store/:id'
        ),
        headerButton: this.activePath !== 'store/:id' && 'Ver mas productos',
        headerCallback: () =>
          this.router.navigate([
            `/ecommerce/store/${this.headerService.saleflow._id}`,
          ]),
        footerCallback: async () => {
          if (this.headerService.saleflow.module?.post)
            this.router.navigate(['/ecommerce/create-giftcard']);
          else if (this.headerService.saleflow.module?.delivery)
            this.router.navigate(['/ecommerce/new-address']);
          else this.router.navigate([`/ecommerce/checkout`]);
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  };
}
