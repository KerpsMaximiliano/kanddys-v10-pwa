import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemsService, ExtendedItemInput } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { CodesService } from 'src/app/core/services/codes.service';
import { WebformsService } from 'src/app/core/services/webforms.service';
import { OrderService } from 'src/app/core/services/order.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { FormComponent, FormData } from 'src/app/shared/dialogs/form/form.component';
import { Validators, FormControl } from '@angular/forms';
import { Code, CodeInput } from 'src/app/core/models/codes';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { SlideInput } from 'src/app/core/models/post';
import {
  Item,
  ItemCategory,
  ItemImageInput,
  ItemInput,
} from 'src/app/core/models/item';


@Component({
  selector: 'app-admin-article-detail',
  templateUrl: './admin-article-detail.component.html',
  styleUrls: ['./admin-article-detail.component.scss']
})
export class AdminArticleDetailComponent implements OnInit {
  item: any = {};
  buyers: number;
  merchantId: string;
  merchantSlug: string;

  env: string = environment.assetsUrl;
  active: boolean = false;
  dropdown: boolean = false;
  itemId: string;
  deliveryTimeStart: number;
  deliveryTimeEnd: number;
  webForm: any;
  numberOfRequiredQuestions: number = 0;
  numberOfOptionalQuestions: number = 0;
  totalSells: number = 0;
  totalIncome: number = 0;
  salesPositionInStore: number = 0;
  totalItemsOfMerchant: number = 1;

  expenditures: any[] = [];

  allHashtags: Code[] = [];
  itemHashtagInput: FormControl = new FormControl('');
  hashtagSelected: any = null;
  isHashtagExist: boolean = false
  isHashtagUpdated: boolean = false
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private MatDialog: MatDialog,
    private itemsService: ItemsService,
    private merchantsService: MerchantsService,
    private codesService: CodesService,
    private webformsService: WebformsService,
    private orderService: OrderService,
    private ngNavigatorShareService: NgNavigatorShareService,
    private headerService: HeaderService
  ) { }

  ngOnInit(): void {
    this.getItemData();
  }

  async getItemData() {
    this.itemId = this.route.snapshot.paramMap.get('itemId');
    await this.merchantsService.merchantDefault().then((res) => {
      this.merchantId = res._id;
      this.merchantSlug = res.slug;
    })
    await this.itemsService.item(this.itemId).then((res) => {
      this.item = res;
      this.active = res.status === 'active' ? true : false;
      this.deliveryTimeStart = res.estimatedDeliveryTime?.from;
      this.deliveryTimeEnd = res.estimatedDeliveryTime?.until;
      this.webForm = res.webForms[0];
    });
    console.log(this.item)
    await this.getSalesData();
    await this.getHashtags(this.itemId);
    if(this.item.expenditures) {
      await this.getExpenditures();
    }
    if(this.webForm) {
      await this.getwebForm();
    }
    await this.getBuyers();
    this.saveTemporalItemInMemory();
  }

  async getBuyers() {
    this.itemsService.buyersByItemInMerchantStore(this.item._id).then((res)=>{
      this.buyers = res
    })
  }

  async getExpenditures() {
    this.orderService.expenditures({
      findBy: {
        merchant: this.merchantId,
        id: this.item.expenditures
      }
    }).then((res) => {
      this.expenditures = res;
    })
  }

  getwebForm() {
    this.webformsService.webform(this.webForm.reference).then((res) => {
      console.log(res)
      res.questions.forEach((question) => {
        if (question.required) {
          this.numberOfRequiredQuestions += 1;
        } else {
          this.numberOfOptionalQuestions += 1;
        }
      })
    })
  }

  openDialog(type: 'deliverytime' | 'hashtag' | 'cost' | 'expenditure-update', expenditureId?: string) {
    let formData: FormData = {
      fields: [],
    };
    switch (type) {
      case 'deliverytime':
        formData.fields = [
          {
            name: 'deliveryTimeStart',
            type: 'text',
            label: 'Desde(horas)',
            validators: [Validators.required, Validators.pattern(/[1-9]\d*|0/)],
          },
          {
            name: 'deliveryTimeEnd',
            type: 'text',
            label: 'Hasta(horas)',
            validators: [Validators.pattern(/[1-9]\d*|0/)],
          },
        ];
        break;
      case 'hashtag':
        formData.fields = [
          {
            name: 'hashtag',
            type: 'text',
            label: 'Hashtag para busqueda directa',
            validators: [Validators.required],
          },
        ];
        break;
      case 'cost':
        formData.fields = [
          {
            name: 'cost',
            type: 'number',
            label: 'Monto',
            validators: [Validators.required, Validators.pattern(/[1-9]\d*|0/)],
          },
          {
            name: 'costName',
            type: 'text',
            label: 'Nombre del Costo', 
            validators: [Validators.required],
          }
        ];
        break;
      case 'expenditure-update':
        formData.fields = [
          {
            name: 'cost-update',
            type: 'number',
            label: 'Monto',
            validators: [Validators.pattern(/[1-9]\d*|0/)],
          },
          {
            name: 'costName-update',
            type: 'text',
            label: 'Nombre del Costo', 
            validators: [],
          }
        ];
        break;
    }
    const dialogRef = this.MatDialog.open(FormComponent, {
      data: formData,
    })

    dialogRef.afterClosed().subscribe((res) => {
      if (res.value['hashtag']) {
        this.updateHashtag(res.value['hashtag']);
      }
      if (res.value['deliveryTimeStart'] || res.value['deliveryTimeEnd']) {
        if (res.value['deliveryTimeStart']) {
          this.deliveryTimeStart = Number(res.value['deliveryTimeStart']);
        }
        if (res.value['deliveryTimeEnd']) {
          console.log(res.value['deliveryTimeEnd'])
          this.deliveryTimeEnd = Number(res.value['deliveryTimeEnd']);
        }
        this.updateItem('deliverytime');
      }
      if(res.value['cost'] && res.value['costName'] && type === 'cost') {
        this.createExpenditure(Number(res.value['cost']), res.value['costName']);
      }
      if(type === 'expenditure-update') {
        if(res.value['cost-update'] && res.value['costName-update']){
          this.updateExpenditure(expenditureId, Number(res.value['cost-update']), res.value['costName-update']);
        } else if(res.value['cost-update']) {
          this.updateExpenditure(expenditureId, Number(res.value['cost-update']), null);
        } else if(res.value['costName-update']) {
          this.updateExpenditure(expenditureId, null, res.value['costName-update']);
        }
      }
    })
  }

  async updateExpenditure(expenditureId: string, cost?: number, costName?: string) {
    let input = {};
    if(cost) {
      input['amount'] = cost;
    }
    if(costName) {
      input['name'] = costName;
    }
    await this.orderService.updateExpenditure(input, expenditureId).then((res) => {
      console.log(res)
    })
    this.getExpenditures();
  }

  async createExpenditure(cost: number, costName: string) {
    let expenditureId;
    await this.orderService.createExpenditure(this.item.merchant._id, {
      type: 'item',
      amount: cost,
      name: costName,
    }).then((res) => {
      expenditureId = res._id;
    })
    
    this.item.expenditures.push(expenditureId);
    await this.itemsService.itemAddExpenditure(expenditureId, this.itemId).then((res) => {
      console.log(res)
    })
    this.getExpenditures();
  }

  updateItem(type: 'toggle' | 'deliverytime') {
    switch (type) {
      case 'toggle':
        this.active = !this.active;
        let update: 'active' | 'disabled' = this.active ? 'active' : 'disabled';
        this.itemsService.updateItem({ status: update }, this.itemId).then((res) => {
          console.log(res)
        });
        break;
      case 'deliverytime':
        let estimatedDeliveryTime = {
        };
        if (this.deliveryTimeStart) {
          estimatedDeliveryTime['from'] = this.deliveryTimeStart;
        }
        if (this.deliveryTimeEnd) {
          estimatedDeliveryTime['until'] = this.deliveryTimeEnd;
        }
        this.itemsService.updateItem(
          {
            estimatedDeliveryTime
          }, this.itemId).then((res) => {
            console.log(res)
          });
        break;
    }
  }

  async getHashtags(id: string) {
    const paginationInput: PaginationInput = {
      findBy: {
        reference: id
      }
    }
    this.codesService
      .getCodes(paginationInput)
      .then((data) => {
        this.allHashtags = !data ? [] : data.results
        if (this.allHashtags.length) {
          this.hashtagSelected = this.allHashtags[0]
          this.itemHashtagInput.setValue(this.hashtagSelected.keyword)
          this.isHashtagExist = true;
        }
      })
  }
  updateHashtag(keyword: string) {
    if (!this.allHashtags.length) {
      this.codesService
        .createCode({
          keyword,
          type: "item",
          reference: this.itemId
        })
        .then((data) => {
          const hashtag: any = data
          this.hashtagSelected = hashtag.createCode
          this.itemHashtagInput.setValue(hashtag.createCode.keyword)
          this.getHashtags(hashtag.createCode._id)
        })
    } else {
      this.codesService
        .updateCode({ keyword }, this.hashtagSelected._id)
        .then((data) => {
          this.hashtagSelected.keyword = data.updateCode.keyword;
          this.itemHashtagInput.setValue(data.updateCode.keyword)
        })
    }
    this.getHashtags(this.itemId)
  }

  async getSalesData() {
    const sellsPagination = {
      options: { sortBy: 'count:asc', limit: 10, page: 1, range: {} },
      findBy: {
        merchant: this.item.merchant._id,
        _id: this.item._id,
      },
    };

    const revenue = await this.itemsService.itemTotalPagination(
      sellsPagination
    );
    if (revenue && revenue.itemTotalPagination?.length) {
      this.totalSells = revenue.itemTotalPagination[0]?.count;
      this.totalIncome = revenue.itemTotalPagination[0]?.total;
    }
    await this.itemsService.salesPositionOfItemByMerchant(this.item._id, {
      findBy: {
        merchant: this.item.merchant._id,
      },
      options: {
        limit: -1,
      },
    }).then((res) => {
      this.salesPositionInStore = res;
    });
    await this.itemsService.itemsByMerchant(this.item.merchant._id).then((res) => {
      this.totalItemsOfMerchant = res.itemsByMerchant.length;
    })
  }

  gotoWebform() {
    this.router.navigate([`/ecommerce/webform-creator/${this.item._id}`],
    {
      queryParams: {
        returnTo: 'admin-article-detail'
      }
    });
  }
  saveTemporalItemInMemory = () => {
    let images: ItemImageInput[] = this.item.images.map(
      (image, index: number) => {
        return {
          file: image.value,
          index,
          active: true,
        };
      }
    );

    let slides = this.item.images.map((image, index: number) => {
      return {
        index,
        text: '',
        type: 'poster',
        url: image.value,
      };
    })
    console.log(images)
    const itemInput: ExtendedItemInput = {
      name: this.item.name,
      description: this.item.description,
      pricing: this.item.pricing,
      images,
      merchant: this.item.merchant._id,
      content: [],
      currencies: [],
      hasExtraPrice: false,
      purchaseLocations: [],
      showImages: images.length > 0,
      layout: 'EXPANDED-SLIDE',
      slides,
    };
    console.log(itemInput)
    this.itemsService.temporalItemInput = itemInput;
    console.log(this.itemsService.temporalItemInput)
    /*
    this.itemsService.tagDataForTheItemEdition = {
      allTags: this.allTags,
      tagsInItem: this.tagsInItem,
      itemTagsIds: this.itemTagsIds,
      tagsById: this.tagsById,
      tagsString: this.tagsString,
      tagsToCreate: this.tagsToCreate,
    };
  
    this.itemsService.categoriesDataForTheItemEdition = {
      allCategories: this.allCategories,
      categoriesInItem: this.categoriesInItem,
      itemCategoriesIds: this.itemCategoriesIds,
      categoryById: this.categoryById,
      categoriesString: this.categoriesString,
      categoriesToCreate: this.categoriesToCreate,
    };
    */
  };

  goToItemDetail() {
    this.saveTemporalItemInMemory();
    this.headerService.flowRoute = this.router.url;
    localStorage.setItem('flowRoute', this.router.url);

      this.router.navigate([`ecommerce/${this.merchantSlug}/article-detail/item`],
        {
          queryParams: {
            mode: 'PREVIEW',
            flow: 'cart'
          }
        }
      );

  }

  share() {
    this.ngNavigatorShareService.share({
      title: this.item.name,
      text: this.item.description,
      url: `${environment.uri}/ecommerce/admin-article-detail/${this.item._id}`,
    })
  }
}
