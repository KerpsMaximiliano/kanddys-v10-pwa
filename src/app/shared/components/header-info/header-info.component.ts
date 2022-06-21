import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { SocialMediaModel } from 'src/app/core/models/saleflow';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { environment } from 'src/environments/environment';
import { MerchantInfoComponent } from '../../dialogs/merchant-info/merchant-info.component';

@Component({
  selector: 'app-header-info',
  templateUrl: './header-info.component.html',
  styleUrls: ['./header-info.component.scss']
})
export class HeaderInfoComponent implements OnInit {

  @Input() simple: boolean = false;
  @Input() merchant: boolean;
  @Input() admin: boolean;
  @Input() mode: 'normal' | 'simple' | 'expanded';
  @Input() profileImage: string;
  @Input() starsAmount: string;
  @Input() title: string;
  @Input() description: string;
  @Input() description2: string;
  @Input() socials: SocialMediaModel[];
  @Input() customStyles: Record<string, Record<string, string>> = null;
  @Input() reverseInfoOrder: boolean = false;
  @Input() hasSocials: boolean;
  env: string = environment.assetsUrl;
  showMore: boolean;

  constructor(
    private dialogService: DialogService,
    private router: Router,
  ) { }

  ngOnInit(): void {
  }

  openDialog() {
    this.dialogService.open(MerchantInfoComponent, {
      type: 'fullscreen-translucent',
      props: {
        merchantImage: this.profileImage,
        merchantName: this.title,
        location: this.socials?.find((social) => social.name === 'location'),
        instagram: this.socials?.find((social) => social.name === 'instagram'),
        whatsapp: this.socials?.find((social) => social.name === 'phone'),
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  redirect() {
    this.router.navigate(['/ecommerce/user-creator']);
  }

}
