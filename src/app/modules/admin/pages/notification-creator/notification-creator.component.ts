import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-notification-creator',
  templateUrl: './notification-creator.component.html',
  styleUrls: ['./notification-creator.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NotificationCreatorComponent implements OnInit {

  env: string = environment.assetsUrl;

  redirectTo: string = null;

  notificationText: string = "";

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(async (queryParams) => {
      const { redirectTo } = queryParams;

      this.redirectTo = redirectTo;

      if (typeof redirectTo === 'undefined') this.redirectTo = null;
    });
  }

  save() {
    console.log("Saving...");
  }

  returnEvent() {
    let queryParams = {};
    if (this.redirectTo && this.redirectTo.includes('?')) {
      const url = this.redirectTo.split('?');
      this.redirectTo = url[0];
      const queryParamList = url[1].split('&');
      for (const param in queryParamList) {
        const keyValue = queryParamList[param].split('=');
        queryParams[keyValue[0]] = keyValue[1];
      }
    }
    this.router.navigate([this.redirectTo], {
      queryParams,
    });
  }

}
