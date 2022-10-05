import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Merchant } from 'src/app/core/models/merchant';
import { ItemOrder } from 'src/app/core/models/order';
import { Bank } from 'src/app/core/models/wallet';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { environment } from 'src/environments/environment';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { SingleActionDialogComponent } from 'src/app/shared/dialogs/single-action-dialog/single-action-dialog.component';
import { formatID } from 'src/app/core/helpers/strings.helpers';
import { LocationStrategy } from '@angular/common';
import { Post } from 'src/app/core/models/post';
import { PostsService } from 'src/app/core/services/posts.service';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss'],
})
export class PaymentsComponent implements OnInit {
  status: 'idle' | 'loading' | 'complete' | 'error' = 'idle';
  environment = environment;
  selectedBank: Bank;
  selectedOption: number;
  image: File;
  paymentAmount: number;
  banks: Bank[];
  order: ItemOrder;
  merchant: Merchant;
  whatsappLink: string;
  disableButton: boolean;
  depositAmount: number;
  post: Post;

  constructor(
    private walletService: WalletService,
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private postsService: PostsService,
    private merchantService: MerchantsService,
    private headerService: HeaderService,
    private dialogService: DialogService,
    private location: LocationStrategy
  ) {
    history.pushState(null, null, window.location.href);
    this.location.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });
  }

  async ngOnInit(): Promise<void> {
    this.status = 'loading';
    const orderId = this.route.snapshot.paramMap.get('id');
    if (!orderId) {
      const saleflowId = this.route.snapshot.paramMap.get('saleflowId');
      if (!saleflowId) {
        this.router.navigate([`/home`]);
        return;
      }
      await this.headerService.fetchSaleflow(saleflowId);
    } else {
      const { orderStatus } = await this.orderService.getOrderStatus(orderId);
      if (orderStatus === 'draft')
        this.order = (await this.orderService.preOrder(orderId)).order;
      else if (orderStatus === 'in progress')
        this.order = (await this.orderService.order(orderId)).order;
      else {
        this.orderCompleted(orderId);
        return;
      }
      if (!this.headerService.saleflow)
        this.headerService.saleflow = this.headerService.getSaleflow();
      if (
        !this.headerService.saleflow?.module?.paymentMethod?.paymentModule?._id
      ) {
        this.orderCompleted();
        return;
      }
      this.paymentAmount = this.order.subtotals.reduce(
        (a, b) => a + b.amount,
        0
      );
      if (this.order.items[0].customizer)
        this.paymentAmount = this.paymentAmount * 1.18;
      this.merchant = await this.merchantService.merchant(
        this.order.merchants?.[0]?._id
      );
      if (this.order.items[0].post) {
        this.post = (
          await this.postsService.getPost(this.order.items[0].post._id)
        ).post;
      }
    }
    this.banks = (
      await this.walletService.exchangeData(
        this.headerService.saleflow?.module?.paymentMethod?.paymentModule?._id
      )
    )?.ExchangeData?.bank;
    this.status = 'complete';
  }

  onFileInput(file: File | { image: File; index: number }) {
    if (!('index' in file)) this.image = file;
  }

  selectBank(value: number) {
    this.selectedOption = value;
    this.selectedBank = this.banks[value];
  }

  removeBank() {
    this.selectedOption = null;
    this.selectedBank = null;
    this.image = null;
  }

  orderCompleted(id?: string) {
    this.router.navigate([`ecommerce/order-info/${id || this.order._id}`], {
      replaceUrl: true,
    });
  }

  async submitPayment() {
    this.disableButton = true;
    lockUI();
    if (this.order) {
      if (this.order.orderStatus === 'draft') {
        this.router.navigate([`/auth/login`], {
          queryParams: {
            orderId: this.order._id,
            auth: 'payment',
          },
          state: {
            image: this.image,
          },
        });
        return;
      }
      await this.orderService.payOrder(
        {
          image: this.image,
          platform: 'bank-transfer',
          transactionCode: '',
        },
        this.order.user._id,
        'bank-transfer',
        this.order._id
      );
      unlockUI();
      this.singleAction();
      return;
    }
    const payment = await this.orderService.createPartialOCR(
      this.depositAmount,
      this.headerService.saleflow.merchant._id,
      this.image,
      this.headerService.user?._id
    );
    const fullLink = `${environment.uri}/ecommerce/order-info/${this.order._id}`;
    const message = `COMPRADOR: ${
      this.headerService.user
        ? this.headerService.user.name || 'Sin nombre'
        : 'Anónimo'
    }\nARTICULO${
      this.order.items.length > 1 ? 'S: \n' : ': '
    }${this.order.items.map(
      (itemSubOrder) =>
        (this.order.items.length > 1 ? '- ' : '') +
        (itemSubOrder.item.name ||
          `${environment.uri}/ecommerce/item-detail/${this.headerService.saleflow._id}/${itemSubOrder.item._id}`) +
        '\n'
    )}PAGO: $${this.paymentAmount.toLocaleString('es-MX')}FACTURA ${formatID(
      this.order.dateId
    )}: ${fullLink}, ${payment.image}`.replace(/,/g, '');
    this.whatsappLink = `https://wa.me/${
      this.headerService.saleflow.merchant.owner.phone
    }?text=${encodeURIComponent(message)}`;
    this.dialogService.open(SingleActionDialogComponent, {
      type: 'fullscreen-translucent',
      props: {
        topButton: false,
        title: 'Factura creada exitosamente',
        buttonText: `Confirmar al WhatsApp de ${this.merchant.name}`,
        mainText: `Al “confirmar” se abrirá tu WhatsApp con el resumen facturado a ${this.merchant.name}.`,
        mainButton: () => {
          this.orderCompleted();
          window.open(this.whatsappLink, '_blank');
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
      notCancellable: true,
    });
  }

  async authOrder() {
    return (
      await this.orderService.authOrder(
        this.headerService.orderId,
        this.headerService.user._id
      )
    ).authOrder;
  }

  singleAction() {
    const fullLink = `${environment.uri}/ecommerce/order-info/${this.order._id}`;
    let address = '';
    const location = this.order.items[0].deliveryLocation;
    if (location.street) {
      if (location.houseNumber) address += '#' + location.houseNumber + ', ';
      address += location.street + ', ';
      if (location.referencePoint) address += location.referencePoint + ', ';
      address += location.city + ', República Dominicana';
      if (location.note) address += ` (nota: ${location.note})`;
    } else {
      address = location.nickName;
    }
    let giftMessage = '';
    if (this.post?.from) giftMessage += 'De: ' + this.post.from + '\n';
    if (this.post?.targets?.[0]?.name)
      giftMessage += 'Para: ' + this.post.targets[0].name + '\n';
    if (this.post?.message) giftMessage += 'Mensaje: ' + this.post.message;
    const message = `*FACTURA ${formatID(
      this.order.dateId
    )} Y ARTÍCULOS COMPRADOS POR MONTO $${this.paymentAmount.toLocaleString(
      'es-MX'
    )}: ${fullLink}*\n\nComprador: ${
      this.headerService.user?.name ||
      this.headerService.user?.phone ||
      this.headerService.user?.email ||
      'Anónimo'
    }\n\nDirección: ${address}\n\n${
      giftMessage ? 'Mensaje en la tarjetita de regalo: ' + giftMessage : ''
    }`;
    this.whatsappLink = `https://wa.me/${
      this.merchant.owner.phone
    }?text=${encodeURIComponent(message)}`;
    this.dialogService.open(SingleActionDialogComponent, {
      type: 'fullscreen-translucent',
      props: {
        topButton: false,
        title: 'Factura creada exitosamente',
        buttonText: `Confirmar al WhatsApp de ${this.merchant.name}`,
        mainText: `Al “confirmar” se abrirá tu WhatsApp con el resumen facturado a ${this.merchant.name}.`,
        mainButton: () => {
          this.orderCompleted();
          window.open(this.whatsappLink, '_blank');
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
      notCancellable: true,
    });
  }
}
