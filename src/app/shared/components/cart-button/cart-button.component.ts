import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-cart-button',
  templateUrl: './cart-button.component.html',
  styleUrls: ['./cart-button.component.scss']
})
export class CartButtonComponent implements OnInit {
  @Input() cartAmount: number;
  @Input() color: 'blue';
  @Input() filter: string;
  @Input() shopCartCallback: () => void;
  env: string = environment.assetsUrl;

  constructor() { }

  ngOnInit(): void {
  }

}
