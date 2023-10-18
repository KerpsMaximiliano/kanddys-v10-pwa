import { Component, OnInit, ViewChild } from '@angular/core';
import { DeliveryZonesService } from 'src/app/core/services/deliveryzones.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { shortFormatID, truncateString } from 'src/app/core/helpers/strings.helpers'
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { FormComponent } from 'src/app/shared/dialogs/form/form.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment'
import { ItemsService } from 'src/app/core/services/items.service';
import { MatDatepicker } from '@angular/material/datepicker';
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

  paymentOrderStatusLabels = [
    { id: 0, name: 'completed', selected: false, label: "Pagadas" },
    { id: 1, name: 'to confirm', selected: false, label: "Sin Pagar" },
  ];

  deliveryStatus : any[] | null = null;
  deliveryZones : any[] | null = null;
  deliveryZoneQuantities : any[] | null = null;

  selectedProgress = [];
  selectedZones = [];
  searchOpened:boolean = false;
  itemSearchbar: FormControl = new FormControl('');
  placeholder: string = "Todas las facturas";
  deliveryTimePlaceholder:string = "⏰ Todos Tiempo de Entrega";
  progressPlaceHolder:string = "📦 Todos los Progreso";
  deliveryZonePlaceholder: string = "📍 Todas las Zonas de Entrega";
  paymentStatusPlaceholder:string = "💰 Cualquier Estatus del Pago";
  deliveryTime: any[] = [];
  startDate: Date = null;
  endDate: Date = null;
  range = new FormGroup({
    start: new FormControl(''),
    end: new FormControl(''),
  });
  benefit:number = 0;
  startDateLabel:string = "";
  endDateLabel:string = "";
  @ViewChild('picker') datePicker: MatDatepicker<Date>;
  ordersTotal: any;
  ordersId: any[]= [];
  totalDeliveryzone:number = 0;
  hourRange:any = {};
  paymentStatus:any[] = [];
  totalPaymentStatus:number = 0;
  paymentStatusName: any [] = [];


  constructor(
    private merchantsService: MerchantsService,
    private orderService: OrderService,
    private deliveryZonesService: DeliveryZonesService,
    private router: Router,
    private dialog: MatDialog,
    private itemsService: ItemsService
  ) {}

  imageFiles: string[] = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];

  merchantId : string;
  userId : string;

  env : string = environment.assetsUrl

  tutorialEnabled : boolean = true;

  pickUp : any = {amount: 0, selected: false};
  delivery : any = {amount: 0, selected: false};

  externalOrderNumber : number | undefined;
  externalOrderImages : File[] = [];

  showLocations : boolean = false;

  orders = [];
  ordersByMonth = [];
  months = [{month:"diciembre"},
  {month:"noviembre"},
  {month:"octubre"},
  {month:"septiembre"},
  {month:"agosto"},
  {month:"julio"},
  {month:"junio"},
  {month:"mayo"},
  {month:"abril"},
  {month:"marzo"},
  {month:"febrero"},
  {month:"enero"}];

  shortFormatID = shortFormatID
  default_image = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
  orderDeliveryStatus(status) {
    return this.orderService.orderDeliveryStatus(status);
  }

  async ngOnInit() {
    await this.generate()
    this.toggleTutorial();
    await this.getDeliveryTime();
    await this.getOrdersTotal();
    await this.getTotalProgress();
    await this.getTotalDeliveryZones();
    await this.getPaymentStatus();
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
    }
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
    let findBy = {
      merchant: this.merchantId,
    }

    let options ={
      limit: 25,
        sortBy: 'createdAt:desc'
    }

    if(this.selectedProgress.length > 0) {
      findBy["orderStatusDelivery"] = this.selectedProgress
    }
    if(this.selectedZones.length > 0) {
      findBy["deliveryZone"] = this.selectedZones
    }
    if(ShippingType) {
      findBy["shippingType"] = ShippingType
    }
    if(Object.keys(this.hourRange).length > 0){
      findBy["estimatedDeliveryTime"] = this.hourRange;
    }
    if(this.paymentStatusName.length > 0){
      findBy["orderStatus"] = this.paymentStatusName;
    }
    if(this.startDate && this.endDate){
      options["range"] = {
        from: this.startDate,
        to: this.endDate
      }
    }
    const pagination: PaginationInput = {
      findBy: findBy,
      options: options
    };
    const orders = (
      await this.orderService.orderPaginate(
        pagination
      )
    )
    this.orders = orders.orderPaginate != undefined ? orders.orderPaginate : []
    
    this.ordersByMonth = [];
    this.months.forEach(month => {
      const data = this.orders.filter(order =>  moment(order.createdAt).locale("es").format('MMMM') === month.month)
      if(data.length > 0){
        this.ordersByMonth.push({
          month: month.month,
          orders: data
        });
      }
    });
    await this.getOrdersIds();   
    await this.getOrdersTotal();
    await this.orderService.orderQuantityOfFiltersStatusDelivery({ findBy: {merchant: this.merchantId}, options: options }).then((res) => {
      this.deliveryStatus = res
    })
   
    if(!this.deliveryZones) {
      let deliverOptions = {
        sortBy: "createdAt:desc", 
        limit: -1
      }
      if(this.startDate && this.endDate){
        deliverOptions["range"] = {
          from: this.startDate,
          to: this.endDate
        }
      }

      await this.deliveryZonesService.deliveryZones(
        {
          findBy:{merchant: this.merchantId},
          options: deliverOptions
        }).then((res) => {
        this.deliveryZones = res.map((deliveryZone) => {
          let zone = {
            ...deliveryZone,
            selected: false,
          }
          return zone;
        })
      })
    }
    let deliveryZonesIds = this.deliveryZones.map((deliveryZone) => deliveryZone._id)
    await this.orderService.orderQuantityOfFiltersDeliveryZone({ 
        findBy: 
        {
          merchant: this.merchantId,
          orderStatusDelivery: this.selectedProgress,
          deliveryZone: deliveryZonesIds,
        }, 
        options: options
      }).then((res) => {
      this.deliveryZoneQuantities = res
    })

    await this.orderService.orderQuantityOfFiltersShippingType({ 
      findBy: 
      {
        merchant: this.merchantId,
        orderStatusDelivery: this.selectedProgress,
      },
      options:options 
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

  goToOrderDetail(orderID: string, index) {
    if(this.orders[index].orderType === 'external') {
      return this.router.navigate(
        [
          `/ecommerce/manual-order-management/${orderID}`
        ],
        {
          queryParams: {
            redirectTo: this.router.url
          }
        }
      );
    }
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
    if(time <= 1) {
      return '1 minuto';
    }
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
    console.log(fileList)
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!this.imageFiles.includes(file.type)) return;
      this.externalOrderImages.push(file);
    }
    if (!this.externalOrderImages.length) return;
    this.externalOrderDialog();
  }

  externalOrderDialog() {
    const dialogRef = this.dialog.open(FormComponent, {
      width: '500px',
      data: {
        title: {text:'Monto Pagado:',},
        fields: [
          {
            placeholder: "$ escribe...",
            type: 'text',
            name: 'externalOrderNumber',
            validators: [Validators.pattern(/^\d+(\.\d{2})?$/)],
          },
        ],
        buttonsTexts: {
          cancel: 'Brincar',
          accept: 'Guardar',
        }
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.externalOrderNumber = Number(result.value.externalOrderNumber);
        this.sendExternalOrder(true);
      } else {
        this.sendExternalOrder(false);
      }
    });
  }

  async sendExternalOrder(sendAmount : boolean) {
    let orderData = {
      metadata: {
        files: this.externalOrderImages,
      },
      merchants: this.merchantId, //backend is merchants, if changed to merchant change this
    }
    if(sendAmount) {
      orderData["amount"] = this.externalOrderNumber;
    }
    await this.orderService.createOrderExternal(orderData)

    this.externalOrderImages = [];
    this.externalOrderNumber = undefined;
    this.generate()
  }

  truncateString (word) {
    return truncateString(word, 12)
  }

  async showSearch() {
    this.searchOpened = true;
    setTimeout(() => {
      (document
        .querySelector('#search-from-results-view') as HTMLInputElement)
        ?.focus();
    }, 100);
    // this.itemsService
    //   .itemsQuantityOfFilters(this.merchantsService.merchantData._id, 'supplier')
    //   .then(data => {
    //     if (this.isSupplier) {
    //       this.buttonFiltering[2].total = data.hidden
    //     } else {
    //       // btn para todos los items
    //       this.buttonFilteringNoSupplier[0].total = data.all
    //       // btn para items ocultos
    //       this.buttonFilteringNoSupplier[1].total = data.hidden
    //       // btn para items con comisiones
    //       this.buttonFilteringNoSupplier[2].total = data.commissionable
    //       // btn para menos de 10 items para vender
    //       this.buttonFilteringNoSupplier[3].total = data.lowStock
    //     }
    //   })

  }

  async getDeliveryTime(){
    let options = {}
    if(this.startDate && this.endDate){
      options["range"] = {
        from: this.startDate,
        to: this.endDate
      }
    }
    const itemsQuantityEstimatedDeliveryTime = await this.itemsService.itemsQuantityOfFiltersByEstimatedDeliveryTime({options});
    let totalDeliveryTime:number = 0;
    itemsQuantityEstimatedDeliveryTime.forEach((data, i)=>{
      totalDeliveryTime += data.count;
      this.deliveryTime.push({
        id: i,
        count: data.count,
        estimatedDeliveryTime: data.estimatedDeliveryTime,
        selected: false
      })
    });
    this.deliveryTimePlaceholder = `⏰ Todos Tiempo de Entrega (${totalDeliveryTime})...`


  }

  async selectDeliveryTime(id){

    const selectedItems = this.deliveryTime.filter(time => time.selected === true && time.id === id);

    if(selectedItems.length > 0){
      this.removeDeliveryTimeSelection();
      this.hourRange = {}
      await this.generate()
    }else{
      this.removeDeliveryTimeSelection();
      this.deliveryTime.forEach((e) => {
        if (e.id == id) {
          e.selected = !e.selected;
        }
      });
      lockUI()
      setTimeout(() => {
        unlockUI()
      }, 500);
      const deliveryTime = this.deliveryTime.filter(time => time.selected === true);
      this.hourRange = {
        from: deliveryTime[0].estimatedDeliveryTime.from,
        until: deliveryTime[0].estimatedDeliveryTime.until,
      }      
      await this.generate()
    }

    
  }

  removeDeliveryTimeSelection(){
    this.deliveryTime.forEach((e) => {
        e.selected = false;
    });
  }

  onCloseSearchbar() {
    this.searchOpened = false
  }

  openDatePicker() {
    this.datePicker.open();
  }

  async onDateChange() {
    if (this.range.get('start').value && this.range.get('end').value) {
      lockUI();
      try {
        this.startDate = new Date(this.range.get('start').value);
        this.endDate = new Date(this.range.get('end').value);
        this.startDateLabel = moment(this.startDate).format("DD/MM/YYYY");
        this.endDateLabel = moment(this.endDate).format("DD/MM/YYYY");
        await this.generate();
        unlockUI();
      } catch (error) {
        unlockUI();
        console.log(error);
      }
    }
  }

  async getOrdersTotal(){
    
    const ordersTotal = await this.orderService.ordersTotal(
      ['completed', 'to confirm'],
      this.merchantId,
      this.ordersId
    );
    this.ordersTotal = ordersTotal
    this.benefit = ordersTotal.total;
    this.placeholder = `Todas las facturas (${ordersTotal.length})...`

  }

  async getOrdersIds(){
    this.orders.forEach(order =>{
      this.ordersId.push(order._id)
    })
  }

  async getTotalProgress(){
    let totalProgress = 0;
    this.progress.forEach(data =>{
      if(this.deliveryStatus[data.name]){
        totalProgress += this.deliveryStatus[data.name];
      }else{
        totalProgress += 0;
      }
    })
    this.progressPlaceHolder = `📦 Todos los Progreso (${totalProgress})...`
  }

  async getTotalDeliveryZones(){
    this.deliveryZoneQuantities.forEach(data =>{
      this.totalDeliveryzone += data.count;
    })
    this.deliveryZonePlaceholder = `📍 Todas las Zonas de Entrega (${this.totalDeliveryzone})...`
  }

  async getPaymentStatus(){
    const paymentStatus = await this.orderService.orderQuantityOfFiltersOrderStatus(true, {findBy:{merchant: this.merchantId}});
    paymentStatus.forEach((data, i)=>{
      this.totalPaymentStatus += data.count;
      this.paymentStatus.push({
        id: i,
        count: data.count,
        name: data.orderStatus,
        selected: false
      })
    });

    this.paymentStatusPlaceholder = `💰 Cualquier Estatus del Pago (${this.totalPaymentStatus})...`;
  }

  parseOrderPaymentStatus(name){
    const paymentStatusOrders = this.paymentOrderStatusLabels.filter(status => status.name === name);
    return paymentStatusOrders[0].label;
  }

  async selectPaymentStatus(id){
    this.paymentStatusName = [];
      this.paymentStatus.forEach((e) => {
        if (e.id === id) {
          e.selected = !e.selected;
        }
      });

      this.paymentStatus.forEach(data =>{
        if(data.selected === true){
          this.paymentStatusName.push(data.name);
        }
      })
    
    lockUI()
    setTimeout(() => {
      unlockUI()
    }, 500);
    await this.generate()
  }

}
