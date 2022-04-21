import { AppEvent } from './../../../app.service';
import { Component, EventEmitter, HostBinding, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { UiService } from 'src/app/core/services/ui.service';

import { AuthService } from '../../../core/services/auth.service';
import { Action } from './../../../core/types/general.types';
import { environment } from 'src/environments/environment';

export interface HeaderInfo {
  image?: string;
  title?: string;
  backBtn?: boolean;
  imageCallback?: () => void;
  actions?: Action<AppEvent>[];
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Output() openMenu: EventEmitter<void> = new EventEmitter();

  constructor(
    private router: Router,
    public auth: AuthService,
    public app: AppService,
    public ui: UiService
  ) {}

  get image() {
    if (this.auth?.session)
      return this.app?.header?.image || `${environment.assetsUrl}/user-default.png`;
    return 'assets/icons/icon-128x128.png';
  }

  @HostBinding('class')
  get classes() {
    return this.app?.header?.backBtn ? 'with-back' : '';
  }

  visibleAction(action: Action) {
    return action?.visible ? action.visible() : true;
  }

  onAction(action: Action<AppEvent>) {
    if (action?.link) this.router.navigateByUrl(action.link);
    if (action?.data) this.app.events.emit(action?.data);
    this.app.events.emit({ type: 'action', data: action });
  }
}
