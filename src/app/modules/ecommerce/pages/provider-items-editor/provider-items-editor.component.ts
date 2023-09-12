import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Item, ItemInput } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { PaginationInput, SaleFlow } from 'src/app/core/models/saleflow';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-provider-item-editor',
  templateUrl: './provider-items-editor.component.html',
  styleUrls: ['./provider-items-editor.component.scss'],
})
export class ProviderItemsEditorComponent implements OnInit {
  
  currency:string = "$";
  changePrice: FormControl = new FormControl('', [
    Validators.min(0.00),
  ]);
  changeStock: FormControl = new FormControl('0', [
    Validators.min(0),
  ]);
  showCurrencyEditor: boolean = true;
  showStockEditor: boolean = false;
  infiniteIcon: string = environment.assetsUrl+"/infinite.png"
  articleId;
  itemData: Item;
  merchantId;
  infinite:boolean = false;
  saleFlowId;
  stock:number = 0;
  constructor( private route: ActivatedRoute,
              private itemService: ItemsService,
              private merchant: MerchantsService,
              private saleflowService: SaleFlowService) {}

  async ngOnInit() {
    this.route.params.subscribe(async (params) => {
      const { articleId } = params;
      this.articleId = articleId;
    });
    await this.getItemData();
    await this.getMerchantDefault();
    await this.getSaleFlowDefault();
  }

  back(){

  }

  async getItemData(){
    console.log("entro por aca");
    
    this.itemData = await this.itemService.item(this.articleId);
    console.log("🚀 ~ file: provider-items-editor.component.ts:51 ~ ProviderItemsEditorComponent ~ getItemData ~ this.itemData:", this.itemData)
  }

  async getMerchantDefault(){
    const merchantDefault:Merchant = await this.merchant.merchantDefault();
    this.merchantId = merchantDefault._id;
  }

  searchItems(event){
    if (event.target.value < 0) {
      event.target.value = 0;
    }else{
      this.currency = "$"+this.changePrice.value;
    }
  }

 
  stockEditor(){
    this.showCurrencyEditor = false;
    this.showStockEditor = true;
  }

  reduceStock(){
    const stock = parseInt(this.changeStock.value);
    if(!this.infinite){
      if(stock > 0){
        this.changeStock.setValue(stock - 1); 
      }
    }
  }
  increaseStock(){
    const stock = parseInt(this.changeStock.value);
    if(!this.infinite){
      this.changeStock.setValue(stock + 1); 
    }
    else if(this.infinite){
      this.infinite = false; 
    }
  }
  setInfinite(){
    this.infinite = !this.infinite;
    this.stock = this.changeStock.value;
  }

  async getSaleFlowDefault(){
    const saleflowDefault:SaleFlow = await this.saleflowService.saleflowDefault(
      this.merchantId
    );
    this.saleFlowId = saleflowDefault._id;
  }

  async createItem(){
    let itemDataInput: ItemInput;
      if(!this.infinite){
        itemDataInput = {
          merchant:this.merchantId,
          pricing:parseInt(this.changePrice.value),
          useStock: true,
          stock: parseInt(this.changeStock.value),
          name: this.itemData.name,
          description: this.itemData.description,
          type:"supplier"
        }
      }else{
        itemDataInput = {
          merchant:this.merchantId,
          pricing:parseInt(this.changePrice.value),
          useStock: false,
          name: this.itemData.name,
          description: this.itemData.description,
          type:"supplier"
        }
      }

    if(this.merchantId){
      const { createItem } = await this.itemService.createItem(
        itemDataInput
      );
      await this.saleflowService.addItemToSaleFlow(
        {
          item: createItem._id,
        },
        this.saleFlowId
      );
    }else{
      await this.itemService.createPreItem(itemDataInput);
    }
  }
}
