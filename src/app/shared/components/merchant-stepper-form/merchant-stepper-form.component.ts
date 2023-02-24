import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { generateMagicLink } from 'src/app/core/graphql/auth.gql';
import { AuthService } from 'src/app/core/services/auth.service';
import { CommunitiesService } from 'src/app/core/services/communities.service';
import { environment } from 'src/environments/environment';
import { MerchantsService } from 'src/app/core/services/merchants.service';

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

  inputName: string = '';
  inputLastName: string = '';
  inputMail: string = '';
  inputPhone = '';
  inputTiendaName: string = '';
  slug: string = '';
  merchant;

  allCommunities;
  allCommunitiesObject;

  itemForm = this._formBuilder.group({
    name: [null, Validators.required],
    lastname: [null, Validators.required],
    mail: [null, Validators.required],
    phone: [null, Validators.required],
    tiendaName: [this.inputName, Validators.required],
    slug: [null, Validators.required],
  });
  isLinear = false;

  options = [];
  merchantCategories = [];

  async ngOnInit() {
    this.itemForm.get('tiendaName').disable();
    this.allCommunities = await this.communities.communitycategories({});
    console.log(this.allCommunities);

    for (let i = 0; i < this.allCommunities.communitycategories.length; i++) {
      this.options.push({
        status: true,
        click: true,
        value: this.allCommunities.communitycategories[i].name,
        valueStyles: {
          'font-family': 'SfProBold',
          'font-size': '17px',
          color: '#272727',
        },
      });
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

  onPhoneInput(phone: string) {
    this.inputPhone = phone;
    this.itemForm.get('phone').patchValue(phone);
  }

  onTiendaNameInput(name: string) {
    this.inputTiendaName = name;
    this.itemForm.get('tiendaName').patchValue(name);
  }

  onSlugInput(slug: string) {
    this.slug = slug;
    this.itemForm.get('slug').patchValue(slug);
  }

  sendLink() {
    this.signUp();
    this.createMerchant();
    this.authService.generateMagicLink(
      this.inputPhone.replace('+', ''),
      'admin/dashboard',
      '',
      'UserAccess',
      {}
    );
  }

  async signUp() {
    this.merchant = await this.authService.signup(
      {
        name: this.inputName,
        lastname: this.inputLastName,
        email: this.inputMail,
        phone: this.inputPhone,
      },
      'none',
      null,
      false
    );

    console.log(this.merchant);
  }

  selectedCategory(i: number) {
    if (
      this.merchantCategories.includes(
        this.allCommunities.communitycategories[i]._id
      )
    ) {
      const index = this.merchantCategories.indexOf(
        this.allCommunities.communitycategories[i]._id
      );
      this.merchantCategories.splice(index, 1);
    } else {
      this.merchantCategories.push(
        this.allCommunities.communitycategories[i]._id
      );
    }

    console.log(this.merchantCategories);
  }

  createMerchant() {
    this.merchantsService.createMerchant({
      name: this.inputTiendaName,
      slug: this.slug,
      categories: this.merchantCategories,
      owner: this.merchant._id,
    });
  }
}
