import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-payments-redirection',
  templateUrl: './payments-redirection.component.html',
  styleUrls: ['./payments-redirection.component.scss'],
})
export class PaymentsRedirectionComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams) => {
      let { typeOfPayment, success } = queryParams;
      success = Boolean(success);

      if (!typeOfPayment) return this.router.navigate(['others/error-screen']);

      if (typeOfPayment === 'stripe' && success) {
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
}
