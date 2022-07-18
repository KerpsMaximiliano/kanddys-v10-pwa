import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
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
  @Input() mode: 'normal' | 'simple';
  @Input() profileImage: string;
  @Input() starsAmount: string;
  @Input() title: string;
  @Input() description: string;
  @Input() description2: string;
  @Input() featuredText: {
    text: string,
    styles: string
  }
  @Input() socials: SocialMediaModel[];
  @Input() customStyles: Record<string, Record<string, string>> = null;
  @Input() reverseInfoOrder: boolean = false;
  @Input() type: 'route' | 'dialog';
  @Input() route: string;
  @Input() fixedMode: boolean = false;
  
  env: string = environment.assetsUrl;

  @Output() featuredTextEvent = new EventEmitter<boolean>();
  @Output() clickedImage = new EventEmitter();

  constructor(
    private dialogService: DialogService,
    private router: Router,
  ) { }

  ngOnInit(): void {
  }

  openInfo() {
    // if(type === 'dialog' || !type){
    // this.dialogService.open(MerchantInfoComponent, {
    //   type: 'fullscreen-translucent',
    //   props: {
    //     merchantImage: this.profileImage,
    //     merchantName: this.title,
    //     location: this.socials?.find((social) => social.name === 'location'),
    //     instagram: this.socials?.find((social) => social.name === 'instagram'),
    //     whatsapp: this.socials?.find((social) => social.name === 'phone'),
    //   },
    //   customClass: 'app-dialog',
    //   flags: ['no-header'],
    // });
    //   } else if(type === 'route') {
      // }

    if(!this.type || this.type === 'route')
      this.router.navigate([`/ecommerce/${this.route}`]);

    if(this.type === 'dialog'){
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
  }

  redirect() {
    this.router.navigate(['/ecommerce/user-creator']);
  }

  triggerFeaturedText() {
    this.featuredTextEvent.emit(true);
  }

  clickOnImage(event){
    this.clickedImage.emit(event)
  }
}
