import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { SaleFlow } from 'src/app/core/models/saleflow';
import {Item,
   ItemCategory,
   ItemCategoryHeadline,
   ItemPackage,
 } from 'src/app/core/models/item';
import {
  SearchCountryField,
  CountryISO,
  PhoneNumberFormat,
} from 'ngx-intl-tel-input';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { ToastrService } from 'ngx-toastr';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ShowItemsComponent } from 'src/app/shared/dialogs/show-items/show-items.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

   saleflowData: SaleFlow;
   auth: 'phone' | 'password' | 'order';
   merchantNumber: string = '(000) 000-0000';
   loggin: boolean;
   signUp: boolean;
   OTP: boolean = false;
   authCode: boolean = false;
   sneaky: string;
   userID: string;
   items: Item[] | ItemPackage[]= [];
   itemCartAmount: number;
   phoneNumber = new FormControl('', [Validators.required, Validators.minLength(10)]);
   password = new FormControl('', [Validators.required, Validators.minLength(3)]);
   firstName = new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-z\s\u00E0-\u00FC\u00f1\u00d1]*$/i)]);
   lastName = new FormControl('', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-z\s\u00E0-\u00FC\u00f1\u00d1]*$/i)]);
   email = new FormControl('', [Validators.minLength(12)]);
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
    private toastr: ToastrService,
    private header: HeaderService,
    private dialog: DialogService,
    private saleflow: SaleFlowService,
    private item: ItemsService,
    ) { }

  async ngOnInit(): Promise<void> {
    const phone = this.route.snapshot.queryParamMap.get('phone');
    const SaleFlow = this.route.snapshot.queryParamMap.get('saleflow');
    this.auth = this.route.snapshot.queryParamMap.get('auth') as 'phone' | 'password' | 'order';

    if(this.auth === 'password') {
        lockUI();

        if(phone) {
            const exists = await this.authService.checkUser(phone);

            if(exists){
               const {countryIso, nationalNumber} = await this.authService.getPhoneInformation(phone);
               this.phoneNumber.setValue(nationalNumber);
               this.CountryISO = countryIso;
               this.loggin = true;
               this.merchantNumber = phone;
               // this.getMerchants();
               console.log(this.saleflowData);
                 
            }else{
                unlockUI();
                this.toastr.info('Número no registrado o inválido 2', null, {
                timeOut: 1500
                });
            }           

            unlockUI();
        } else {
            this.loggin = false;
            unlockUI();
        }

    } else if(this.auth === 'order'){
      lockUI();

      this.header.flowId = SaleFlow;
      this.header.orderId = null;
      this.saleflowData = await this.header.fetchSaleflow(SaleFlow);
      // console.log(this.saleflowData);
      let productData: Item[] = this.header.getItems(this.saleflowData._id);
      this.itemCartAmount = productData?.length;
      this.items = productData;

      if(phone) {
          const exists = await this.authService.checkUser(phone);

          if(exists){
             const {countryIso, nationalNumber} = await this.authService.getPhoneInformation(phone);
             this.phoneNumber.setValue(nationalNumber);
             this.CountryISO = countryIso;
             this.loggin = true;
             this.merchantNumber = phone;
               
          }else{
             unlockUI();
             this.toastr.error('Número no registrado o inválido ', null, {
             timeOut: 1500
             });
             return
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
    this.OTP = false;
    this.authCode = false;
    this.phoneNumber.reset();
    this.password.reset();
    this.merchantNumber = '';
  }

  toSignUp(){
    this.signUp = !this.signUp;
    this.OTP = false;
    this.authCode = false;
    this.phoneNumber.reset();
    this.password.reset();
    this.firstName.reset();
    this.lastName.reset();
    this.email.reset();
  }

  async toPassword(){
   this.password.reset();
   this.signUp = false;
   this.OTP = false;
   this.loggin = true;
   this.authCode = true;
   const toVerify = await this.authService.checkUser(this.merchantNumber);
      if(toVerify){
         this.userID = toVerify._id;
         // console.log(this.userID);
      } else {
         this.signUp = false;
         this.loggin = false;
         this.toastr.error('algo no funco', null, {timeOut: 2000});
      }
  }

  async submitPhone(){
    if(this.phoneNumber.value != undefined || null){
    const validUser = await this.authService.checkUser(this.phoneNumber.value.e164Number.split('+')[1]);
    
        if(validUser){
            try{
                const {countryIso, nationalNumber} = await this.authService.getPhoneInformation(this.phoneNumber.value.e164Number);
                this.merchantNumber = this.phoneNumber.value.e164Number.split('+')[1];
                this.userID = validUser._id;
                this.phoneNumber.setValue(nationalNumber);
                this.CountryISO = countryIso;
                this.loggin = true;
               
            } catch (error) {
                console.log(error);
            }
        } else {
            this.toastr.error('Número no registrado', null, {timeOut: 2000});
            return
        }
    } else {
        this.toastr.error('Introduzca un número válido', null, {timeOut: 2000});
        return
    }
  };

  async signIn(){
    if (this.password.invalid){
        this.toastr.error('Error en campo de contraseña', null, {
          timeOut: 1500
        });
        
    } else if(this.OTP) {
      const checkOTP = await this.authService.verify(this.password.value, this.userID);

      if(!checkOTP){
         this.toastr.error('Código inválido', null, {timeOut: 2000})
         return
      } else{
         this.toastr.info('Código válido', null, {timeOut: 2000});
         this.router.navigate([`admin/entity-detail-metrics`]); 
      }
      
    } else if(this.authCode){
      const authCoded =  await this.authService.analizeMagicLink(this.password.value);

      if(!authCoded){
         this.toastr.error('Código inválido', null, {timeOut: 2000})
         return
      } else {
         this.toastr.info('Código válido', null, {timeOut: 2000});
         const sneak = await this.authService.signin(this.merchantNumber, this.sneaky, true);
         if(sneak) this.router.navigate([`admin/entity-detail-metrics`]);
         else console.log('Error');
      }

    } else {
        const signin = await this.authService.signin( this.merchantNumber, this.password.value, true );

        if(!signin){
            this.toastr.error('Contraseña invalida o usuario no verficado', null, {
              timeOut: 2500
            });
            console.log('error');

            return
        }
        this.router.navigate([`admin/entity-detail-metrics`]);  
    }       
  }

  async generateTOP(){
   const OTP = await this.authService.generateOTP(this.merchantNumber);
      if(OTP){
         this.toastr.info('Código enviado al número', null, {timeOut: 2000});
         this.OTP = true;
      }
  }

  async signMeUp(){
    if(this.phoneNumber === null || undefined) {
        this.toastr.info('Por favor, introduzca un número válido', null, {timeOut: 2000});
        return
      }

    this.merchantNumber = this.phoneNumber.value.e164Number.split('+')[1];

    const valid = await this.authService.checkUser(this.merchantNumber);

    if(!valid) {
        const newUser = await this.authService.signup( 
         { phone: this.merchantNumber, 
         password: this.password.value, 
         name: this.firstName.value,
         lastname: this.lastName.value, 
         email: this.email.value && this.email.valid ? this.email.value : undefined}, 
         'none', 
         null, 
         false );

        if(!newUser){
            console.log('Algo salio mal');
            return;
        } else {
            // console.log(newUser);
            this.sneaky = this.password.value;
            await this.authService.generateMagicLink(this.merchantNumber, `admin/entity-detail-metrics`, newUser._id, 'MerchantAccess', null);
            this.toPassword();
            this.toastr.info('¡Usuario registrado con exito!', null, {timeOut: 2000});
        }

    } else {
      this.toastr.info('Ese Usuario ya esta registrado', null, {
        timeOut: 2200
      });
      return;
    }
  }
  
 showShoppingCartDialog = () => {
   this.dialog.open(ShowItemsComponent, {
     type: 'flat-action-sheet',
     props: {
       orderFinished: true,
       products: this.items
     },
     customClass: 'app-dialog',
     flags: ['no-header'],
   });
 };

}
