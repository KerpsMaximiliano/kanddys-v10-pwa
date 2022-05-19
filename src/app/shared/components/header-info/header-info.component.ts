import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-header-info',
  templateUrl: './header-info.component.html',
  styleUrls: ['./header-info.component.scss']
})
export class HeaderInfoComponent implements OnInit {

    imageFolder: string;
    @Input() profileImage: string = '/Logo.svg';
    @Input() starsAmount: string = '14,458';
    @Input() headerName: string = 'TIENDA NAME';
    @Input() userName: string = 'José Amado';
    @Input() fechaId: string = 'FechaID';
    @Input() horaId: string = 'NombreID';

  constructor() {
    this.imageFolder = environment.assetsUrl;
   }

  ngOnInit(): void {
  }

}
