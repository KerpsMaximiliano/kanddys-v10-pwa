import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-router-options',
  templateUrl: './router-options.component.html',
  styleUrls: ['./router-options.component.scss'],
})
export class RouterOptionsComponent implements OnInit {
  constructor() {}

  @Input() title: string =
    '¿Cuáles son los principales desafíos que enfrenta su negocio en este momento?';

  @Input() options: Array<{
    text: string;
    link: string;
    file?: string;
    optionValue?: string;
  }> = [];

  ngOnInit(): void {}
}
