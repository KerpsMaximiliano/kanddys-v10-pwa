import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Item } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { QueryParameter } from 'src/app/core/models/query-parameters';
import { Tag } from 'src/app/core/models/tags';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { QueryparametersService } from 'src/app/core/services/queryparameters.service';
import { environment } from 'src/environments/environment';
import { SwiperOptions } from 'swiper';
import { FilterCriteria } from '../admin-dashboard/admin-dashboard.component';
import * as moment from 'moment';
import { FormControl, FormGroup } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { LinksDialogComponent } from 'src/app/shared/dialogs/links-dialog/links-dialog.component';

@Component({
  selector: 'app-dashboard-library',
  templateUrl: './dashboard-library.component.html',
  styleUrls: ['./dashboard-library.component.scss']
})
export class DashboardLibraryComponent implements OnInit {

  environment: string = environment.assetsUrl;

  swiperConfig: SwiperOptions = {
    slidesPerView: 4,
    freeMode: true,
    spaceBetween: 1,
  };

  merchant: Merchant;

  tags: Tag[] = [];
  selectedTags: Tag[] = [];

  filters: FilterCriteria[] = [];

  queryParameters: QueryParameter[] = [];
  dateString: string = "Aún no hay filtros aplicados";

  range = new FormGroup({
    start: new FormControl(''),
    end: new FormControl(''),
  })

  redirectTo: string = null;
  dataToRequest: 'recent' | 'mostSold' | 'lessSold' = 'recent';

  items: Item[] = [];

  constructor(
    private _MerchantsService: MerchantsService,
    private _ItemsService: ItemsService,
    private route: ActivatedRoute,
    private router: Router,
    private queryParameterService: QueryparametersService,
    private _bottomSheet: MatBottomSheet,
  ) { }

  async ngOnInit() {
    this.route.queryParams.subscribe(async (queryParams) => {
      const { redirectTo, data } = queryParams;

      this.redirectTo = redirectTo;
      this.dataToRequest = data;

      if (typeof redirectTo === 'undefined') this.redirectTo = null;
      if (typeof data === 'undefined') this.returnEvent();

      await this.getMerchant();
      await this.getQueryParameters();
      await this.getTags();
      await this.getData();
    });
    
  }

  async getMerchant() {
    const result = await this._MerchantsService.merchantDefault()
    this.merchant = result;
  }

  async getTags() {
    const tagsByMerchant = (
      await this._MerchantsService.tagsByMerchant(
        this.merchant._id
      )
    )?.tagsByMerchant;
    this.tags = tagsByMerchant.map((value) => value.tags);
  }

  async getData() {
    switch (this.dataToRequest) {
      case 'recent':
        await this.getOrders();
        break;
      case 'mostSold':
        await this.getMostSoldItems();
        break;
      case 'lessSold':
        await this.getLessSoldItems();
        break;
    }
  }

  async getOrders() {
    try {
      const { ordersByMerchant } = await this._MerchantsService.ordersByMerchant(
        this.merchant._id,
        {
          options: {
            limit: 50,
            sortBy: 'createdAt:desc'
          }
        }
      );

      const itemIds = new Set<string>();

      ordersByMerchant.forEach((order) => {
        order.items.forEach((item) => {
          itemIds.add(item.item._id);
        });
      });

      const filteredItems = Array.from(itemIds);

      const { listItems } = await this._ItemsService.listItems(
        {
          findBy: {
            _id: {
              __in: filteredItems,
            },
          }
        }
      );

      this.items = listItems;

    } catch (error) {
      console.log(error);
    }
  }

  async getMostSoldItems() {
    try {
      const result = await this._ItemsService.bestSellersByMerchant(
        false,
        {
          findBy: {
            merchant: this.merchant._id,
          }
        }
      ) as any[];

      this.items = result.map((item) => item.item).filter((item) => item !== undefined);
      console.log(this.items);
    } catch (error) {
      console.log(error);
    }
  }

  async getLessSoldItems() {
    try {
      const result = await this._ItemsService.bestSellersByMerchant(
        false,
        {
          options: {
            page: 2
          },
          findBy: {
            merchant: this.merchant._id,
          }
        }
      ) as any[];

      this.items = result.map((item) => item.item);
    } catch (error) {
      console.log(error);
    }
  }

  async getQueryParameters() {
    try {
      const result = await this.queryParameterService.queryParameters({
        options: {
          limit: 10,
          sortBy: 'createdAt:desc'
        },
        findBy: {
          merchant: this.merchant._id
        }
      });
      this.queryParameters = result;

      if (this.queryParameters.length > 0) {
        const startDate = new Date(this.queryParameters[0].from.date);
        const endDate = new Date(this.queryParameters[0].until.date);
        this.dateString = `Desde ${this.formatDate(startDate)} hasta ${this.formatDate(endDate)} N artículos vendidos. $XXX`;

        const filters: FilterCriteria[] = this.queryParameters.map((queryParameter) => {
          return {
            type: "queryParameter",
            queryParameter: queryParameter,
            _id: queryParameter._id
          }
        });

        this.filters.push(...filters);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async deleteQueryParameter(id: string) {
    try {
      await this.queryParameterService.deleteQueryParameter(id);
      this.queryParameters = this.queryParameters.splice(this.queryParameters.findIndex((queryParameter) => queryParameter._id === id), 1);
    } catch (error) {
      console.log(error);
    }
  }

  openDeleteQueryParameterDialog(id: string) {
    const bottomSheetRef = this._bottomSheet.open(LinksDialogComponent, {
      data: [
        {
          title: 'Eliminando registro',
          options: [
            {
              title: 'Eliminar el filtro',
              callback: async () => {
                await this.deleteQueryParameter(id);
              },
            }
          ],
        },
      ],
    });
  }

  shortenText(text, limit) {
    if (text.length > limit) return text.substring(0, limit) + "..."; 
    else return text;
  }

  filterTag(index: number) {
    const selectedTag = this.tags[index];
    if (this.selectedTags.find((tag) => tag._id === selectedTag._id)) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(selectedTag);
    }
  }

  isTagActive(tag: Tag) {
    return this.selectedTags.find((selectedTag) => selectedTag._id === tag._id);
  }

  formatDate(date: Date, short?: boolean) {
    if (!short) return moment(date).format('DD/MM/YYYY');
    else return `${moment(date).locale('es-es').format('MMM')} ${moment(date).locale('es-es').format('DD')}`;
  }

  returnEvent() {
    let queryParams = {};
    if (this.redirectTo.includes('?')) {
      const url = this.redirectTo.split('?');
      this.redirectTo = url[0];
      const queryParamList = url[1].split('&');
      for (const param in queryParamList) {
        const keyValue = queryParamList[param].split('=');
        queryParams[keyValue[0]] = keyValue[1];
      }
    }
    this.router.navigate([this.redirectTo], {
      queryParams,
    });
  }

}
