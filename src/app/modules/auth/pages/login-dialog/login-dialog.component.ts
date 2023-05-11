import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { Session } from 'src/app/core/models/session';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';
import { MagicLinkEntities, User, UserInput } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';

export interface LoginDialogData {
  magicLinkData?: {
    redirectionRoute: string;
    redirectionRouteId: string;
    entity: MagicLinkEntities;
    redirectionRouteQueryParams: any;
    attachments?: any;
  };
  loginType?: 'full' | 'phone';
  extraUserInput?: UserInput;
}

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.scss'],
})
export class LoginDialogComponent implements OnInit {
  @ViewChild('stepper') private myStepper: MatStepper;
  CountryISO = CountryISO.DominicanRepublic;
  preferredCountries: CountryISO[] = [
    CountryISO.DominicanRepublic,
    CountryISO.UnitedStates,
  ];
  PhoneNumberFormat = PhoneNumberFormat;
  user: User;
  newUser = false;
  inputType: 'phone' | 'email' = 'phone';
  phoneNumber: FormControl;
  email: FormControl;
  passwordStep: FormGroup;
  codeStep: FormGroup;
  sentCode = false;
  userStep: 'phone' | 'password' | 'code' = 'phone';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: LoginDialogData,
    private dialogRef: MatDialogRef<LoginDialogComponent>,
    private _formBuilder: FormBuilder,
    private authService: AuthService,
    private matSnackBar: MatSnackBar
  ) {}

  ngOnInit() {
    if (!this.data?.loginType) {
      this.data = {
        loginType: 'full',
        ...this.data,
      };
    }
    this.phoneNumber = this._formBuilder.control('', [
      Validators.required,
      Validators.minLength(10),
      Validators.pattern(/[\S]/),
    ]);
    this.email = this._formBuilder.control('', [
      Validators.required,
      Validators.email,
      Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
    ]);
    this.passwordStep = this._formBuilder.group({
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/[\S]/),
        ],
      ],
    });
    this.codeStep = this._formBuilder.group({
      code: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/[\S]/),
        ],
      ],
    });
  }

  changeInputType() {
    this.inputType = this.inputType === 'email' ? 'phone' : 'email';
    this.email.reset();
    this.phoneNumber.reset();
  }

  async submitPhone() {
    if (this.inputType === 'email' && this.email.invalid) {
      this.matSnackBar.open('Introduce un correo electrónico válido', '', {
        duration: 2000,
      });
      return;
    }
    if (this.inputType === 'phone' && this.phoneNumber.invalid) {
      this.matSnackBar.open('Introduce un número válido', '', {
        duration: 2000,
      });
      return;
    }
    lockUI();
    const emailOrPhone =
      this.inputType === 'email'
        ? this.email.value
        : this.phoneNumber.value.e164Number.split('+')[1];
    this.user = await this.authService.checkUser(emailOrPhone);
    if (this.inputType === 'email' && !this.user) {
      unlockUI();
      this.matSnackBar.open(
        'Correo electrónico no registrado. Regístrate con tu número telefónico',
        '',
        {
          duration: 5000,
        }
      );
      return;
    }
    // const phone = this.phoneNumber.value.e164Number.split('+')[1] as string;
    this.userStep = 'password';
    if (this.inputType === 'phone' && !this.user) {
      this.newUser = true; // Valor asignado para verificar si hace refresh
      // El número de teléfono ingresado no existe, creando usuario
      if (this.data?.loginType === 'phone') {
        // Signup rápido, sin ingresar datos
        const newUser = await this.authService.signup(
          {
            phone: emailOrPhone,
            password: emailOrPhone.slice(-4),
            ...this.data.extraUserInput,
          },
          'none',
          null,
          false
        );
        this.matSnackBar.open('Usuario registrado exitosamente', '', {
          duration: 2000,
        });
        this.dialogRef.close({ user: newUser, new: true });
        return;
      }
      console.log('el usuario no existe, ir a ingresar password');
      // SignUp con todos los datos
      this.myStepper.next();
      this.passwordStep.get('password').patchValue(emailOrPhone.slice(-4));
      unlockUI();
      return;
    }
    // El usuario existe pero no está validado
    if (!this.user.validatedAt) {
      console.log('El usuario existe pero no está validado');
      await this.generateOTP(emailOrPhone);
      unlockUI();
      return;
    }
    // El usuario existe
    if (this.data?.loginType === 'phone') {
      this.matSnackBar.open('Usuario validado exitosamente', '', {
        duration: 2000,
      });
      this.dialogRef.close({ user: this.user, new: false });
      return;
    }

    console.log(this.data);
    if (this.data?.magicLinkData) {
      console.log('si hay magic link data');
      // Si hay magicLinkData, enviar el magic link con los datos
      await this.authService.generateMagicLink(
        emailOrPhone,
        this.data.magicLinkData.redirectionRoute,
        this.data.magicLinkData.redirectionRouteId,
        this.data.magicLinkData.entity,
        this.data.magicLinkData.redirectionRouteQueryParams,
        this.data.magicLinkData.attachments
      );
      this.matSnackBar.open(
        `Se ha enviado un link de acceso a tu ${
          this.inputType === 'phone' ? 'teléfono' : 'correo electrónico'
        }`,
        '',
        {
          duration: 5000,
        }
      );
    }
    this.myStepper.next();
    // if(this.phoneCallback) this.phoneCallback();

    // this.phoneStep.get('phoneNumber').setValue(nationalNumber);
    // this.CountryISO = countryIso;
    unlockUI();
  }

  async submitCodePassword() {
    if (this.passwordStep.get('password').invalid) {
      this.matSnackBar.open('Introduce un código o contraseña válido', '', {
        duration: 2000,
      });
      return;
    }
    const password =
      this.userStep === 'password'
        ? this.passwordStep.get('password').value
        : this.codeStep.get('code').value;
    let session: Session;

    // Si no existe usuario, crea uno
    if (!this.user) return this.signUp();

    // El usuario existe
    if (!this.user.validatedAt) {
      console.log('no validado');
      // El usuario existe pero no está validado
      const authCoded = await this.authService.verify(
        password,
        this.user._id,
        false
      );
      if (!authCoded) {
        // Código de verificación inválido
        this.matSnackBar.open('Código inválido', '', {
          duration: 2000,
        });
        this.passwordStep.get('password').reset();
        return;
      }
      console.log(authCoded);
      // Código de verificación válido
      this.user.validatedAt = 'something'; // Asignando valor a validatedAt para indicar que ya se validó
      if (!this.newUser) {
        console.log('hizo refresh y no ingreso el codigo');
        // En caso de refresh, lleva a ingresar la contraseña
        this.userStep = 'code';
        setTimeout(() => {
          this.myStepper.next();
        }, 50);
        return;
      }
      console.log('es nuevo y no ha hecho refresh');
      // sin hacer refresh, hace signin luego de ingresar la clave
      const session = await this.authService.signin(
        this.user.phone,
        this.passwordStep.get('password').value,
        true
      );
      if (session) {
        this.matSnackBar.open('Inicio de sesión exitoso', '', {
          duration: 3000,
        });
        this.dialogRef.close({ session, new: true });
      }
      return;
    }
    if (password.length === 4 || password.length === 6) {
      // Verificando el código de magic link (código de 4 o 6 dígitos)
      console.log('analizando magic link');
      session = (await this.authService.analizeMagicLink(password))?.session;
    }
    if (!session) {
      console.log('analizando contraseña');
      // Código del magic link inválido, verificando por contraseña
      session = await this.authService.signin(this.user.phone, password, true);
    }

    if (!session) {
      // Código y contraseña inválidos
      this.matSnackBar.open('Código o contraseña incorrecto', '', {
        duration: 2000,
      });
      this.codeStep.get('code').reset();
      return;
    }
    // Código o contraseña válido
    this.matSnackBar.open('Inicio de sesión exitoso', '', {
      duration: 3000,
    });
    this.dialogRef.close({ session, new: false });
  }

  async signUp() {
    const phone = this.phoneNumber.value.e164Number.split('+')[1];
    const password = this.passwordStep.get('password').value;
    if (!this.user) {
      console.log('usuario nuevo, creando...');
      this.user = await this.authService.signup(
        {
          phone,
          password,
          ...this.data.extraUserInput,
        },
        'none',
        null,
        false
      );
      await this.generateOTP(phone);
      this.userStep = 'code';
      this.matSnackBar.open(
        '¡Usuario registrado con exito! Se ha enviado un código para verificar',
        '',
        {
          duration: 5000,
        }
      );
      setTimeout(() => {
        this.myStepper.next();
      }, 50);
      return;
    }
    if (!this.user.validatedAt) {
      console.log('viendo si llega aqui');
      await this.generateOTP(phone);
      // this.userStep = 'code';
    }
  }

  async generateOTP(emailOrPhone: string) {
    const OTP = await this.authService.generateOTP(emailOrPhone);
    if (OTP) {
      this.matSnackBar.open('¡Se ha enviado un código para verificar', '', {
        duration: 5000,
      });
    }
  }
}