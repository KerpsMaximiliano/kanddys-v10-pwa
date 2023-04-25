import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { EmbeddedComponentWithId } from 'src/app/core/types/multistep-form';
import { Banner } from 'src/app/core/models/banner';

type CSSStyles = Record<string, string | number>;
@Component({
  selector: 'app-envelope-data',
  templateUrl: './envelope-data.component.html',
  styleUrls: ['./envelope-data.component.scss'],
})
export class EnvelopeDataComponent implements OnInit {
  @Input() biosBannerStyles: CSSStyles = {};
  name: string;
  description: string;
  image: SafeStyle;
  temporalDialogs: Array<EmbeddedComponentWithId> = [];
  type:string;
  @Input() banner: Banner;

  constructor(
    private _DomSanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.name = this.banner.name;
    this.description = this.banner.description;
    this.image = this._DomSanitizer.bypassSecurityTrustStyle(`url(
    ${this.banner.image})
    no-repeat center center / cover #fff`);
    this.type = this.banner.type;
  }
}
