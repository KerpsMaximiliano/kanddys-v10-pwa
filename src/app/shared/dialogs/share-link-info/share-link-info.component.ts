import { Component, Input, OnInit } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';

@Component({
  selector: 'app-share-link-info',
  templateUrl: './share-link-info.component.html',
  styleUrls: ['./share-link-info.component.scss']
})
export class ShareLinkInfoComponent implements OnInit {
  @Input() link: string = 'www.laichat.com/userID';

  constructor(
    private clipboard: Clipboard,
    private toastrService: ToastrService,
    private router: Router,
    private ref: DialogRef
  ) { }

  ngOnInit(): void {
    const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const isMobile = regex.test(navigator.userAgent);
    if(!isMobile) {
      const element : HTMLElement = document.querySelector('.dialog-frame');
      element?.style?.setProperty('max-width', '427px', 'important');
    }
  }

  copyLink() {
    this.clipboard.copy(this.link);
    this.toastrService.success(
      'Enlace copiado satisfactoriamente'
    );
  }

  goIntegrationLink() {
    this.router.navigate(['/ecommerce/laiachat-integrations']);
    this.ref.close();
  }

}
