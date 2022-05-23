import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-delivery-preview',
  templateUrl: './delivery-preview.component.html',
  styleUrls: ['./delivery-preview.component.scss']
})
export class DeliveryPreviewComponent implements OnInit {

  imageFolder: string;
  constructor() { 
      this.imageFolder = environment.assetsUrl;
  }

  ngOnInit(): void {
  }

}
