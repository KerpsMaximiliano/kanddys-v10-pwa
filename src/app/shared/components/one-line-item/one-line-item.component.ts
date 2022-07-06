import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-one-line-item',
  templateUrl: './one-line-item.component.html',
  styleUrls: ['./one-line-item.component.scss']
})
export class OneLineItemComponent implements OnInit {
  env = environment.assetsUrl;
  @Input() leftCTA: {
    text: string;
    color?: string;
    icon?: {
      src: string;
      alt?: string;
      filter?: string;
      size: {
        width: number;
        height: number;
      }
    };
    func?: () => void;
  };
  @Input() rightCTA: {
    text: string;
    color?: string;
    func?: () => void;
  };
  constructor() { }

  ngOnInit(): void {
  }

}
