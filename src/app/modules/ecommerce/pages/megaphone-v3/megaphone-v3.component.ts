import { Component, OnInit, OnDestroy } from '@angular/core';
import { copyText } from 'src/app/core/helpers/strings.helpers';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { environment } from 'src/environments/environment';
//import { SelectedNapkinsModalComponent } from '../selected-napkins-modal/selected-napkins-modal.component';
//import { ShortcutsComponent } from '../../../../shared/dialogs/shortcuts/shortcuts.component';
//import { QuickFiltersComponent } from '../../../../shared/dialogs/quick-filters/quick-filters.component';
import { ActivatedRoute, Data, Router } from '@angular/router';
//import { MerchantMoreInfoComponent } from 'src/app/shared/dialogs/merchant-more-info/merchant-more-info.component';
import { AuthService } from 'src/app/core/services/auth.service';
import {
  Item,
  ItemPackage,
  ItemParam,
  ItemParamValue,
} from 'src/app/core/models/item';
import { SaleFlow } from 'src/app/core/models/saleflow';
//import { ToastrService } from 'ngx-toastr';
import { HeaderService } from 'src/app/core/services/header.service';
import { AppService } from 'src/app/app.service';
import { filter } from 'rxjs/operators';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { resolve } from 'dns';

@Component({
  selector: 'app-megaphone-v3',
  templateUrl: './megaphone-v3.component.html',
  styleUrls: ['./megaphone-v3.component.scss'],
})
export class MegaphoneV3Component implements OnInit, OnDestroy {
  pagesList: string[] = ['My Store'];
  itemList = {
    one: {
      label: 'ALEGRIAS DE ESTA SEmana',
      itemList: [
        {
          name: 'Item Name ID',
          price: 500,
        },
        {
          name: 'Item Name ID',
          price: 500,
        },
      ],
    },
    two: {
      label: 'ALEGRIAS DE ESTA SEmana',
      itemListTwo: [
        {
          name: 'Item Name ID',
          price: 595,
          isCrypto: true,
          cryptoCurrency: 'ethereum',
        },
        {
          name: 'Item Name ID',
          price: 595,
          isCrypto: true,
          cryptoCurrency: 'ethereum',
        },
      ],
    },
  };

  smallItemList = [
    {
      name: 'Item Name ID',
      price: 500,
    },
    {
      name: 'Item Name ID',
      price: 500,
    },
    {
      name: 'Item Name ID',
      price: 500,
    },
    {
      name: 'Item Name ID',
      price: 500,
    },
    {
      name: 'Item Name ID',
      price: 500,
    },
    {
      name: 'Item Name ID',
      price: 500,
    },
    {
      name: 'Item Name ID',
      price: 500,
    },
    {
      name: 'Item Name ID',
      price: 500,
    },
    {
      name: 'Item Name ID',
      price: 500,
    },
    {
      name: 'Item Name ID',
      price: 500,
    },
    {
      name: 'Item Name ID',
      price: 500,
    },
  ];

  // filters = [];

  // =============================================================

  saleflowData: SaleFlow;
  customizersId: string[] = [];
  isLogged: boolean = false;
  showFilters = false;
  type = 1;
  done: boolean = false;
  mouseDown = false;
  startX: any;
  scrollLeft: any;
  scroll: boolean = false;
  option: boolean = false;
  types = [];
  data = [
    {
      name: 'Bebes',
      active: true,
    },
    {
      name: 'New Born',
      active: false,
    },
    {
      name: 'Familias',
      active: false,
    },
    {
      name: 'Graduaciones',
      active: false,
    },
  ];
  typeOneStyle = {
    display: 'grid',
    'grid-template-columns': '1fr 1fr',
    'grid-column-gap': '5px',
    'grid-row-gap': '5px',
  };
  styleOption = {
    'background-color': 'white',
    'border-radius': '8px',
  };
  category: any;
  options = [];
  loadingSwiper: boolean = false;
  banner: string = '';
  itemsId: any = [];
  items: Item[] = [];
  itemsByCategory: {
    label: string;
    items: Item[];
  }[] = [];
  inputsItems: any = [];
  packagesId: any = [];
  packageData: any = [];
  inputPackage: ItemPackage[] = [];
  sliderPackage: ItemPackage[] = [];
  swiperPackageOrder: any = [];
  packagesRulesItems: any = [];
  selectedTagsIds: any = [];
  categories: any = [];
  flowId: string;
  merchantId: string;
  merchantName: string = '';
  merchantSubheadline: string = '';
  merchantHours: string = '';
  merchantLabel: string = ''; //Asignado en ngOnInit
  boxToggler: boolean = false;
  labelValues: any = [];
  optionSelected = 1;
  extraFilterSelected = 1;
  showMore = false;
  phoneNumber: string = 'tel:+19188156444';
  instagram: string;
  id: string;
  otherFilters = [];
  filters: Array<any> = ['Mar', 'Mie', 'Jue', 'Vie'];
  priceTotal: number = 0;
  isCategories: boolean;
  imageRoute: string = `${environment.assetsUrl}/share-outline.png`;
  renderedSwippers: number = 0;

  isCaffaro: boolean;
  isCecilia: boolean;
  showCTA: boolean = false;

  constructor(
    private dialog: DialogService,
    private router: Router,
    private merchant: MerchantsService,
    private header: HeaderService,
    private saleflow: SaleFlowService,
    private item: ItemsService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private appService: AppService,
  ) {
    const sub = this.appService.events
    .pipe(filter((e) => e.type === 'deleted-item'))
    .subscribe((e) => {
      let productData = this.header.getItemProduct(this.saleflowData._id);
      for (let i = 0; i < this.items.length; i++) {
        console.log(this.items[i]);
        productData
      }
      sub.unsubscribe();
    });
  }

  openDialog() {
    //
  }

  async getMerchant(id: string) {
    try {
      const merchant = await this.merchant.merchant(id);
      this.header.merchantInfo = merchant;
    } catch (error) {
      console.log(error);
    }
  }

  async getCategories() {
    const itemCategoriesList = (
      await this.item.itemCategories(this.merchantId, {})
    ).itemCategoriesList;
    const headlines = await this.item.itemCategoryHeadlineByMerchant(
      this.merchantId
    );

    if (itemCategoriesList.length === 0) return;

    const filters = headlines.map((headline) => {
      const options = headline.itemsCategories
        .map((value) =>
          itemCategoriesList.find((element) => element._id === value)
        )
        .filter((item) => item)
        .map((filter) => {
          return {
            id: filter._id,
            label: filter.name,
            type: 'label',
            selected: false,
          };
        });

      return {
        section: 'categories',
        title: 'Categorías',
        subtitle: headline.headline,
        property: 'category',
        options,
      };
    });

    this.categories = itemCategoriesList;
    this.filters = filters;
    console.log(this.categories);
    this.category = this.categories[0].name;

    if (this.items.length > 0 && this.itemsByCategory.length === 0) {
      this.organizeItems();
    }

    if (itemCategoriesList.length > 0) {
      for (let i = 0; i < itemCategoriesList.length; i++) {
        this.closeTagItems[0].options.push({
          id: itemCategoriesList[i]._id,
          label: itemCategoriesList[i].name,
          type: 'label',
          selected: false,
        });
      }
    }

    console.log(this.categories.length);
    if (this.categories.length == 0) {
      this.isCategories = false;
    } else {
      this.isCategories = true;
      this.category = this.categories[0].name;
    }

    this.done = true;
  }

  organizeItems() {
    let categories = [];
    this.items.forEach((item) => {
      item.category.forEach((category) => {
        if(!categories.includes(category.name)) categories.push(category.name);
      })
    })
    console.log(categories);
    categories.forEach((name) => {
      this.itemsByCategory.push({
        label: name,
        items: this.items.filter((item) =>
          item.category.some((category) => category.name === name)
        )
      })
    })
    // if (
    //   this.items.some((item) =>
    //     item.category.some((category) => category.name === 'Tragos')
    //   )
    // ) {
    //   this.itemsByCategory[0] = {
    //     label: 'servilletas para tragos',
    //     items: this.items.filter((item) =>
    //       item.category.some((category) => category.name === 'Tragos')
    //     ),
    //   };
    // }
    // if (
    //   this.items.some((item) =>
    //     item.category.some((category) => category.name === 'Baño')
    //   )
    // ) {
    //   this.itemsByCategory[1] = {
    //     label: 'servilletas para baños',
    //     items: this.items.filter((item) =>
    //       item.category.some((category) => category.name === 'Baño')
    //     ),
    //   };
    // }
    // if (
    //   this.items.some((item) =>
    //     item.category.some((category) => category.name === 'Comidas')
    //   )
    // ) {
    //   this.itemsByCategory[2] = {
    //     label: 'servilletas para comidas',
    //     items: this.items.filter((item) =>
    //       item.category.some((category) => category.name === 'Comidas')
    //     ),
    //   };
    // }
    let renderedSpinners = 0;
    for (let i = 0; i < this.itemsByCategory.length; i++) {
      renderedSpinners++;
      if(renderedSpinners === this.itemsByCategory.length){
        unlockUI()
      }
    }
    // if (this.itemsByCategory.length > 0) {
    //   this.toastr.info(undefined, 'Selecciona el tipo de servilletas', {
    //     closeButton: true,
    //     disableTimeOut: 'timeOut',
    //     extendedTimeOut: 500,
    //     positionClass: 'toast-bottom-center',
    //   });
    // }
    
  }

  // =====================================================

  async ngOnInit(): Promise<void> {
    this.header.resetIsComplete();
    this.header.disableNav();
    this.header.hide();
    this.header.packId = 0;
    let sub: any;
    if (localStorage.getItem('session-token')) {
      if (!this.header.user)
        sub = this.appService.events
          .pipe(filter((e) => e.type === 'auth'))
          .subscribe((e) => {
            this.executeProcessesAfterLoading();
            sub.unsubscribe();
          });
      else this.executeProcessesAfterLoading();
    } else {
      this.executeProcessesAfterLoading();
    }
  }

  executeProcessesAfterLoading() {
    this.route.params.subscribe(async (params) => {
      console.log(params.id);
      this.flowId = params.id;
      if (this.flowId == '6201d72bdfeceed4d13805bc') {
        this.isCecilia = true;
      }

      if (this.flowId === '61b8df151e8962cdd6f30feb') {
        this.isCaffaro = true;
      }

      //Quita lo que sea que este llegando de donde sea que venga
      // unlockUI();

      lockUI();

      this.header.flowId = params.id;
      this.saleflowData = (await this.saleflow.saleflow(params.id)).saleflow;
      console.log(this.saleflowData);
      this.header.saleflow = this.saleflowData;
      this.header.storeFlowId(this.saleflowData._id);
      const orderData = this.header.getOrder(this.saleflowData._id)
      this.banner = this.saleflowData.banner;
      this.merchantName = this.saleflowData.merchant.name;
      this.merchantSubheadline = this.saleflowData.subheadline;
      this.merchantHours = this.saleflowData.workingHours;
      this.merchantId = this.saleflowData.merchant._id;

      this.getCategories();
      this.getMerchant(this.saleflowData.merchant._id);

      console.log(this.saleflowData.items.length);
      if (this.saleflowData.items.length !== 0) {
        this.merchantLabel = 'Alegrías de esta semana';
        for (let i = 0; i < this.saleflowData.items.length; i++) {
          if (this.saleflowData?.items[i]?.customizer?._id)
            this.customizersId.push(this.saleflowData.items[i].customizer._id);
          this.itemsId.push(this.saleflowData.items[i].item._id);
        }
      }
      if (this.saleflowData.packages.length !== 0) {
        this.merchantLabel = 'Planes mas comprados';
        for (let i = 0; i < this.saleflowData.packages.length; i++) {
          this.packagesId.push(this.saleflowData.packages[i]._id);
        }
      }

      const listPackages = (
        await this.saleflow.listPackages({
          findBy: {
            _id: {
              __in: ([] = this.packagesId),
            },
          },
        })
      ).listItemPackage;
      for (let i = 0; i < listPackages.length; i++) {
        listPackages[i].isSelected = orderData?.itemPackage ===  listPackages[i]._id;
      }
      console.log('lista de paquetes');
      console.log(listPackages);
      this.inputPackage = listPackages;
      this.sliderPackage = listPackages;
      console.log('Assigned packages before item fetching');
      await this.itemOfPackage(listPackages);
      this.inputPackage = this.packageData.map((e) => e.package);
      console.log('Packages Item fetching done!');
      this.swiperPackageOrder = this.packageData;
      console.log(this.inputPackage);
      if (this.inputPackage.length > 0) this.currentItem(0);
      if (this.inputPackage.length == 0) {
      const selectedItems = orderData?.products?.length > 0 ? orderData.products.map((subOrder) => subOrder.item) : [];
        this.items = (
          await this.saleflow.listItems({
            findBy: {
              _id: {
                __in: ([] = this.itemsId),
              },
            },
            options: {
              limit: 20,
            },
          })
        ).listItems;
        this.inputsItems = this.items;
        for (let i = 0; i < this.items.length; i++) {
          this.items[i].customizerId = this.customizersId[i];
          this.items[i].isSelected = selectedItems.includes(this.items[i]._id);
          if (this.items[i].hasExtraPrice)
            this.items[i].totalPrice =
              this.items[i].fixedQuantity *
                this.items[i].params[0].values[0].price +
              this.items[i].pricing;
          this.labelValues.push({ id: i, status: false });
        }
        this.organizeItems();
        this.priceTotal = this.inputsItems[0].pricing;
        this.options.push({
          id: this.inputsItems[0]._id,
          title: this.inputsItems[0].name,
          subtitle: this.inputsItems[0].pricing,
          num: 1,
        });
        console.log('items',this.items);
        for (let i = 0; i < this.items.length; i++) {
          if (this.items[i].isSelected) {
            this.showCTA = true;
          }
        }
      }

      if (!this.isCecilia) unlockUI();

      this.authService.me().then((data) => {
        this.isLogged = data != undefined;
      });
    });
    if (this.header.customizerData) this.header.customizerData = null;
    
  }

  endLoader() {
    this.renderedSwippers++;

    if (this.renderedSwippers === this.itemsByCategory.length) {
      console.log('finished rendering');
      unlockUI();
    }
  }

  ngOnDestroy(): void {
    // this.toastr.clear();
  }

  logOut() {
    this.authService.signouttwo();
  }

  // Logic for selecting items
  toggleSelected(type: string, index: number, $event?: number) {
    if(type === 'item') {
      if(index != undefined) {
        if($event != undefined && this.itemsByCategory[index].items[$event]) {
          this.itemsByCategory[index].items[$event].isSelected = !this.itemsByCategory[index].items[$event].isSelected;
          let itemParams = {
            param: this.itemsByCategory[index].items[$event].params[0]._id,
            paramValue: this.itemsByCategory[index].items[$event].params[0].values[0]._id
          }
          this.header.storeItems(this.saleflowData._id, {
              item: this.itemsByCategory[index].items[$event]._id,
              customizer: this.itemsByCategory[index].items[$event].customizerId,
              params: [itemParams],
              saleflow: this.saleflowData._id,
          });
          this.header.storeItemProduct(this.saleflowData._id, this.itemsByCategory[index].items[$event]);
        } else {
          this.inputsItems[index].isSelected = !this.inputsItems[index].isSelected;
          this.header.storeItems(this.saleflowData._id, {
            item: this.inputsItems[index]._id,
            amount: 1,
            saleflow: this.saleflowData._id,
          });
          this.header.storeItemProduct(this.saleflowData._id, this.inputsItems[index]);
        }
        let itemData = this.header.getItemProduct(this.saleflowData._id);
        console.log(itemData);
        if (itemData.length > 0) {
          this.showCTA = true;
        }else{
          this.showCTA = false;
        }
      }
    } else if(type === 'package') {
      this.sliderPackage.forEach((packageItem, packageIndex) => {
        if(packageIndex === index) packageItem.isSelected = !packageItem.isSelected;
        else packageItem.isSelected = false;
      })
      let products = [];
      for (
        let i = 0;
        i < this.packageData[index].items.listItems.length;
        i++
      ) {
        products.push({
          item: this.packageData[index].items.listItems[i]._id,
          amount:
            this.packageData[index].package.packageRules[i]
              .fixedQuantity,
          isScenario:
            this.packageData[index].items.listItems[i].itemExtra
              .length > 0,
          limitScenario:
            this.packageData[index].package.packageRules[i]
              .maxQuantity,
        });
      }
      this.header.storePackage(this.saleflowData._id, this.packageData[index].package._id, products);
      this.header.storeItemProduct(this.saleflowData._id, this.sliderPackage[index]);
    }
  }

  currentItemCaffaro(e) {
    console.log(this.inputsItems);
    console.log(e);
    if (this.inputsItems[e]) {
      this.options = [];
      this.priceTotal = 0;

      this.priceTotal = this.inputsItems[e].pricing;
      this.options.push({
        id: this.inputsItems[e]._id,
        title: this.inputsItems[e].name,
        subtitle: this.inputsItems[e].pricing,
        num: 1,
        images: this.inputsItems[e].images,
      });
      this.save(e);
    }
  }

  seeCategories(i: number) {
    this.router.navigate([
      `ecommerce/category-items/${this.saleflowData._id}/${
        this.itemsByCategory[i].items[0].category.find(category => category.name === this.itemsByCategory[i].label)._id
      }`,
    ]);
  }

  currentItemNapkins(listIndex: number, itemIndex: number) {
    console.log(listIndex);
    console.log(itemIndex);
      if (this.itemsByCategory[listIndex].items[itemIndex]) {
        this.options = [];
        this.priceTotal = 0;
  
        this.priceTotal =
          this.itemsByCategory[listIndex].items[itemIndex].pricing;
        this.options.push({
          id: this.itemsByCategory[listIndex].items[itemIndex]._id,
          title: this.itemsByCategory[listIndex].items[itemIndex].name,
          subtitle:
            this.itemsByCategory[listIndex].items[itemIndex].pricing,
          num: 1,
          images: this.itemsByCategory[listIndex].items[itemIndex].images,
          customizerId:
            this.itemsByCategory[listIndex].items[itemIndex].customizerId,
        });
        // this.save();
        if (
          this.itemsByCategory[listIndex].items[itemIndex].customizerId
        ) {
          this.header.categoryId =
            this.itemsByCategory[listIndex].items[
              itemIndex
            ].category[0]._id;
        console.log('new redirect to flow');
        const itemData =
          this.itemsByCategory[listIndex].items[itemIndex];
        let params: ItemParam;
        let selectedValue: ItemParamValue;
        if (itemData.params.length > 0) {
          params = itemData.params[0];
          selectedValue = params.values[0];
        }
        // const amount = itemData.fixedQuantity ?? 1;
        // const itemQuantity = itemData.fixedQuantity ?? 1;
        // const total = itemData.pricing + itemQuantity * selectedValue.price;

        // itemData.total = total;
        // itemData.amount = amount;
        this.header.items = [itemData];

        const order = {
          products: [{}],
        };
        this.header.order = order;
        this.header.order.products[0].item = itemData._id;
        // this.header.order.products[0].amount = amount;
        this.header.order.products[0].saleflow = this.header.saleflow._id;
        if (params) {
          this.header.order.products[0].params = [];
          this.header.order.products[0].params[0] = {
            param: params._id,
            paramValue: selectedValue._id,
          };
        }
        console.log(itemData);
        this.header.storeItems(this.saleflowData._id, 
          {
            item: itemData._id,
            saleflow: this.saleflowData._id,
            params: [{
              param: params._id,
              paramValue: selectedValue._id
            }],
            customizer: itemData.customizerId
        });
        this.header.storeItemProduct(this.saleflowData._id, itemData);
        this.router.navigate([`/ecommerce/provider-store`]);
        //this.router.navigate(['/ecommerce/item-detail/' + this.header.saleflow._id + '/' + itemData._id]);
      }
    }
  }

  minMax(sum: boolean, index: number) {
    if (this.inputPackage.length === 0) {
      if (sum) {
        if (this.options[0].num) {
          this.options[0].num++;
          this.priceTotal += Number(this.options[0].subtitle);
        }
      } else if (this.options[0].num && this.options[0].num > 1) {
        this.options[0].num--;
        this.priceTotal -= Number(this.options[0].subtitle);
      }
    } else {
      if (sum) {
        if (this.options[index].num < this.options[index].limitScenario) {
          this.options[index].num++;
          this.priceTotal += Number(this.options[index].subtitle);
        }
      } else if (this.options[index].num > this.options[index].min) {
        this.options[index].num--;
        this.priceTotal -= Number(this.options[index].subtitle);
      }
    }
  }

  closeTagItems = [
    {
      title: 'Filters',
      subtitle: 'Package Filters',
      options: [],
    },
  ];

  slider = document.querySelector<HTMLElement>('.scroller');

  getCheck(name: string) {
    if (this.header.items.length > 0) {
      if (this.header.items[0].name == name) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  startDragging(e, flag, el) {
    this.mouseDown = true;
    this.startX = e.pageX - el.offsetLeft;
    this.scrollLeft = el.scrollLeft;
  }
  stopDragging(e, flag) {
    this.mouseDown = false;
  }
  moveEvent(e, el) {
    e.preventDefault();
    if (!this.mouseDown) {
      return;
    }
    const x = e.pageX - el.offsetLeft;
    const scroll = x - this.startX;
    el.scrollLeft = this.scrollLeft - scroll;
  }

  toggleOption(option, category) {
    this.category = category;
    console.log(this.category);
    this.option = option;
  }

  /*openSelectedNapkinsModal() {
    this.dialog.open(SelectedNapkinsModalComponent, {
      type: 'window',
      props: { types: this.types },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }*/

  /*OpenShortcutsComponent() {
    this.dialog.open(ShortcutsComponent, {
      type: 'flat-action-sheet',
      props: {
        phone: this.phoneNumber,
        instagram: this.instagram,
        merchantId: this.merchantId,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }*/

  /*OpenQuickFlitersComponent() {
    this.dialog.open(QuickFiltersComponent, {
      type: 'flat-action-sheet',
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }*/

  OpenCart() {
    this.router.navigate(['/ecommerce/cart']);
  }

  save(index?: number) {
    if (index) this.header.packId = index;
    this.header.items = [];

    console.log(this.options);
    console.log(this.inputsItems);

    let products = [];
    let order;

    if (this.inputPackage.length > 0) {
      for (
        let i = 0;
        i < this.packageData[this.header.packId].items.listItems.length;
        i++
      ) {
        products.push({
          item: this.packageData[this.header.packId].items.listItems[i]._id,
          amount:
            this.packageData[this.header.packId].package.packageRules[i]
              .fixedQuantity,
          isScenario:
            this.packageData[this.header.packId].items.listItems[i].itemExtra
              .length > 0,
          limitScenario:
            this.packageData[this.header.packId].package.packageRules[i]
              .maxQuantity,
        });
      }
      order = {
        itemPackage: this.packageData[this.header.packId].package._id,
        products: products,
      };
      console.log(order);
      this.header.order = order;
      this.header.order.products[0].saleflow = this.header.saleflow._id;
      this.router.navigate(['/ecommerce/provider-store']);
    }

    if (this.inputPackage.length === 0) {
      products.push({
        item: this.inputsItems[index]._id,
        name: this.inputsItems[index].name,
        amount: 1,
      });

      order = {
        products: products,
      };

      console.log(order);
      this.header.order = order;
      this.header.order.products[0].saleflow = this.header.saleflow._id;
      //this.router.navigate(['/ecommerce/provider-store']);
      this.router.navigate(['/ecommerce/item-detail/' + this.header.saleflow._id + '/' + this.inputsItems[index]._id]);
    }
  }

  /*openModal() {
    console.log(this.saleflowData);
    this.dialog.open(MerchantMoreInfoComponent, {
      type: 'flat-action-sheet',
      flags: ['no-header'],
      customClass: 'app-dialog',
      props: {
        paymentInfo: this.saleflowData.paymentInfo,
        workingHours: this.saleflowData.workingHours,
        social: this.saleflowData.social,
        id: this.flowId,
      },
    });
  }*/

  currentItem(e) {
    console.log('evento', e);
    let isScenario;
    let scenariosLength;

    if (this.inputPackage.length === 0) {
      this.currentItemCaffaro(e);
    } else {
      this.options = [];
      this.priceTotal = 0;

      for (
        let i = 0;
        i < this.swiperPackageOrder[e].items.listItems.length;
        i++
      ) {
        scenariosLength =
          this.swiperPackageOrder[e].items.listItems[i].itemExtra.length > 0
            ? this.swiperPackageOrder[e].items.listItems[i].itemExtra.length
            : undefined;
        isScenario =
          this.swiperPackageOrder[e].items.listItems[i].itemExtra.length > 0;

        console.log(this.swiperPackageOrder[e]);

        // this.priceTotal += this.swiperPackageOrder[e].package.packageRules[i].minQuantity * this.swiperPackageOrder[e].items.listItems[i].pricing;

        this.priceTotal = this.swiperPackageOrder[e].package.price;

        this.options.push({
          title: this.swiperPackageOrder[e].items.listItems[i].name,
          subtitle: this.swiperPackageOrder[e].items.listItems[i].pricing,
          num: this.swiperPackageOrder[e].package.packageRules[i].fixedQuantity,
          isScenario: isScenario,
          min: this.swiperPackageOrder[e].package.packageRules[i].minQuantity,
          limitScenario:
            this.swiperPackageOrder[e].package.packageRules[i].maxQuantity,
        });
      }
    }
  }

  selectType() {
    this.type++;
    if (this.type == 2) {
      this.typeOneStyle['grid-template-columns'] = '1fr 1fr';
    }
    if (this.type > 4) {
      this.type = 1;
      this.typeOneStyle['grid-template-columns'] = '1fr 1fr';
    }
  }

  addNapkin(type) {
    if (this.types.includes(type)) {
      this.types = this.types.filter((e) => e != type);
    } else {
      this.types.push(type);
    }
  }

  hasNapkin(type) {
    return this.types.includes(type);
  }

  populateArray(event) {
    let isArray = Array.isArray(event);
    if (isArray) {
      this.types.push(event[0]);
    } else {
      for (let i = 0; i < this.types.length; i++) {
        if (this.types[i] == event) {
          this.types.splice(i, 1);
          return;
        }
      }
    }
  }

  redirect(id: string) {
    this.router.navigate(['/ecommerce/product-view/' + id]);
  }

  personalize() {
    this.header.ids = this.types;
    this.router.navigate(['/ecommerce/slot-creation']);
  }

  select(numb) {
    this.optionSelected = numb;
  }

  selectExtraFilter(numb) {
    this.extraFilterSelected = numb;
  }

  boxToggle() {
    this.boxToggler = !this.boxToggler;
  }

  selectOtherFilter(numb) {
    if (this.otherFilters.includes(numb)) {
      this.otherFilters = this.otherFilters.filter((e) => e != numb);
    } else {
      this.otherFilters.push(numb);
    }
  }

  otherFilterHasElement(numb) {
    return this.otherFilters.includes(numb);
  }

  transformIcon() {
    // copyText(`${environment.uri}/ecommerce/megaphone-v3/${this.flowId}`);
    //this.imageRoute = '/assets/images/check-circle.png';
    if (this.customizersId.length === 0) {
      this.router.navigate([`/ecommerce/create-giftcard`]);
    }else{
      this.router.navigate([`/ecommerce/provider-store`]);
    }
  }

  copyLink() {
    return `${environment.uri}/ecommerce/megaphone-v3/${this.flowId}`;
  }

  orderSwiper() {
    this.swiperPackageOrder = [];
    let aux;

    for (let i = 0; i < this.inputPackage.length; i++) {
      aux = this.packageData.find(
        (e) => e.package._id == this.inputPackage[i]._id
      );
      this.swiperPackageOrder.push(aux);
    }
  }

  validateCategories(category) {
    return category && category._id ? category._id : '0';
  }

  filterTags(e) {
    this.selectedTagsIds = e[0].options
      .filter((el) => el.selected)
      .map((el) => el.id);

    if (this.selectedTagsIds.length == 0) {
      this.inputPackage = this.packageData.map((e) => e.package);
    }

    if (this.selectedTagsIds.length == 0 && this.inputPackage.length === 0) {
      this.inputsItems = this.items;
    }

    if (this.selectedTagsIds.length > 0 && this.inputPackage.length > 0)
      this.inputPackage = this.packageData
        .filter((packageEl) =>
          packageEl.package.categories.some((element) =>
            this.selectedTagsIds.includes(element._id)
          )
        )
        .map((e) => e.package);

    if (this.selectedTagsIds.length > 0 && this.inputPackage.length === 0) {
      this.inputsItems = this.items.filter((el) =>
        this.selectedTagsIds.includes(this.validateCategories(el.category))
      );
    }

    console.log(this.inputsItems);
    console.log(this.items);
    this.loadingSwiper = false;
    this.orderSwiper();
    this.currentItem(0);
  }

  /*
[1,2,3] --> [tag1, tag2]

[1,2,3] --> [1,3] swiper
  */

  tagDeleted(e) {
    this.selectedTagsIds = this.selectedTagsIds.filter(
      (el) => el !== e.name[0].id
    );

    if (this.selectedTagsIds.length == 0) {
      this.inputPackage = this.packageData.map((e) => e.package);
    }

    if (this.selectedTagsIds.length == 0 && this.inputPackage.length === 0) {
      this.inputsItems = this.items;
    }

    if (this.selectedTagsIds.length > 0 && this.inputPackage.length > 0)
      this.inputPackage = this.packageData
        .filter((packageEl) =>
          packageEl.package.categories.some((element) =>
            this.selectedTagsIds.includes(element._id)
          )
        )
        .map((e) => e.package);

    if (this.inputPackage.length === 0 && this.selectedTagsIds.length > 0) {
      this.inputsItems = this.items.filter((el) =>
        this.selectedTagsIds.includes(this.validateCategories(el.category))
      );
    }

    setTimeout(() => (this.loadingSwiper = false), 1);
    console.log(this.inputsItems);
    console.log(this.items);
    this.orderSwiper();
    this.currentItem(0);
  }

  /**
   *  (click) => unload => filter/delete => load
   *
   *  (click) => deletedTags => unload
   */

  startLoading(e: boolean) {
    this.loadingSwiper = e;
  }

  async itemOfPackage(packages: ItemPackage[]) {
    let index = 0;

    for (let itemPackage of packages) {
      this.packageData.push({
        package: itemPackage,
      });

      console.log(itemPackage.packageRules.length);
      // console.log(itemPackage.packageRules.minQuantity);

      const listItems = (
        await this.saleflow.listItems({
          findBy: {
            _id: {
              __in: ([] = itemPackage.packageRules.map((e) => e.item._id)),
            },
          },
        })
      ).listItems;

      console.log('datos de los items de list item package');
      console.log(listItems);

      let isScenario;
      let scenariosLength;

      if (index === 0 && this.inputPackage.length > 0) {
        for (let i = 0; i < listItems.length; i++) {
          // scenariosLength = listItems[i].itemExtra.length > 0? listItems[i].itemExtra.length:undefined; //
          isScenario = listItems[i].itemExtra.length > 0;
          // this.priceTotal += itemPackage.packageRules[i].minQuantity * listItems[i].pricing;
          this.priceTotal = itemPackage.price;
          this.options.push({
            title: listItems[i].name,
            subtitle: listItems[i].pricing,
            num: itemPackage.packageRules[i].fixedQuantity,
            isScenario: isScenario,
            min: itemPackage.packageRules[i].minQuantity,
            limitScenario: itemPackage.packageRules[i].maxQuantity,
          });
        }
      }
      this.packageData[index].items = { listItems };
      console.log(this.packageData[index].items);
      index++;
    }
  }

  formatPrice(price: string = '') {
    return `${price}`.replace(',', '.').replace('.', ',');
  }
}
