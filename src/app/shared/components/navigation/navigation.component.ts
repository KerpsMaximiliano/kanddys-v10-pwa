import {
  Component,
  OnInit,
  ViewChild,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { Item } from 'src/app/core/models/item';
import { Quotation } from 'src/app/core/models/quotations';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { QuotationsService } from 'src/app/core/services/quotations.service';
import { NgNavigatorShareService } from 'ng-navigator-share';
import {
  LoginDialogComponent,
  LoginDialogData,
} from 'src/app/modules/auth/pages/login-dialog/login-dialog.component';
import { SwiperOptions } from 'swiper';
import { FormComponent, FormData } from '../../dialogs/form/form.component';
import { FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ClubDialogComponent } from 'src/app/shared/dialogs/club-dialog/club-dialog.component';
import { OptionsMenuComponent } from 'src/app/shared/dialogs/options-menu/options-menu.component';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import {
  OptionsDialogComponent,
  OptionsDialogTemplate,
} from 'src/app/shared/dialogs/options-dialog/options-dialog.component';
import { GeneralFormSubmissionDialogComponent } from 'src/app/shared/dialogs/general-form-submission-dialog/general-form-submission-dialog.component';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { SelectRoleDialogComponent } from '../../dialogs/select-role-dialog/select-role-dialog.component';
import { MessageDialogComponent } from '../../dialogs/message-dialog/message-dialog.component';
import { SpecialDialogComponent } from '../../dialogs/special-dialog/special-dialog.component';
import { CompareDialogComponent } from '../../dialogs/compare-dialog/compare-dialog.component';
interface NavigationTab {
  headerText: string;
  text: string;
  active?: boolean;
  links?: Array<{
    text: string;
    routerLink: Array<string>;
    possibleRedirection?: Array<string>;
    queryParams?: Record<string, any>;
    possibleRedirectionQueryParams?: Record<string, any>;
    hardcodedURL?: string;
    linkName: string;
    authorization?: boolean;
    isDummy?: boolean;
  }>;
  textList?: Array<{
    title?: string;
    content: string;
  }>;
  footer?: {
    button: {
      text: string;
      callback: any;
    };
    swiper?: {
      title: string;
      slides: Array<{
        content: string;
      }>;
    };
  };
}

interface Tabs {
  text: string;
  subTabs?: Array<{
    text: string;
    active: boolean;
    content?: string[];
  }>;
  active?: boolean;
}

interface underTab {
  text: string;
  subTabs?: Array<{
    text: string;
    active: boolean;
    content?: string[];
  }>;
  active?: boolean;
}

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit {
  @Input() opened: boolean;
  @Output() closed = new EventEmitter();
  quotations: Array<Quotation> = [];
  loggedUser: boolean = false;
  isCurrentUserASeller: boolean = false;
  isCurrentUserASupplier: boolean = false;
  isCurrentUserAnAdmin: boolean = false;
  activeTabIndex: number = 0;
  assetsFolder: string = environment.assetsUrl;
  URI: string = environment.uri;

  tabIndex = 0;
  userID = '';
  isVendor = false;
  isProvider = false;
  mainTitle = 'HERRAMIENTAS GRATIS  PARA PROVEEDORES';
  curRole = 0;
  isOpen = false;
  list = [
    {
      text: '\"Daliah, nos impulsa a avanzar para no quedarnos atrás\"',
      avatar: '',
      name: 'José Miguel Caffaro',
      role: 'Proveedor de flores frescas, follajes y bases'
    },
    {
      text: '\"Daliah, nos impulsa a avanzar para no quedarnos atrás\"',
      avatar: '',
      name: 'José Miguel Caffaro',
      role: 'Proveedor de flores frescas, follajes y bases'
    },
    {
      text: '\"Daliah, nos impulsa a avanzar para no quedarnos atrás\"',
      avatar: '',
      name: 'José Miguel Caffaro',
      role: 'Proveedor de flores frescas, follajes y bases'
    }
  ]
  tabarIndex = 0

  emailDialogRef: MatDialogRef<FormComponent, any> = null;

  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    freeMode: false,
    spaceBetween: 0,
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true,
    },
  };

  constructor(
    private authService: AuthService,
    public merchantsService: MerchantsService,
    public headerService: HeaderService,
    private appService: AppService,
    private quotationsService: QuotationsService,
    private itemsService: ItemsService,
    private router: Router,
    private matDialog: MatDialog,
    private translate: TranslateService,
    private snackbar: MatSnackBar,
    private bottomSheet: MatBottomSheet,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private ngNavigatorShareService: NgNavigatorShareService
    ) {
    translate.setDefaultLang('en');
    translate.use('en');
  }

  async ngOnInit() {
    
  }
  openClubDialog() {
    this.bottomSheet.open(ClubDialogComponent, {
      data: {
        title: "",
        styles: {
          fullScreen: true,
        },
        tabIndex: this.tabIndex,
        callback: (e: number) => {
          this.tabIndex = e;
        }
      },
    });
  }

  showDialog() {
    console.log("dafdsasdf")
    const dialogRef = this.dialog.open(SpecialDialogComponent, {});
    const link = `${this.URI}/ecommerce/club-landing`;

    dialogRef.afterClosed().subscribe(role => {
      if (!role) {
        // this.setRole(parseInt(role))
        return
      }
      console.log(role)
      switch (role) {
        case "0":
          this.ngNavigatorShareService.share({
            title: '',
            url: `${link}`,
          });
          break;
        case "1":
          this.ngNavigatorShareService.share({
            title: '',
            url: `${link}`,
          });
          break;
        case "2":
          const message = `Hola, me interesa esta funcionalidad: `;
          const phone = '19188156444';
          window.location.href = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
          break;
        case "3":
          window.location.href = "mailto:"
          break;
        default:
          break;
      }
    });
  }


  setRole(role: number) {
    this.curRole = role;
    switch (role) {
      case 0:
        this.tabIndex = 0;
        break;
      case 1:
        this.tabIndex = 1;
        break;
      case 2:
        this.tabIndex = 1;
        break;
      case 3:
        this.tabIndex = 0;
        break;
      case 4:
        this.tabIndex = 1;
        break;
    }
    this.isOpen = false;
  }

  openDialog() {
    this.bottomSheet.open(ClubDialogComponent, {
      data: {
        title: 'SELECCION DE HERRAMIENTAS',
        styles: {
          fullScreen: true,
        },
        tabIndex: this.tabIndex,
        callback: (e: number) => {
          this.tabIndex = e;
        },
      },
    });
  }

  openMsgDialog() {
    const dialogRef = this.dialog.open(MessageDialogComponent, {});

    dialogRef.afterClosed().subscribe(role => {
      if (!role) {
        // this.setRole(parseInt(role))
        return
      }
      console.log(role)
    });
  }

  share() {
    if (!this.headerService.user) {
      this.openMagicLinkDialog()
    }
    // else this.showDialog()
  }

  enterClub() {
    if(!this.headerService.user) this.openMagicLinkDialog();
    else this.showDialog()
  }

  async openMagicLinkDialog() {
    let fieldsToCreateInEmailDialog: FormData = {
      title: {
        text: 'Correo Electrónico:',
      },
      buttonsTexts: {
        accept: 'Recibir el enlace con acceso',
        cancel: 'Cancelar',
      },
      containerStyles: {
        padding: '35px 23px 38px 18px',
      },
      hideBottomButtons: true,
      fields: [
        {
          name: 'magicLinkEmailOrPhone',
          type: 'email',
          placeholder: 'Escribe el correo electrónico..',
          validators: [Validators.pattern(/[\S]/), Validators.required],
          inputStyles: {
            padding: '11px 1px',
          },
          styles: {
            gap: '0px',
          },
          bottomTexts: [
            {
              text: 'Este correo también sirve para accesar al Club y aprovechar todas las herramientas que se están creando.',
              styles: {
                color: '#FFF',
                fontFamily: 'InterLight',
                fontSize: '19px',
                fontStyle: 'normal',
                fontWeight: '300',
                lineHeight: 'normal',
                marginBottom: '28px',
                marginTop: '36px',
              },
            },
          ],
          submitButton: {
            text: '>',
            styles: {
              borderRadius: '8px',
              background: '#87CD9B',
              padding: '6px 15px',
              color: '#181D17',
              textAlign: 'center',
              fontFamily: 'InterBold',
              fontSize: '17px',
              fontStyle: 'normal',
              fontWeight: '700',
              lineHeight: 'normal',
              position: 'absolute',
              right: '1px',
              top: '8px',
            },
          },
        },
      ],
    };

    this.emailDialogRef = this.dialog.open(FormComponent, {
      data: fieldsToCreateInEmailDialog,
      disableClose: false,
    });

    this.emailDialogRef.afterClosed().subscribe(async (result: FormGroup) => {
      if (result?.controls?.magicLinkEmailOrPhone.valid) {
        // const exists = await this.checkIfUserExists(result?.controls?.magicLinkEmailOrPhone.value);
        // if (exists) {
        //   await this.existingUserLoginFlow(
        //     result?.controls?.magicLinkEmailOrPhone.value,
        //     result?.controls?.magicLinkEmailOrPhone.valid
        //   );
        // } else {
        //   await this.nonExistingUserLoginFlow(
        //     result?.controls?.magicLinkEmailOrPhone.value,
        //     result?.controls?.magicLinkEmailOrPhone.valid
        //   );
        // }
      } else if (result?.controls?.magicLinkEmailOrPhone.valid === false) {
        this.snackbar.open('Datos invalidos', 'Cerrar', {
          duration: 3000,
        });
      }
    });
  }

  async checkIfUserIsAProviderOrASeller() {
    const isTheUserAnAdmin = this.headerService.user?.roles?.find(
      (role) => role.code === 'ADMIN'
    );
    if (isTheUserAnAdmin) {
      this.isCurrentUserAnAdmin = true;
    }

    const normalItemsPagination: PaginationInput = {
      findBy: {
        merchant: this.merchantsService.merchantData._id,
        type: {
          $ne: 'supplier',
        },
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: 1,
        page: 1,
      },
    };

    const supplierItemsPagination: PaginationInput = {
      findBy: {
        merchant: this.merchantsService.merchantData._id,
        type: 'supplier',
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: 1,
        page: 1,
      },
    };

    const [normalItemsPromiseResult, supplierItemsPromiseResult] =
      await Promise.all([
        this.itemsService.listItems(normalItemsPagination),
        this.itemsService.listItems(supplierItemsPagination),
      ]);

    const normalItems: Array<Item> = normalItemsPromiseResult?.listItems;
    const supplierItems: Array<Item> = supplierItemsPromiseResult?.listItems;

    if (supplierItems.length) {
      this.isCurrentUserASupplier = true;
    }

    //If the current user is a supplier, it redirects them to the screen where they may adjust the quotation items prices and stock
    if (normalItems.length) {
      this.isCurrentUserASeller = true;
    }
  }

  startArticleCreationForUnregisteredMerchant() {
    let fieldsToCreate: FormData = {
      fields: [
        {
          label: '¿Cuál es el precio de venta?',
          name: 'price',
          type: 'currency',
          validators: [
            Validators.pattern(/[\S]/),
            Validators.required,
            Validators.min(0.1),
          ],
        },
      ],
      automaticallyFocusFirstField: true,
    };

    const dialogRef = this.matDialog.open(FormComponent, {
      data: fieldsToCreate,
    });

    dialogRef.afterClosed().subscribe((result: FormGroup) => {
      const fields = [
        {
          fieldName: 'pricing',
          fieldKey: 'price',
        },
      ];

      this.itemsService.temporalItemInput = this.itemsService.temporalItemInput
        ? this.itemsService.temporalItemInput
        : {};

      fields.forEach((field) => {
        try {
          if (
            result?.value[field.fieldKey] &&
            result?.controls[field.fieldKey].valid
          ) {
            this.itemsService.createUserAlongWithItem = true;
            this.itemsService.temporalItemInput[field.fieldName] =
              result?.value[field.fieldKey];

            this.headerService.flowRouteForEachPage['florist-creating-item'] =
              this.router.url;
            this.router.navigate(['/ecommerce/item-management']);
          } else if (result?.value[field.fieldKey] !== undefined) {
            this.headerService.showErrorToast();
          }
        } catch (error) {
          console.error(error);
          this.headerService.showErrorToast();
        }
      });
    });
  }

  signout() {
    this.authService.signouttwo();
  }

  login() {
    const matDialogRef = this.matDialog.open(LoginDialogComponent, {
      data: {
        magicLinkData: {
          redirectionRoute: this.router.url,
          entity: 'UserAccess',
        },
      } as LoginDialogData,
    });
    matDialogRef.afterClosed().subscribe(async (value) => {
      if (!value) return;
      if (value.user?._id || value.session.user._id) {
        this.close();
      }
    });
  }

  redirectToLink(link: any) {
    this.headerService.flowRouteForEachPage[link.linkName] = this.router.url;

    if (link.isDummy) {
      const message = `Hola, me interesa esta funcionalidad: ${link.text}`;
      const phone = '19188156444';
      window.location.href = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(
        message
      )}`;
      return;
    }

    this.headerService.flowRoute = this.headerService.buildURL(
      link.routerLink.join('/'),
      link.queryParams ? link.queryParams : null
    );

    this.router.navigate(link.routerLink, {
      queryParams: link.queryParams ? link.queryParams : {},
    });

    this.close();
  }
  showRoleDialog() {
    const dialogRef = this.dialog.open(SelectRoleDialogComponent, {});
    dialogRef.afterClosed().subscribe(role => {
      if (role != undefined) {
        this.setRole(parseInt(role))
        return
      }
      switch (role) {
        case "0":
          
          break;
        case "1":
          
          break;
        case "2":
          
          break;
        case "3":
          
          break;
        case "4":
        
          break;
        case "5":
        
          break;
      
        default:
          break;
      }
    });
  }

  openCompareDialog(){
    this.bottomSheet.open(CompareDialogComponent, {
      data: {
        title: "",
        styles: {
          fullScreen: true,
        },
        tabIndex: this.tabIndex,
        callback: (e: number) => {
          this.tabIndex = e;
        }
      },
    });
  }

  @ViewChild('sidenav') sidenav: MatSidenav;

  close() {
    this.sidenav.close();
  }
}
