import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
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

  currency: number;
  pricing: number;
  placeholder: string = "0.00"
  articleName: FormControl = new FormControl('');
  articleDescription: FormControl = new FormControl('');
  changeStock: FormControl = new FormControl('0', [
    Validators.min(0),
  ]);
  showCurrencyEditor: boolean = true;
  showStockEditor: boolean = false;
  infiniteIcon: string = environment.assetsUrl + "/infinite.png"
  articleId;
  itemData: Item;
  merchantId;
  infinite: boolean = false;
  saleFlowId;
  stock: number = 0;
  useStock: boolean;
  loginflow: boolean = false;
  redirectionRoute: string = "/ecommerce/provider-items-editor";
  redirectionRouteId: string | null = null;
  entity: string = "MerchantAccess";
  preItemId: string;
  jsondata: string;
  saleFlowDefault:string;

  constructor(private route: ActivatedRoute,
    private itemService: ItemsService,
    private merchant: MerchantsService,
    private saleflowService: SaleFlowService) { }

  async ngOnInit() {
    this.route.params.subscribe(async (params) => {
      const { articleId } = params;
      this.articleId = articleId;
    });

    await this.validateLoginFromLink();

    if (this.articleId) {
      await this.getItemData();
      this.articleName.setValue(this.itemData.name);
      this.articleDescription.setValue(this.itemData.description);
      this.changeStock.setValue(this.itemData.stock);
      this.stock = this.itemData.stock;
      this.pricing = this.itemData.pricing;
      this.currency = this.pricing;
      this.placeholder = String(this.itemData.pricing);
      this.useStock = this.itemData.useStock;
      this.infinite = !this.useStock;
    }
    await this.getMerchantDefault();
    await this.getSaleFlowDefault();
  }

  back() {

  }

  async validateLoginFromLink(){
    let parsedData;
    this.route.queryParams.subscribe(async ({ jsondata }) => {
      parsedData = JSON.parse(decodeURIComponent(jsondata));
    });
    this.preItemId = parsedData.itemId;
    await this.addItemToSaleFlow();
  }

  async getItemData() {
    this.itemData = await this.itemService.item(this.articleId);
  }

  async getMerchantDefault() {
    try {
      const merchantDefault: Merchant = await this.merchant.merchantDefault();
      this.merchantId = merchantDefault._id;
    } catch (error) {
      console.log(error);
    }
  }

  async validationLogin() {
    try {
      const { me: { _id } } = await this.merchant.getMe();
      return _id;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  updateItemPrice(newPrice: number) {
    this.currency = newPrice;
  }


  stockEditor() {
    this.showCurrencyEditor = false;
    this.showStockEditor = true;
  }

  reduceStock() {
    const stock = parseInt(this.changeStock.value);
    if (!this.infinite) {
      if (stock > 0) {
        this.changeStock.setValue(stock - 1);
      }
    }
  }
  increaseStock() {
    const stock = parseInt(this.changeStock.value);
    if (!this.infinite) {
      this.changeStock.setValue(stock + 1);
    }
    else if (this.infinite) {
      this.infinite = false;
      this.useStock = this.infinite;
    }
  }
  setInfinite() {
    this.infinite = !this.infinite;
    this.stock = this.changeStock.value;
    this.useStock = this.infinite ? true : false;
  }

  async getSaleFlowDefault() {
    try {
      const saleflowDefault: SaleFlow = await this.saleflowService.saleflowDefault(
        this.merchantId
      );
      this.saleFlowId = saleflowDefault._id;
    } catch (error) {
      console.log(error);
    }
  }

  async toDoTask() {
    if (this.articleId) {
      await this.updateItem();
    } else {
      await this.createItem();
    }
  }

  async createItem() {
    lockUI();
    let itemDataInput: ItemInput;
    if (!this.infinite) {
      itemDataInput = {
        merchant: this.merchantId,
        pricing: this.currency,
        useStock: true,
        stock: parseInt(this.changeStock.value),
        name: this.articleName.value,
        description: this.articleDescription.value
      }
    } else {
      itemDataInput = {
        merchant: this.merchantId,
        pricing: this.currency,
        useStock: false,
        name: this.articleName.value,
        description: this.articleDescription.value
      }
    }

    if (this.merchantId) {
      const { createItem } = await this.itemService.createItem(
        itemDataInput
      );
      await this.saleflowService.addItemToSaleFlow(
        {
          item: createItem._id,
        },
        this.saleFlowId
      );
      unlockUI();
    } else {
      if (!this.preItemId) {
        const preItem = await this.itemService.createPreItem(itemDataInput);
        this.preItemId = preItem.createPreItem._id;
        this.jsondata = JSON.stringify({
          itemId: this.preItemId
        });
        this.loginflow = true;
        unlockUI();
      } else {
        this.jsondata = JSON.stringify({
          itemId: this.preItemId
        });
        this.loginflow = true;
        unlockUI();
      }
    }
  }

  async updateItem() {
    lockUI();
    let itemDataInput: ItemInput;
    if (!this.infinite) {
      itemDataInput = {
        pricing: this.currency,
        useStock: true,
        stock: parseInt(this.changeStock.value),
        name: this.articleName.value,
        description: this.articleDescription.value
      }
    } else {
      itemDataInput = {
        pricing: this.currency,
        useStock: false,
        name: this.articleName.value,
        description: this.articleDescription.value
      }
    }
    await this.itemService.updateItem(itemDataInput, this.articleId);
    unlockUI();
  }
  async createSaleFlow() {
    try {
      const saleflow = await this.saleflowService.createSaleflow({
        merchant: this.merchantId
      });
      return saleflow.createSaleflow._id;
    } catch (error) {
      console.log(error);
      unlockUI();
    }
  }

  async setSaleFlowDefault(saleFlowId){
    try{
      await this.saleflowService.setDefaultSaleflow(this.merchantId, saleFlowId);
    }catch(error){
      console.log(error);
      unlockUI();
    }
  }

  async createMerchantDefault(id: string) {
    const { createMerchant: createdMerchant } =
      await this.merchant.createMerchant({
        owner: id
      });

    const merchantSetDefault = await this.merchant.setDefaultMerchant(createdMerchant._id);
    this.merchantId = merchantSetDefault.merchantSetDefault._id;
  }

  async resetLoginDialog(event) {
    lockUI();
    await this.addItemToSaleFlow();
  }

  async addItemToSaleFlow(){
    const me = await this.validationLogin();
    if (me) {
      await this.getMerchantDefault();
      if (this.merchantId) {
        try{
          const saleflowDefault = await this.saleflowService.saleflowDefault(
            this.merchantId
          );
          this.saleFlowDefault = saleflowDefault._id;
        }catch(error){
          console.log(error);
          unlockUI();
        }
        
        if(this.saleFlowDefault){
          await this.authCreatedItem();
          try{
            await this.saleflowService.addItemToSaleFlow(
              {
                item: this.preItemId,
              },
              this.saleFlowDefault
            );
          }catch(error){
            console.log(error);
            unlockUI();
          }
          unlockUI();
        }else{
          const saleFlowId = await this.createSaleFlow();
          await this.setSaleFlowDefault(saleFlowId);
          await this.authCreatedItem();
          try{
            await this.saleflowService.addItemToSaleFlow(
              {
                item: this.preItemId,
              },
              this.saleFlowId
            );
          }catch(error){
            console.log(error);
            unlockUI();
          }
          unlockUI();
        }
        unlockUI();
      } else {
        await this.createMerchantDefault(me);
        const saleFlowId = await this.createSaleFlow();
        await this.setSaleFlowDefault(saleFlowId);
        await this.authCreatedItem();
        try{
          await this.saleflowService.addItemToSaleFlow(
            {
              item: this.preItemId,
            },
            this.saleFlowId
          );
        }catch(error){
          console.log(error);
          unlockUI();
        }
        unlockUI();
      }
    }else{
      unlockUI();
    }
  }

  async authCreatedItem(){
    try{
      await this.itemService.authItem(
        this.merchantId,
        this.preItemId
      );
    }catch(error){
      console.log(error);
      unlockUI();
    }
  }
}
