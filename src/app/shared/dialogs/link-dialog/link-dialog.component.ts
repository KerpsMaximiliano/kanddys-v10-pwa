import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-link-dialog',
  templateUrl: './link-dialog.component.html',
  styleUrls: ['./link-dialog.component.scss'],
})
export class LinkDialogComponent implements OnInit {
  env: string = environment.assetsUrl;
  linksCategory: Array<any> = [
    {
      title: '',
      links: [
        { linkName: 'Crear un nuevo artículo', linkDir: '' },
        { linkName: 'Crea un nuevo collection', linkDir: '' },
        { linkName: 'Cambiar el orden de la biblioteca', linkDir: '' },
        { linkName: 'Mostrar exhibidos', linkDir: '' },
        { linkName: 'Mostrar invisible', linkDir: '' },
        { linkName: 'Tienda activa. No estoy de vacaciones', linkDir: '' },
      ],
    },
    {
      title: 'Perspectiva del Comprador',
      links: [
        { linkName: 'Comparte el enlace', linkDir: '' },
        { linkName: 'Mira la tienda', linkDir: '' },
        { linkName: 'Descarga el QR', linkDir: '' },
      ],
    },
  ];

  constructor() {}

  ngOnInit(): void {}
}
