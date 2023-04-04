import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-router-options',
  templateUrl: './router-options.component.html',
  styleUrls: ['./router-options.component.scss'],
})
export class RouterOptionsComponent implements OnInit {
  constructor() {}

  title: string =
    '¿Cuáles son los principales desafíos que enfrenta su negocio en este momento?';

  @Input() options = [
    {
      text: '14 Baja rentabilidad',
      link: '/',
    },
    {
      text: '1,457 Competencia Desleal',
      link: '/',
    },
    {
      text: '255 Escasez de mano de obra',
      link: '/',
    },
    {
      text: '255 Costos de insumos y materia',
      link: '/',
    },
  ];

  ngOnInit(): void {}
}
