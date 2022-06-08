import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderService } from 'src/app/core/services/header.service';

@Component({
  selector: 'app-customizer-redirect',
  templateUrl: './customizer-redirect.component.html',
  styleUrls: ['./customizer-redirect.component.scss']
})
export class CustomizerRedirectComponent implements OnInit {

  constructor(
    private router: Router,
    private header: HeaderService,
  ) { }

  ngOnInit(): void {
    this.redirect();
  }

  redirect() {
    if(this.header.customizerData) this.header.customizerData.willModify = true;
    this.router.navigate([`posts/post-customizer/${this.header.order.products[0].item}/${this.header.items[0].customizerId}`])
  }

}
