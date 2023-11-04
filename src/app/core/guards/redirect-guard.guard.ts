import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RedirectGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const domain = window.location.hostname;
    const redirectTo = domain === 'laiachat.com' ? 'ecommerce/laiachat-landing' : 'ecommerce/club-landing';
    const previousUrl = this.router.url;

    if (domain === 'localhost' && previousUrl === '/ecommerce/laiachat-landing') return true;
    if (redirectTo !== 'ecommerce/club-landing') this.router.navigate([redirectTo]);
    return true;
  }
}
