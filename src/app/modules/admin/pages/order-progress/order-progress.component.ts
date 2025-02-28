import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
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
import { SwiperOptions } from 'swiper';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { OptionsMenuComponent } from 'src/app/shared/dialogs/options-menu/options-menu.component';
import { TranslateService } from '@ngx-translate/core';
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
    { id: 1, name: 'to confirm', selected: false, label: "Por confirmar" },
    { id: 1, name: 'in progress', selected: false, label: "Sin pagar" },
  ];

  deliveryStatus: any[] | null = null;
  deliveryZones: any[] | null = null;
  deliveryZoneQuantities: any[] | null = null;

  selectedProgress = [];
  selectedZones = [];
  searchOpened: boolean = false;
  itemSearchbar: FormControl = new FormControl('');
  placeholder: string = "Filtros según estados o mas";
  deliveryTimePlaceholder: string = "Tiempos de Entregas";
  progressPlaceHolder: string = "Status de la Entrega";
  deliveryZonePlaceholder: string = "Entregas";
  paymentStatusPlaceholder: string = "Status del Pago";
  deliveryTime: any[] = [];
  startDate: Date = null;
  endDate: Date = null;
  range = new FormGroup({
    start: new FormControl(''),
    end: new FormControl(''),
  });
  benefit: number = 0;
  startDateLabel: string = "";
  endDateLabel: string = "";
  @ViewChild('picker') datePicker: MatDatepicker<Date>;
  ordersTotal: any;
  ordersId: any[] = [];
  totalDeliveryzone: number = 0;
  hourRange: any = {};
  paymentStatus: any[] = [];
  totalPaymentStatus: number = 0;
  paymentStatusName: any[] = [];
  paginationState: {
    pageSize: number;
    page: number;
    status: 'loading' | 'complete';
  } = {
      page: 1,
      pageSize: 25,
      status: 'loading',
    };
  reachedTheEndOfPagination = false;

  swiperConfig: SwiperOptions = {
    slidesPerView: 2.5,
    freeMode: true,
    spaceBetween: 0.5,
  };
  @ViewChild('progressStatus') progressStatus: ElementRef;
  assetsFolder: string = environment.assetsUrl;
  orderIds: any[] = [];
  filterApplied: boolean = false;
  searchResultsObtained:boolean = false;
  filterOpened: boolean = false;
  filterModalOpened:boolean = false;
  filterBreadcumbsShow:boolean = false;
  isMobile:boolean = false;


  constructor(
    private merchantsService: MerchantsService,
    private orderService: OrderService,
    private deliveryZonesService: DeliveryZonesService,
    private router: Router,
    private dialog: MatDialog,
    private itemsService: ItemsService,
    private renderer: Renderer2,
    private bottomSheet: MatBottomSheet,
    private translate: TranslateService
  ) {
    let language = navigator?.language ? navigator?.language?.substring(0, 2) : 'es';
      translate.setDefaultLang(language?.length === 2 ? language  : 'es');
      translate.use(language?.length === 2 ? language  : 'es');
   }

  imageFiles: string[] = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];

  merchantId: string;
  userId: string;

  env: string = environment.assetsUrl

  tutorialEnabled: boolean = false;

  pickUp: any = { amount: 0, selected: false };
  delivery: any = { amount: 0, selected: false };

  externalOrderNumber: number | undefined;
  externalOrderImages: File[] = [];

  showLocations: boolean = false;

  orders = [];
  ordersByMonth = [];
  months = [{ month: "diciembre" },
  { month: "noviembre" },
  { month: "octubre" },
  { month: "septiembre" },
  { month: "agosto" },
  { month: "julio" },
  { month: "junio" },
  { month: "mayo" },
  { month: "abril" },
  { month: "marzo" },
  { month: "febrero" },
  { month: "enero" }];

  shortFormatID = shortFormatID
  default_image = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
  orderDeliveryStatus(status) {
    return this.orderService.orderDeliveryStatus(status);
  }

  async ngOnInit() {
    const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    this.isMobile = regex.test(navigator.userAgent);
    await this.fetchPaginationData(false, true)
    this.toggleTutorial();
    await this.getDeliveryTime();
    await this.getOrdersTotal();
    await this.getTotalProgress();
    await this.getTotalDeliveryZones();
    await this.getPaymentStatus();
  }

  selectProgress(id) {
    this.paginationState.page = 1;
    this.progress.forEach((e) => {
      if (e.id == id) {
        e.selected = !e.selected;
      }
    });
    this.selectedProgress = this.progress.filter(progress => progress.selected).map(progress => progress.name)
  }

  selectZone(id) {
    this.paginationState.page = 1;
    this.deliveryZones.forEach((e) => {
      if (e._id == id) {
        e.selected = !e.selected;
      }
    });
    this.selectedZones = this.deliveryZones.filter(zone => zone.selected).map(zone => zone._id)
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
    if (!this.deliveryStatus) return 0;
    return this.deliveryStatus[status];
  }

  async generate() {
    lockUI()

    if (!this.merchantId) {
      await this.merchantsService.merchantDefault().then((res) => {
        this.merchantId = res._id;
        this.userId = res.owner._id;
      });
    }
    let ShippingType;
    if (this.pickUp.selected && this.delivery.selected) {
      ShippingType = ["pickup", "delivery"]
    } else if (this.pickUp.selected) {
      ShippingType = "pickup"
    } else if (this.delivery.selected) {
      ShippingType = "delivery"
    } else {
      ShippingType = null
    }
    let findBy = {
      merchant: this.merchantId,
    }

    let options = {
      limit: 25,
      sortBy: 'createdAt:desc',
      page: this.paginationState.page
    }

    if (this.selectedProgress.length > 0) {
      findBy["orderStatusDelivery"] = this.selectedProgress
    }
    if (this.selectedZones.length > 0) {
      findBy["deliveryZone"] = this.selectedZones
    }
    if (ShippingType) {
      findBy["shippingType"] = ShippingType
    }
    if (Object.keys(this.hourRange).length > 0) {
      findBy["estimatedDeliveryTime"] = this.hourRange;
    }
    if (this.paymentStatusName.length > 0) {
      findBy["orderStatus"] = this.paymentStatusName;
    }
    if (this.startDate && this.endDate) {
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
      const data = this.orders.filter(order => moment(order.createdAt).locale("es").format('MMMM') === month.month)
      if (data.length > 0) {
        this.ordersByMonth.push({
          month: month.month,
          orders: data
        });
      }
    });
    await this.getOrdersIds();
    await this.getOrdersTotal();
    let orderQuantityDeliveryOptions = {
      limit: 25,
      sortBy: 'createdAt:desc'
    }
    await this.orderService.orderQuantityOfFiltersStatusDelivery({ findBy: { merchant: this.merchantId }, options: orderQuantityDeliveryOptions }).then((res) => {
      this.deliveryStatus = res
    })

    if (!this.deliveryZones) {
      let deliverOptions = {
        sortBy: "createdAt:desc",
        limit: -1
      }
      if (this.startDate && this.endDate) {
        deliverOptions["range"] = {
          from: this.startDate,
          to: this.endDate
        }
      }

      await this.deliveryZonesService.deliveryZones(
        {
          findBy: { merchant: this.merchantId },
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
      options: orderQuantityDeliveryOptions
    }).then((res) => {
      if (res) {
        this.pickUp = {
          amount: res.pickup,
          selected: false,
        }
        this.delivery = {
          amount: res.delivery,
          selected: false,
        }
      } else {
        unlockUI()
      }
    })
    unlockUI()

  }

  findAmount(id) {
    if (!this.deliveryZoneQuantities) return 0;
    const quantity = this.deliveryZoneQuantities.find((quantity) => quantity.deliveryzone._id === id)
    return quantity !== undefined ? quantity.count : 0;
  }

  emitFileInputClick() {
    (document.querySelector('#file') as HTMLElement).click();
  }

  goToOrderDetail(orderID: string, index) {
    if (this.orders[index].orderType === 'external') {
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
    let time = Math.ceil((new Date().getTime() - date.getTime()) / (1000 * 60));
    if (time <= 1) {
      return '1 minuto';
    }
    if (time < 60) {
      return time + ' minutos';
    }
    if (time < 120) {
      return '1 hora';
    }
    if (time < 1440) {
      return Math.ceil(time / 60) + ' horas';
    }
    if (time < 2880) {
      return '1 día';
    }
    if (time < 43800) {
      return Math.ceil(time / 1440) + ' dias';
    }
    if (time < 87600) {
      return '1 mes';
    }
    if (time < 525600) {
      return Math.ceil(time / 43800) + ' meses';
    }
    if (time < 1051200) {
      return '1 año';
    }
    return Math.ceil(time / 525600) + ' años';
  }

  toggleTutorial(disable = false) {
    if (disable) {
      window.localStorage.setItem('tutorialDisable', 'true')
      this.tutorialEnabled = false
    } else {
      let tutorialStatus = window.localStorage.getItem('tutorialDisable')
      if (!tutorialStatus) {
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
        title: { text: 'Monto Pagado:', },
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

  async sendExternalOrder(sendAmount: boolean) {
    let orderData = {
      metadata: {
        files: this.externalOrderImages,
      },
      merchants: this.merchantId, //backend is merchants, if changed to merchant change this
    }
    if (sendAmount) {
      orderData["amount"] = this.externalOrderNumber;
    }
    await this.orderService.createOrderExternal(orderData)

    this.externalOrderImages = [];
    this.externalOrderNumber = undefined;
    this.generate()
  }

  truncateString(word) {
    return truncateString(word, 12)
  }

  async showFilter() {
    this.filterOpened = true;
    this.filterModalOpened = true;
    setTimeout(() => {
      (document
        .querySelector('#search-from-results-view') as HTMLInputElement)
        ?.focus();
    }, 100);
  }

  async getDeliveryTime() {
    let options = {}
    if (this.startDate && this.endDate) {
      options["range"] = {
        from: this.startDate,
        to: this.endDate
      }
    }
    const itemsQuantityEstimatedDeliveryTime = await this.itemsService.itemsQuantityOfFiltersByEstimatedDeliveryTime({ options });
    let totalDeliveryTime: number = 0;
    itemsQuantityEstimatedDeliveryTime.forEach((data, i) => {
      totalDeliveryTime += data.count;
      this.deliveryTime.push({
        id: i,
        count: data.count,
        estimatedDeliveryTime: data.estimatedDeliveryTime,
        selected: false
      })
    });


  }

  async selectDeliveryTime(id) {
    this.paginationState.page = 1;
    let hourRangeSelected = [];
    this.deliveryTime.forEach((e) => {
      if (e.id == id) {
        e.selected = !e.selected;
      }
    });

    const deliveryTime = this.deliveryTime.filter(time => time.selected === true);
    deliveryTime.forEach(time => {
      hourRangeSelected.push({
        from: time.estimatedDeliveryTime.from,
        until: time.estimatedDeliveryTime.until
      })
    })
    const selectedItems = this.deliveryTime.filter(time => time.selected === true);
    if (selectedItems.length > 0) {
      const range = this.getHourRanger(hourRangeSelected);
      this.hourRange = range;
    } else {
      this.hourRange = {}
    }
  }

  getHourRanger(hours: any) {
    const fromValues = hours.map(item => item.from);
    const untilValues = hours.map(item => item.until);

    const minFrom = Math.min(...fromValues);
    const maxUntil = Math.max(...untilValues);

    return {
      from: minFrom,
      until: maxUntil
    }
  }

  removeDeliveryTimeSelection() {
    this.deliveryTime.forEach((e) => {
      e.selected = false;
    });
  }

 async  onCloseSearchbar() {
    this.selectedProgress = [];
    this.selectedZones = [];
    this.paymentStatusName = [];
    this.hourRange = {}

    await this.generate();

    this.filterOpened = false;
    this.searchOpened = false;
    this.filterModalOpened = false;
    this.filterApplied = false;
    this.searchResultsObtained=false
    this.resetAllFilter();
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

  async getOrdersTotal() {
    let range = {};
    if (this.startDate && this.endDate) {
      range = {
        from: this.startDate,
        to: this.endDate
      }
    }
    const ordersTotal = await this.orderService.ordersTotalV2(
      ['completed', 'to confirm', 'in progress'],
      this.merchantId,
      this.ordersId,
      range
    );
    this.ordersTotal = ordersTotal
    this.benefit = ordersTotal.total;
    // this.placeholder = `Todas las facturas (${ordersTotal.lenght})...``

  }

  async getOrdersIds() {
    this.orders.forEach(order => {
      this.ordersId.push(order._id)
    })
  }

  async getTotalProgress() {
    let totalProgress = 0;
    this.progress.forEach(data => {
      if (this.deliveryStatus[data.name]) {
        totalProgress += this.deliveryStatus[data.name];
      } else {
        totalProgress += 0;
      }
    })
  }

  async getTotalDeliveryZones() {
    this.deliveryZoneQuantities.forEach(data => {
      this.totalDeliveryzone += data.count;
    })
  }

  async getPaymentStatus() {
    const paymentStatus = await this.orderService.orderQuantityOfFiltersOrderStatus(true, { findBy: { merchant: this.merchantId } });
    paymentStatus.forEach((data, i) => {
      this.totalPaymentStatus += data.count;
      this.paymentStatus.push({
        id: i,
        count: data.count,
        name: data.orderStatus,
        selected: false
      })
    });
  }

  parseOrderPaymentStatus(name) {
    const paymentStatusOrders = this.paymentOrderStatusLabels.filter(status => status.name === name);
    return paymentStatusOrders[0].label;
  }

  async selectPaymentStatus(id) {
    this.paymentStatusName = [];
    this.paymentStatus.forEach((e) => {
      if (e.id === id) {
        e.selected = !e.selected;
      }
    });

    this.paymentStatus.forEach(data => {
      if (data.selected === true) {
        this.paymentStatusName.push(data.name);
      }
    })

  }

  async infinitePagination() {


    const targetClass = '.dashboard-page';
    const page = document.querySelector(targetClass);
    const pageScrollHeight = page.scrollHeight;
    const verticalScroll = window.innerHeight + page.scrollTop;

    // Calcula la diferencia entre la posición vertical y la altura total de la página
    const difference = Math.abs(verticalScroll - pageScrollHeight);

    if (verticalScroll >= pageScrollHeight || difference <= 50) {
      if (
        this.paginationState.status === 'complete'
      ) {
        await this.fetchPaginationData(false, true)
      }
    }
  }

  async fetchPaginationData(
    restartPagination = false,
    triggeredFromScroll = false) {
    this.paginationState.status = 'loading';

    if (restartPagination) {
      this.paginationState.page = 1;
    } else {
      this.paginationState.page++;
    }

    if (!this.orders.length && this.paginationState.page !== 1) {
      this.paginationState.page--;
      this.reachedTheEndOfPagination = true;
    }
    await this.paginateItems();

    this.paginationState.status = 'complete';

    if (this.orders.length === 0 && !triggeredFromScroll) {
      this.ordersByMonth = [];
    }


  }

  async paginateItems() {

    if (!this.merchantId) {
      await this.merchantsService.merchantDefault().then((res) => {
        this.merchantId = res._id;
        this.userId = res.owner._id;
      });
    }
    let ShippingType;
    if (this.pickUp.selected && this.delivery.selected) {
      ShippingType = ["pickup", "delivery"]
    } else if (this.pickUp.selected) {
      ShippingType = "pickup"
    } else if (this.delivery.selected) {
      ShippingType = "delivery"
    } else {
      ShippingType = null
    }
    let findBy = {
      merchant: this.merchantId,
    }

    let options = {
      limit: this.paginationState.pageSize,
      sortBy: 'createdAt:desc',
      page: this.paginationState.page
    }

    if (this.selectedProgress.length > 0) {
      findBy["orderStatusDelivery"] = this.selectedProgress
    }
    if (this.selectedZones.length > 0) {
      findBy["deliveryZone"] = this.selectedZones
    }
    if (ShippingType) {
      findBy["shippingType"] = ShippingType
    }
    if (Object.keys(this.hourRange).length > 0) {
      findBy["estimatedDeliveryTime"] = this.hourRange;
    }
    if (this.paymentStatusName.length > 0) {
      findBy["orderStatus"] = this.paymentStatusName;
    }
    if (this.startDate && this.endDate) {
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

    if (orders.orderPaginate) {
      orders.orderPaginate.forEach(order => {
        this.orders.push(order)
      })
    } else {
      this.orders = [];
    }

    this.ordersByMonth = [];
    this.months.forEach(month => {
      const data = this.orders.filter(order => moment(order.createdAt).locale("es").format('MMMM') === month.month)
      if (data.length > 0) {
        this.ordersByMonth.push({
          month: month.month,
          orders: data
        });
      }
    });
    await this.getOrdersIds();
    await this.getOrdersTotal();
    let orderQuantityDeliveryOptions = {
      limit: 25,
      sortBy: 'createdAt:desc'
    }
    await this.orderService.orderQuantityOfFiltersStatusDelivery({ findBy: { merchant: this.merchantId }, options: orderQuantityDeliveryOptions }).then((res) => {
      this.deliveryStatus = res
    })

    if (!this.deliveryZones) {
      let deliverOptions = {
        sortBy: "createdAt:desc",
        limit: -1
      }
      if (this.startDate && this.endDate) {
        deliverOptions["range"] = {
          from: this.startDate,
          to: this.endDate
        }
      }

      await this.deliveryZonesService.deliveryZones(
        {
          findBy: { merchant: this.merchantId },
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
      options: orderQuantityDeliveryOptions
    }).then((res) => {
      this.deliveryZoneQuantities = res
    })

    await this.orderService.orderQuantityOfFiltersShippingType({
      findBy:
      {
        merchant: this.merchantId,
        orderStatusDelivery: this.selectedProgress,
      },
      options: orderQuantityDeliveryOptions
    }).then((res) => {
      if (res) {
        this.pickUp = {
          amount: res.pickup,
          selected: false,
        }
        this.delivery = {
          amount: res.delivery,
          selected: false,
        }
      } else {
        unlockUI()
      }
    })

    this.paginationState.status = 'complete';
  }

  getItemsName(items: any) {
    let names = "";
    items.forEach(item => {
      if (item.item.name !== null) {
        names !== "" ? names += ", " + truncateString(item.item.name, 7) : names += truncateString(item.item.name, 7);
      } else {
        names !== "" ? names += ", Sin nombre" : names += "Sin nombre";
      }
    })
    return names

  }

  selectedOrder(event) {
    if(!this.orderIds.includes(event.target.value)){
      this.orderIds.push(event.target.value);
    }else{
      const index: number = this.orderIds.indexOf(event.target.value);
      if (index !== -1) {
          this.orderIds.splice(index, 1);
      }
      event.target.checked = false;
      
    }
  }

  async applyFilters() {
    this.deselectAll();
    this.filterModalOpened = false;
    this.filterApplied = true;
    this.searchResultsObtained = true;
    await this.generate();
  }

  openSelectedOrdersOptionsMenu() {
    this.bottomSheet.open(OptionsMenuComponent, {
      data: {
        title: `Selecciona entre estas opciones`,
        options: [
          {
            value: `Cambiar ordenes seleccionadas a estado En preparación`,
            callback: async () => {
              await this.updateOrderStatus("in progress");
            },
          },
          {
            value: `Cambiar ordenes seleccionadas a estado Listo para enviarse`,
            callback: async () => {
              await this.updateOrderStatus("pending");
            },
          },
          {
            value: `Cambiar ordenes seleccionadas a estado Listo para pick-up`,
            callback: async () => {
              await this.updateOrderStatus("pickup");
            },
          },
          {
            value: `Cambiar ordenes seleccionadas a estado Enviado`,
            callback: async () => {
              await this.updateOrderStatus("shipped");
            },
          },
          {
            value: `Cambiar ordenes seleccionadas a estado Entregado`,
            callback: async () => {
              await this.updateOrderStatus("delivered");
            },
          },
        ],
        styles: {
          fullScreen: true,
        },
      },
    });
  }

  async updateOrderStatus(status:string){
    lockUI();
    this.orderIds.forEach(async orderId =>{
      try {
        await this.orderService.orderSetStatusDelivery(
          status,
          orderId
        );
      } catch (error) {
        console.log(error);
      }
    })
    unlockUI();
    await this.generate();
    this.orderIds=[];
    this.deselectAll();
  }

  deselectAll() {
    const radioInputs = document.querySelectorAll('input[type="checkbox"]');
    radioInputs.forEach((input: HTMLInputElement) => {
      input.checked = false;
    });
  }

  showSearchBar(){
    this.searchOpened = true;
  }
  async searchItems(event) {
    setTimeout(async () => {
      await this.getListItems(this.itemSearchbar.value);
    }, 500);
  }

  async getListItems(searchName = "") {
    if (searchName === "") {
      this.searchResultsObtained = false;
      await this.generate();
    } else {
      this.searchResultsObtained = true;
      setTimeout(async () => {
        await this.filterOrdersByUserField(searchName);
      }, 500);
    }
  }

  filterOrdersByUserField(searchTerm: string) {

    searchTerm = searchTerm.toLowerCase();
  
    const filteredOrders = this.orders.filter((order) => {
      const user = order.user || {};
      const name = user.name || '';
      const email = user.email || '';
      const phone = user.phone || '';
      return (
        name.toLowerCase().includes(searchTerm) ||
        email.toLowerCase().includes(searchTerm) ||
        phone.toLowerCase().includes(searchTerm)
      );
    });
  
    this.ordersByMonth = [];
    this.months.forEach(month => {
      const data = filteredOrders.filter(order => moment(order.createdAt).locale("es").format('MMMM') === month.month)
      if (data.length > 0) {
        this.ordersByMonth.push({
          month: month.month,
          orders: data
        });
      }
    });
    this.getOrdersIds();
    this.getOrdersTotal();
    
  }

  selectDelivery(){
    if(this.delivery["selected"] === false){
      this.delivery["selected"] = true;
    }else{
      this.delivery["selected"] = false;
    }
  }

  selectPickUp(){
    if(this.pickUp["selected"] === false){
      this.pickUp["selected"] = true;
    }else{
      this.pickUp["selected"] = false;
    }
  }

  resetAllFilter(){
    this.delivery["selected"] = false;
    this.pickUp["selected"] = false;
    this.progress.forEach((e) => {
        e.selected = false;
    });
    this.deliveryZones.forEach((e) => {
      e.selected = false;
    });
    this.deliveryTime.forEach((e) => {
      e.selected = false;
    });
    this.paymentStatus.forEach((e) => {
      e.selected = false;
    });
  }

}
