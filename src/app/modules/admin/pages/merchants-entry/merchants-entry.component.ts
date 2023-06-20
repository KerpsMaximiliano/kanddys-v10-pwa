import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Merchant, MerchantInput } from 'src/app/core/models/merchant';
import { UserInput } from 'src/app/core/models/user';
import { MerchantsService } from 'src/app/core/services/merchants.service';

@Component({
  selector: 'app-merchants-entry',
  templateUrl: './merchants-entry.component.html',
  styleUrls: ['./merchants-entry.component.scss']
})
export class MerchantsEntryComponent implements OnInit {

  merchantForm: FormGroup;

  merchant: Merchant;

  merchantCreated: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private merchantsService: MerchantsService
  ) { }

  async ngOnInit() {
    this.merchantForm = this.formBuilder.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      phone: ['', Validators.required],
      password: ['', Validators.required]
    });

    await this.getMerchantDefault();
  }

  async getMerchantDefault() {
    try {
      const result = await this.merchantsService.merchantDefault();
      if (result) this.merchant = result;
    } catch (error) {
      console.log(error);
    }
  }

  async submitForm() {
    if (this.merchantForm.invalid) {
      return;
    }

    // Obtener los valores del formulario
    const storeName = this.merchantForm.value.name;
    const phone = this.merchantForm.value.phone;
    const password = this.merchantForm.value.password;
    const slug = this.merchantForm.value.slug;

    lockUI();

    try {
      const result = await this.merchantsService.entryMerchant(
        this.merchant._id,
        {
          name: storeName,
          slug
        },
        {
          phone: phone,
          password: password,
          name: storeName
        }
      )

      if (result) this.merchantCreated = true;

      unlockUI();
    } catch (error) {
      console.log(error);
      unlockUI();
    }
  }

  clearForm() {
    // Reiniciar el formulario
    this.merchantForm.reset();
    this.merchantCreated = false;
  }

}
