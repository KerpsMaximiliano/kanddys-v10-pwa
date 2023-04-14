import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-gradient-footer',
  templateUrl: './gradient-footer.component.html',
  styleUrls: ['./gradient-footer.component.scss'],
})
export class GradientFooterComponent implements OnInit {
  @Input() commentButtonText: string;
  @Input() uploadIcon: boolean = false;
  @Input() heartIcon: boolean = false;
  @Output() btnClicked = new EventEmitter<'comment' | 'heart' | 'share'>();

  environment: string = environment.assetsUrl;

  constructor() {}

  ngOnInit(): void {}
}
