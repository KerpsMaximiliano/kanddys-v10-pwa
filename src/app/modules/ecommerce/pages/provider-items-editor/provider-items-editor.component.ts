import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Item, ItemInput } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { PaginationInput, SaleFlow } from 'src/app/core/models/saleflow';
import { FilesService } from 'src/app/core/services/files.service';
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
  saleFlowDefault: string;
  itemImage:any;
  imageFromService:string;
  canChangeStock:boolean = false;
  updateFullStep:boolean = false;

  constructor(private route: ActivatedRoute,
    private itemService: ItemsService,
    private merchant: MerchantsService,
    private saleflowService: SaleFlowService,
    private filesService: FilesService,
    private router:Router) { }

  async ngOnInit() {
    this.route.params.subscribe(async (params) => {
      console.log("🚀 ~ file: provider-items-editor.component.ts:64 ~ ProviderItemsEditorComponent ~ this.route.params.subscribe ~ params:", params)
      const { articleId } = params;
      this.articleId = articleId;
    });
    await this.getQueryParams();
    

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
      if(!this.canChangeStock){
        this.updateFullStep = true;
      }else{
        this.showCurrencyEditor = false;
        this.showStockEditor = true;
      }
    }else{

    }
    await this.getMerchantDefault();
    await this.getSaleFlowDefault();
    const imageService = await this.filesService.getFile();
    if(imageService) this.imageFromService = imageService;
    await this.getImageForItem();
    
    
  }

  async getQueryParams(){
    this.route.queryParams.subscribe((data)=>{
        data && data.stockEdition ? this.canChangeStock = data.stockEdition: false;
     })
  }

  back() {

  }

  async validateLoginFromLink() {
    let parsedData;
    this.route.queryParams.subscribe(async ({ jsondata }) => {
      if(jsondata){
        parsedData = JSON.parse(decodeURIComponent(jsondata));
      }
    });
    if(parsedData){
      this.preItemId = parsedData.itemId;
      await this.addItemToSaleFlow();
    }
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
    if(this.currency > 0){
      this.showCurrencyEditor = false;
      this.showStockEditor = true;
    }
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
    if(this.canChangeStock){
      this.showCurrencyEditor = false;
      this.updateFullStep = false;
      this.showStockEditor = true;
      await this.updateItem();
    }
    else if (this.articleId) {
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
        name: this.articleName.value,
        description: this.articleDescription.value
      }
    } else {
      itemDataInput = {
        merchant: this.merchantId,
        pricing: this.currency,
        name: this.articleName.value,
        description: this.articleDescription.value
      }
    }

    if(this.itemImage){
      const type = this.itemImage.split(';')[0].split(':')[1];
      const imageBlob = this.filesService.dataURItoBlob(this.itemImage);
      const imageFile = new File([imageBlob], this.articleName.value, { type: type });
      itemDataInput.images = [{
        file:imageFile
      }]
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
      await this.router.navigate(['/ecommerce/provider-items']);
    } else {
      if (!this.preItemId) {
        const preItem = await this.createPreItem(itemDataInput);
        if (preItem) {
          this.preItemId = preItem.createPreItem._id;
          this.jsondata = JSON.stringify({
            itemId: this.preItemId
          });
          this.loginflow = true;
          unlockUI();
        } else {
          unlockUI();
        }
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
    
    if(this.itemImage){
      const type = this.itemImage.split(';')[0].split(':')[1];
      const imageBlob = this.filesService.dataURItoBlob(this.itemImage);
      const imageFile = new File([imageBlob], this.articleName.value, { type: type });
      itemDataInput.images = [{
        file:imageFile
      }]
    } 
    
    await this.itemService.updateItem(itemDataInput, this.articleId);
    unlockUI();
    this.router.navigate(['/ecommerce/provider-items']);
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

  async setSaleFlowDefault(saleFlowId) {
    try {
      const saleFlowDefault = await this.saleflowService.setDefaultSaleflow(this.merchantId, saleFlowId);
      return saleFlowDefault.saleflowSetDefault._id;
    } catch (error) {
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
    this.loginflow = false;
    await this.addItemToSaleFlow();
  }

  async addItemToSaleFlow() {
    const me = await this.validationLogin();
    if (me) {
      await this.getMerchantDefault();
      if (this.merchantId) {
        try {
          const saleflowDefault = await this.saleflowService.saleflowDefault(
            this.merchantId
          );
          this.saleFlowDefault = saleflowDefault._id;
        } catch (error) {
          console.log(error);
          unlockUI();
        }

        if (this.saleFlowDefault) {
          await this.authCreatedItem();
          try {
            await this.saleflowService.addItemToSaleFlow(
              {
                item: this.preItemId,
              },
              this.saleFlowDefault
            );
          } catch (error) {
            console.log(error);
            unlockUI();
          }
          unlockUI();
        } else {
          const saleFlowId = await this.createSaleFlow();
          await this.setSaleFlowDefault(saleFlowId);
          await this.authCreatedItem();
          try {
            await this.saleflowService.addItemToSaleFlow(
              {
                item: this.preItemId,
              },
              this.saleFlowId
            );
          } catch (error) {
            console.log(error);
            unlockUI();
          }
          unlockUI();
          this.router.navigate(['/ecommerce/provider-items']);
        }
        unlockUI();
        this.router.navigate(['/ecommerce/provider-items']);
      } else {
        await this.createMerchantDefault(me);
        const saleFlowId = await this.createSaleFlow();
        const saleFlowDefault = await this.setSaleFlowDefault(saleFlowId);
        console.log("🚀 ~ file: provider-items-editor.component.ts:371 ~ ProviderItemsEditorComponent ~ addItemToSaleFlow ~ saleFlowDefault:", saleFlowDefault)
        await this.authCreatedItem();
        try {
          await this.saleflowService.addItemToSaleFlow(
            {
              item: this.preItemId,
            },
            saleFlowDefault
          );
        } catch (error) {
          console.log(error);
          unlockUI();
        }
        unlockUI();
        this.router.navigate(['/ecommerce/provider-items']);
      }
    } else {
      unlockUI();
    }
  }

  async authCreatedItem() {
    try {
      await this.itemService.authItem(
        this.merchantId,
        this.preItemId
      );
    } catch (error) {
      console.log(error);
      unlockUI();
    }
  }

  async createPreItem(itemDataInput) {
    try {
      const preItem = await this.itemService.createPreItem(itemDataInput);
      return preItem;
    } catch (error) {
      console.log(error);
    }
  }

  async getImageForItem(){

    if(this.itemData && this.itemData.images[0]?.value){
      this.itemImage = this.itemData.images[0]?.value;
    }
    else if(this.imageFromService){
      this.itemImage = this.imageFromService;
    }
  }

  async getImg(e) {
    const inputElement = e.target as HTMLInputElement;
    if (inputElement.files && inputElement.files[0]) {
      const selectedFile = inputElement.files[0];
      const toBase64 = selectedFile => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
    });
    const base64Data = await toBase64(selectedFile);
    this.itemImage = base64Data;
    
    } 
}

}
