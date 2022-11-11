import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import { AppService } from 'src/app/app.service';
import { Item, ItemParamValue } from 'src/app/core/models/item';
import { ItemSubOrderInput } from 'src/app/core/models/order';
import { Tag } from 'src/app/core/models/tags';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ShowItemsComponent } from 'src/app/shared/dialogs/show-items/show-items.component';
import { environment } from 'src/environments/environment';
import { SwiperOptions } from 'swiper';
import SwiperCore, { Virtual } from 'swiper/core';

SwiperCore.use([Virtual]);

interface ExtendedTag extends Tag {
  selected?: boolean;
}

type TypesOfMenu = 'TAGS' | 'DESCRIPTION';
type ValidEntities = 'item' | 'post';

@Component({
  selector: 'app-article-detail',
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.scss'],
})
export class ArticleDetailComponent implements OnInit {
  env: string = environment.assetsUrl;
  controllers: FormArray = new FormArray([]);
  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    freeMode: false,
    spaceBetween: 0,
    autoplay: {
      delay: 10000,
      stopOnLastSlide: true,
      disableOnInteraction: false,
    },
  };
  currentMediaSlide: number = 0;
  entity: ValidEntities;
  entityId: string;
  itemData: Item = null;
  itemTags: Array<ExtendedTag> = [];
  selectedParam: {
    param: number;
    value: number;
  };
  isItemInCart: boolean = false;
  menuOpened: boolean;
  previewMode: boolean;
  typeOfMenuToShow: TypesOfMenu;
  swiperConfigTag: SwiperOptions = {
    slidesPerView: 5,
    freeMode: false,
    spaceBetween: 0,
  };
  fractions: string = '';
  timer: NodeJS.Timeout;

  @ViewChild('mediaSwiper') mediaSwiper: SwiperComponent;

  constructor(
    private itemsService: ItemsService,
    private tagsService: TagsService,
    public headerService: HeaderService,
    private route: ActivatedRoute,
    private router: Router,
    private appService: AppService,
    private dialogService: DialogService,
    private ngNavigatorShareService: NgNavigatorShareService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(async (routeParams) => {
      const validEntities = ['item', 'post'];
      const { saleflowId, entity, entityId } = routeParams;
      if (!this.headerService.saleflow)
        this.headerService.fetchSaleflow(saleflowId);

      if (validEntities.includes(entity)) {
        this.entityId = entityId;
        this.entity = entity;

        await this.getItemData();
        this.itemInCart();
      } else {
        this.router.navigate([`others/error-screen/`]);
      }
    });
  }

  async getItemData() {
    try {
      this.itemData = await this.itemsService.item(this.entityId);
      this.updateFrantions();
      this.itemTags = await this.tagsService.tagsByUser();
      this.itemTags?.forEach((tag) => {
        tag.selected = this.itemData.tags?.includes(tag._id);
      });

      this.currentMediaSlide = this.mediaSwiper.directiveRef.getIndex();
      if (this.itemData.images?.length < 2) this.startTimeout();
    } catch (error) {
      console.error(error);
      this.router.navigate([`others/error-screen/`]);
    }
  }

  async onTagClick(tag: ExtendedTag) {
    try {
      if (tag.selected) {
        const result = await this.tagsService.itemRemoveTag(
          tag._id,
          this.entityId
        );
        if (!result) throw new Error('Error al remover el tag');
        tag.selected = false;
      } else {
        const result = await this.tagsService.itemAddTag(
          tag._id,
          this.entityId
        );
        if (!result) throw new Error('Error al agregar el tag');
        tag.selected = true;
      }
    } catch (error) {
      console.log(error);
    }
  }

  startTimeout() {
    this.timer = setTimeout(() => {
      if (this.route.snapshot.queryParamMap.get('mode') === 'saleflow') {
        const index = this.headerService.saleflow.items.findIndex(
          (saleflowItem) => saleflowItem.item._id === this.itemData._id
        );
        for (let i = 1; i < this.headerService.saleflow.items.length; i++) {
          if (
            this.headerService.saleflow.items[index - i].item.status ===
              'active' ||
            this.headerService.saleflow.items[index - i].item.status ===
              'featured'
          ) {
            this.itemData = null;
            this.router.navigate(
              [`../${this.headerService.saleflow.items[index - i].item._id}`],
              {
                relativeTo: this.route,
                queryParamsHandling: 'preserve',
              }
            );
            break;
          }
        }
      }
    }, 10000);
  }

  updateCurrentSlideData(event: any) {
    this.currentMediaSlide = this.mediaSwiper.directiveRef.getIndex();
    if (this.itemData.images.length === this.currentMediaSlide + 1) {
      this.startTimeout();
    } else if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  saveProduct() {
    const product: ItemSubOrderInput = {
      item: this.itemData._id,
      amount: 1,
    };

    if (this.selectedParam) {
      product.params = [
        {
          param: this.itemData.params[this.selectedParam.param]._id,
          paramValue:
            this.itemData.params[this.selectedParam.param].values[
              this.selectedParam.value
            ]._id,
        },
      ];
      const paramValue =
        this.itemData.params[this.selectedParam.param].values[
          this.selectedParam.value
        ]._id;
      this.paramFromSameItem(paramValue);
    }

    this.headerService.storeOrderProduct(
      this.headerService.saleflow._id,
      product
    );
    const itemParamValue: ItemParamValue = this.selectedParam
      ? {
          ...this.itemData.params[this.selectedParam.param].values[
            this.selectedParam.value
          ],
          price:
            this.itemData.pricing +
            this.itemData.params[this.selectedParam.param].values[
              this.selectedParam.value
            ].price,
        }
      : null;

    this.appService.events.emit({
      type: 'added-item',
      data: this.itemData._id,
    });
    this.headerService.storeItem(
      this.headerService.saleflow._id,
      this.selectedParam ? itemParamValue : this.itemData
    );
    this.itemInCart();
    this.showItems();
  }

  paramFromSameItem(id: string) {
    const products = this.headerService.getItems(
      this.headerService.saleflow._id
    );
    products?.forEach((product) => {
      if (!product.params) {
        this.itemData.params[0].values.forEach((value) => {
          if (id != product._id && value._id == product._id) {
            this.headerService.removeItem(
              this.headerService.saleflow._id,
              product._id
            );
            this.headerService.removeOrderProduct(
              this.headerService.saleflow._id,
              product._id
            );
          }
        });
      }
    });
    return;
  }

  itemInCart() {
    const productData = this.headerService.getItems(
      this.headerService.saleflow._id
    );
    if (productData?.length) {
      this.isItemInCart = productData.some(
        (item) =>
          item._id === this.itemData._id ||
          item._id ===
            this.itemData.params?.[this.selectedParam?.param]?.values?.[
              this.selectedParam?.value
            ]?._id
      );
    } else this.isItemInCart = false;
  }

  openMenu(typeOfMenu: TypesOfMenu) {
    this.menuOpened = !this.menuOpened;
    this.typeOfMenuToShow = typeOfMenu;
  }

  async share() {
    await this.ngNavigatorShareService
      .share({
        title: '',
        url:
          environment.uri +
          '/ecommerce/' +
          this.headerService.saleflow._id +
          '/article-detail/' +
          this.entity +
          '/' +
          this.entityId,
      })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  showItems() {
    if (this.previewMode) return;
    this.dialogService.open(ShowItemsComponent, {
      type: 'flat-action-sheet',
      props: {
        headerButton: 'Ver más productos',
        headerCallback: () =>
          this.router.navigate(
            [`/ecommerce/store/${this.headerService.saleflow._id}`],
            {
              replaceUrl: this.headerService.checkoutRoute ? true : false,
            }
          ),
        footerCallback: () => {
          if (this.headerService.checkoutRoute) {
            this.router.navigate([this.headerService.checkoutRoute], {
              replaceUrl: true,
            });
            return;
          }
          if (this.headerService.saleflow.module?.post) {
            this.router.navigate([
              `/ecommerce/${this.headerService.saleflow._id}/create-giftcard`,
            ]);
            return;
          }
          if (this.headerService.saleflow.module?.appointment?.calendar?._id) {
            this.router.navigate([
              `/ecommerce/${this.headerService.saleflow._id}/reservations/${this.headerService.saleflow.module.appointment.calendar._id}`,
            ]);
            return;
          }
          if (this.headerService.saleflow.module?.delivery) {
            this.router.navigate([
              `/ecommerce/${this.headerService.saleflow._id}/new-address`,
            ]);
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
  }

  back() {
    if (this.previewMode) {
      if (this.itemData._id)
        return this.router.navigate([
          `/admin/create-article/${this.itemData._id}`,
        ]);
      else return this.router.navigate([`/admin/create-article`]);
    }
    if (this.selectedParam) {
      this.selectedParam = null;
      return;
    }
    this.itemsService.removeTemporalItem();
    this.router.navigate(
      [`/ecommerce/store/${this.headerService.saleflow._id}`],
      {
        replaceUrl: this.headerService.checkoutRoute ? true : false,
      }
    );
  }

  updateFrantions(): void {
    this.fractions = this.itemData.images
      .map(
        () =>
          `${
            this.itemData.images.length < 3
              ? '1'
              : this.getRandomArbitrary(0, this.itemData.images.length)
          }fr`
      )
      .join(' ');
  }

  getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }
}
