import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderService } from 'src/app/core/services/header.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {

  env: string = environment.assetsUrl;

  constructor(
    public headerService: HeaderService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  goToStore() {
    // this.router.navigate([``])
  }

}
