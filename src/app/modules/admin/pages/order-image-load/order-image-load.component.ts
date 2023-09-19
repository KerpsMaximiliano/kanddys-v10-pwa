import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormComponent } from 'src/app/shared/dialogs/form/form.component';
import { Validators } from '@angular/forms';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { OptionsMenuComponent } from 'src/app/shared/dialogs/options-menu/options-menu.component';
import { NgNavigatorShareService } from 'ng-navigator-share';
import {
  formatID,
} from 'src/app/core/helpers/strings.helpers';
import {
  OrderStatusDeliveryType,
} from 'src/app/core/models/order';
@Component({
  selector: 'app-order-image-load',
  templateUrl: './order-image-load.component.html',
  styleUrls: ['./order-image-load.component.scss'],
})
export class OrderImageLoadComponent implements OnInit {
  env: string = environment.assetsUrl;
  profit: number = 0;
  order;
  user;
  userId: string;
  merchantId: string = '';
  merchantName: string = '';
  merchantImage: string = ''
  activeStatusIndex = 0;
  isMerchant: boolean;
  statusList: Array<{
    name: string;
    status?:string;
  }> = [];
  image: any;
  imageFile: File;
  amount: number;
  identification : string;
  receiver : string;
  receiverPhoneNumber : string;
  sender : string;
  notes: string;
  orderId: string;
  messageLink: string;
  constructor(
    private merchantsService: MerchantsService,
    private orderService: OrderService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private clipboard: Clipboard,
    private _bottomSheet: MatBottomSheet,
    private NgNavigatorShareService: NgNavigatorShareService,
  ) {}

  ngOnInit(): void {
    this.generate();
  }

  async generate() {
    await this.merchantsService.merchantDefault().then((res) => {
      this.merchantId = res._id;
      this.merchantName = res.name;
      this.merchantImage = res.image;
    })
    await this.orderData()
    this.buildStatusList();
    if(!this.profit) {
      const orders = (await this.orderService.orderPaginate({
        findBy: {
          merchant: this.merchantId,
        },
        options: {
          limit: 25,
          sortBy: 'createdAt:desc'
        },
      })).orderPaginate;
      orders.forEach(order => {
        this.profit += this.calcTotal(order.subtotals);
      });
    }
    if(this.route.snapshot.queryParamMap.get('userId')) {
      this.userId = this.route.snapshot.queryParamMap.get('userId');
      console.log('userId', this.userId)
      if(!this.user || this.userId !== this.user._id) {
        this.updateOrder('user');
      }
    }
  }

  async orderData() {
    this.orderId = this.route.snapshot.paramMap.get('orderId');
    await this.orderService.order(this.orderId, false).then((res) => {
      console.log(res)
      this.order = res.order;
      this.amount = this.order.subtotals.reduce((amount, currentSubtotal) => {
        return amount + currentSubtotal.amount*100;
      }, 0)/100;
      this.notes = this.order.metadata.description;
      this.image = this.order.metadata.files[0];
      this.identification = this.order.identification;
      this.orderId = this.order._id;
      this.user = this.order.user;
      this.isMerchant = this.order.merchants.findIndex((merchant) => merchant._id === this.merchantId) !== -1;
    })
  }

  calcTotal(subtotals: any) {
    let sum = 0;

    subtotals.forEach(subtotal => {
        sum += subtotal.amount;
    });

    return sum;
  }

  goToUserSearch() {
    this.router.navigate(['/admin/user-search'], {
      queryParams: {
        returnTo: 'manual-order-management',
        manualOrderId: this.orderId
      }
    });
  }
  
  onFileSelected(event) {
    const file: File = event.target.files[0];
    const reader = new FileReader();
    this.imageFile = file;
    reader.readAsDataURL(file);
    reader.onload = (_event) => {
      this.image = reader.result;
    };
    this.updateOrder('image');
  }

  openInputDialog(type : 'amount' | 'notes' | 'identification'| 'receiver') {
    console.log('clicked')
    let title;
    if(type === 'amount') {
      title = 'Monto'
    } else if (type === 'notes') {
      title = 'Notas'
    } else if (type === 'identification') {
      title = 'Identificación'
    }
    let fieldData = {
      'amount': [{
        placeholder: this.amount ? this.amount : "$ escribe...",
        type: 'text',
        name: 'amount',
        validators: [Validators.pattern(/^\d+(\.\d{2})?$/)],
      }],
      'notes': [{
        placeholder: this.notes ? this.notes : "Escribe...",
        type: 'text',
        name: 'notes',
        validators: [Validators.pattern(/[\S]/)],
      }],
      'identification': [{
        placeholder: this.identification ? this.identification : "Escribe...",
        type: 'text',
        name: 'identification',
        validators: [Validators.pattern(/[\S]/)],
      }],
      'receiver': [{
        label: 'Quien recibirá lo comprado?',
        placeholder: "Escribe...",
        type: 'text',
        name: 'receiver',
        validators: [Validators.required],
      },{
        label: 'Opcional, añada el telefono de quien recibirá lo comprado',
        type: 'phone',
        name: 'receiverPhoneNumber',
      },{
        label:'Opcional, ¿Quién Envía?',
        placeholder: "Escribe...",
        type: 'text',
        name: 'sender',
      }],
    };
    const dialogRef = this.dialog.open(FormComponent, {
      width: '500px',
      data: {
        title: {
          text: title,
        },
        fields: fieldData[type],
        buttonsTexts: {
          cancel: 'Cancelar',
          accept: 'Ok',
        }
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result)
      if(result.value.amount) {
        this.amount = result.value.amount;
      }
      if(result.value.notes) {
        this.notes = result.value.notes;
      }
      if(result.value.identification) {
        this.identification = result.value.identification;
      }
      if(result.value.receiver) {
        this.receiver = result.value.receiver;
      }
      if(result.value.receiverPhoneNumber) {
        this.receiverPhoneNumber = result.value.receiverPhoneNumber.internationalNumber;
      }
      if(result.value.sender) {
        this.sender = result.value.sender;
      }
      this.updateOrder(type)
    });
    
  }

  returnEvent() {
    this.router.navigate(['/admin/order-progress']);
  }
  

  async updateOrder(type : 'amount' | 'notes' | 'identification' | 'user' | 'receiver' | 'image') {
    let input;
    if(type === 'amount') {
      input = {
        amount: Number(this.amount)
      }
    } else if (type === 'notes') {
      input = {
        metadata: {
          description: this.notes
        }
      }
    } else if (type === 'identification') {
      input = {
        identification: this.identification
      }
    } else if (type === 'user') {
      input = {
        user: this.userId
      }
    } else if(type === 'receiver') {
      input = {
        receiverData: {
          receiver: this.receiver,
        }
      }
      if(this.receiverPhoneNumber){
        input.receiverData.receiverPhoneNumber = this.receiverPhoneNumber;
      }
      if(this.sender) {
        input.receiverData.sender = this.sender;
      }
    } else if(type === 'image') {
      input = {
        metadata: {
          files: [this.imageFile]
        }
      }
    }
    console.log(input)
    await this.orderService.updateOrderExternal(input, this.orderId).then((res) => {
      console.log(res)
    })
    if(type === 'user' || type === 'receiver') {
      setTimeout(() => {
        this.orderData();
      }, 1000)
    }
  }

  async handleStatusUpdated(event) {
    const status = this.statusList.map(a => a.status);
    this.activeStatusIndex = status.findIndex(
      (status) => status === event
    );
    this.openNotificationDialog()
  }

  buildStatusList() {    
    const statusList: OrderStatusDeliveryType[] = ['in progress', 'delivered'];

    if(this.order.items[0]) {
      const location = this.order.items[0].deliveryLocation;
      if (location.street) {
        statusList.splice(1, 0, 'pending');
        statusList.splice(2, 0, 'shipped');
      } else statusList.splice(1, 0, 'pickup');
    } else {
      statusList.splice(1, 0, 'pending');
      statusList.splice(2, 0, 'shipped');
      statusList.splice(1, 0, 'pickup')
    } 

    for (const status of statusList) {
      this.statusList.push({
        name: this.orderService.orderDeliveryStatus(status),
        status: status
      });
    }
    const orderStatusDelivery = this.order.orderStatus;
    this.activeStatusIndex = statusList.findIndex(
      (status) => status === orderStatusDelivery
    );
    if(this.activeStatusIndex === -1) this.activeStatusIndex = 0;
  }

  openNotificationDialog() {
    const link = `${environment.uri}/ecommerce/manual-order-management/${this.order._id}`;
    if (this.order.user.email && this.order.user.phone) {
      this._bottomSheet.open(OptionsMenuComponent, {
        data: {
          title: `¿Notificar del nuevo Status a ${this.order.user.name || this.order.user.email || this.order.user.phone}?`,
          options: [
            {
              value: `Copia el enlace de la factura`,
              callback: () => {
                this.clipboard.copy(link);
              },
            },
            {
              value: `Comparte el enlace de la factura`,
              callback: () => {
                this.NgNavigatorShareService.share({
                  title: '',
                  url: link,
                });
              },
            },
            {
              value: `Compártecelo por Whatsapp`,
              callback: () => {
                this.goToWhatsapp()
              },
            },
            {
              value: `Compártecelo por correo electronico`,
              callback: () => {
                this.openEmail();
              },
            },
          ],
          styles: {
            fullScreen: true,
          },
        }
      });
    } else if(!this.order.user.email) {
      this._bottomSheet.open(OptionsMenuComponent, {
        data: {
          title: `¿Notificar del nuevo Status a ${this.order.user.name || this.order.user.email || this.order.user.phone}?`,
          options: [
            {
              value: `Copia el enlace de la factura`,
              callback: () => {
                this.clipboard.copy(link);
              },
            },
            {
              value: `Comparte el enlace de la factura`,
              callback: () => {
                this.NgNavigatorShareService.share({
                  title: '',
                  url: link,
                });
              },
            },
            {
              value: `Compártecelo por Whatsapp`,
              callback: () => {
                this.goToWhatsapp()
              },
            },
          ],
          styles: {
            fullScreen: true,
          },
        }
      });
    } else {
      this._bottomSheet.open(OptionsMenuComponent, {
        data: {
          title: `¿Notificar del nuevo Status a ${this.order.user.name || this.order.user.email || this.order.user.phone}?`,
          options: [
            {
              value: `Copia el enlace de la factura`,
              callback: () => {
                this.clipboard.copy(link);
              },
            },
            {
              value: `Comparte el enlace de la factura`,
              callback: () => {
                this.NgNavigatorShareService.share({
                  title: '',
                  url: link,
                });
              },
            },
            {
              value: `Compártecelo por correo electronico`,
              callback: () => {
                this.openEmail();
              },
            },
          ],
          styles: {
            fullScreen: true,
          },
        }
      });
    }
  }

  openEmail() {
    (document.querySelector('#mailLink') as HTMLElement).click();
  }

  goToWhatsapp() {
    let address = '';
    const location = this.order.items[0].deliveryLocation;
    if (location) {
      address = '\n\nDirección: ';
      if (location.street) {
        if (location.houseNumber) address += '#' + location.houseNumber + ', ';
        address += location.street + ', ';
        if (location.referencePoint) address += location.referencePoint + ', ';
        address += location.city + ', República Dominicana';
        if (location.note) address += ` (${location.note})`;
      } else {
        address += location.nickName;
      }
    }
    const fullLink = `${environment.uri}/ecommerce/order-detail/${this.order._id}`;
    const message = `*🐝 FACTURA ${formatID(
      this.order.dateId
    )}* \n\nLink de lo facturado por $${this.amount.toLocaleString(
      'es-MX'
    )}: ${fullLink}\n\n*Comprador*: ${
      this.order.user?.name ||
      this.order.user?.phone ||
      this.order.user?.email ||
      'Anónimo'
    }${address}\n\n`;
    this.messageLink = `https://api.whatsapp.com/send?phone=${
      this.order.user?.phone
    }&text=${encodeURIComponent(message)}`;
    window.location.href = this.messageLink;
  }

}
