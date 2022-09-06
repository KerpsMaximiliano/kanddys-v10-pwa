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
    value: 'Artículos',
    valueStyles: {
      'font-family': 'SfProBold',
      'font-size': '13px',
      color: '#202020',
    },
    subtexts: [
      {
        text: `Ir a mi galeria de mis artículos`,
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
    value: 'Ocultar',
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
    value: 'Este y otro artículos',
    valueStyles: {
      'font-family': 'SfProBold',
      'font-size': '13px',
      color: '#202020',
    },
    subtexts: [
      {
        text: `Poner invisible los otros artículos excepto este`,
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
    value: 'D` Licianthus',
    valueStyles: {
      'font-family': 'SfProBold',
      'font-size': '13px',
      color: '#202020',
    },
    subtexts: [
      {
        text: `Ir al Home`,
        styles: {
          fontFamily: 'SfProRegular',
          fontSize: '1rem',
          color: '#7B7B7B',
        },
      },
    ],
  },
  // {
  //   status: true,
  //   id: 'new',
  //   click: true,
  //   value: 'Nuevo artículo',
  //   valueStyles: {
  //     'font-family': 'SfProBold',
  //     'font-size': '13px',
  //     color: '#202020',
  //   },
  //   subtexts: [
  //     {
  //       text: `Crear un nuevo articulo de precio dinámico.`,
  //       styles: {
  //         fontFamily: 'SfProRegular',
  //         fontSize: '1rem',
  //         color: '#7B7B7B',
  //       },
  //     },
  //   ],
  // },
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
  user: User;
  item: Item;
  saleflow: SaleFlow;
  itemsByMerchant: Item[];
  tag: Tag = {
    _id: '1',
    createdAt: 'string',
    updatedAt: 'string',
    messageNotify: 'Esto es un mensaje',
    counter: 0,
    name: '#Tag',
    notify: true,
    user: 'Pablito',
    notifyUserOrder: true,
    notifyMerchantOrder: true,
  };
  options: OptionAnswerSelector[] = options;

  async ngOnInit(): Promise<void> {
    this.authService.ready.subscribe(async (observer) => {
      if (observer != undefined) {
        const itemId = this.route.snapshot.paramMap.get('itemId');
        const [user, merchant, item] = await Promise.all([
          this.authService.me(),
          this.merchantsService.merchantDefault(),
          this.itemsService.item(itemId),
        ]);
        if (!user || !merchant || !item) return;
        console.log('dasdasdas');
        this.user = user;
        this.item = item;
        const [saleflow, merchantItems] = await Promise.all([
          this.saleflowService.saleflowDefault(merchant._id),
          this.merchantsService.itemsByMerchant(merchant._id),
        ]);
        this.saleflow = saleflow;
        this.itemsByMerchant = merchantItems?.itemsByMerchant;
      }
    });
  }

  selectedOption(e: number) {
    console.log(e);
    console.log(this.options[e]);
    switch (e) {
      case 0:
        this.router.navigate([`/admin/merchant-items`]);
        break;
      case 1: {
        this.itemsService.updateItem(
          {
            status: 'disabled',
          },
          this.item._id
        );
        break;
      }
      case 2: {
        this.itemsService.updateItem(
          {
            status: 'active',
          },
          this.item._id
        );
        this.itemsByMerchant?.forEach((item) => {
          if (item._id != this.item._id) {
            this.itemsService.updateItem(
              {
                status: 'disabled',
              },
              item._id
            );
          }
        });
        break;
      }
      case 3:
        this.router.navigate([`/ecommerce/store/${this.saleflow._id}`]);
        break;
    }
  }

  goToMerchantItems() {
    this.router.navigate(['admin/merchant-items']);
  }
}
