import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { generateMagicLink } from 'src/app/core/graphql/auth.gql';
import { AuthService } from 'src/app/core/services/auth.service';
import { CommunitiesService } from 'src/app/core/services/communities.service';
import { environment } from 'src/environments/environment';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from 'ngx-intl-tel-input';

@Component({
  selector: 'app-merchant-stepper-form',
  templateUrl: './merchant-stepper-form.component.html',
  styleUrls: ['./merchant-stepper-form.component.scss'],
})
export class MerchantStepperFormComponent implements OnInit {
  constructor(
    private _formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<MerchantStepperFormComponent>,
    private authService: AuthService,
    private communities: CommunitiesService,
    private merchantsService: MerchantsService
  ) {}

  env: string = environment.assetsUrl;

  CountryISO = CountryISO.DominicanRepublic;
  preferredCountries: CountryISO[] = [
    CountryISO.DominicanRepublic,
    CountryISO.UnitedStates,
  ];
  PhoneNumberFormat = PhoneNumberFormat;

  inputName: string = '';
  inputLastName: string = '';
  inputMail: string = '';
  inputPhone: string = '';
  phoneNumber: string;
  inputTiendaName: string = '';
  slug: string = '';
  user;
  merchantId;

  allCommunities;
  allCommunitiesObject;

  itemForm = this._formBuilder.group({
    name: [null, [Validators.required, Validators.minLength(3)]],
    lastname: [null, [Validators.required, Validators.minLength(3)]],
    mail: [
      null,
      [
        Validators.required,
        Validators.pattern(
          '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'
        ),
      ],
    ],
    phone: [null, [Validators.required, Validators.minLength(10)]],
  });

  itemForm2 = this._formBuilder.group({
    tiendaName: [null, [Validators.required, Validators.minLength(3)]],
    slug: [null, [Validators.required, Validators.minLength(3)]],
  });

  // itemForm3 = this._formBuilder.group({
  //   categories: [null, [Validators.required, Validators.minLength(1)]],
  // });
  isLinear = false;

  options;
  merchantCategories: string[] = [];
  category;
  isAlreadyAdded: boolean;

  async ngOnInit() {
    this.itemForm2.get('tiendaName').disable();
    this.allCommunities = await this.communities.communitycategories({});
    console.log(this.allCommunities);

    this.options = [];

    for (let i = 0; i < this.allCommunities.communitycategories.length; i++) {
      this.options.push({
        status: true,
        click: true,
        value: this.allCommunities.communitycategories[i].name,
        description: this.allCommunities.communitycategories[i].description,
        valueStyles: {
          'font-family': 'SfProBold',
          'font-size': '17px',
          color: '#272727',
        },
      });
      console.log(this.allCommunities.communitycategories[i].description);
    }

    console.log(this.options);
  }

  onNameInput(name: string) {
    this.inputName = name;
    this.itemForm.get('name').patchValue(name);
  }

  onLastNameInput(lastname: string) {
    this.inputLastName = lastname;
    this.itemForm.get('lastname').patchValue(lastname);
  }

  onMailInput(mail: string) {
    this.inputMail = mail;
    this.itemForm.get('mail').patchValue(mail);
  }

  onPhoneInput() {
    if (this.inputPhone != null) {
      let data: any = this.inputPhone;
      this.phoneNumber = data.e164Number;
      //console.log('full number: ', Data.e164Number);
    }
    this.itemForm.get('phone').patchValue(this.phoneNumber);
  }

  onTiendaNameInput(name: string) {
    this.inputTiendaName = name;
    this.itemForm2.get('tiendaName').patchValue(name);
  }

  onSlugInput(slug: string) {
    this.slug = slug;
    this.itemForm2.get('slug').patchValue(slug);
  }

  async sendLink() {
    //this.signUp();
    console.log(this.user);
    await this.createMerchant();
    console.log(this.merchantId);
    this.authService.generateMagicLink(
      this.phoneNumber.replace('+', ''),
      `/ecommerce/arepera-que-molleja/article-detail/item/63f6a229e2f51cbd1a4f3f71?createArticle=true&merchant=${this.merchantId}`,
      '',
      'UserAccess',
      {}
    );
  }

  async signUp() {
    console.log('name: ', this.inputName);
    console.log('lastname: ', this.inputLastName);
    console.log('email: ', this.inputMail);
    console.log('phone: ', this.phoneNumber);

    this.user = await this.authService.signup(
      {
        name: this.inputName,
        lastname: this.inputLastName,
        email: this.inputMail,
        phone: this.phoneNumber,
      },
      'none',
      null,
      false
    );

    console.log(this.user);
  }

  selectedCategory(i: number) {
    this.category = this.allCommunities.communitycategories[i]._id;

    if (
      this.merchantCategories.includes(
        this.allCommunities.communitycategories[i]._id
      )
    ) {
      const index = this.merchantCategories.indexOf(
        this.allCommunities.communitycategories[i]._id
      );
      this.merchantCategories.splice(index, 1);
      console.log(this.merchantCategories);
    } else {
      this.merchantCategories.push(
        this.allCommunities.communitycategories[i]._id
      );
      console.log(this.merchantCategories);
    }
  }

  async createMerchant() {
    console.log(this.user);
    const merchant = await this.merchantsService.createMerchant({
      name: this.inputTiendaName,
      slug: this.slug,
      categories: this.merchantCategories,
      owner: this.user.user_id,
    });

    this.merchantId = merchant.createMerchant._id;
    console.log(merchant);
    console.log(this.merchantId);
  }
}
