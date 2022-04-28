import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemsService } from 'src/app/core/services/items.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import {
  Item,
  ItemPackage,
} from 'src/app/core/models/item';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemSubOrderInput } from 'src/app/core/models/order';

@Component({
  selector: 'app-package-detail',
  templateUrl: './package-detail.component.html',
  styleUrls: ['./package-detail.component.scss']
})
export class PackageDetailComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    public items: ItemsService,
    private saleflow: SaleFlowService,
    private header: HeaderService,
    private router: Router,
  ) { }

  itemData: Item[] = [];
  packageData: ItemPackage;
  scenarios: any[] = [];
  showScenarios: any[] = [];
  limitScenarios: number = 0;
  selectedsQty: number = 0;
  filters: any[] = [
    {
      title: 'Filters',
      subtitle: 'Package Filters',
      options: [],
    },
  ];
  saleflowId:string;
  orderProducts: ItemSubOrderInput[] = [];

  ngOnInit(): void {
    this.saleflow.saleflow(this.header.getSaleflow()._id).then(data =>{
      this.saleflowId = data.saleflow._id;
      this.items.itemCategories(data.saleflow.merchant._id, {}).then(data =>{
        console.log(data);
        //this.filters = data.itemCategoriesList;
        for (let i = 0; i < data.itemCategoriesList.length; i++) {
          this.filters[0].options.push({
            id:  data.itemCategoriesList[i]._id,
            label:  data.itemCategoriesList[i].name,
            type: 'label',
            selected: false,
          });
        }
      })
    })
    this.route.params.subscribe((params) => {
      this.items.itemPacakge(params.id).then(data => {
        this.packageData = data.itemPackage;
        this.listItems();
      })
    })
    
  }

  async listItems() {
    let packageItems = [];
    for (let i = 0; i < this.packageData.packageRules.length; i++) {
      packageItems.push(this.packageData.packageRules[i].item._id);
    }
    this.saleflow.listItems({
      findBy: {
        _id: {
          __in: ([] = packageItems),
        },
      },
      options: {
        limit: 60,
      },
    }).then(data => {
      for (let i = 0; i < data.listItems.length; i++) {
        if (data.listItems[i].itemExtra.length > 0) {
          this.limitScenarios = this.packageData.packageRules[i].maxQuantity;
          this.scenarios = data.listItems[i].itemExtra;
          for (let j = 0; j < this.scenarios.length; j++) {
            this.scenarios[j].isActive = false;
          }
        }
        this.orderProducts.push(
          {
            item: data.listItems[i]._id,
            itemExtra: [],
            saleflow: this.saleflowId
          }
        )
      }
    })
    console.log(this.orderProducts);
  }

  handleSelection(event) {
    this.scenarios.map(data => {
      if (data._id === event.item._id) {
        if (this.selectedsQty < this.limitScenarios && !data.isActive) {
          data.isActive = event.isSelected;
          this.selectedsQty++;
          this.orderProducts[0].itemExtra.push(data._id)
          console.log(this.orderProducts);
        }
        else if (this.selectedsQty == this.limitScenarios && data.isActive) {
          data.isActive = event.isSelected;
          console.log(this.selectedsQty);
          this.selectedsQty--;
          console.log(this.selectedsQty);
          this.orderProducts[0].itemExtra.splice(this.orderProducts[0].itemExtra.indexOf(data._id),1);
          console.log(this.orderProducts);
        }
        else if (this.selectedsQty < this.limitScenarios && data.isActive) {
          data.isActive = event.isSelected;
          console.log(this.selectedsQty);
          this.selectedsQty--;
          console.log(this.selectedsQty);
          this.orderProducts[0].itemExtra.splice(this.orderProducts[0].itemExtra.indexOf(data._id),1);
        }
      }
    })
  }

  back(){
    this.router.navigate(['/ecommerce/megaphone-v3/' + this.saleflowId]);
  }

  submit(){
    console.log('submit');
    this.header.storeOrderPackage(this.saleflowId,this.packageData._id,this.orderProducts);
    console.log(this.header.getItems(this.saleflowId));
    this.router.navigate(['/ecommerce/reservations']);
  }
}
