import { Component, OnInit } from '@angular/core';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';
import { Router } from '@angular/router';

@Component({
  selector: 'app-magic-link-dialog',
  templateUrl: './magic-link-dialog.component.html',
  styleUrls: ['./magic-link-dialog.component.scss'],
})
export class MagicLinkDialogComponent implements OnInit {
  whatsappLink: string;

  constructor(private ref: DialogRef, private router: Router) {}

  ngOnInit(): void {}

  storeRouteState() {
    this.whatsappLink = `https://wa.me/19295263397?text=Keyword-Authme%20`;
    const currentRoute = this.router.url;

    localStorage.setItem('currentRoute', JSON.stringify(currentRoute));

    let linkRef = document.querySelector(`#sendWS`) as HTMLAnchorElement;
    linkRef.href = this.whatsappLink;
    linkRef.click();

    this.close();
  }

  close() {
    this.ref.close();
  }
}
