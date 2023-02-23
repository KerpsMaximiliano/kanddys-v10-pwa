import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-collection-card',
  templateUrl: './collection-card.component.html',
  styleUrls: ['./collection-card.component.scss'],
})
export class CollectionCardComponent implements OnInit {
  @Input() imgURL: string;
  @Input() title: string;
  @Input() description: string;
  @Input() icon: string;
  @Input() imageFit: string;

  environment: string = environment.assetsUrl;

  constructor() {}

  ngOnInit(): void {}
}
