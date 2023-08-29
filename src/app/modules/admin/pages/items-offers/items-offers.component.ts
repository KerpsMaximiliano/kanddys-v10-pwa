import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Item, ItemInput } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { FormComponent, FormData } from 'src/app/shared/dialogs/form/form.component';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-items-offers',
  templateUrl: './items-offers.component.html',
  styleUrls: ['./items-offers.component.scss']
})
export class ItemsOffersComponent implements OnInit {
  drawerOpened: boolean = false;
  itemSearchbar: FormControl = new FormControl('');
  showSearchbar: boolean = true;
  view: 'LIST' | 'SEARCH' = 'LIST';
  assetsURL: string = environment.assetsUrl;
  merchantId: string;
  saleFlowItemsId = [];
  listItems;
  unitsForItemsThatYouDontSell: Record<string, number> = {};
  itemsISell: Array<Item> = [];
  itemsIDontSell: Array<Item> = [];
  stock:number;
  private clickSubject = new Subject();

  constructor(private dialog: MatDialog,
              private merchantService: MerchantsService,
              private saleFlowService: SaleFlowService,
              private itemService: ItemsService
  ) { 
    this.clickSubject.pipe(debounceTime(500)).subscribe((data) => {
      this.executeDelayedProcess(data);
    });
  }


  async ngOnInit() {
    this.merchantId = await this.getMerchantId();
    await this.getSaleFlowItemsId();
    await this.getListItems();
  }

  async getMerchantId() {
    const merchant: Merchant = await this.merchantService.merchantDefault();
    return merchant._id
  }

  async getSaleFlowItemsId(){
    const saleFlowDefault = await this.saleFlowService.saleflowDefault(this.merchantId);
   const saleFlow = Object.keys(saleFlowDefault).map(data =>{
      return saleFlowDefault[data]
    })
   const getIds = this.getItemIds(saleFlow);
   return getIds;
  }

  getItemIds(saleFlow) {
    const ids = [];

    saleFlow.forEach(item => {
        if (Array.isArray(item)) {
          item.forEach(subItem => {
                if (subItem && subItem.item && subItem.item._id) {
                    ids.push(subItem.item._id);
                }
            });
        } else if (item && item.item && item.item._id) {
            ids.push(item.item._id);
        }
    });

    return ids;
}

async getListItems(searchName = ""){
  const ids = await this.getSaleFlowItemsId();
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
  const items = await this.saleFlowService.listItems(pagination, true,searchName);
  const listItemsResponse = Object.keys(items).map(data =>{
    return items[data]
  })
  this.listItems = [];
  listItemsResponse[0].forEach(item => {
    this.listItems.push({
      _id:item._id,
      name: item.name,
      images: item.images,
      description: item.description,
      pricing: item.pricing,
      activeOffer: item.activeOffer,
      stock: item.stock,
      offerExpiration: item.offerExpiration ? this.getTimeDifference(item.offerExpiration) : ""
    })
  })
  this.listItems.sort(this.compareItems)
}

  changeView = async (newView: 'LIST' | 'SEARCH') => {
    this.view = newView;
    if (newView === 'SEARCH') {
      setTimeout(() => {
       (
          document.querySelector(
            '#search-from-results-view'
          ) as HTMLInputElement
        )?.focus();
      }, 100);
    }
  };

  async searchItems(event){
    setTimeout(async () => {
      await this.getListItems(this.itemSearchbar.value);
     }, 300);
  }

  openAddButtonOptionsMenu() { }
  openHeaderDotOptions() { }
  goToStore() { }

  async addPrice(item) {
    let fieldsToCreate: FormData = {
      fields: [
        {
          label:
            '¿Cuál es el precio de tu Oferta Flash? (precio normal $'+item.pricing+')',
          name: 'price',
          type: 'currency',
          validators: [Validators.pattern(/[\S]/), Validators.min(1)],
        },
      ],
      buttonsTexts: {
        accept: 'Exhibirlo a los Miembros',
        cancel: 'Cancelar',
      },
      automaticallyFocusFirstField: true,
    };

    const dialogRef = this.dialog.open(FormComponent, {
      data: fieldsToCreate,
    });

    dialogRef.afterClosed().subscribe(async (result: FormGroup) => {
      const price = Number(result.value['price']);
      if (result.controls.price.valid && price > 0) {
        lockUI();
        let itemsInput:ItemInput;
        if(item.activeOffer){
          itemsInput = {
            pricing: price,
            activeOffer: true
          }
        }else{
          itemsInput = {
            offerPrice: price,
            activeOffer: true
          }
        }
        const updatePrice = await this.itemService.updateItem(itemsInput, item._id);
        this.listItems = [];
        await this.getListItems();
        unlockUI();
      }
    });
  }

  getTimeDifference(time){
    const targetDate = moment(time);
    const currentDate = moment();
    const hoursDifference = targetDate.diff(currentDate, 'hours');
    return hoursDifference;
  }

  compareItems(prev: any, next: any) {
    if (prev.activeOffer && !next.activeOffer) {
      return -1;
    }
    if (!prev.activeOffer && next.activeOffer) {
      return 1;
    }
    return 0;
  }

  async changeAmount(item, type: 'add' | 'subtract', itemIndex) {
    try {      
      let newAmount: number;
      if (type === 'add') {
        newAmount = item.stock >= 0 ? item.stock + 1 : 1;
        this.listItems[itemIndex].stock = newAmount;
      } else if (type === 'subtract') {
        newAmount = item.stock >= 1 ? item.stock - 1 : 0;
        this.listItems[itemIndex].stock = newAmount;
      }

      const data = {
        _id: item._id,
        stock: newAmount
      }

      this.clickSubject.next(data);

    } catch (error) {
      console.log(error);
      
    }
  }

  executeDelayedProcess(data) {
    this.itemService.updateItem(
      {
        stock: data.stock,
      },
      data._id
    );
  }

}
