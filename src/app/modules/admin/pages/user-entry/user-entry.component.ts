import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';

@Component({
  selector: 'app-user-entry',
  templateUrl: './user-entry.component.html',
  styleUrls: ['./user-entry.component.scss'],
})
export class UserEntryComponent implements OnInit {
  form: FormGroup;
  returnTo: string;
  manualOrderId: string;

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
      if(this.returnTo === 'manual-order-management') {
        this.router.navigate([`/ecommerce/manual-order-management/${this.manualOrderId}`], {queryParams: {userId: data._id}});
      } else {
        this.router.navigate(["/ecommerce/recipient-info-select"]);
      }
      console.log(data);
    }
  }

  goBack() {
    this.router.navigate([`/admin/user-search`], {
        queryParams: {
        returnTo: 'manual-order-management',
        manualOrderId: this.manualOrderId
      }
    });
  }
}
