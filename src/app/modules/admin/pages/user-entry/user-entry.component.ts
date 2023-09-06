import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';

@Component({
  selector: 'app-user-entry',
  templateUrl: './user-entry.component.html',
  styleUrls: ['./user-entry.component.scss'],
})
export class UserEntryComponent implements OnInit {
  form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private merchantsService: MerchantsService,
    private router:Router
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      phone: ['', Validators.required],
      name: ['', Validators.required],
      email: [''],
      clientOfMerchants: [''],
    });
  }

  /**
   * Envía el formulario de registro de usuario.
   *
   * @function
   * @async
   * @returns {Promise<void>} Una promesa que se resuelve cuando se completa el registro.
   */
  async sendForm(): Promise<void> {
    if (!this.form.invalid) {
      const merchantDefault = await this.merchantsService.merchantDefault();
      
      const { phone, name, clientOfMerchants } = this.form.value;
      const inputData = { phone, name, clientOfMerchants };
      inputData.clientOfMerchants = [merchantDefault._id];
      
      const data = await this.authService.signup(inputData, '');
      this.router.navigate(["/ecommerce/recipient-info-select"]);
      console.log(data);
    }
  }
}
