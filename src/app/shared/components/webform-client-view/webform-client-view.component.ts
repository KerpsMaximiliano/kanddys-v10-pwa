import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { WebformsService } from 'src/app/core/services/webforms.service';

@Component({
  selector: 'app-webform-client-view',
  templateUrl: './webform-client-view.component.html',
  styleUrls: ['./webform-client-view.component.scss'],
})
export class WebformClientViewComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private webformsService: WebformsService,
    private itemsService: ItemsService,
    private headerService: HeaderService,
    private authService: AuthService,
    private merchantService: MerchantsService,
    private saleflowService: SaleFlowService
  ) {}

  ngOnInit(): void {}
}
