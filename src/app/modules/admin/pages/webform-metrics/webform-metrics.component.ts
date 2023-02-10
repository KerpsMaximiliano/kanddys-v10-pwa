import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-webform-metrics',
  templateUrl: './webform-metrics.component.html',
  styleUrls: ['./webform-metrics.component.scss'],
})
export class WebformMetricsComponent implements OnInit {
  env: string = environment.assetsUrl;

  constructor() {}

  ngOnInit(): void {}
}
