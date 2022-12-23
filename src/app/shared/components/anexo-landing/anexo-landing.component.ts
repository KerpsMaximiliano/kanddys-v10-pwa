import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-anexo-landing',
  templateUrl: './anexo-landing.component.html',
  styleUrls: ['./anexo-landing.component.scss'],
})
export class AnexoLandingComponent implements OnInit {
  @Input('background') background: string = '#f24940';
  @Input('footerBackground') footerBackground: string = '#272727';
  @Input('footerTextColor') footerTextColor: string = '#ffffff';
  @Input('headlines') headlines: string[] = ['WhatsApp en esteroides'];
  @Input('headlineColor') headlineColor: string = '#ffffff';
  @Input('subHeadlines') subHeadlines: string[] = [
    'Seguimiento',
    'automatizados',
  ];
  @Input('subHeadlineColor') subHeadlineColor: string = '#ffffff';
  @Input('image') image: any =
    'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/heart.png';
  @Input('image2') image2: any =
    'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/heart.png';
  @Input('footerTexts') footerTexts: string[] = [
    'Cada facturas con las',
    'repsuestas que necesitas',
    'del comprador.',
  ];
  @Input('btnText') btnText: string = 'Empezar mi base de datos';
  @Input('btnColor') btnColor: string = '#2874ad';
  @Input('btnBackground') btnBackground: string = '#ffffff';
  @Output('btnOnClick') btnOnClick: EventEmitter<any> = new EventEmitter();
  constructor(private _DomSanitizer: DomSanitizer) {}

  ngOnInit(): void {
    const bg = '#e9e371';
    this.image = this._DomSanitizer.bypassSecurityTrustStyle(
      `url(${this.image}) no-repeat center center / contain ${bg}`
    );
    this.image2 = this._DomSanitizer.bypassSecurityTrustStyle(
      `url(${this.image2}) no-repeat center center / contain ${bg}`
    );
  }

  onClick(): void {
    this.btnOnClick.emit();
  }
}
