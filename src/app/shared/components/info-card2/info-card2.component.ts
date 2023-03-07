import { Component, Input, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-info-card2',
  templateUrl: './info-card2.component.html',
  styleUrls: ['./info-card2.component.scss'],
})
export class InfoCard2Component implements OnInit {
  env: string = environment.assetsUrl;

  @Input() cards = [];

  constructor() {}

  ngOnInit(): void {}
}
