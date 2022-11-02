import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ShowItemsComponent } from 'src/app/shared/dialogs/show-items/show-items.component';

@Component({
  selector: 'app-ecommerce',
  templateUrl: './ecommerce.component.html',
  styleUrls: ['./ecommerce.component.scss'],
})
export class EcommerceComponent implements OnInit {
  showCartButtons: boolean = false;
  activePath: string;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialogService: DialogService,
    public headerService: HeaderService,
    private appService: AppService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(async ({ saleflowId }) => {
      await this.headerService.fetchSaleflow(saleflowId);
      this.setColorScheme();
      this.headerService.getOrder();
      this.headerService.getItems();
      this.headerService.getOrderProgress();
      this.activePath = this.route.firstChild.routeConfig.path;
      this.router.events
        .pipe(filter((evt) => evt instanceof NavigationEnd))
        .subscribe(() => {
          this.activePath = this.route.firstChild.routeConfig.path;
        });
    });
    this.appService.events
      .pipe(filter((e) => e.type === 'auth'))
      .subscribe((e) => {
        if (e.data) this.setColorScheme();
      });
  }

  setColorScheme() {
    this.headerService.colorTheme =
      this.headerService.user?._id ===
      this.headerService.saleflow?.merchant?.owner?._id
        ? '#2874AD'
        : '#272727';
  }

  showShoppingCartDialog = () => {
    this.dialogService.open(ShowItemsComponent, {
      type: 'flat-action-sheet',
      props: {
        orderFinished: !(
          this.activePath === 'item-detail/:id' ||
          this.activePath === 'store'
        ),
        headerButton: this.activePath !== 'store' && 'Ver mas productos',
        headerCallback: () =>
          this.router.navigate([
            `/ecommerce/${this.headerService.saleflow._id}/store`,
          ]),
        footerCallback: async () => {
          if (this.headerService.checkoutRoute) {
            this.router.navigate([this.headerService.checkoutRoute], {
              replaceUrl: true,
            });
            return;
          }
          this.router.navigate([
            `/ecommerce/${this.headerService.saleflow._id}/checkout`,
          ]);
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  };
}