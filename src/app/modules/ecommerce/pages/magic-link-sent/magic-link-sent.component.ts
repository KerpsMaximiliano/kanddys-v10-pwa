import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-magic-link-sent',
  templateUrl: './magic-link-sent.component.html',
  styleUrls: ['./magic-link-sent.component.scss'],
})
export class MagicLinkSentComponent implements OnInit {
  constructor(private location: Location, private router: Router) {}

  ngOnInit(): void {}

  back() {
    this.location.back();
  }

  goToLanding() {
    this.router.navigate(['ecommerce/club-landing']);
  }

  askForHelp() {
    let message = 'Hola, daviel, necesito ayuda con algo';

    let whatsappLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      message
    )}&phone=19188156444`;

    window.location.href = whatsappLink;
  }
}
