import { Component, OnInit, Input, EventEmitter } from '@angular/core';
import { SocialMediaModel } from 'src/app/core/models/post';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { environment } from 'src/environments/environment';
import { MerchantInfoComponent } from '../../dialogs/merchant-info/merchant-info.component';

@Component({
  selector: 'app-header-info',
  templateUrl: './header-info.component.html',
  styleUrls: ['./header-info.component.scss']
})
export class HeaderInfoComponent implements OnInit {
  @Input() profileImage: string;
  @Input() starsAmount: string;
  @Input() title: string;
  @Input() description: string;
  @Input() description2: string;
  @Input() socials: SocialMediaModel[];
  env: string = environment.assetsUrl;

  constructor(
    private dialogService: DialogService,
  ) {}

  ngOnInit(): void {
  }

  openDialog() {
    // this.dialog.open(MerchantInfoComponent, {
    //   type: 'fullscreen-translucent',
    //   props: {
    //     merchantImage: this.profileImage,
    //     merchantName: this.title,

    //   },
    //   customClass: 'app-dialog',
    //   flags: ['no-header'],
    // });
  }

}
