import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-confirm-club-registration',
  templateUrl: './confirm-club-registration.component.html',
  styleUrls: ['./confirm-club-registration.component.scss'],
})
export class ConfirmClubRegistrationComponent implements OnInit {
  assetsFolder = environment.assetsUrl;
  merchantName: string;

  constructor(private location: Location, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(({ merchantName }) => {
      this.merchantName = merchantName;
    });
  }

  back() {
    this.location.back();
  }

  sendWhatsappToAppOwner() {
    let message = `Hola daviel`;

    const whatsappLink = `https://api.whatsapp.com/send?phone=19188156444&text=${encodeURIComponent(
      message
    )}`;

    window.location.href = whatsappLink;
  }
}
