import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { formatID } from 'src/app/core/helpers/strings.helpers';
import { Merchant } from 'src/app/core/models/merchant';
import { ItemOrder } from 'src/app/core/models/order';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { Tag } from 'src/app/core/models/tags';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-anexo-choices',
  templateUrl: './anexo-choices.component.html',
  styleUrls: ['./anexo-choices.component.scss'],
})
export class AnexoChoicesComponent implements OnInit, OnDestroy {
  choice: string = 'Descripción';
  list = ['Descripción', 'Listado', 'Facturado'];
  subscription: Subscription;
  subscription2: Subscription;
  articleId: string;
  merchantId: string;
  inOrder: number = 0;
  total: number = 0;
  status: string;
  phone: string = '';
  option: string;
  env: string = environment.assetsUrl;
  helperHeaderTextConfig: any = {
    text: 'Facturas y Pre-facturas',
    fontSize: '21px',
    fontFamily: 'SfProBold',
  };
  invoiceListForOrders: any[] = [];
  limit: number;
  sort: string;
  itemId: string = '';
  tagsCarousell: any[] = [];
  controller: FormControl = new FormControl();
  description: FormControl = new FormControl();
  content: FormArray = new FormArray([]);
  ordersAmount: number = 0;
  merchantIncome: number = 0;
  contentSubscription: Subscription;

  //L changes
  paginationSortByField: string = 'createdAt';
  paginationSortByDirection: string = 'desc';
  paginationRangeStartDate: string = null;
  paginationRangeEndDate: string = null;
  paginationState: {
    pageSize: number;
    page: number;
    status: 'loading' | 'complete';
  } = {
    page: 1,
    pageSize: 5,
    status: 'complete',
  };
  tags: Array<Tag> = [];
  selectedTags: Array<Tag> = [];
  selectedTagsPermanent: Array<Tag> = [];
  unselectedTags: Array<Tag> = [];
  multipleTags: boolean = true;
  ordersList: any = [];
  renderOrdersPromise: Promise<{ ordersByItem: Array<ItemOrder> }> = null;
  ordersIncomeForMatchingOrders: number = null;
  matchingOrdersTotalCounter: number = 0;

  async infinitePagination() {
    const page = document.querySelector('.article-choices');
    const pageScrollHeight = page.scrollHeight;
    const verticalScroll = window.innerHeight + page.scrollTop;

    if (verticalScroll >= pageScrollHeight) {
      if (this.paginationState.status === 'complete') {
        this.getOrdersByItem(false, true);
      }
    }
  }

  constructor(
    private _ActivatedRoute: ActivatedRoute,
    private _TagsService: TagsService,
    private _ItemsService: ItemsService,
    private _MerchantsService: MerchantsService,
    private _OrderService: OrderService
  ) {}

  ngOnInit(): void {
    this.subscription = this._ActivatedRoute.params.subscribe(
      async ({ articleId }: any) => {
        this.articleId = articleId;

        await this.inicializeItemAndFormVariables();
        await this.getTags();
        await this.inicializeOrdersData();
      }
    );
  }

  inicializeQueryParamsVariables(params) {
    let {
      by = 1,
      limit = null,
      sort = 'desc',
      at = 'createdAt',
      type = 'facturas',
      phone = '',
      startDate = null,
      endDate = null,
    } = params;
    this.paginationSortByField = at;
    this.paginationSortByDirection = sort;
    this.paginationRangeStartDate = startDate;
    this.paginationRangeEndDate = endDate;

    phone = phone.replace('+', '');
    this.phone = phone;

    this.option = type.replace('%20');
    this.helperHeaderTextConfig.text =
      this.option[0].toUpperCase() + this.option.slice(1);

    this.invoiceListForOrders = [];
    const atList = ['createdAt', 'updatedAt'];
    if (!atList.includes(at)) {
      at = 'createdAt';
    }
    const sortList = ['asc', 'desc'];
    if (!sortList.includes(sort)) {
      sort = 'desc';
    }

    if (limit && !isNaN(limit)) {
      this.paginationState.pageSize = Number(limit);
    }

    if (by && !isNaN(by)) {
      this.paginationState.page = Number(by);
    }

    this.sort = sort;
  }

  async inicializeItemAndFormVariables() {
    const data = await this._ItemsService.item(this.articleId);
    this.description.setValue(data.description);
    for (const item of data.content) {
      this.content.push(new FormControl(item, [Validators.required]));
    }
    const { _id }: Merchant = await this._MerchantsService.merchantDefault();
    this.merchantId = _id;
    const [{ itemInOrder, total }]: any = await this._ItemsService.totalByItem(
      this.merchantId,
      [this.articleId]
    );
    this.inOrder = itemInOrder;
    this.total = total;
  }

  async inicializeOrdersData() {
    this.subscription2 = this._ActivatedRoute.queryParams.subscribe(
      async (params) => {
        this.status = 'loading';

        this.inicializeQueryParamsVariables(params);

        await this.getOrdersByItem(true, false);

        const ordersTotalResponse = await this._OrderService.ordersTotal(
          ['in progress', 'to confirm', 'completed'],
          this._MerchantsService.merchantData._id
        );

        const incomeMerchantResponse =
          await this._MerchantsService.incomeMerchant({
            findBy: {
              merchant: this.merchantId,
            },
          });

        if (ordersTotalResponse && ordersTotalResponse !== null) {
          this.ordersAmount = ordersTotalResponse.length;
        }

        if (incomeMerchantResponse && incomeMerchantResponse !== null) {
          this.merchantIncome = incomeMerchantResponse;
        }
        this.contentSubscription = this.content.valueChanges.subscribe(() => {
          if (this.content.valid) this.addControl();
        });
        this.addControl();
      }
    );
  }

  getTags = async () => {
    this.tags = [];
    this.tags = await this._TagsService.tagsByUser();
    this.unselectedTags = [...this.tags];
  };

  getOrdersByItem = async (
    restartPagination = false,
    triggeredFromScroll = false
  ) => {
    this.paginationState.status = 'loading';

    if (restartPagination) {
      this.paginationState.page = 1;
    } else {
      this.paginationState.page++;
    }

    const pagination: PaginationInput = {
      options: {
        sortBy: `${this.paginationSortByField}:${this.paginationSortByDirection}`,
        limit: Number(this.paginationState.pageSize),
        page: this.paginationState.page,
      },
      findBy: {
        orderStatus:
          this.option === 'facturas'
            ? ['in progress', 'to confirm', 'completed']
            : ['draft'],
        item: this.articleId,
      },
    };

    if (this.paginationRangeStartDate || this.paginationRangeEndDate)
      pagination.options.range = { from: null, to: null };

    const selectedTagIds = this.selectedTags.map((tag) => tag._id);

    if (this.selectedTags.length > 0 && selectedTagIds.length > 0) {
      pagination.findBy.tags = selectedTagIds;
    }

    this.renderOrdersPromise = this._OrderService.ordersByItem(
      pagination,
      true
    );

    this.renderOrdersPromise.then(async ({ ordersByItem }) => {
      if (this.paginationState.page === 1) {
        const hotOrdersByItemPagination: PaginationInput = {
          findBy: {
            orderStatus:
              this.option === 'facturas'
                ? ['in progress', 'to confirm', 'completed']
                : ['draft'],
            item: this.articleId,
          },
          options: {
            sortBy: `${this.paginationSortByField}:${this.paginationSortByDirection}`,
            limit: -1,
            page: 1,
          },
        };

        if (this.selectedTags.length > 0 && selectedTagIds.length > 0) {
          hotOrdersByItemPagination.findBy.tags = selectedTagIds;
        }

        const { ordersByItem: ordersByItemHot } =
          await this._OrderService.hotOrdersByItem(hotOrdersByItemPagination);

        if (ordersByItemHot)
          this.matchingOrdersTotalCounter = ordersByItemHot.length;
        else this.matchingOrdersTotalCounter = null;
      }

      if (ordersByItem.length === 0 && this.paginationState.page !== 1)
        this.paginationState.page--;

      if (ordersByItem && ordersByItem.length > 0) {
        const _ordersByItem: any = ordersByItem.map((order: any) => ({
          ...order,
          tags: order.tags.map((tag) => {
            const result = this.tags.find(({ _id }) => {
              const flag: boolean = _id === tag;
              return flag;
            });
            return result ? result.name : tag;
          }),
        }));
        if (this.paginationState.page === 1) {
          this.ordersList = _ordersByItem;
        } else {
          this.ordersList = this.ordersList.concat(_ordersByItem);
        }
      }

      if (ordersByItem.length === 0 && !triggeredFromScroll) {
        this.ordersList = [];
      }

      const incomeMerchantPagination: PaginationInput = {
        findBy: {
          merchant: this.merchantId,
          $or: [
            {
              _id: {
                $in: [this.articleId],
              },
            },
          ],
        },
        options: {
          limit: -1,
        },
      };

      if (this.selectedTags.length > 0 && selectedTagIds.length > 0) {
        incomeMerchantPagination.findBy.tags = selectedTagIds;
      }

      const ordersIncomeForMatchingOrders =
        await this._MerchantsService.incomeMerchant(incomeMerchantPagination);

      if (typeof ordersIncomeForMatchingOrders === 'number')
        this.ordersIncomeForMatchingOrders = ordersIncomeForMatchingOrders;

      delete pagination.findBy.merchant;

      this.paginationState.status = 'complete';
    });
  };

  _AbstractControl(index: number): FormControl {
    return this.content.at(index) as FormControl;
  }

  removeControl(index: number): void {
    this.content.removeAt(index);
  }

  addControl(): void {
    this.content.push(new FormControl('', [Validators.required]));
  }

  submitItem(): void {
    if (this.description.invalid) return;
    const _updateItem = async () => {
      const result = await this._ItemsService.updateItem(
        {
          content: this.content.controls
            .filter((control: AbstractControl) => control.valid)
            .map((control: AbstractControl) => control.value),
          description: this.description.value,
        },
        this.articleId
      );
    };
    _updateItem();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.contentSubscription.unsubscribe();
  }

  fillList(n: number): any[] {
    const result = [...Array(n).keys()].map(() => '');
    return result;
  }

  handleChoice(choice: any): void {
    this.choice = choice;
  }

  handleTag(selectedTag: Tag): void {
    this.scrollToTheTopOfThePage();

    if (this.selectedTags.map((tag) => tag._id).includes(selectedTag._id)) {
      this.selectedTags = this.selectedTags.filter(
        (tag) => tag._id !== selectedTag._id
      );

      if (this.selectedTags.length === 0) {
        this.unselectedTags = [...this.tags];
        this.selectedTagsPermanent = [];
      }
    } else {
      const value = this.multipleTags
        ? [...this.selectedTags, selectedTag]
        : [selectedTag];
      this.selectedTags = value;

      if (
        !this.selectedTagsPermanent.find((tag) => tag._id === selectedTag._id)
      ) {
        this.selectedTagsPermanent.push(selectedTag);
      }

      const unselectedTagIndexToDelete = this.unselectedTags.findIndex(
        (unselectedTag) => {
          return unselectedTag._id === selectedTag._id;
        }
      );

      if (unselectedTagIndexToDelete >= 0) {
        this.unselectedTags.splice(unselectedTagIndexToDelete, 1);
      }
    }

    this.getOrdersByItem(true);
  }

  scrollToTheTopOfThePage() {
    const scrollElem = document.querySelector('#top-of-the-page');
    scrollElem.scrollIntoView();
  }

  getIdsOfSelectedTags() {
    return this.selectedTags.map((tag) => tag._id);
  }

  async selectTagFromHeader(eventData: { selected: boolean; tag: Tag }) {
    this.handleTag(eventData.tag);
  }

  resetSelectedTags(): void {
    this.selectedTags = [];
    this.selectedTagsPermanent = [];
    this.unselectedTags = [...this.tags];
    this.ordersIncomeForMatchingOrders = null;
    this.matchingOrdersTotalCounter = 0;

    this.getOrdersByItem(true);
  }
}
