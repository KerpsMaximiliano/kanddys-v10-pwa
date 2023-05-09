import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-admin-navigation',
  templateUrl: './admin-navigation.component.html',
  styleUrls: ['./admin-navigation.component.scss'],
})
export class AdminNavigationComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit(): void {}

  signout() {
    this.authService.signouttwo();
  }
}
