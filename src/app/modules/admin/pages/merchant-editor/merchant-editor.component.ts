import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { MerchantInput } from 'src/app/core/models/merchant';
import { base64ToFile } from 'src/app/core/helpers/files.helpers';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Component({
  selector: 'app-merchant-editor',
  templateUrl: './merchant-editor.component.html',
  styleUrls: ['./merchant-editor.component.scss']
})
export class MerchantEditorComponent implements OnInit {
  email: string | null = null;
  image: string | null = null;
  imageName: string | null = null;
  imageBase64: string | null = null;
  name: string | null = null;
  slug: string | null = null;
  merchantId: string | null = null;

  constructor(
    private merchantsService: MerchantsService,
    private authService: AuthService,
    private _DomSanitizer: DomSanitizer,
  ) {}

  async ngOnInit(): Promise<void> {
    const user = await this.authService.me();
    if (user && user?._id) {
      try {
        const merchant = await this.merchantsService.merchantDefault(user._id);
        if (merchant && merchant?._id) {
          if (merchant?.owner?.email) this.email = merchant?.owner?.email;
          this.merchantId = merchant._id;
          this.name = merchant.name;
          this.slug = merchant.slug;
          this.image = merchant.image;
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  addField(field) {
    this[field] = '';
  }

  onFileUpload(event: any) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imageBase64 = e.target.result as string
      this.image = reader.result as string;
    };
    reader.readAsDataURL(event.target.files[0] as File);
    this.imageName = event.target.files[0].name as string;
  }

  async save() {
    if (this.email) {
      try {
        await this.authService.updateMe({email: this.email});
      } catch (error) {
        console.log(error);
      }
    }
    if (this.name || this.slug || this.image) {
      try {
        let merchantInput = {};
        if(this.name) merchantInput['name'] = this.name;
        if(this.slug) merchantInput['slug'] = this.slug;
        if(this.imageName) merchantInput['image'] = this.imageName;
        await this.merchantsService.updateMerchant(
          merchantInput,
          this.merchantId,
          this.imageBase64? [base64ToFile(this.imageBase64)]: null,
        );
      } catch (error) {
        console.log(error);
      }
    }
  }

  formatImage(image: string): SafeStyle {
    return this._DomSanitizer.bypassSecurityTrustStyle(`url(
      ${image})
      no-repeat center center / cover #fff`);
  }
}
