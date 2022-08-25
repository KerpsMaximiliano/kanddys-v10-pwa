import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment';

interface Text {
    text: string;
    color?: string;
    fontFamily?: string;
    fontSize?: string;
    pointer?: boolean;
    callback?: () => void;
}

interface Icon{
    src: string;
    alt?: string;
    color?: string;
    width?: number;
    height?: number;
    callback?: () => void;
}

interface testTag{
    name: string;
    icon?: Icon;
}

@Component({
  selector: 'app-item-reservation',
  templateUrl: './item-reservation.component.html',
  styleUrls: ['./item-reservation.component.scss']
})
export class ItemReservationComponent implements OnInit {

    @Input() headline: Text;
    @Input() subheadlines: Text[];
    @Input() rightSubHeadline: Text;
    @Input() rightActive: boolean;
    @Input() icon: Array<Icon>;
    @Input() tagActive: boolean;
    @Input() tag: {
        title: Text;
        tags: testTag[];
        icon?: Icon;
    };
    @Input() content: {
        title?: Text;
        images?: Array<string>
    };
    @Input() ctaText: {
        text: Text;
        arrow?: boolean;
        showEntry?: boolean;
    };
    env: string = environment.assetsUrl;
  constructor() { }

  ngOnInit(): void {
  }

}
