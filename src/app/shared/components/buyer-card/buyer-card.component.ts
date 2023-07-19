import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { truncateString } from 'src/app/core/helpers/strings.helpers';
import { HeaderService } from 'src/app/core/services/header.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-buyer-card',
  templateUrl: './buyer-card.component.html',
  styleUrls: ['./buyer-card.component.scss'],
})
export class BuyerCardComponent implements OnInit {
  @Input() ID: string = '';
  @Input() index: number;
  @Input() redirectionParams: any;
  @Input() shadow: boolean = true;
  @Input() img: string = '';
  @Input() title: string;
  @Input() description: string;
  @Input() supplierProvidedData: {
    stock?: number;
    price?: number;
  } = null;
  @Input() leftAmount: number;
  @Input() rightAmount: number;
  @Input() cta: boolean;
  @Input() ctaActive: boolean = false;
  @Input() viewsCounter: boolean = false;
  @Input() views: number;
  @Output() ctaClicked = new EventEmitter();
  @Output() cardClicked = new EventEmitter();
  @Input() mode: 'normal' | 'fullWidth' = 'normal';
  @Input() skipRedirection: boolean = false;

  env: string = environment.assetsUrl;

  truncateString = truncateString;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private headerService: HeaderService
  ) {}

  ngOnInit(): void {}

  emitClick() {
    this.ctaClicked.emit(this.index);
  }

  clickHandler() {
    if (this.skipRedirection) return this.cardClicked.emit(true);

    if(!this.redirectionParams) return;

    this.headerService.flowRoute = this.router.url;
    localStorage.setItem('flowRoute', this.router.url);

    this.router.navigate(this.redirectionParams.link, {
      relativeTo: this.route,
      queryParams: this.redirectionParams.param,
    });
  }
}
