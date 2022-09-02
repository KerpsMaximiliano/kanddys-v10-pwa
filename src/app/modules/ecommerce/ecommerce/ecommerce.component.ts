import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
// import { Subscription } from 'rxjs';
// import { filter } from 'rxjs/operators';
// import { AppService } from 'src/app/app.service';
// import { HeaderService } from 'src/app/core/services/header.service';
// import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
// import { ShowItemsComponent } from 'src/app/shared/dialogs/show-items/show-items.component';

@Component({
  selector: 'app-ecommerce',
  templateUrl: './ecommerce.component.html',
  styleUrls: ['./ecommerce.component.scss'],
})
export class EcommerceComponent implements OnInit {
  // itemCartAmount: number;
  // itemEvent: Subscription;
  // showCartButtons: boolean = false;
  // activePath: string;
  constructor(
    // private route: ActivatedRoute,
    // private router: Router,
    // private dialogService: DialogService,
    // private headerService: HeaderService,
    // private appService: AppService
  ) {}

  ngOnInit(): void {
    // this.activePath = this.route.firstChild.routeConfig.path;
    // this.router.events
    //   .pipe(filter((evt) => evt instanceof NavigationEnd))
    //   .subscribe(() => {
    //     this.activePath = this.route.firstChild.routeConfig.path;
    //   });
    // this.headerService.saleflow = this.headerService.getSaleflow();
    // this.headerService.order = this.headerService.getOrder(
    //   this.headerService.saleflow?._id
    // );
    // this.getItemsAmount();

    // this.itemEvent = this.appService.events
    //   .pipe(filter((e) => e.type === 'deleted-item' || e.type === 'added-item'))
    //   .subscribe((e) => {
    //     console.log('fsdfsdf');
    //     this.getItemsAmount();
    //   });
  }

  // getItemsAmount() {
  //   this.itemCartAmount = this.headerService.order?.products?.length;
  // }

  // ngOnDestroy() {
  //   this.itemEvent.unsubscribe();
  // }

  // showShoppingCartDialog = () => {
  //   this.dialogService.open(ShowItemsComponent, {
  //     type: 'flat-action-sheet',
  //     props: {
  //       orderFinished: !(
  //         this.activePath === 'item-detail/:saleflow/:id' ||
  //         this.activePath === 'store/:id'
  //       ),
  //       headerButton: this.activePath !== 'store/:id' && 'Ver mas productos',
  //       headerCallback: () =>
  //         this.router.navigate([
  //           `/ecommerce/store/${this.headerService.saleflow._id}`,
  //         ]),
  //       footerCallback: async () => {
  //         if (this.headerService.saleflow.module?.post)
  //           this.router.navigate(['/ecommerce/create-giftcard']);
  //         else if (this.headerService.saleflow.module?.delivery)
  //           this.router.navigate(['/ecommerce/new-address']);
  //         else this.router.navigate([`/ecommerce/checkout`]);
  //       },
  //     },
  //     customClass: 'app-dialog',
  //     flags: ['no-header'],
  //   });
  // };
}
