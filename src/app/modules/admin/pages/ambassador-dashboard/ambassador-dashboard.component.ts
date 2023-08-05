import { Component } from '@angular/core';

@Component({
  selector: 'app-ambassador-dashboard',
  templateUrl: './ambassador-dashboard.component.html',
  styleUrls: ['./ambassador-dashboard.component.scss'],
})
export class AmbassadorDashboardComponent {
  heartIcon = '../../../../../assets/';
  heartIconFilled = '../../../../../assets/';
  isHeartIconClicked = false;

  constructor() {}

  setHeartIcon(): string {
    return '';
  }
}
