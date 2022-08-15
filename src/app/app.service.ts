import { EventEmitter, Injectable } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  NavigationEnd,
  Router,
} from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/internal/operators/filter';

// import { HeaderInfo } from './shared/sections/header/header.component';
// import { NavLink } from './shared/sections/navbar/navbar.component';

export type AppEventType =
  | 'auth'
  | 'reload'
  | 'refresh'
  | 'resource'
  | 'action'
  | 'singleAuth'
  | 'order-done'
  | 'deleted-item';

export interface AppEvent {
  type: AppEventType;
  data?: any;
}

@Injectable({ providedIn: 'root' })
export class AppService {
  block: boolean;
  navend: BehaviorSubject<ActivatedRouteSnapshot>;
  events: EventEmitter<AppEvent> = new EventEmitter();
  // nav: NavLink[] = [];
  // header: HeaderInfo = {};

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnAppInit() {
    this.initRoute();
  }

  initRoute() {
    this.navend = new BehaviorSubject(this.route.snapshot);
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        let route = this.route.snapshot;
        while (route.firstChild) route = route.firstChild;
        this.navend.next(route);
      });
  }
}