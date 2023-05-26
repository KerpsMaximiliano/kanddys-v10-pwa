import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { ContactService } from 'src/app/core/services/contact.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
// import { DialogService } from 'src/app/libs/dialog/services/dialog.service';

@Component({
  selector: 'app-ecommerce',
  templateUrl: './ecommerce.component.html',
  styleUrls: ['./ecommerce.component.scss'],
})
export class EcommerceComponent implements OnInit {
  showCartButtons: boolean = false;
  activePath: string;
  suscription: Subscription;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    // private dialogService: DialogService,
    public headerService: HeaderService,
    private appService: AppService,
    private _MerchantsService: MerchantsService,
    private contactService: ContactService,
    private _SaleflowService: SaleFlowService,
    private _Location: Location
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(async ({ merchantSlug }) => {
      const saleflow = (await this._SaleflowService.saleflow(merchantSlug))
        ?.saleflow;
      if (saleflow) {
        const url = this.router
          .createUrlTree([
            this._Location
              .path()
              .split('?')[0]
              .replace(merchantSlug, saleflow.merchant.slug),
          ])
          .toString();

        this.router.navigate([url], {
          replaceUrl: true,
          queryParamsHandling: 'preserve',
        });
        return;
      }
      if (!saleflow) {
        const merchant = await this._MerchantsService.merchantBySlug(
          merchantSlug
        );
        if (!merchant) {
          // console.log('no hay merchant');
        }
        const saleflow = await this._SaleflowService.saleflowDefault(
          merchant._id
        );
        if (!saleflow) {
          // .log('no hay saleflow');
        }
        this.headerService.saleflow = saleflow;
        this.headerService.storeSaleflow(saleflow);
      }
      this.setColorScheme();
      this.headerService.getOrder();
      this.headerService.getItems();
      this.headerService.getOrderProgress();
      this.headerService.emptyPost();
      this.headerService.merchantContact = (
        await this.contactService.contacts({
          findBy: {
            user: this.headerService.saleflow.merchant.owner._id,
          },
          options: {
            limit: 1,
            sortBy: 'createdAt:desc',
          },
        })
      )[0];
      this.activePath = this.route.firstChild.routeConfig.path;

      if (this.router.url.includes('/store'))
        this.headerService.emptyMediaPost();

      this.router.events
        .pipe(filter((evt) => evt instanceof NavigationEnd))
        .subscribe(() => {
          this.activePath = this.route.firstChild.routeConfig.path;
        });
    });
    this.suscription = this.appService.events
      .pipe(filter((e) => e.type === 'auth'))
      .subscribe((e) => {
        this.setColorScheme();
      });
  }

  ngOnDestroy() {
    this.suscription.unsubscribe();
  }

  setColorScheme() {
    this.headerService.colorTheme =
      this.headerService.user?._id ===
      this.headerService.saleflow?.merchant?.owner?._id
        ? '#2874AD'
        : '#272727';
  }

  goToCheckout = () => {
    this.router.navigate([
      '/ecommerce/' + this.headerService.saleflow.merchant.slug + '/cart',
    ]);
  };
}
