import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-gradient-card',
  templateUrl: './gradient-card.component.html',
  styleUrls: ['./gradient-card.component.scss'],
})
export class GradientCardComponent implements OnInit {
  @Input() cards = [
    { name: 'CategoriaID' },
    { name: 'CategoriaID' },
    { name: 'CategoriaID' },
    { name: 'CategoriaID' },
    { name: 'CategoriaID' },
    { name: 'CategoriaID' },
    { name: 'CategoriaID' },
    { name: 'CategoriaID' },
    { name: 'CategoriaID' },
    { name: 'CategoriaID' },
    { name: 'CategoriaID' },
    { name: 'CategoriaID' },
  ];

  constructor() {}

  ngOnInit(): void {}
}
