import {
  Component,
  OnInit,
  ViewChild,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import {
  LoginDialogComponent,
  LoginDialogData,
} from 'src/app/modules/auth/pages/login-dialog/login-dialog.component';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit {
  @Input() opened: boolean;
  @Output() closed = new EventEmitter();

  constructor(
    private authService: AuthService,
    public merchantsService: MerchantsService,
    public headerService: HeaderService,
    private router: Router,
    private matDialog: MatDialog
  ) {}

  ngOnInit(): void {}

  signout() {
    this.authService.signouttwo();
  }

  login() {
    const matDialogRef = this.matDialog.open(LoginDialogComponent, {
      data: {
        magicLinkData: {
          redirectionRoute: this.router.url,
          entity: 'UserAccess',
        },
      } as LoginDialogData,
    });
    matDialogRef.afterClosed().subscribe(async (value) => {
      if (!value) return;
      if (value.user?._id || value.session.user._id) {
        this.close();
      }
    });
  }

  @ViewChild('sidenav') sidenav: MatSidenav;

  close() {
    this.sidenav.close();
  }
}
