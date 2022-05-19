import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-header-info',
  templateUrl: './header-info.component.html',
  styleUrls: ['./header-info.component.scss']
})
export class HeaderInfoComponent implements OnInit {
  @Input() profileImage: string = '/Logo.svg';
  @Input() starsAmount: string = '14,458';
  @Input() title: string = 'TIENDA NAME';
  @Input() description: string = 'José Amado';
  @Input() description2: string = 'FechaID HoraID';
  env: string = environment.assetsUrl;

  constructor() {}

  ngOnInit(): void {
  }

  openDialog() {
    //
  }

}
