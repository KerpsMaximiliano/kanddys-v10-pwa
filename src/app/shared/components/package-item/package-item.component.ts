import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-package-item',
  templateUrl: './package-item.component.html',
  styleUrls: ['./package-item.component.scss']
})
export class PackageItemComponent implements OnInit {

    @Input() package: any ={
        name: '', //Nombre del paquete
        subtitle: '', //Info extra(si tiene)
        price: '', //Precio del paquete
        content: ['', ''] //contenido del paquete
    };

    @Output() action = new EventEmitter()

  constructor() { }

  ngOnInit(): void {
  }

  actionator(event){
      this.action.emit(event)
  }
}
