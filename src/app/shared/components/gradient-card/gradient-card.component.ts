import { Component, Input, OnInit } from '@angular/core';
import { Tag } from 'src/app/core/models/tags';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-gradient-card',
  templateUrl: './gradient-card.component.html',
  styleUrls: ['./gradient-card.component.scss'],
})
export class GradientCardComponent implements OnInit {
  env = environment.assetsUrl;
  @Input() tag: Tag;

  constructor() {}

  ngOnInit(): void {}
}
