import { Component, OnInit } from '@angular/core';
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from 'ngx-intl-tel-input';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { PostsService } from 'src/app/core/services/posts.service';

@Component({
  selector: 'app-giftcard-details',
  templateUrl: './giftcard-details.component.html',
  styleUrls: ['./giftcard-details.component.scss'],
})
export class GiftcardDetailsComponent implements OnInit {
  isQr: boolean = false;
  isText: boolean = false;
  isWhatsapp: boolean = true;

  CountryISO = CountryISO.DominicanRepublic;
  preferredCountries: CountryISO[] = [
    CountryISO.DominicanRepublic,
    CountryISO.UnitedStates,
  ];
  PhoneNumberFormat = PhoneNumberFormat;

  inputPhone;
  phoneNumber: string;
  mail: string = '';

  itemFormPhone = this._formBuilder.group({
    phone: [
      null,
      [Validators.required, Validators.minLength(12), Validators.maxLength(15)],
    ],
  });

  itemFormMail = this._formBuilder.group({
    mail: [
      null,
      [
        Validators.required,
        Validators.pattern(
          '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'
        ),
      ],
    ],
  });

  flow: 'cart' | 'checkout' = 'cart';

  constructor(
    private _formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private merchantsService: MerchantsService,
    private headerService: HeaderService,
    private postsService: PostsService
  ) {}

  async ngOnInit() {
    const flow = this.route.snapshot.queryParamMap.get('flow');
    if (flow) this.flow = flow as 'cart' | 'checkout';
    if(!this.postsService.post) this.router.navigate(['/ecommerce/' + this.headerService.saleflow.merchant.slug + '/cart'])
  }

  qrClicked() {
    this.isQr = !this.isQr;
  }

  textClicked() {
    this.isText = !this.isText;
  }

  backToMain() {
    this.isQr = false;
    this.isText = false;
  }

  changeOption() {
    this.isWhatsapp = !this.isWhatsapp;
    this.inputPhone = '';
    this.mail = '';
  }

  async onMailInput(event: Event | string, input: HTMLInputElement) {
    this.mail = input.value;
    this.itemFormMail.get('mail').patchValue(this.mail);
  }

  async onPhoneInput() {
    if (this.inputPhone != null) {
      let data: any = this.inputPhone;
      this.phoneNumber = data.e164Number.split('+')[1];
    }
    this.itemFormPhone.get('phone').patchValue(this.phoneNumber);
  }

  save() {
    if (this.phoneNumber && this.phoneNumber !== '') {
      this.postsService.postReceiverNumber = this.phoneNumber;
    } else if (this.mail && this.mail !== '') {
      this.postsService.postReceiverEmail = this.mail;
    }
    this.postsService.privatePost = true;
    localStorage.setItem('privatePost', 'true');

    this.headerService.flowRoute = this.router.url;
    localStorage.setItem('flowRoute', this.router.url);

    this.postsService.post.envelopePresentation = this.isQr ? 'QR' : 'QR-TEXT';

    if (this.flow === 'checkout') 
      return this.router.navigate([
        '/ecommerce/' +
          this.headerService.saleflow.merchant.slug +
          '/checkout',
      ]);

    return this.router.navigate([
      '/ecommerce/' +
        this.headerService.saleflow.merchant.slug +
        '/receiver-form',
    ]);
  }

  back() {
    this.router.navigate(
      [
      '/ecommerce/' + this.headerService.saleflow.merchant.slug + '/new-symbol',
      ],
      {
        queryParams: {
          flow: this.flow
        }
      }
    );
    //this.headerService.redirectFromQueryParams();
  }

  send() {
    this.router.navigate([`ecommerce`]);
  }
}
