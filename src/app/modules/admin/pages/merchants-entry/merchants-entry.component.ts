import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Merchant, Roles } from 'src/app/core/models/merchant';
import { AuthService } from 'src/app/core/services/auth.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { environment } from 'src/environments/environment';
import { OptionsDialogComponent } from 'src/app/shared/dialogs/options-dialog/options-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { PaginationInput } from 'src/app/core/models/saleflow';

interface Option {
  value: string;
  viewValue: string;
};

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

  countries: any[] = [];

  cities: any[] = [];

  PhoneNumberFormat = PhoneNumberFormat;

  URI: string = environment.uri;

  roles: Roles[] = [];
  role: Roles;

  constructor(
    private formBuilder: FormBuilder,
    private merchantsService: MerchantsService,
    private authservice: AuthService,
    private matSnackBar: MatSnackBar,
    private clipboard: Clipboard,
    private dialog: MatDialog,
  ) { }

  async ngOnInit() {
    this.merchantForm = this.formBuilder.group({
      name: [null],
      slug: [null],
      phone: [null],
      email: [null, Validators.compose([Validators.required, Validators.email])],
      password: ['123', Validators.required],
      userName: [null, Validators.required],
      role: [null],
      country: [null],
      city: [null],
      address: [null],
      bio: [null],
    });

    this.getDataCountries();

    await this.getMerchantDefault();
  }

  async getDataCountries() {
    let result = await this.merchantsService.getDataCountries();
    if (result) this.countries = result;
  }

  async getCities(cityID: string) {
    const paginationInput: PaginationInput = {
      findBy: {
        table: "city",
        reference: cityID
      }
    }
    let result = await this.merchantsService.getDataPagination(paginationInput);
    if (result) this.cities = result?.results;
  }

  async getMerchantDefault() {
    try {
      this.merchantsService.rolesPublic().then((res) => {
        this.roles = res;
      })
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

    const userName = this.merchantForm.value.userName;
    const role = this.merchantForm.value.role;
    const country = this.merchantForm.value.country;
    const city = this.merchantForm.value.city;
    const address = this.merchantForm.value.address;
    const bio = this.merchantForm.value.bio;

    lockUI();

    if (await this.checkIfUserExists() || await this.checkIfMerchantExists()) {
      unlockUI();
      return;
    }

    const userInput = {
      email: email,
      phone: phone?.e164Number?.split('+')[1] ? phone?.e164Number?.split('+')[1] : null,
      password: password,
      name: userName,
    };

    const deliveryLocations = {
      country: country,
      cityReference: city,
      type: 'city-reference',
    };
    
    const arrayRole = [role];

    if (!phone?.e164Number?.split('+')[1]) delete userInput.phone;

    try {
      const result = await this.merchantsService.entryMerchant(
        this.merchant._id,
        {
          name: storeName,
          slug,
          bio
        },
        userInput,
        address,
        deliveryLocations,
        arrayRole,
      );

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
      let phone;
      if(this.merchantForm?.value?.phone) {
        phone = await this.authservice.checkUser(this.merchantForm?.value?.phone?.e164Number?.split('+')[1]);
        if (phone) {
          this.matSnackBar.open('Un usuario con ese teléfono ya existe', '', {
            duration: 2000,
            panelClass: 'snack-toast-error'
          });
        }
      }
      const email = await this.authservice.checkUser(this.merchantForm.value.email);
      if (email) {
        this.matSnackBar.open('Un usuario con ese correo ya existe', '', {
          duration: 2000,
          panelClass: 'snack-toast-error'
        });
      }
      if (phone || email) return true;
      else return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  private async checkIfMerchantExists(): Promise<boolean> {
    try {
      let name;
      if(this.merchantForm?.value?.name) name = await this.merchantsService.merchantByName(this.merchantForm.value.name);
      let slug;
      if(this.merchantForm?.value?.slug) slug = await this.merchantsService.merchantBySlug(this.merchantForm.value.slug);

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

  openExhibitDialog() {
    this.dialog.open(OptionsDialogComponent, {
      data: {
        title: '¿A quién le vendes?',
        options: [
          {
            value: 'Consumidor final',
            callback: () => {
              this.role = this.roles.find((role) => role.code === 'STORE');
              this.merchantForm.get('role').setValue(this.role._id);
            }
          },
          {
            value: 'Floristerías',
            callback: () => {
              this.role = this.roles.find((role) => role.code === 'PROVIDER');
              this.merchantForm.get('role').setValue(this.role._id);
            }
          },
          {
            value: 'Wholesalers',
            callback: () => {
              this.role = this.roles.find((role) => role.code === 'SUPPLIER');
              this.merchantForm.get('role').setValue(this.role._id);
            }
          },
          {
            value: 'Fincas',
            callback: () => {
              this.role = this.roles.find((role) => role.code === 'PRODUCTOR');
              this.merchantForm.get('role').setValue(this.role._id);
            }
          },
        ]
      }
    })
  }

  clearForm() {
    // Reiniciar el formulario
    this.merchantForm.reset();
    this.merchantCreated = false;
  }

}
