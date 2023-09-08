import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Merchant } from 'src/app/core/models/merchant';
import { AuthService } from 'src/app/core/services/auth.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-merchants-entry',
  templateUrl: './merchants-entry.component.html',
  styleUrls: ['./merchants-entry.component.scss']
})
export class MerchantsEntryComponent implements OnInit {

  merchantForm: FormGroup;

  merchant: Merchant;

  merchantCreated: boolean = false;

  CountryISO = CountryISO.DominicanRepublic;
  preferredCountries: CountryISO[] = [
    CountryISO.DominicanRepublic,
    CountryISO.UnitedStates,
  ];

  PhoneNumberFormat = PhoneNumberFormat;

  URI: string = environment.uri;

  constructor(
    private formBuilder: FormBuilder,
    private merchantsService: MerchantsService,
    private authservice: AuthService,
    private matSnackBar: MatSnackBar,
    private clipboard: Clipboard
  ) { }

  async ngOnInit() {
    this.merchantForm = this.formBuilder.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      phone: [''],
      email: ['', Validators.required, Validators.email],
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
    const email = this.merchantForm.value.email;
    const phone = this.merchantForm.value.phone;
    const password = this.merchantForm.value.password;
    const slug = this.merchantForm.value.slug;

    lockUI();

    if (await this.checkIfUserExists() || await this.checkIfMerchantExists()) {
      unlockUI();
      return;
    }

    const userInput = {
      email: email,
      phone: phone?.e164Number?.split('+')[1] ? phone?.e164Number?.split('+')[1] : null,
      password: password,
      name: storeName
    }

    if (!phone?.e164Number?.split('+')[1]) delete userInput.phone;

    try {
      const result = await this.merchantsService.entryMerchant(
        this.merchant._id,
        {
          name: storeName,
          slug
        },
        userInput
      )

      if (result) {
        this.merchantCreated = true;
        this.matSnackBar.open('Usuario registrado exitosamente', '', {
          duration: 2000,
        });
      }
      unlockUI();
    } catch (error) {
      console.log(error);
      unlockUI();
    }
  }

  private async checkIfUserExists(): Promise<boolean> {
    try {
      const phone = await this.authservice.checkUser(this.merchantForm?.value?.phone?.e164Number?.split('+')[1]);
      if (phone) {
        this.matSnackBar.open('Un usuario con ese teléfono ya existe', '', {
          duration: 2000,
          panelClass: 'snack-toast-error'
        });
      }
      const email = await this.authservice.checkUser(this.merchantForm.value.email);
      if (email) {
        this.matSnackBar.open('Un usuario con ese correo ya existe', '', {
          duration: 2000,
          panelClass: 'snack-toast-error'
        });
      }
      if (phone && email) return true;
      else return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  private async checkIfMerchantExists(): Promise<boolean> {
    try {
      const name = await this.merchantsService.merchantByName(this.merchantForm.value.name);
      const slug = await this.merchantsService.merchantBySlug(this.merchantForm.value.slug);

      if (name || slug) {
        if (name) 
          this.matSnackBar.open('Una tienda con ese nombre ya existe', '', {
            duration: 2000,
            panelClass: 'snack-toast-error'
          });
        
        if (slug)
          this.matSnackBar.open('Una tienda con ese slug ya existe', '', {
            duration: 2000,
            panelClass: 'snack-toast-error'
          });
        return true;
      }
      else return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  focusPhoneInput() {
    const ngxIntlPhoneInput = document.querySelector('#phone');

    (ngxIntlPhoneInput.querySelector('#phone') as HTMLInputElement).focus();
  }

  copyLinkToClipboard() {
    this.clipboard.copy(`${this.URI}/auth/login`);
    this.matSnackBar.open(
      'Enlace copiado en el portapapeles',
      '',
      {
        duration: 2000,
      }
    );
  }

  clearForm() {
    // Reiniciar el formulario
    this.merchantForm.reset();
    this.merchantCreated = false;
  }

}
