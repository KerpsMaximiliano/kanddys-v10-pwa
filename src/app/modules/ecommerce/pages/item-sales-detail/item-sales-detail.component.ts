import { Component, OnInit } from '@angular/core';
import { Item } from 'src/app/core/models/item';
import { ItemsService } from 'src/app/core/services/items.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ItemList } from 'src/app/shared/components/item-list/item-list.component';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
import { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-item-sales-detail',
  templateUrl: './item-sales-detail.component.html',
  styleUrls: ['./item-sales-detail.component.scss']
})
export class ItemSalesDetailComponent implements OnInit {
  itemData: Item;
  swiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: true,
    spaceBetween: 5,
  };
  tabs: string[] = ["44 Compradores", "1,457 Ventas"];
  orders: ItemList[] = [
    {
      visible: true,
      id: 'adsadasdasdsa',
      image: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1648833244956.png',
      title: '$9000',
      subtitle: 'Custom Field',
      text_left: 'Hace 2 dias' ,
      text_right: '4 etiqueta(s)',
      text_style: true,
      phone: '534534534534675',
      add_tag: true,
      description2: 'dasdasdas',
      description: 'gdgdfgfdg',
      text_middle: 'ddddddd',
      bonus: '50'
    },
    {
      visible: true,
      id: 'adsadasdasdsa',
      image: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1648833244956.png',
      title: '$9000',
      subtitle: 'Custom Field',
      text_left: 'Hace 2 dias' ,
      text_right: '4 etiqueta(s)',
      text_style: true,
      phone: '534534534534675',
      add_tag: true,
    },
    {
      visible: true,
      id: 'adsadasdasdsa',
      image: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/item-images/1648833244956.png',
      title: '$9000',
      subtitle: 'Custom Field',
      text_left: 'Hace 2 dias' ,
      text_right: '4 etiqueta(s)',
      text_style: true,
      phone: '534534534534675',
      add_tag: true,
    },
  ];

  constructor(
    private dialog: DialogService,
    private itemService: ItemsService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.itemData = await this.itemService.item("628d47985d291213549ccb50");
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
