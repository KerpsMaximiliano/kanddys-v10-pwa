import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemsService } from 'src/app/core/services/items.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { Item, ItemExtra, ItemPackage } from 'src/app/core/models/item';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemSubOrderInput } from 'src/app/core/models/order';
import { SwiperOptions } from 'swiper';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { SaleFlow } from 'src/app/core/models/saleflow';

@Component({
  selector: 'app-package-detail',
  templateUrl: './package-detail.component.html',
  styleUrls: ['./package-detail.component.scss'],
})
export class PackageDetailComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    public items: ItemsService,
    private saleflow: SaleFlowService,
    private header: HeaderService,
    private router: Router,
    private dialogService: DialogService,
  ) {}

  itemData: Item[] = [];
  packageData: ItemPackage;
  scenarios: ItemExtra[] = [];
  showScenarios: any[] = [];
  limitScenarios: number = 3;
  selectedsQty: number = 0;
  filters: any[] = [
     {
        title: 'Filters',
        subtitle: 'Package Filters',
        options: [],
      },
   ];
   saleflowData: SaleFlow;
   orderProducts: ItemSubOrderInput[] = [];
   tags: string[] = ['#tag ID','#tag ID','#tag ID','#tag ID','#tag ID','#tag ID','#tag ID'];
   dummyscenarios: any[] = [{
    name: 'test1',
    active: false
   },
   {
    name: 'test1',
    active: false
   },
   {
    name: 'test1',
    active: false
   },
   {
    name: 'test1',
    active: false
   },
   {
    name: 'test1',
    active: false
   },
   {
    name: 'test1',
    active: false
   },];

  ngOnInit(): void {
    /* this.route.params.subscribe(async (params) => {
      this.saleflowData = await this.header.fetchSaleflow(params.saleflowId);
      if(!this.saleflowData) return new Error(`Saleflow doesn't exist`);
      this.packageData = (await this.items.itemPacakge(params.packageId)).itemPackage;
      if(!this.packageData) return this.back();
      if(this.packageData.images.length) this.openImageModal(this.packageData.images[0]);
      this.listItems();

      this.items
        .itemCategories(this.header.saleflow.merchant._id, {
          options: {
            limit: 15,
          },
        })
        .then((data) => {
          for (let i = 0; i < data.itemCategoriesList.length; i++) {
            this.filters[0].options.push({
              id: data.itemCategoriesList[i]._id,
              label: data.itemCategoriesList[i].name,
              type: 'label',
              selected: false,
            });
          }
        });
      this.header.flowRoute = `package-detail/${this.saleflowData._id}/${params.id}`;
      localStorage.setItem('flowRoute', `package-detail/${this.saleflowData._id}/${params.id}`);
    }); */
  }

  async listItems() {
    let packageItems: string[] = [];
    for (let i = 0; i < this.packageData.packageRules.length; i++) {
      packageItems.push(this.packageData.packageRules[i].item._id);
    };

    const listItems = (await this.saleflow
      .listItems({
        findBy: {
          _id: {
            __in: ([] = packageItems),
          },
        },
        options: {
          limit: 60,
        },
      })).listItems;
    if(!listItems || listItems.length === 0) return new Error('Missing data')
    for (let i = 0; i < listItems.length; i++) {
      if (listItems[i].itemExtra.length) {
        this.limitScenarios = this.packageData.packageRules[i].maxQuantity;
        this.scenarios = listItems[i].itemExtra;
        for (let j = 0; j < this.scenarios.length; j++) {
          this.scenarios[j].active = false;
        }
      }
      this.orderProducts.push({
        item: listItems[i]._id,
        itemExtra: [],
        amount: this.packageData.packageRules[i].fixedQuantity,
      });
    }
    const orderData = this.header.getOrder(this.saleflowData._id);
    if(orderData?.itemPackage !== this.packageData._id) return;
    if (orderData?.products[0].itemExtra.length) {
      this.orderProducts[0].itemExtra = orderData.products[0].itemExtra;
      this.selectedsQty = orderData.products[0].itemExtra.length;
      let index: number;
      for (let i = 0; i < orderData.products[0].itemExtra.length;i++) {
        index = this.scenarios.findIndex((object) => object._id === orderData.products[0].itemExtra[i]);
        this.scenarios[index].active = true;
      }
    } else {
      this.header.emptyOrderProducts(this.saleflowData._id);
      this.header.emptyItems(this.saleflowData._id);
    }
  }

  handleSelection(event) {
    console.log(event);
    this.scenarios.map((data) => {
      if (data._id === event.item._id) {
        if (this.selectedsQty < this.limitScenarios && !data.active) {
          data.active = event.isSelected;
          this.selectedsQty++;
          this.orderProducts[0].itemExtra.push(data._id);
        } else if (this.selectedsQty == this.limitScenarios && data.active) {
          data.active = event.isSelected;
          this.selectedsQty--;
          this.orderProducts[0].itemExtra.splice(
            this.orderProducts[0].itemExtra.indexOf(data._id),
            1
          );
        } else if (this.selectedsQty == this.limitScenarios && !data.active) {
          let index = this.scenarios.findIndex((object) => {
            return object._id === this.orderProducts[0].itemExtra[0];
          });
          this.scenarios[index].active = false;
          this.orderProducts[0].itemExtra.splice(0, 1);
          data.active = event.isSelected;
          this.orderProducts[0].itemExtra.push(data._id);
        } else if (this.selectedsQty < this.limitScenarios && data.active) {
          data.active = event.isSelected;
          this.selectedsQty--;
          this.orderProducts[0].itemExtra.splice(
            this.orderProducts[0].itemExtra.indexOf(data._id),
            1
          );
        }
      }
    });
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

  back() {
    this.router.navigate(['/ecommerce/store/' + this.saleflowData._id]);
  }

  submit() {
    this.orderProducts[0].saleflow = this.saleflowData._id;
    this.header.emptyItems(this.saleflowData._id);
    this.header.storeOrderPackage(
      this.saleflowData._id,
      this.packageData._id,
      this.orderProducts
    );
    this.header.storeItem(this.saleflowData._id, this.packageData);
    this.header.hasScenarios = true;
    this.header.isComplete.scenarios = true;
    this.header.storeOrderProgress(this.header.saleflow?._id);
    this.router.navigate(['/ecommerce/reservations']);
  }
}
