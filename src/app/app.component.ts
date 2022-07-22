import { Component, HostBinding, OnDestroy, OnInit, AfterViewChecked } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import * as ons from 'onsenui';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router'
import { AppService } from './app.service';
import { DialogService } from './libs/dialog/services/dialog.service';
import { filter } from 'rxjs/operators';
import { IpusersService } from './core/services/ipusers.service';

@Component({
  selector: 'app-root',
  template: `
    <main>
      <router-outlet></router-outlet>
    </main>
    <!-- <app-scope-menu #scopeMenu></app-scope-menu> -->
  `,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy, OnInit {
  @HostBinding('class.content-fullscreen')
  isfullscreen = false;
  navsub: Subscription;
  loader: boolean = false;
  constructor(private swUpdate: SwUpdate, public service: AppService, private router: Router, private dialog: DialogService, private ipuser: IpusersService) {
    this.navsub = this.service.navend.subscribe((route) => {
      this.isfullscreen = route?.data?.fullscreen;
    });

    // SW
    if (this.swUpdate?.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        // localStorage.clear();
        ons.notification.alert(`Reload to update.`, {
          cancelable: false,
          title: 'New version available!',
          buttonLabel: 'Reload',
          callback: () => this.reload(),
        });
      });
    }
  }

  ngOnInit() {
    localStorage.setItem('user-data', JSON.stringify({
      ip: '',
      city: '',
      country: ''
    }));
    this.getIp();
  }

  async getIp() {
    let request;
    try {
      request = await fetch('https://api.ipdata.co/?api-key=b193221ea697d98a5232c0a38625a79259f1b27f062a09b23e6ecc82', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      let response = await request.json();

      let data = await this.ipuser.IpUserbyIp(response.ip);

      if (data) {
        localStorage.setItem('user-data', JSON.stringify(data.IpUserbyIp));
      } else {
        let data = await this.ipuser.createIpUser({ ip: response.ip, country: response.country_name, city: response.city })
        localStorage.setItem('user-data', JSON.stringify(data.createIpUser));
      }
    } catch (error) {
      console.log(request);
      console.log(error);
    }
  }

  ngAfterViewChecked(): void {
  }
  reload() {
    window.location.reload();
  }


  ngOnDestroy(): void {
    this.navsub?.unsubscribe();
    delete this.navsub;
  }
}