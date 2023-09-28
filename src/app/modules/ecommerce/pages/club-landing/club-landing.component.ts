import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HeaderService } from 'src/app/core/services/header.service';
import { SwiperOptions } from 'swiper';
import { GoogleSigninService } from 'src/app/core/services/google-signin.service';
import { environment } from 'src/environments/environment';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { Location } from '@angular/common';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatIcon } from '@angular/material/icon';
import { OptionsMenuComponent } from 'src/app/shared/dialogs/options-menu/options-menu.component';
import { ClubDialogComponent } from 'src/app/shared/dialogs/club-dialog/club-dialog.component';
import { MessageDialogComponent } from 'src/app/shared/dialogs/message-dialog/message-dialog.component';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemsService } from 'src/app/core/services/items.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { GeneralFormSubmissionDialogComponent } from 'src/app/shared/dialogs/general-form-submission-dialog/general-form-submission-dialog.component';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { PaginationInput } from 'src/app/core/models/saleflow';

import {
  FormComponent,
  FormData,
} from 'src/app/shared/dialogs/form/form.component';
import { FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ChangeDetectorRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  OptionsDialogComponent,
  OptionsDialogTemplate,
} from 'src/app/shared/dialogs/options-dialog/options-dialog.component';
import { MerchantsService } from 'src/app/core/services/merchants.service';

import { SelectRoleDialogComponent } from 'src/app/shared/dialogs/select-role-dialog/select-role-dialog.component';
import { SpecialDialogComponent } from 'src/app/shared/dialogs/special-dialog/special-dialog.component';
import { CompareDialogComponent } from 'src/app/shared/dialogs/compare-dialog/compare-dialog.component';
import { Clipboard } from '@angular/cdk/clipboard';
import { base64ToBlob } from 'src/app/core/helpers/files.helpers';
import { AffiliateService } from 'src/app/core/services/affiliate.service';
import { Merchant } from 'src/app/core/models/merchant';
import { AffiliateInput } from 'src/app/core/models/affiliate';

interface ReviewsSwiper {
  title: string;
  slides: Array<{
    content: string;
  }>;
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

@Component({
  selector: 'app-club-landing',
  templateUrl: './club-landing.component.html',
  styleUrls: ['./club-landing.component.scss'],
})
export class ClubLandingComponent implements OnInit, OnDestroy {

  loginflow: boolean = false;

  assetsFolder: string = environment.assetsUrl;
  URI: string = environment.uri;
  openNavigation: boolean = false;
  queryParamsSubscription: Subscription = null;
  routerParamsSubscription: Subscription = null;

  redirectionRoute: string = '/ecommerce/login-landing';
  redirectionRouteId : string | null = null;
  entity: string = "MerchantAccess";
  jsondata: string = JSON.stringify({
    openNavigation: true,
  });

  isFlag = false;
  tabIndex = 0;
  userID = ""
  isVendor = false;
  isProvider = false;
  mainTitle = "HERRAMIENTAS GRATIS  PARA PROVEEDORES"
  isOpen = false;
  curRole = 0;
  tabarIndex = 0;

  user : gapi.auth2.GoogleUser;

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

  activeTabIndex: number = 0;

  swipers: Array<ReviewsSwiper> = [
    {
      title: 'LO QUE MAS LE GUSTA A LAS FLORISTERIAS',
      slides: [
        {
          content:
            '“.. lo de las ventas a través de WhatsApp, mensajes de video para clientes, comunicación de estado de pedidos, y la base de datos de mis clientes segmentada”',
        },
        {
          content:
            '“.. lo fácil que es convertir cotizaciones en compras y mantener un seguimiento de todas las transacciones, me ayuda a gestionar los costos y mi inventario”',
        },
        {
          content:
            '“.. me aseguro de ahorrarme $ al obtener las cotizaciones de múltiples proveedores al mismo tiempo”',
        },
      ],
    },
    {
      title: 'LO QUE MAS LE GUSTA A LOS PROVEEDORES',
      slides: [
        {
          content:
            '“.. es que no hay manera más fácil de cotizarles a las floristerías, me ahorra tiempo y una empleada.”',
        },
        {
          content:
            '“.. las floristerías convierten las cotizaciones en compras con un solo clic y eso simplifica el proceso de venta”',
        },
      ],
    },
  ];
  link: string = this.URI;
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

  emailDialogRef: MatDialogRef<FormComponent, any> = null;
  merchant:string;
  @ViewChild('qrcode', { read: ElementRef }) qrcode: ElementRef;

  constructor(
    public headerService: HeaderService,
    private ngNavigatorShareService: NgNavigatorShareService,
    private bottomSheet: MatBottomSheet,
    private itemsService: ItemsService,
    private dialogService: DialogService,
    private googleSigninService: GoogleSigninService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private authService: AuthService,
    private merchantsService: MerchantsService,
    private route: ActivatedRoute,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private clipboard: Clipboard,
    private affiliateService: AffiliateService
  ) {}

  async ngOnInit() {
    await this.getMerchantDefault();
    this.queryParamsSubscription = this.route.queryParams.subscribe(
      async ({ affiliateCode }) => {
        if(affiliateCode){
          if(this.merchant){
            const input: AffiliateInput = {
              reference: this.merchant
            }
            await this.affiliateService.createAffiliate(affiliateCode, input);
          }else{
            localStorage.setItem('affiliateCode', affiliateCode);
          }
        }
      }
    );

    


    this.googleSigninService.observable().subscribe((user) => {
      this.user = user;
      console.log(user)
      this.changeDetectorRef.detectChanges();
    })
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

  setRole(role: number) {
    this.curRole = role;
    switch (role) {
      case 0:
        this.tabIndex = 0
        break;
      case 1:
        this.tabIndex = 1
        break;
      case 2:
        this.tabIndex = 1
        break;
      case 3:
        this.tabIndex = 0
        break;  
      default:
        this.tabIndex = 1;
        break;
      }
      this.isOpen = false;
  }

  shareDialog() {
    const dialogRef = this.bottomSheet.open(OptionsMenuComponent, {
      data: {
        title: "Compartir enlace",
        options: [
          {
            value: "Copiar enlace",
            callback: () => {
              this.clipboard.copy(this.link);
              this.snackbar.open("Enlace copiado", "Cerrar", {
                duration: 3000,
              });
            },
          },
          {
            value: "Compartir enlace",
            callback: () => {
              this.ngNavigatorShareService.share({
                title: "Compartir enlace de www.flores.club",
                url: `${this.link}`,
              });
            },
          },
          {
            value: "Enviar por WhatsApp",
            callback: () => {
              const message = `${this.link}`;
              window.location.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
            },
          },
          {
            value: "Enviar por correo electrónico",
            callback: () => {
              window.location.href = `mailto:?body=${this.link}`;
            },
          },
          {
            value: "Descargar QR",
            callback: () => {
              this.downloadQr()
            }
          }
        ]
      },
    });
  }

  showDialog() {
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
          const message = `${link}`;
          const phone = '19188156444';
          window.location.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
          break;
        case "3":
          window.location.href = "mailto:"
          break;
        default:
          break;
      }
    });
  }

  close() {
    // if (this.headerService.user) this.location.back();
    this.openNavigation = true;
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

  redirectToLink(link: any) {
    this.headerService.flowRouteForEachPage[link.linkName] = this.router.url;

    if (link.isDummy) {
      const message = `Hola, me interesa esta funcionalidad: ${link.text}`;
      const phone = '19188156444';
      window.location.href = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
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

  share() {
    if (!this.headerService.user) {
      this.loginflow = true;
    }
  }

  enterClub() {
    if(!this.headerService.user) this.loginflow = true;
    else this.showDialog()
  }

  ngOnDestroy(): void {
    this.queryParamsSubscription.unsubscribe();
  }

  resetLoginDialog(event) {
    console.log('fire', event)
    this.loginflow = false;
  }

  downloadQr() {
    const parentElement =
      this.qrcode.nativeElement.querySelector('img').src;
    let blobData = base64ToBlob(parentElement);
    if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
      //IE
      (window.navigator as any).msSaveOrOpenBlob(blobData, 'Landing QR Code');
    } else {
      // chrome
      const blob = new Blob([blobData], { type: 'image/png' });
      const url = window.URL.createObjectURL(blob);
      // window.open(url);
      const link = document.createElement('a');
      link.href = url;
      link.download = "Landing QR Code";
      link.click();
    }
  }
  async getMerchantDefault() {
    const merchantDefault: Merchant = await this.merchantsService.merchantDefault();
    this.merchant = merchantDefault._id;
  }
}
