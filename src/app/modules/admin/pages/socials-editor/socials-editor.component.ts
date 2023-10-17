import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/core/services/auth.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { ContactService } from 'src/app/core/services/contact.service';

@Component({
  selector: 'app-socials-editor',
  templateUrl: './socials-editor.component.html',
  styleUrls: ['./socials-editor.component.scss']
})
export class SocialsEditorComponent implements OnInit {
  links: any = {
    Facebook: '',
    Instagram: '',
    Twitter: '',
    TikTok: '',
    Threads: '',
  };

  linksIds: any = {
    Facebook: '',
    Instagram: '',
    Twitter: '',
    TikTok: '',
    Threads: '',
  };

  linkFacebook: string | null = null;
  linkInstagram: string | null = null;
  linkTwitter: string | null = null;
  linkTikTok: string | null = null;
  linkThreads: string | null = null;

  Object = Object;

  contactDefault: any | null = null;
  merchantId: string | null = null;

  constructor(
    private authService: AuthService,
    private merchantsService: MerchantsService,
    private contactService: ContactService,
    private location: Location,
  ) { }

  async ngOnInit(): Promise<void> {
    const user = await this.authService.me();
    if (user && user?._id) {
      const merchant = await this.merchantsService.merchantDefault(user._id);
      if (merchant && merchant?._id) {
        this.merchantId = merchant._id;
        const contactDefault = await this.contactService.contactDefault('merchant', merchant._id);
        if (contactDefault) {
          this.contactDefault = contactDefault;
          for (let link of contactDefault.link) {
            this.links[link.name] = link.value;
            this.linksIds[link.name] = link._id;
          }
        }
      }
    }
  }

  isThereAnyLink() {
    return Object.keys(this.links).filter(prop => this.links[prop].length > 0).length > 0;
  }

  async close() {
    if (!this.contactDefault) {
      const newContact = await this.contactService.createContact({
        type: 'merchant',
        merchant: this.merchantId
      });
      this.contactDefault = newContact;
      await this.contactService.contactSetDefault(this.contactDefault._id);
    }
    for (const prop in this.links) {
      if (this[`link${prop}`] && this[`link${prop}`].length > 0) {
        const linkAdded = await this.contactService.contactAddLink(
          {
            name: prop,
            value: this[`link${prop}`],
          },
          this.contactDefault._id
        );
      }
    }
    this.location.back();
  }

  async removeLink(option: string) {
    this.links[option] = '';
    try {
      const linkRemoved = await this.contactService.contactRemoveLink(this.linksIds[option], this.contactDefault._id);
    } catch (error) {
      console.log(error);
    }
  }

}