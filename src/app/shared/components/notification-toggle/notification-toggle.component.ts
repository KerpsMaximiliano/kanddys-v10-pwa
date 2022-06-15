import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-notification-toggle',
  templateUrl: './notification-toggle.component.html',
  styleUrls: ['./notification-toggle.component.scss']
})
export class NotificationToggleComponent implements OnInit {
  env: string = environment.assetsUrl;
  @Input() active: boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
