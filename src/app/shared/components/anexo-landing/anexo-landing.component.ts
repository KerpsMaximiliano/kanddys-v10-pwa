import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-anexo-landing',
  templateUrl: './anexo-landing.component.html',
  styleUrls: ['./anexo-landing.component.scss'],
})
export class AnexoLandingComponent implements OnInit {
  @Input('contentStyles') contentStyles: Record<string, string | number> = {
    background: '#f24940',
    minHeight: '348px'
  };
  @Input('textContainer') textContainer: Record<string, string | number> = {}
  @Input('footerBackground') footerBackground: string = '#272727';
  @Input('headlines') headlines: string[] = ['Asignas el Gol con el'];
  @Input('headlineStyles') headlineStyles: Record<string, string | number> = {
    fontFamily: 'SfProLight',
    fontSize: '16px',
    color: '#ffffff'
  };
  @Input('subHeadlines') subHeadlines: string[] = [
    'Programa de Fidelidad',
  ];
  @Input('subHeadlineStyles') subHeadlineStyles: Record<string, string | number> = {
    fontFamily: '"SfProBold"',
    fontSize: '16px',
    marginTop: '0px',
    color: '#fff'
  };
  @Input('image') image: any = 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/heart.png';
  @Input('image2') image2: any = 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/heart.png';
  @Input() imageStyles: Record<string, string | number> = null;
  @Input() image2Styles: Record<string, string | number> = null;
  @Input() footerStyles: Record<string, string | number> = {
    position: 'relative',
    top: '-20px',
    borderRadius: '10px',
    width: '190px',
    background: '#f6f6f6',
    margin: 'auto',
    color: '#272727',
    fontFamily: 'SfProLight',
    fontSize: '15px'
  };
  
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
