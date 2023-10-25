import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';

@Component({
  selector: 'app-user-entry',
  templateUrl: './user-entry.component.html',
  styleUrls: ['./user-entry.component.scss'],
})
export class UserEntryComponent implements OnInit {
  form: FormGroup;
  returnTo: string;
  manualOrderId: string;

  CountryISO = CountryISO.DominicanRepublic;
  preferredCountries: CountryISO[] = [
    CountryISO.DominicanRepublic,
    CountryISO.UnitedStates,
  ];
  PhoneNumberFormat = PhoneNumberFormat;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private merchantsService: MerchantsService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if(params.returnTo) {
        this.returnTo = params.returnTo;
      }
      if(params.manualOrderId) {
        this.manualOrderId = params.manualOrderId;
      }
    })
    this.form = this.formBuilder.group({
      phone: [''],
      name: [''],
      lastname: [''],
      email: ['', Validators.email],
      clientOfMerchants: [''],
    },{validator: this.hasEmailOrPhone});
  }

  hasEmailOrPhone(group: FormGroup) {
    const email = group.controls.email.value;
    const phone = group.controls.phone.value;
    if(!email && !phone) {
      return { hasEmailOrPhone: true };
    }
    return null;
  }

  /**
   * Envía el formulario de registro de usuario.
   *
   * @function
   * @async
   * @returns {Promise<void>} Una promesa que se resuelve cuando se completa el registro.
   */
  async sendForm(): Promise<void> {
      const merchantDefault = await this.merchantsService.merchantDefault();
      
      const { phone, email, name, lastname, clientOfMerchants } = this.form.value;

      let inputData;
      if(!email) {
        inputData = { phone: phone?.e164Number, name, lastname, clientOfMerchants };
      } else if (!phone) {
        inputData = { email, name, lastname, clientOfMerchants };
      } else {
        console.log('both')
        inputData = { phone: phone?.e164Number, email, name, lastname, clientOfMerchants };
      }
      inputData.clientOfMerchants = [merchantDefault._id];
      
      const data = await this.authService.signup(inputData, '');
      if(this.returnTo === 'manual-order-management') {
        this.router.navigate([`/ecommerce/manual-order-management/${this.manualOrderId}`], {queryParams: {userId: data._id}});
      } else {
        this.router.navigate(["/ecommerce/recipient-info-select"]);
      }
      console.log(data);
  }

  goBack() {

    this.router.navigate([`/admin/user-search`], {
        queryParams: {
        returnTo: this.returnTo,
        manualOrderId: this.manualOrderId
      }
    });
  }
}
