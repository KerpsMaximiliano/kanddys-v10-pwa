import { Component, OnInit, Input } from '@angular/core';
import { Merchant } from 'src/app/core/models/merchant';
import { HeaderService } from 'src/app/core/services/header.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-merchant-contact',
  templateUrl: './merchant-contact.component.html',
  styleUrls: ['./merchant-contact.component.scss'],
})
export class MerchantContactComponent implements OnInit {
  URI: string = environment.uri;
  env: string = environment.assetsUrl;
  merchantData: Merchant;
  regex = /\D/g;
  @Input() imgBanner: string

  constructor(public headerService: HeaderService) {}

  ngOnInit(): void {}
}