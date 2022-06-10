import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Item, ItemPackage } from 'src/app/core/models/item';
import { ItemsService } from 'src/app/core/services/items.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';

@Component({
  selector: 'app-new-item-display',
  templateUrl: './new-item-display.component.html',
  styleUrls: ['./new-item-display.component.scss']
})
export class NewItemDisplayComponent implements OnInit {
  @Input() item: Item;
  shouldRedirectToPreviousPage: boolean = false;

  isOwner: boolean = true;

  tagsData: Array<any> = [ '', '', '', ''];

  tapped: boolean = false;

  env: string = environment.assetsUrl;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private itemsService: ItemsService,
    private dialogService: DialogService,
    private headerService: HeaderService,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
      if (params.itemId) {
        this.item = await this.itemsService.item(params.itemId);
        this.shouldRedirectToPreviousPage = true;
        if (!this.item) return this.redirect();
      }
      //  else {
      //   if (this.headerService.newTempItem) {
      //     this.item = this.headerService.newTempItem;
      //     this.shouldRedirectTo = this.headerService.newTempItemRoute;
      //   }
      // }
    })
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

  redirect() {
    if (!this.shouldRedirectToPreviousPage) {
      this.router.navigate([`ecommerce/error-screen/`], {
        queryParams: { type: 'item' },
      });
    } else {
      this.location.back();
    }
  }

  tapping(){
    this.tapped = !this.tapped;
  }

}
