import { Component, OnInit, Input } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input';
import { Merchant } from 'src/app/core/models/merchant';
import { Tag } from 'src/app/core/models/tags';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { TagsService } from 'src/app/core/services/tags.service';

@Component({
  selector: 'app-container-form',
  templateUrl: './container-form.component.html',
  styleUrls: ['./container-form.component.scss']
})
export class ContainerFormComponent implements OnInit {
  tag: Tag;
  PhoneNumberFormat = PhoneNumberFormat;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.UnitedStates];
  SearchCountryField = SearchCountryField;
  phoneNumber = new FormControl('', [Validators.required]);
  error: string;

  merchantInfo: Merchant;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private merchantService: MerchantsService,
    private tagService: TagsService,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
      this.merchantInfo = await this.merchantService.merchant(params.merchantId);
      if(!this.merchantInfo) return this.router.navigate(['others/error-screen']);;
      this.tag = (await this.tagService.tag(params.tagId))?.tag;
      if(!this.tag) return this.router.navigate(['others/error-screen']);
    })
  }

  async addTag() {
    if(this.phoneNumber.invalid) return;
    try {
      const result = await this.tagService.addTagContainersPublic({
        phone: this.phoneNumber.value.e164Number.split('+')[1],
      }, this.tag._id);
      if(result?.message?.includes('Phone already registered previously'))
        this.error = "El número de teléfono ingresado ya existe"
      else this.error = null;
    } catch (error) {
      console.log(error);
    }
  }
}
