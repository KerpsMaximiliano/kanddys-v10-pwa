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
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { FormComponent, FormData } from 'src/app/shared/dialogs/form/form.component';
import { Validators, FormControl, FormGroup } from '@angular/forms';
import { Code, CodeInput } from 'src/app/core/models/codes';
import { PaginationInput, SaleFlow } from 'src/app/core/models/saleflow';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { SlideInput } from 'src/app/core/models/post';
import {
  Item,
  ItemCategory,
  ItemImageInput,
  ItemInput,
} from 'src/app/core/models/item';
import { TagFilteringComponent } from 'src/app/shared/dialogs/tag-filtering/tag-filtering.component';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { CommunityCategory } from 'src/app/core/models/community-categories';
import { FilesService } from 'src/app/core/services/files.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { Merchant } from 'src/app/core/models/merchant';

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

  tabIndex: number = 2;

  env: string = environment.assetsUrl;
  active: boolean = false;
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

  allCategories: Array<ItemCategory> = [];
  categoriesInItem: Record<string, boolean> = {};
  categoryById: Record<string, CommunityCategory> = {};
  itemCategoriesIds: Array<string> = [];
  categoriesString: string = '';
  categoriesToCreate: Array<ItemCategory> = [];
  articleName: FormControl = new FormControl('');
  articleDescription: FormControl = new FormControl('');
  imageFromService: string;
  itemData: Item;
  itemImage: any;
  price = new FormControl('', [
    Validators.required,
    Validators.min(0.01),
    Validators.pattern(/[\S]/),
  ]);
  pricing: string = "";
  redirectionRoute: string = "/ecommerce/admin-article-detail";
  redirectionRouteId: string | null = null;
  entity: string = "MerchantAccess";
  preItemId: string;
  jsondata: string;
  loginflow: boolean = false;
  saleFlowId;
  saleFlowDefault: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private MatDialog: MatDialog,
    private _bottomSheet: MatBottomSheet,
    private itemsService: ItemsService,
    private merchantsService: MerchantsService,
    private codesService: CodesService,
    private webformsService: WebformsService,
    private orderService: OrderService,
    private ngNavigatorShareService: NgNavigatorShareService,
    private headerService: HeaderService,
    private fileService: FilesService,
    private saleflowService: SaleFlowService,
  ) { }

  async ngOnInit() {
    this.itemId = this.route.snapshot.paramMap.get('itemId');
    if (this.itemId) {
      this.getItemData();
    }

    await this.validateLoginFromLink();

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
      this.articleDescription.setValue(this.item.description ? this.item.description : "");
      this.articleName.setValue(this.item.name ? this.item.name : "");
      this.itemImage = this.item?.images[0].value;
    });
    console.log(this.item)
    await this.getSalesData();
    await this.getHashtags(this.itemId);
    if (this.item.expenditures) {
      await this.getExpenditures();
    }
    if (this.webForm) {
      await this.getwebForm();
    }
    await this.getBuyers();
    this.saveTemporalItemInMemory();
    await this.getCategories();
  }

  async getBuyers() {
    this.itemsService.buyersByItemInMerchantStore(this.item._id).then((res) => {
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
      if (res.value['cost'] && res.value['costName'] && type === 'cost') {
        this.createExpenditure(Number(res.value['cost']), res.value['costName']);
      }
      if (type === 'expenditure-update') {
        if (res.value['cost-update'] && res.value['costName-update']) {
          this.updateExpenditure(expenditureId, Number(res.value['cost-update']), res.value['costName-update']);
        } else if (res.value['cost-update']) {
          this.updateExpenditure(expenditureId, Number(res.value['cost-update']), null);
        } else if (res.value['costName-update']) {
          this.updateExpenditure(expenditureId, null, res.value['costName-update']);
        }
      }
    })
  }

  async updateExpenditure(expenditureId: string, cost?: number, costName?: string) {
    let input = {};
    if (cost) {
      input['amount'] = cost;
    }
    if (costName) {
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

  async getCategories() {
    this.categoriesString = '';
    this.itemCategoriesIds = [];
    const categories = (
      await this.itemsService.itemCategories(
        this.merchantId,
        {
          options: {
            limit: -1,
          },
        }
      )
    )?.itemCategoriesList;

    this.allCategories = categories;

    for (const category of this.allCategories) {
      this.categoryById[category._id] = category;
    }

    const categoryIdsInItem =
      this.item && this.item.category
        ? this.item.category.map((category) => category._id)
        : [];

    if (this.item) {
      for (const category of this.allCategories) {
        if (categoryIdsInItem.includes(category._id)) {
          this.itemCategoriesIds.push(category._id);
        }
      }
    }

    if (this.itemCategoriesIds.length > 0)
      this.categoriesString = this.itemCategoriesIds
        .map((categoryId) => this.categoryById[categoryId].name)
        .join(', ');
    else this.categoriesString = null;
  }

  openCategoriesDialog = () => {
    const bottomSheetRef = this._bottomSheet.open(TagFilteringComponent, {
      data: {
        title: '¿En cual sub-vitrina?',
        titleIcon: {
          show: false,
        },
        categories: this.headerService.user
          ? this.allCategories.map((category) => ({
            _id: category._id,
            name: category.name,
            selected: this.itemCategoriesIds.includes(category._id),
          }))
          : this.categoriesToCreate.map((category) => ({
            _id: category._id,
            name: category.name,
            selected: this.itemCategoriesIds.includes(category._id),
          })),
        rightIcon: {
          iconName: 'add',
          callback: (data) => {
            let fieldsToCreate: FormData = {
              fields: [
                {
                  name: 'new-category',
                  placeholder: 'Nueva categoría',
                  type: 'text',
                  validators: [Validators.pattern(/[\S]/), Validators.required],
                },
              ],
            };

            unlockUI();

            bottomSheetRef.dismiss();

            const dialogRef = this.MatDialog.open(FormComponent, {
              data: fieldsToCreate,
              disableClose: true,
            });

            dialogRef.afterClosed().subscribe(async (result: FormGroup) => {
              if (!result?.controls['new-category'].valid) {
                this.headerService.showErrorToast('Categoría inválida');
              } else {
                if (this.headerService.user) {
                  const categoryName = result?.value['new-category'];

                  lockUI();
                  await this.itemsService.createItemCategory(
                    {
                      merchant: this.merchantId,
                      name: categoryName,
                      active: true,
                    },
                    false
                  );

                  await this.getCategories();

                  unlockUI();

                  this.openCategoriesDialog();
                } else {
                  this.categoriesToCreate.push({
                    _id: 'created-category-' + result?.value['new-category'],
                    name: result?.value['new-category'],
                    merchant: null,
                  } as any);
                  this.categoryById[
                    'created-category-' + result?.value['new-category']
                  ] = {
                    _id: 'created-category-' + result?.value['new-category'],
                    name: result?.value['new-category'],
                    merchant: null,
                  } as any;

                  this.openCategoriesDialog();
                }
              }
            });
          },
        },
      },
    });

    bottomSheetRef.instance.selectionOutput.subscribe(
      async (categoriesAdded: Array<string>) => {
        if (this.item) {
          await this.itemsService.updateItem(
            {
              category: categoriesAdded,
            },
            this.item._id
          );
        }

        this.itemCategoriesIds = categoriesAdded;

        if (this.itemCategoriesIds.length > 0)
          this.categoriesString = this.itemCategoriesIds
            .map((categoryId) => this.categoryById[categoryId].name)
            .join(', ');
        else this.categoriesString = null;
      }
    );
  };

  async getImageForItem() {

    if (this.itemData && this.itemData.images[0]?.value) {
      this.itemImage = this.itemData.images[0]?.value;
    }
    else if (this.imageFromService) {
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
  handleCurrencyInput(value: number) {
    this.price.setValue(value);
    this.pricing = this.price.value
  }
  
  async resetLoginDialog(event) {
    this.loginflow = false;
    await this.addItemToSaleFlow();
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
      await this.merchantsService.createMerchant({
        owner: id
      });

    const merchantSetDefault = await this.merchantsService.setDefaultMerchant(createdMerchant._id);
    this.merchantId = merchantSetDefault.merchantSetDefault._id;
  }

  async validationLogin() {
    try {
      const { me: { _id } } = await this.merchantsService.getMe();
      return _id;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async getMerchantDefault() {
    try {
      const merchantDefault: Merchant = await this.merchantsService.merchantDefault();
      this.merchantId = merchantDefault._id;
    } catch (error) {
      console.log(error);
    }
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
          await this.router.navigate(['/ecommerce/laia-assistant'], {
            queryParams: {
              newArticle: this.preItemId,
            },
          });
        }
        unlockUI();
        await this.router.navigate(['/ecommerce/laia-assistant'], {
          queryParams: {
            newArticle: this.preItemId,
          },
        });
      } else {
        await this.createMerchantDefault(me);
        const saleFlowId = await this.createSaleFlow();
        const saleFlowDefault = await this.setSaleFlowDefault(saleFlowId);
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
        await this.router.navigate(['/ecommerce/laia-assistant'], {
          queryParams: {
            newArticle: this.preItemId,
          },
        });
      }
    } else {
      unlockUI();
    }
  }

  async authCreatedItem() {
    try {
      await this.itemsService.authItem(
        this.merchantId,
        this.preItemId
      );
    } catch (error) {
      console.log(error);
      unlockUI();
    }
  }

  async toDoTask(){
    if(!this.itemId){
      await this.createItem();
    }
  }

  async createItem() {
    lockUI();
    let itemDataInput: ItemInput;
    
      itemDataInput = {
        merchant: this.merchantId,
        pricing: parseInt(this.pricing),
        name: this.articleName.value,
        description: this.articleDescription.value
      }
    

    if(this.itemImage){
      const type = this.itemImage.split(';')[0].split(':')[1];
      const imageBlob = this.fileService.dataURItoBlob(this.itemImage);
      const imageFile = new File([imageBlob], this.articleName?.value ? this.articleName?.value : 'image', { type: type });
      console.log(imageFile);
      itemDataInput.images = [{
        file:imageFile
      }]
    } 

    if (this.merchantId) {
      const { createItem } = await this.itemsService.createItem(
        itemDataInput
      );
      await this.saleflowService.addItemToSaleFlow(
        {
          item: createItem._id,
        },
        this.saleFlowId
      );
      unlockUI();
      await this.router.navigate(['/ecommerce/laia-assistant'], {
        queryParams: {
          newArticle: createItem._id,
        },
      });
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

  async createPreItem(itemDataInput) {
    try {
      const preItem = await this.itemsService.createPreItem(itemDataInput);
      return preItem;
    } catch (error) {
      console.log(error);
    }
  }
}
