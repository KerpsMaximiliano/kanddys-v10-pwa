import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-envelope-data',
  templateUrl: './envelope-data.component.html',
  styleUrls: ['./envelope-data.component.scss']
})
export class EnvelopeDataComponent implements OnInit {
  @Input() title:string = 'Contenido del Sobre';
  constructor() { }

  ngOnInit(): void {
  }

}
