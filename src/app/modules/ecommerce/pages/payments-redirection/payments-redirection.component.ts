import { LocationStrategy } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemOrder } from 'src/app/core/models/order';
import { HeaderService } from 'src/app/core/services/header.service';
import { OrderService } from 'src/app/core/services/order.service';
import { PaymentLogsService } from 'src/app/core/services/paymentLogs.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-payments-redirection',
  templateUrl: './payments-redirection.component.html',
  styleUrls: ['./payments-redirection.component.scss'],
})
export class PaymentsRedirectionComponent implements OnInit {
  label: string = 'payments-redirection works!';
  azulOrderQueryParams: Record<string, string> = null;
  success: boolean = false;
  cancel: boolean = false;
  env: string = environment.assetsUrl;
  icon: string = 'check-circle.svg';
  orderId: string = null;
  order: ItemOrder = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentLogService: PaymentLogsService,
    private headerService: HeaderService,
    private location: LocationStrategy,
    private ordersService: OrderService
  ) {
    history.pushState(null, null, window.location.href);
    this.location.onPopState(() => {
      history.pushState(null, null, window.location.href);
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(async (queryParams) => {
      let { typeOfPayment, success, cancel, orderId, blockURL, ...rest } =
        queryParams;

      success = Boolean(success);
      cancel = Boolean(cancel);
      this.success = success === true && rest['IsoCode'] === '00';
      this.cancel = cancel;

      if (typeOfPayment === 'azul') {
        this.azulOrderQueryParams = rest;
      }

      if (!typeOfPayment) return this.router.navigate(['others/error-screen']);
      if (typeOfPayment === 'azul' && this.success) {
        this.label = 'El pago se completó';

        this.order = (
          await this.ordersService.order(rest['OrderNumber'])
        ).order;

        fetch(environment.api.url + '/azul/calculate-response-hash', {
          method: 'POST',
          headers: {
            'App-Key':
              'a6c6d9880190ad2c4d477b89b44107b82b3e4902f293fe710d9a904de283f8f7',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            MerchantID: this.headerService.saleflow.merchant._id,
            OrderNumber: rest['OrderNumber'],
            Amount: rest['Amount'],
            AuthorizationCode: rest['AuthorizationCode'],
            DateTime: rest['DateTime'],
            ResponseCode: rest['ResponseCode'],
            ISOCode: rest['IsoCode'],
            ResponseMessage: rest['ResponseMessage'],
            ErrorDescription: rest['ErrorDescription'],
            RRN: rest['RRN'],
          }),
        })
          .then((response) => response.text())
          .then((hash) => {
            console.log('hash del back', hash);
            console.log('hash del url', rest['AuthHash']);

            if (
              rest['IsoCode'] === '00' &&
              this.order.orderStatus !== 'completed'
            ) {
              //Cambiar igualdad

              if (hash !== rest['AuthHash'] && this.order.orderStatus !== 'paid') {
                this.paymentLogService.createPaymentLogAzul({
                  ammount: Number(rest['Amount']) / 100,
                  reason: 'payment',
                  paymentMethod: 'azul',
                  order: rest['OrderNumber'],
                  merchant: this.headerService.saleflow.merchant._id,
                  user: this.order.user._id,
                  metadata: {
                    AzulOrderId: rest['AzulOrderId'],
                    DateTime: rest['DateTime'],
                  },
                });
              }
            }
          });
      } else if (typeOfPayment === 'azul' && !this.success && !cancel) {
        this.icon = 'sadFace.svg';

        this.label =
          'El pago con azul no se pudo completar, razón: ' +
          rest['ErrorDescription'];
      } else if (typeOfPayment === 'azul' && cancel && orderId) {
        this.icon = 'sadFace.svg';
        this.orderId = orderId;

        this.label = 'El pago se canceló';
      } else if (typeOfPayment === 'stripe' && success) {
        const orderId = localStorage.getItem('stripe-payed-orderId');

        this.router.navigate(['ecommerce/order-info/' + orderId]);
      } else if (typeOfPayment === 'stripe' && !success) {
        const orderId = localStorage.getItem('stripe-payed-orderId');

        this.router.navigate(
          [
            'ecommerce/' +
              this.headerService.saleflow.merchant.slug +
              '/payments/' +
              orderId,
          ],
          {
            queryParams: {
              paymentFailed: true,
            },
          }
        );
      }
    });
  }

  redirectToOrderInfo() {
    this.router.navigate(
      ['ecommerce/order-info/' + this.azulOrderQueryParams['OrderNumber']],
      {
        queryParams: {
          notify: true,
        },
      }
    );
  }

  goBackToPaymentSelection() {
    const orderNumber = !this.cancel
      ? this.azulOrderQueryParams['OrderNumber']
      : this.orderId;

    this.router.navigate(
      [
        'ecommerce/' +
          this.headerService.saleflow.merchant.slug +
          '/payments/' +
          orderNumber,
      ],
      {
        queryParams: {
          paymentFailed: true,
        },
      }
    );
  }
}
