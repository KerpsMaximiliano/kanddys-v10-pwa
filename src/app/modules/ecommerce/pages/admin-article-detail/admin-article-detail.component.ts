import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { CodesService } from 'src/app/core/services/codes.service';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { FormComponent, FormData } from 'src/app/shared/dialogs/form/form.component';
import { Validators, FormControl } from '@angular/forms';
import { Code, CodeInput } from 'src/app/core/models/codes';
import { PaginationInput } from 'src/app/core/models/saleflow';

@Component({
  selector: 'app-admin-article-detail',
  templateUrl: './admin-article-detail.component.html',
  styleUrls: ['./admin-article-detail.component.scss']
})
export class AdminArticleDetailComponent implements OnInit {
  item: any = {};
  env: string = environment.assetsUrl;
  active: boolean = false;
  dropdown: boolean = false;
  itemId: string;
  deliveryTimeStart: number;
  deliveryTimeEnd: number;

  totalSells: number = 0;
  totalIncome: number = 0;
  salesPositionInStore: number = 0;
  totalItemsOfMerchant: number = 1;

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
    private codesService: CodesService
  ) { }

  ngOnInit(): void {
    this.getItemData();
  }

  async getItemData() {
    this.itemId = this.route.snapshot.paramMap.get('itemId');
    await this.itemsService.item(this.itemId).then((res) => {
      this.item = res;
      this.active = res.status === 'active' ? true : false;
      this.deliveryTimeStart = res.estimatedDeliveryTime?.from;
      this.deliveryTimeEnd =  res.estimatedDeliveryTime?.until;
    });
    console.log(this.item)
    await this.getSalesData();
    await this.getHashtags(this.itemId);
  }

  openDialog(type: 'deliverytime' | 'hashtag') {
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
    })
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

  async getHashtags(id : string) {
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
  }

  editHashtag(event: any) {
    const keyword = event.target.value
    if (!keyword) {
      this.hashtagSelected.keyword = ''
      this.isHashtagExist = false
    } else {
      this.hashtagSelected.keyword = keyword
      this.itemHashtagInput.setValue(keyword)
    }
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
}
