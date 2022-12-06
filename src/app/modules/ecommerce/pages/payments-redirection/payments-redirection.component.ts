import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderService } from 'src/app/core/services/header.service';
import { PaymentLogsService } from 'src/app/core/services/paymentLogs.service';

@Component({
  selector: 'app-payments-redirection',
  templateUrl: './payments-redirection.component.html',
  styleUrls: ['./payments-redirection.component.scss'],
})
export class PaymentsRedirectionComponent implements OnInit {
  label: string = 'payments-redirection works!';
  azulOrderQueryParams: Record<string, string> = null;
  success: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentLogService: PaymentLogsService,
    private headerService: HeaderService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams) => {
      let { typeOfPayment, success, cancel, ...rest } = queryParams;
      success = Boolean(success);
      this.success = success;

      if (!typeOfPayment) return this.router.navigate(['others/error-screen']);
      if (typeOfPayment === 'azul' && success) {
        this.label =
          'El pago con azul se completó, estos son los datos: ' +
          JSON.stringify(rest, null, 4);

        this.azulOrderQueryParams = rest;

        fetch('http://localhost:3500/azul/calculate-response-hash', {
          method: 'POST',
          headers: {
            'App-Key':
              'a6c6d9880190ad2c4d477b89b44107b82b3e4902f293fe710d9a904de283f8f7',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
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

            if (rest['IsoCode'] === '00') {
              //Cambiar igualdad

              if (hash !== rest['AuthHash']) {
                this.paymentLogService.createPaymentLogAzul({
                  ammount: Number(rest['Amount']) / 100,
                  reason: 'payment',
                  paymentMethod: 'azul',
                  order: rest['OrderNumber'],
                  merchant: this.headerService.myMerchants[0]._id,
                  metadata: {
                    AzulOrderId: rest['AzulOrderId'],
                    DateTime: rest['DateTime'],
                  },
                });
              }
            }
          });
      } else if (typeOfPayment === 'azul' && !success) {
        this.label =
          'El pago con azul no se pudo completar, estos son los datos: ' +
          JSON.stringify(rest, null, 4);
      } else if (typeOfPayment === 'azul' && cancel) {
        this.label =
          'El pago con azul se cancelo, estos son los datos: ' +
          JSON.stringify(rest);
      } else if (typeOfPayment === 'stripe' && success) {
        const orderId = localStorage.getItem('stripe-payed-orderId');

        this.router.navigate(['ecommerce/order-info/' + orderId]);
      } else if (typeOfPayment === 'stripe' && !success) {
        const orderId = localStorage.getItem('stripe-payed-orderId');

        this.router.navigate(['payments/637289ea18c8811f24ae983f/' + orderId], {
          queryParams: {
            paymentFailed: true,
          },
        });
      }
    });
  }

  redirectToOrderInfo() {
    this.router.navigate([
      'ecommerce/order-info/' + this.azulOrderQueryParams['OrderNumber'],
    ]);
  }
}
