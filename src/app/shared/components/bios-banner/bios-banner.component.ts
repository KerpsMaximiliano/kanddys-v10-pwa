import { Component, Input, OnInit } from '@angular/core';

type CSSStyles = Record<string, string | number>;
@Component({
  selector: 'app-bios-banner',
  templateUrl: './bios-banner.component.html',
  styleUrls: ['./bios-banner.component.scss'],
})
export class BiosBannerComponent implements OnInit {

  @Input() biosBannerStyles: CSSStyles = {};
  @Input() username: string = 'User ID';

  text: string = 'Servicios de Asesoría Fiscal • 15 años de experiencia como Gerente Local y Proceso.. ';
  
  constructor() {}

  ngOnInit(): void {}
}
