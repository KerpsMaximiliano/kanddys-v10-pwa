import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Item, ItemPackage } from 'src/app/core/models/item';
import { ItemsService } from 'src/app/core/services/items.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';

@Component({
  selector: 'app-new-item-display',
  templateUrl: './new-item-display.component.html',
  styleUrls: ['./new-item-display.component.scss']
})
export class NewItemDisplayComponent implements OnInit {

  item: Item;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private itemsService: ItemsService,
    private dialogService: DialogService,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
      this.item = await this.itemsService.item(params.itemId);
      if(!this.item) return this.redirect();
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
    this.router.navigate([`ecommerce/error-screen/`], {
      queryParams: { type: 'item' },
    });
  }

}
