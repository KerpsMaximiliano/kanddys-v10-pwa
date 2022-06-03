import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-store-share',
  templateUrl: './store-share.component.html',
  styleUrls: ['./store-share.component.scss']
})
export class StoreShareComponent implements OnInit {

    env: string = environment.assetsUrl;
  constructor() { }

  ngOnInit(): void {
  }

}
