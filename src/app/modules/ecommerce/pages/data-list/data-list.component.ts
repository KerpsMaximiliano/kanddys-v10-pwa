import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Item, ItemCategory } from 'src/app/core/models/item';
import { Tag } from 'src/app/core/models/tags';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { OrderService } from 'src/app/core/services/order.service';
import { TagsService } from 'src/app/core/services/tags.service';

@Component({
  selector: 'app-data-list',
  templateUrl: './data-list.component.html',
  styleUrls: ['./data-list.component.scss']
})
export class DataListComponent implements OnInit {
  keyword: string = '';
  tagList: Tag[] = [];
  filteredTagList: Tag[] = [];
  merchantId: string;
  id: string;
  viewtype: 'merchant' | 'user';
  mode: 'tag' | 'category' = 'category';
  item: Item;
  categoriesList: ItemCategory[] = [
    {
      _id: 'gdfgdfgf',
      createdAt: 'hfghfghfg',
      name: "gdfgdfgfd",
      updatedAt: 'gdfgdf',
    },
    {
      _id: 'gdfgdfgf',
      createdAt: 'hfghfghfg',
      name: "gdfgdfgfd",
      updatedAt: 'gdfgdf',
    },
    {
      _id: 'gdfgdfgf',
      createdAt: 'hfghfghfg',
      name: "gdfgdfgfd",
      updatedAt: 'gdfgdf',
    },
    {
      _id: 'gdfgdfgf',
      createdAt: 'hfghfghfg',
      name: "gdfgdfgfd",
      updatedAt: 'gdfgdf',
    },
  ];
  filteredCategories: ItemCategory[] = [];
  matches: string[];
  dummyView: boolean = false;
  dummyFilteredTagList: any[] = [];
  dummyTags: any[] = [
    {
      _id: "123456789",
      user: "123546789",
      updatedAt: "2022-06-14T01:48:10.049Z",
      counter: 5,
      containers: [],
      name: "Tag pro",
      createdAt: "2022-06-14T01:48:10.049Z",
      messageNotify: "Hola mami",
      notify: false,
      notifyMerchantOrder: false,
      notifyUserOrder: false
    },
    {
      _id: "123456789",
      user: "123546789",
      updatedAt: "2022-06-14T01:48:10.049Z",
      counter: 5,
      containers: [],
      name: "Tag pro",
      createdAt: "2022-06-14T01:48:10.049Z",
      messageNotify: "Hola mami",
      notify: false,
      notifyMerchantOrder: false,
      notifyUserOrder: false
    },
    {
      _id: "123456789",
      user: "123546789",
      updatedAt: "2022-06-14T01:48:10.049Z",
      counter: 5,
      containers: [],
      name: "Tag pro",
      createdAt: "2022-06-14T01:48:10.049Z",
      messageNotify: "Hola mami",
      notify: false,
      notifyMerchantOrder: false,
      notifyUserOrder: false
    }
  ]

  constructor(
    private tagsService: TagsService,
    private orderService: OrderService,
    private itemsService: ItemsService,
    private route: ActivatedRoute,
    private auth: AuthService,
    private headerService: HeaderService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((queries) => {
      if(queries.viewtype === 'merchant') this.viewtype = 'merchant';
      else if(queries.viewtype === 'user') this.viewtype = 'user';
      else return this.redirect();
      if(queries.mode === 'tag') this.mode = 'tag';
      else if(queries.mode === 'category') this.mode = 'category';
      else return this.redirect();
    })
    if(this.viewtype === 'merchant') {
      // this.merchantId = this.headerService.merchantInfo?._id;
      this.merchantId = "616a13a527bcf7b8ba3ac312";
      if(!this.merchantId) return this.redirect();
    }
    this.route.params.subscribe(async (params) => {
      if(!params.id) this.dummyView = true;
      if(this.mode === 'tag') {
        if(!this.dummyView) {
          // const order = (await this.orderService.order(params.id))?.order;
          // if(!order) return this.redirect();
          // this.id = order._id;
          // const user = await this.auth.me();
          // if(!user) return this.redirect();
          try {
            const [data, user] = await Promise.all([
              this.orderService.order(params.id),
              this.auth.me()
            ]);
            if(!data || !data.order || !user) return this.redirect();
            const tags = await this.tagsService.tagsByUser();
            tags.forEach((tag) => {
              if(data.order.tags.includes(tag._id)) {
                if(this.viewtype === 'merchant') tag.notifyMerchantOrder = true;
                if(this.viewtype === 'user') tag.notifyUserOrder = true;
              }
            })
            this.tagList = tags;
            this.filteredTagList = tags;
          } catch (error) {
            console.log(error);
            return this.redirect();
          }
        } else {
          this.dummyFilteredTagList = this.dummyTags;
        }
      }
      if(this.mode === 'category') {
        if (!this.dummyView) {
          const [item, data] = await Promise.all([
            this.itemsService.item(params.id),
            this.itemsService.itemCategories(this.merchantId, {
              options: {
                limit: 100,
              },
            })
          ]);
          if(!item || !data || !data) return this.redirect();
          this.item = item;
          const itemCategories = item.category.map((category) => category._id);
          data.itemCategoriesList.forEach((category) => {
            category.isSelected = itemCategories.includes(category._id);
          })
          this.categoriesList = data.itemCategoriesList;
          this.filteredCategories = data.itemCategoriesList;
        } else {
          this.filteredCategories = this.categoriesList;
        }
      }
    })
  }

  redirect() {
    this.router.navigate([`ecommerce/error-screen/`]);
  }

  onTagClick(tag: Tag) {
    if(this.mode !== 'tag') return;
    if(this.viewtype === 'merchant') {
      if(tag.notifyMerchantOrder) {
        tag.counter--;
        this.tagsService.removeTagsInOrder(this.merchantId, tag._id, this.id)
          .then((value) => {
            console.log('removed successfully!')
          })
          .catch((error) => {
            console.log(error);
            tag.counter++;
          });
      }
      else {
        tag.counter++;
        this.tagsService.addTagsInOrder(this.merchantId, tag._id, this.id)
          .then((value) => {
            console.log('added successfully!')
          })
          .catch((error) => {
            console.log(error);
            tag.counter--;
          }); 
      }
      tag.notifyMerchantOrder = !tag.notifyMerchantOrder;
    }
    if(this.viewtype === 'user') {
      if(tag.notifyUserOrder) {
        tag.counter--;
        this.tagsService.removeTagsInUserOrder(tag._id, this.id)
        .then((value) => {
          console.log(value);
          console.log('removed successfully!')
        })
        .catch((error) => {
          console.log(error);
          tag.counter++;
        });
      } else {
        tag.counter++;
        this.tagsService.addTagsInUserOrder(tag._id, this.id)
          .then((value) => {
            console.log(value);
            console.log('added successfully!')
          })
          .catch((error) => {
            console.log(error);
            tag.counter--;
          }); 
      }
      tag.notifyUserOrder = !tag.notifyUserOrder;
    }
  }

  onCategoryClick(category: ItemCategory) {
    if(this.mode !== 'category') return;
    const categories = this.item.category.map((category) => category._id);
    if(category.isSelected) {
      const index = categories.indexOf(category._id);
      categories.splice(index, 1);
      category.isSelected = false;
      const catIndex = this.item.category.findIndex((itemCategory) => itemCategory._id === category._id);
      this.item.category.splice(catIndex, 1);
    } else {
      categories.push(category._id);
      this.item.category.push(category);
      category.isSelected = true;
    }
    this.itemsService.updateItem({
      category: categories
    }, this.item._id);
  }

  async addCategory() {
    const category = await this.itemsService.createItemCategory({
      merchant: this.merchantId,
      name: this.keyword
    });
    if(!category) throw new Error('Hubo un error al crear la categoría');
    const categories = this.item.category.map((category) => category._id);
    categories.push(category._id);
    await this.itemsService.updateItem({
      category: categories
    }, this.item._id);
  }

  searchKeyword() {
    if(this.mode === 'tag') {
      if (!this.dummyView) this.filteredTagList = this.tagList.filter((tag) => tag.name.includes(this.keyword));
      else this.dummyFilteredTagList = this.dummyTags.filter((tag) => tag.name.includes(this.keyword));
    }
    if(this.mode === 'category')
      this.filteredCategories = this.categoriesList.filter((category) => category.name.toLowerCase().includes(this.keyword.toLowerCase()))
  }

  back() {
    const route = `/ecommerce/${this.viewtype === 'merchant' ? 'order-sales/'+this.merchantId : 'user-dashboard/tiendas'}`
    this.router.navigate([route]);
  }

}
