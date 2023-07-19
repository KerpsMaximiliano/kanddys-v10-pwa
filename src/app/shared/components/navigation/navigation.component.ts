import {
  Component,
  OnInit,
  ViewChild,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { Quotation } from 'src/app/core/models/quotations';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { QuotationsService } from 'src/app/core/services/quotations.service';
import {
  LoginDialogComponent,
  LoginDialogData,
} from 'src/app/modules/auth/pages/login-dialog/login-dialog.component';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit {
  @Input() opened: boolean;
  @Output() closed = new EventEmitter();
  quotations: Array<Quotation> = [];
  tabs: Array<{
    headerText: string;
    text: string;
    active?: boolean;
    links: Array<any>;
  }> = [
    {
      headerText: 'Proveedor de ✨',
      text: 'Yo',
      active: true,
      links: [
        {
          text: 'Registrar nuevos afiliados 📒',
          routerLink: ['/admin/merchants-entry'],
        },
      ],
    },
    {
      headerText:
        'Vende online. Cotiza y ordena al suplidor local que te convenga',
      text: 'Floristerias',
      active: false,
      links: [
        {
          text: 'Mi KiosKo 💰',
          routerLink: ['/admin/dashboard'],
        },
        {
          text: 'Lo vendido 🧾',
          routerLink: ['/admin/reports'],
        },
        {
          text: 'Progreso de facturas ⏩',
          routerLink: ['/admin/order-slides'],
        },
        {
          text: 'Vista de compradores 👀',
          routerLink: [
            '/ecommerce',
            this.merchantsService.merchantData?.slug ||
              this.headerService.saleflow?.merchant.slug,
            'store',
          ],
        },
        {
          text: 'Mis suplidores (compras y cotizaciones)',
          routerLink: ['/admin/item-selector'],
        },
      ],
    },
    {
      headerText: 'Cotiza y vende a Floristerías fácilemente.',
      text: 'Suplidores',
      active: false,
      links: [
        {
          text: 'Lo que vendo a Floristerias 🏷️',
          routerLink: ['/admin/merchants-entry'],
        },
      ],
    },
  ];

  constructor(
    private authService: AuthService,
    public merchantsService: MerchantsService,
    public headerService: HeaderService,
    private quotationsService: QuotationsService,
    private router: Router,
    private matDialog: MatDialog
  ) {}

  async ngOnInit() {
    if (this.headerService.navigationTabState)
      this.tabs = this.headerService.navigationTabState;

    let activeTabIndex = 0;

    this.tabs.forEach((tab, tabIndex) => {
      const isCurrentURLInCurrentTab = tab.links.find((link) => {
        return (
          JSON.stringify(link.routerLink.join('/')) ===
          JSON.stringify(this.router.url)
        );
      });

      if (isCurrentURLInCurrentTab) activeTabIndex = tabIndex;
    });

    this.tabs[activeTabIndex].active = true;

    this.quotations = await this.quotationsService.quotations({
      findBy: {
        merchant: this.merchantsService.merchantData._id,
      },
      options: { limit: -1 },
    });

    if (this.quotations.length > 0) {
      this.tabs[1].links[this.tabs[1].links.length - 1].routerLink = [
        '/admin/quotations',
      ];
    }
  }

  signout() {
    this.authService.signouttwo();
  }

  changeTab(tabIndex: number) {
    this.tabs[tabIndex].active = true;

    this.tabs.forEach((tab, index) => {
      if (index !== tabIndex) tab.active = false;
    });

    this.headerService.navigationTabState = this.tabs;
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

  @ViewChild('sidenav') sidenav: MatSidenav;

  close() {
    this.sidenav.close();
  }
}
