import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Item, ItemPackage } from 'src/app/core/models/item';
import { ItemsService } from 'src/app/core/services/items.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';

@Component({
  selector: 'app-new-item-display',
  templateUrl: './new-item-display.component.html',
  styleUrls: ['./new-item-display.component.scss']
})
export class NewItemDisplayComponent implements OnInit {
  @Input() item: Item;
  shouldRedirectTo: string = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private itemsService: ItemsService,
    private dialogService: DialogService,
    private headerService: HeaderService,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
      if (params.itemId) {
        this.item = await this.itemsService.item(params.itemId);
        if (!this.item) return this.redirect();
      } else {
        if (this.headerService.newTempItem) {
          this.item = this.headerService.newTempItem;
          this.shouldRedirectTo = this.headerService.newTempItemRoute;
        }
      }
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
    if (!this.shouldRedirectTo) {
      this.router.navigate([`ecommerce/error-screen/`], {
        queryParams: { type: 'item' },
      });
    } else {
      this.router.navigate([this.shouldRedirectTo]);
    }
  }

}
