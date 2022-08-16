import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import {
  SearchCountryField,
  CountryISO,
  PhoneNumberFormat,
} from 'ngx-intl-tel-input';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    auth: 'phone' | 'password';
    merchantNumber: string = '(000) 000-0000';
    loggin: boolean;
    signUp: boolean;
    phoneNumber = new FormControl('', [Validators.minLength(10)]);
    password = new FormControl('', [Validators.required, Validators.minLength(3)]);
    SearchCountryField = SearchCountryField;
    CountryISO = CountryISO.DominicanRepublic;
    preferredCountries: CountryISO[] = [
    CountryISO.DominicanRepublic,
    CountryISO.UnitedStates,
    ];
    PhoneNumberFormat = PhoneNumberFormat;


  constructor(     
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
    ) { }

  async ngOnInit(): Promise<void> {
    const phone = this.route.snapshot.queryParamMap.get('phone');
    this.auth = this.route.snapshot.queryParamMap.get('auth') as 'phone' | 'password';

    if(this.auth === 'password') {
        lockUI();

        if(phone) {
            try {
                const {countryIso, nationalNumber} = await this.authService.getPhoneInformation(phone);
                this.phoneNumber.setValue(nationalNumber);
                this.CountryISO = countryIso;
                this.loggin = true;
                this.merchantNumber = phone;
                
            } catch(e){
                unlockUI();
                this.toastr.info('Número no registrado o inválido', null, {
                  timeOut: 1500
                });
            }

            unlockUI();
        } else {
            this.loggin = false;
            unlockUI();
        }

    } else {
        this.auth = 'phone';
        this.loggin = false;
        unlockUI(); 
    }

  }

  toggleLog(){
    this.loggin = !this.loggin;
    this.phoneNumber.setValue(null);
    this.merchantNumber = '';
  }

  toSignUp(){
    this.signUp = !this.signUp;
    this.phoneNumber.reset();
    this.password.reset()
  }

  async submitPhone(){
    console.log(this.phoneNumber);

    try{
        const {countryIso, nationalNumber} = await this.authService.getPhoneInformation(this.phoneNumber.value.e164Number);
        this.merchantNumber = this.phoneNumber.value.e164Number.split('+')[1];
        this.phoneNumber.setValue(nationalNumber);
        this.CountryISO = countryIso;
        this.loggin = true;

    } catch (error) {
        this.toastr.info('Número no registrado o inválido');
        console.log(error);
    }
  };

  async signIn(){
    if (this.password.invalid){
        this.toastr.info('Contraseña invalida', null, {
          timeOut: 1500
        });
    } else {
        const signin = await this.authService.signin( this.merchantNumber, this.password.value, true );

        if(!signin){
            this.toastr.info('Contraseña invalida', null, {
              timeOut: 1500
            });
            console.log('error');

            return
        }
        this.router.navigate([`admin/entity-detail-metrics`]);  
    }       
  }

  async signMeUp(){
    this.merchantNumber = this.phoneNumber.value.e164Number.split('+')[1];

    const valid = await this.authService.checkUser(this.merchantNumber);

    if(!valid) {
        const newUser = await this.authService.signup( { phone: this.merchantNumber, password: this.password.value}, 'none', null, false );

        if(!newUser){
            console.log('Algo salio mal');
            return;
        } else {
            // console.log(newUser);
            await this.authService.generateMagicLink(this.merchantNumber, `admin/entity-detail-metrics`, newUser._id, 'MerchantAccess', null);
            this.toSignUp();
        }

    } else {
        this.toastr.info('Ese Usuario ya esta registrado', null, {
          timeOut: 1500
        });
        return;
    }
  }

}
