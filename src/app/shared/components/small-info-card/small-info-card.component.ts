import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-small-info-card',
  templateUrl: './small-info-card.component.html',
  styleUrls: ['./small-info-card.component.scss'],
})
export class SmallInfoCardComponent implements OnInit {
  @Input() image: string;
  @Input() title: string;
  @Input() subtitle: string;
  @Input() topInfo: string;
  @Input() bottomInfo: string;

  constructor() {}

  ngOnInit(): void {}
}
