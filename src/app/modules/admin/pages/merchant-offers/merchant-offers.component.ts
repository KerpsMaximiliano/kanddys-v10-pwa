import { Component, OnInit } from '@angular/core';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { ItemsService } from 'src/app/core/services/items.service';

@Component({
  selector: 'app-merchant-offers',
  templateUrl: './merchant-offers.component.html',
  styleUrls: ['./merchant-offers.component.scss']
})
export class MerchantOffersComponent implements OnInit {
  drawerOpened: boolean = false;
  listItems = [];
  constructor(private itemService: ItemsService,
              ) { }

  async ngOnInit() {
    await this.getSuppliers();
  }

  async getSuppliers(){
    const paginate: PaginationInput = {
      findBy:{
        activeOffer: true,
        type: "supplier"
      }
    }
    const suppliers = await this.itemService.itemsSuppliersPaginate(paginate);
    const suppliersResults = Object.keys(suppliers).map(data =>{
      return suppliers[data].results
    })
    const suppliersId: string[] = [];
    suppliersResults[0].forEach(supplier => {
      if (supplier.items && Array.isArray(supplier.items)) {
        suppliersId.push(...supplier.items);
      }
    });
    await this.getListItems(suppliersId, suppliersResults[0]);

  }

  async getListItems(ids, suppliers){
    const pagination: PaginationInput = {
      findBy: {
        _id: {
          __in: ids
        },
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: -1,
        page: 1,
      },
    };
    const items = await this.itemService.listItems(pagination);
    const listItemsResponse = Object.keys(items).map(data =>{
      return items[data]
    })
    await this.updateListItems(suppliers,listItemsResponse);
  }

  async findAdditionalData(listItems, id) {
    const items = listItems[0].find(data => data._id === id);
    return items;
  }

 async updateListItems(suppliers, listItems){
  let updatedListItems = [];
    suppliers.forEach(async supplier => {
      let supplierItems = [];
      await supplier.items.forEach(async (item:any) =>{
        const items = await this.findAdditionalData(listItems, item);
        supplierItems.push(items);
      })
      updatedListItems.push({
        parent_id: supplier.parentItem._id,
        name: supplier.parentItem.name,
        description: supplier.parentItem.description,
        images: supplier.parentItem.images,
        suppliers: supplierItems
      })      
    })
  this.listItems = updatedListItems;
 }

 getAverage(suppliers){
  let price:number = 0;
  suppliers.forEach(item =>{
    price+=item.pricing
  })
  const avgPrice = price/suppliers.length
  return avgPrice.toFixed(2);
 }
}
