import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-landing',
  templateUrl: './login-landing.component.html',
  styleUrls: ['./login-landing.component.scss']
})
export class LoginLandingComponent implements OnInit {

  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {
  }

  goToQuotations() {
    return this.router.navigate(['/ecommerce/supplier-items-selector']);
  }

  goToDashboard() {
    return this.router.navigate(['/ecommerce/provider-items']);
  }

  goToWhatsapp() {
    const message = 'Hola, quiero saber más sobre Floristerias.club';
    const phone = '19188156444';
    window.location.href = `https://wa.me/${phone}?text=${message}`;
  }

}
