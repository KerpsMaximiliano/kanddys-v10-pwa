import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {

   payment: number = 1450.00;
  constructor() { }

  ngOnInit(): void {
  }

  placeholder(){
   console.log('placeholder')
  }
}
