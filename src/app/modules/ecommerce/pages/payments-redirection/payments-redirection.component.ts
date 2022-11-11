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
      const { typeOfPayment } = queryParams;

      if (!typeOfPayment) return this.router.navigate(['others/error-screen']);

      if (typeOfPayment === 'stripe') {
        const orderId = localStorage.getItem('stripe-payed-orderId');

        this.router.navigate(['ecommerce/order-info/' + orderId]);
      }
    });
  }
}
