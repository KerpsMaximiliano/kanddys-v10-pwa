import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-header-info',
  templateUrl: './header-info.component.html',
  styleUrls: ['./header-info.component.scss']
})
export class HeaderInfoComponent implements OnInit {
  @Input() profileImage: string;
  @Input() starsAmount: string;
  @Input() title: string;
  @Input() description: string;
  @Input() description2: string;
  env: string = environment.assetsUrl;

  constructor() {}

  ngOnInit(): void {
  }

  openDialog() {
    //
  }

}
