import { Component, OnInit } from '@angular/core';
import { DeliveryZonesService } from 'src/app/core/services/deliveryzones.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { shortFormatID, truncateString } from 'src/app/core/helpers/strings.helpers'
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-order-progress',
  templateUrl: './order-progress.component.html',
  styleUrls: ['./order-progress.component.scss']
})
export class OrderProgressComponent implements OnInit {

  progress = [
    { id: 1, name: 'in progress', selected: false },
    { id: 2, name: 'pickup', selected: false },
    { id: 3, name: 'pending', selected: false },
    { id: 4, name: 'shipped', selected: false },
    { id: 5, name: 'delivered', selected: false },
  ];

  deliveryStatus : any[] | null = null;
  deliveryZones : any[] | null = null;
  deliveryZoneQuantities : any[] | null = null;

  selectedProgress = [];
  selectedZones = [];

  constructor(
    private merchantsService: MerchantsService,
    private orderService: OrderService,
    private deliveryZonesService: DeliveryZonesService,
    private router: Router,
  ) {}

  imageFiles: string[] = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];

  merchantId : string;
  userId : string;

  env : string = environment.assetsUrl

  tutorialEnabled : boolean = true;

  pickUp : any = {amount: 0, selected: false};
  delivery : any = {amount: 0, selected: false};

  externalOrderDialog : boolean = false;
  externalOrderNumber : number = 0;
  externalOrderImages : File[] = [];

  showLocations : boolean = false;

  orders = []

  shortFormatID = shortFormatID
  default_image = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
  orderDeliveryStatus(status) {
    return this.orderService.orderDeliveryStatus(status);
  }

  ngOnInit(): void {
    this.generate()
    this.toggleTutorial()
  }

  selectProgress(id) {
    this.progress.forEach((e) => {
      if (e.id == id) {
        e.selected = !e.selected;
      }
    });
    lockUI()
    setTimeout(() => {
      unlockUI()
    }, 500);
    this.selectedProgress = this.progress.filter(progress => progress.selected).map(progress => progress.name)
    this.generate()
  }

  selectZone(id) {
    this.deliveryZones.forEach((e) => {
      if (e._id == id) {
        e.selected = !e.selected;
      }
    });
    lockUI()
    setTimeout(() => {
      unlockUI()
    }, 500);
    this.selectedZones = this.deliveryZones.filter(zone => zone.selected).map(zone => zone._id)
    this.generate()
  }

  calcTotal(subtotals: any) {
    let sum = 0;

    subtotals.forEach(subtotal => {
        sum += subtotal.amount;
    });

    return sum;
  }

  calcTotalPrice() {
    let totalprice = 0;
    this.orders.forEach(order => {
      totalprice += this.calcTotal(order.subtotals);
    });
    return totalprice;
  }

  orderDeliveryLength(status) {
    if(!this.deliveryStatus) return 0;
    return this.deliveryStatus[status];
  }

  async generate() {

    lockUI()
    if(!this.merchantId) {
      await this.merchantsService.merchantDefault().then((res) => {
        this.merchantId = res._id;
        this.userId = res.owner._id;
      });
      console.log("merchant _id", this.merchantId);
    }
    console.log(this.selectedProgress)
    console.log(this.selectedZones)
    let ShippingType;
    if(this.pickUp.selected && this.delivery.selected) {
      ShippingType = ["pickup", "delivery"]
    } else if(this.pickUp.selected) {
      ShippingType = "pickup"
    } else if(this.delivery.selected) {
      ShippingType = "delivery"
    } else {
      ShippingType = null
    }
    let findBy = {}
    if(this.selectedProgress.length > 0) {
      findBy["orderStatusDelivery"] = this.selectedProgress
    }
    if(this.selectedZones.length > 0) {
      findBy["deliveryZone"] = this.selectedZones
    }
    if(ShippingType) {
      findBy["shippingType"] = ShippingType
    }
    const pagination: PaginationInput = {
      findBy: findBy,
      options: {
        limit: 25,
        sortBy: 'updatedAt:desc'
      },
    };
    const orders = (
      await this.merchantsService.ordersByMerchant(
        this.merchantId,
        pagination
      )
    )?.ordersByMerchant;
    this.orders = orders != undefined ? orders : []
    console.log(orders, "ordersByMerchant");

    await this.orderService.orderQuantityOfFiltersStatusDelivery({ findBy: {merchant: this.merchantId} }).then((res) => {
      this.deliveryStatus = res
    })

    await this.deliveryZonesService.deliveryZones(
      {
        findBy:{merchant: this.merchantId},
        options: {sortBy: "createdAt:desc", limit: -1}
      }).then((res) => {
      this.deliveryZones = res.map((deliveryZone) => {
        let zone = {
          ...deliveryZone,
          selected: false,
        }
        return zone;
      })
      console.log(this.deliveryZones)
    })
    let deliveryZonesIds = this.deliveryZones.map((deliveryZone) => deliveryZone._id)
    console.log(deliveryZonesIds)
    await this.orderService.orderQuantityOfFiltersDeliveryZone({ 
        findBy: 
        {
          merchant: this.merchantId,
          orderStatusDelivery: this.selectedProgress,
          deliveryZone: deliveryZonesIds,
        } 
      }).then((res) => {
      this.deliveryZoneQuantities = res
      console.log(this.deliveryZoneQuantities)
    })

    await this.orderService.orderQuantityOfFiltersShippingType({ 
      findBy: 
      {
        merchant: this.merchantId,
        orderStatusDelivery: this.selectedProgress,
      } 
    }).then((res) => {
      this.pickUp = {
        amount: res.pickup,
        selected: false,
      }
      this.delivery ={
        amount: res.delivery,
        selected: false,
      }
    })
    unlockUI()
  }

  findAmount(id) {
    if(!this.deliveryZoneQuantities) return 0;
    const quantity = this.deliveryZoneQuantities.find((quantity) => quantity.deliveryzone._id === id)
    return quantity !== undefined ? quantity.count : 0;
  }

  emitFileInputClick() {
    (document.querySelector('#file') as HTMLElement).click();
  }

  goToOrderDetail(orderID: string) {
    return this.router.navigate(
      [
        `/ecommerce/order-detail/${orderID}`
      ],
      {
        queryParams: {
          redirectTo: this.router.url
        }
      }
    );
  }

  back() {
    return this.router.navigate(['/admin/dashboard']);
  }

  dateHandler(datestring: string) {
    datestring = datestring.slice(0, -5)
    let date = new Date(datestring)
    let time = Math.ceil((new Date().getTime() - date.getTime())/(1000*60));
    if(time < 60) {
      return time + ' minutos';
    }
    if(time < 120) {
      return '1 hora';
    }
    if(time < 1440) {
      return Math.ceil(time/60) + ' horas';
    }
    if(time < 2880) {
      return '1 día';
    }
    if(time < 43800) {
      return Math.ceil(time/1440) + ' dias';
    }
    if(time < 87600) {
      return '1 mes';
    }
    if(time < 525600) {
      return Math.ceil(time/43800) + ' meses';
    }
    if(time < 1051200) {
      return '1 año';
    }
    return Math.ceil(time/525600) + ' años';
  }

  toggleTutorial(disable = false) {
    if(disable) {
      window.localStorage.setItem('tutorialDisable', 'true')
      this.tutorialEnabled = false
    } else {
      let tutorialStatus = window.localStorage.getItem('tutorialDisable')
      if(!tutorialStatus) {
        this.tutorialEnabled = true;
      } else {
        this.tutorialEnabled = false;
      }
    }
    return;
  }

  async loadFile(event: Event) {
    const fileList = (event.target as HTMLInputElement).files;
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!this.imageFiles.includes(file.type)) return;
      this.externalOrderImages.push(file);
    }
    if (!this.externalOrderImages.length) return;

    this.externalOrderDialog = true;
  }

  sendExternalOrder(sendAmount : boolean) {
    if(!sendAmount) {
      this.orderService.createOrderExternal({
        metadata: {
          files: this.externalOrderImages,
        },
        merchants: this.merchantId, //backend is merchants, if changed to merchant change this
        user: this.userId,
      }).then((res) => {
        console.log(res)
      })
    } else {
      this.orderService.createOrderExternal({
        metadata: {
          files: this.externalOrderImages,
        },
        amount: this.externalOrderNumber,
        merchants: this.merchantId, //backend is merchants, if changed change this
        user: this.userId,
      }).then((res) => {
        console.log(res)
      })
    }
    this.externalOrderDialog = false;
  }

  truncateString (word) {
    return truncateString(word, 12)
  }
}
