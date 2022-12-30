import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-factura-preview',
  templateUrl: './factura-preview.component.html',
  styleUrls: ['./factura-preview.component.scss'],
})
export class FacturaPreviewComponent implements OnInit {
  fullImage: boolean = false;
  gradient: boolean = true;

  mode: string = 'gradientImg';
  constructor() {}

  ngOnInit(): void {}
}
