import { LocationStrategy } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemOrder } from 'src/app/core/models/order';
import { HeaderService } from 'src/app/core/services/header.service';
import { OrderService } from 'src/app/core/services/order.service';
import { PaymentLogsService } from 'src/app/core/services/paymentLogs.service';
import { environment } from 'src/environments/environment';
import * as forge from 'node-forge';

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
        this.azulOrderQueryParams['RealOrderID'] = orderId;
      }

      if (!typeOfPayment) return this.router.navigate(['others/error-screen']);
      if (typeOfPayment === 'azul' && this.success) {
        this.label = 'El pago se completó';

        this.order = (
          await this.ordersService.order(orderId)
        ).order;

        if (
          rest['IsoCode'] === '00' &&
          this.order.orderStatus !== 'completed' && this.order.orderStatus !== 'paid'
        ) {
          const response = await fetch('assets/ap.pem');
          const textResponse = await response.text();

          const publicKeyParsed =
            forge.pki.publicKeyFromPem(textResponse);

          const data = rest['CardNumber'];
          const brand = this.detectCreditCardBrand(data.replaceAll('*', '0'));
          const last4Digits = data.slice(-4);
          
          const plaintextBytes = forge.util.encodeUtf8(last4Digits);
          const encrypted = publicKeyParsed.encrypt(
            plaintextBytes,
            'RSA-OAEP'
          );
          const encryptedBase64 = forge.util.encode64(encrypted);

          const brandPlaintextBytes = forge.util.encodeUtf8(brand);
          const encryptedBrand = publicKeyParsed.encrypt(
            brandPlaintextBytes,
            'RSA-OAEP'
          );
          const encryptedBrandBase64 = forge.util.encode64(encryptedBrand);

          this.paymentLogService.createPaymentLogAzul({
            ammount: Number(rest['Amount']) / 100,
            reason: 'payment',
            paymentMethod: 'azul',
            order: this.order._id,
            merchant: this.headerService.saleflow.merchant._id,
            user: this.order.user._id,
            metadata: {
              AzulOrderId: rest['AzulOrderId'],
              DateTime: rest['DateTime'],
              cardNumber: encryptedBase64,
              cardBrand: encryptedBrandBase64
            },
          }, JSON.stringify({
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
          }), rest['AuthHash']);
        }
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
      ['ecommerce/order-info/' + this.azulOrderQueryParams['RealOrderID']],
      {
        queryParams: {
          notify: true,
        },
      }
    );
  }

  goBackToPaymentSelection() {
    const orderNumber = !this.cancel
      ? this.azulOrderQueryParams['RealOrderID']
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

  detectCreditCardBrand(creditCardNumber) {
    // Remove any non-digit characters from the input string
    const cleanedNumber = creditCardNumber.replace(/\D/g, '');
  
    // Define regular expressions for each supported credit card brand
    const visaRegex = /^4[0-9]{12}(?:[0-9]{3})?$/;
    const mastercardRegex = /^5[1-5][0-9]{14}$/;
    const amexRegex = /^3[47][0-9]{13}$/;
    const discoverRegex = /^6(?:011|5[0-9]{2})[0-9]{12}$/;
    const dinersRegex = /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/;
  
    // Check the cleaned number against each regular expression to determine the brand
    if (visaRegex.test(cleanedNumber)) {
      return 'Visa';
    } else if (mastercardRegex.test(cleanedNumber)) {
      return 'Mastercard';
    } else if (amexRegex.test(cleanedNumber)) {
      return 'American Express';
    } else if (discoverRegex.test(cleanedNumber)) {
      return 'Discover';
    } else if (dinersRegex.test(cleanedNumber)) {
      return 'Diners Club';
    } else {
      return 'Unknown';
    }
  }
}
