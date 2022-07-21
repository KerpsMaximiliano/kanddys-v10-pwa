import { Component, OnInit } from '@angular/core';
import { OptionAnswerSelector } from 'src/app/shared/components/answer-selector/answer-selector.component';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { Router } from '@angular/router';

const icons = [
  {
    src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/open-eye.svg',
    styles: {
      width: '29px',
      height: '19px',
      margin: '0px 0px 0px 18px',  
    },
    callback: () => console.log("clicked icon 1")
  },
  {
    src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/whatsapp_verde.svg',
    styles: {
      width: '19px',
      height: '19px',
      margin: '0px 0px 0px 21px'
    },
    callback: () => console.log("clicked icon 2")
  },
  {
    src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/arrow-right.svg',
    styles: {
      width: '19px',
      height: '19px',
      margin: '0px 0px 0px 44px'
    },
    callback: () => console.log("clicked icon 3")
  }
];

@Component({
  selector: 'app-item-category-exposition',
  templateUrl: './item-category-exposition.component.html',
  styleUrls: ['./item-category-exposition.component.scss']
})
export class ItemCategoryExpositionComponent implements OnInit {
  loggedIn: boolean = false;

  listOfOptions: OptionAnswerSelector[] = [
    {
      value: 'Crea una nueva Tab',
      status: true
    }
  ];

  constructor(
    private itemsService: ItemsService,
    private authService: AuthService,
    private merchantsService: MerchantsService,
    private router: Router
  ) { }

  async ngOnInit() {
    if (localStorage.getItem('session-token')) {
      const data = await this.authService.me()
      if (data) this.loggedIn = true;
    }

    const merchantDefault = await this.merchantsService.merchantDefault();
    const { itemCategoriesList } = await this.itemsService.itemCategories(merchantDefault._id, { options: { limit: 1000 } });



    for(let i = 0; i < itemCategoriesList.length; i++) {
      const category = itemCategoriesList[i];
      
      const itemCategory = {
        value: category.name,
        status: category.active,
        icons: JSON.parse(JSON.stringify(icons))
      };


      itemCategory.icons[0].src = `https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/${
        category.active ? 'open-eye' : 'closed-eye'
      }.svg`;

      itemCategory.icons[0].callback = async () => {
        const result = await this.itemsService.updateItemCategory({
          active: !this.listOfOptions[i + 1].status
        }, category._id);

        if(result) {
          this.listOfOptions[i + 1].icons[0].src = `https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/${
            !this.listOfOptions[i + 1].status ? 'open-eye' : 'closed-eye'
          }.svg`;
          this.listOfOptions[i + 1].status = !this.listOfOptions[i + 1].status
        } 
      };

      itemCategory.icons[2].callback = () => {
        this.router.navigate([`ecommerce/category-creator/${category._id}`]);
      }

      this.listOfOptions.push(itemCategory);
    } 
  }

  optionClicked(index) {
    if(index === 0) {
      this.router.navigate([`ecommerce/category-creator`]);
    }
  }

}
