import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { SafeStyle } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

type CSSStyles = Record<string, string | number>;
@Component({
  selector: 'app-bios-banner',
  templateUrl: './bios-banner.component.html',
  styleUrls: ['./bios-banner.component.scss'],
})
export class BiosBannerComponent implements OnInit {

  @Input() image: SafeStyle = '';
  @Input() biosBannerStyles: CSSStyles = {};
  @Input() username: string = 'User ID';

  @Input() text: string = 'Servicios de Asesoría Fiscal • 15 años de experiencia como Gerente Local y Proceso.. ';
  
  constructor(
    private _ActivatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
  }
}
