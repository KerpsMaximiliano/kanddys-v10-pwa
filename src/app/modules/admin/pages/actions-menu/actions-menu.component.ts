import { Component, OnInit } from '@angular/core';
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';
import { Tag } from 'src/app/core/models/tags';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { Item } from 'src/app/core/models/item';
import { SaleFlow } from 'src/app/core/models/saleflow';

const options = [
  {
    status: true,
    id: 'articles',
    click: true,
    value: 'Ver artículos',
    valueStyles: {
      'font-family': 'SfProBold',
      'font-size': '13px',
      color: '#202020',
    },
    subtexts: [
      {
        text: `Ir a la galeria de mis artículos`,
        styles: {
          fontFamily: 'SfProRegular',
          fontSize: '1rem',
          color: '#7B7B7B',
        },
      },
    ],
  },
  {
    status: true,
    id: 'articleID',
    click: true,
    value: 'Ocultar este',
    valueStyles: {
      'font-family': 'SfProBold',
      'font-size': '13px',
      color: '#202020',
    },
    subtexts: [
      {
        text: `Poner invisible este artículo`,
        styles: {
          fontFamily: 'SfProRegular',
          fontSize: '1rem',
          color: '#7B7B7B',
        },
      },
    ],
  },
  {
    status: true,
    id: 'group',
    click: true,
    value: 'Ocultar el resto',
    valueStyles: {
      'font-family': 'SfProBold',
      'font-size': '13px',
      color: '#202020',
    },
    subtexts: [
      {
        text: `Poner invisible todos los artículos excepto este`,
        styles: {
          fontFamily: 'SfProRegular',
          fontSize: '1rem',
          color: '#7B7B7B',
        },
      },
    ],
  },
  {
    status: true,
    id: 'home',
    click: true,
    value: 'Saleflow',
    valueStyles: {
      'font-family': 'SfProBold',
      'font-size': '13px',
      color: '#202020',
    },
    subtexts: [
      {
        text: `Ir a la tienda`,
        styles: {
          fontFamily: 'SfProRegular',
          fontSize: '1rem',
          color: '#7B7B7B',
        },
      },
    ],
  },
  {
    status: true,
    id: 'dynamic',
    click: true,
    value: 'Nuevo artículo',
    valueStyles: {
      'font-family': 'SfProBold',
      'font-size': '13px',
      color: '#202020',
    },
    subtexts: [
      {
        text: `Crear un nuevo artículo.`,
        styles: {
          fontFamily: 'SfProRegular',
          fontSize: '1rem',
          color: '#7B7B7B',
        },
      },
    ],
  },
];

@Component({
  selector: 'app-actions-menu',
  templateUrl: './actions-menu.component.html',
  styleUrls: ['./actions-menu.component.scss'],
})
export class ActionsMenuComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private saleflowService: SaleFlowService,
    private merchantsService: MerchantsService,
    private itemsService: ItemsService
  ) {}

  template: boolean;
  isTag: boolean;
  activeIndex: number;
  item: Item;
  itemsByMerchant: Item[];
  tag: Tag = {
    _id: '1',
    createdAt: 'string',
    updatedAt: 'string',
    counter: 0,
    name: '#Tag',
    user: 'Pablito',
    merchant: '',
    notifications: [],
    status: '',
  };
  options: OptionAnswerSelector[] = options;

  async ngOnInit(): Promise<void> {
    const itemId = this.route.snapshot.paramMap.get('itemId');
    this.item = await this.itemsService.item(itemId);
    if (!this.item) return;

    options[3].value = this.merchantsService.merchantData.name || 'MerchantID';

    const merchantItems = await this.merchantsService.itemsByMerchant(
      this.merchantsService.merchantData._id
    );
    this.itemsByMerchant = merchantItems?.itemsByMerchant;
  }

  async selectedOption(e: number) {
    switch (e) {
      case 0:
        this.router.navigate([`/admin/merchant-items`]);
        break;
      case 1: {
        await this.itemsService.updateItem(
          {
            status: 'disabled',
          },
          this.item._id
        );
        this.router.navigate([`/admin/merchant-items`]);
        break;
      }
      case 2: {
        await this.itemsService.updateItem(
          {
            status: 'active',
          },
          this.item._id
        );
        this.itemsByMerchant?.forEach(async (item) => {
          if (item._id != this.item._id) {
            await this.itemsService.updateItem(
              {
                status: 'disabled',
              },
              item._id
            );
          }
        });
        this.router.navigate([`/admin/merchant-items`]);
        break;
      }
      case 3:
        this.router.navigate([
          `/ecommerce/store/${this.saleflowService.saleflowData._id}`,
        ]);
        break;
      case 4:
        this.router.navigate(
          [`admin/create-item`],
          this.item.params?.[0]?.values?.length && {
            queryParams: {
              justdynamicmode: true,
            },
          }
        );
        break;
    }
  }

  goToMerchantItems() {
    this.router.navigate(['admin/merchant-items']);
  }
}
