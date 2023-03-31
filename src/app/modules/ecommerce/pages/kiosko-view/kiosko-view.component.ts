import { Component, OnInit } from '@angular/core';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { LinksDialogComponent } from 'src/app/shared/dialogs/links-dialog/links-dialog.component';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-kiosko-view',
  templateUrl: './kiosko-view.component.html',
  styleUrls: ['./kiosko-view.component.scss'],
})
export class KioskoViewComponent implements OnInit {
  constructor(
    private ngNavigatorShareService: NgNavigatorShareService,
    private router: Router,
    private route: ActivatedRoute,
    private _bottomSheet: MatBottomSheet,
    private snackBar: MatSnackBar,
    private clipboard: Clipboard,
    private merchantsService: MerchantsService,
    private authService: AuthService
  ) {}

  panelOpenState: boolean = false;

  env: string = environment.assetsUrl;

  URI = environment.uri;

  menuOptions = [
    {
      text: 'Crea una factura y mándala al cliente (ESTO ES DUMMY)',
      callback: async () => {},
    },
    {
      text: 'Crea un mensaje virtual (ESTO ES DUMMY)',
      callback: async () => {},
    },
    {
      text: 'Coordina una sesión de tiempo con otra persona (ESTO ES DUMMY)',
      callback: async () => {},
    },
    {
      text: 'Crea una página como Stories o Reels (ESTO ES DUMMY)',
      callback: async () => {},
    },
    {
      text: 'Crea una revista para compilar páginas (ESTO ES DUMMY)',
      callback: async () => {},
    },
  ];

  menuOptions2 = [
    {
      text: 'Exhibe y vende un nuevo artículo propio (ESTO ES DUMMY)',
      callback: async () => {},
    },
    {
      text: 'Cambia el orden de los artículos de tu exhibidor (ESTO ES DUMMY)',
      callback: async () => {},
    },
    {
      text: 'Adiciona categorías y colecciones a tu exhibidor (ESTO ES DUMMY)',
      callback: async () => {},
    },
  ];

  user;

  userId: string;
  async ngOnInit() {
    await this.route.params.subscribe(async (params) => {
      this.userId = params.userId;
      console.log(this.userId);
    });
  }

  togglePanel() {
    this.panelOpenState = !this.panelOpenState;
    console.log(this.panelOpenState);
  }

  goToLinks() {
    this.router.navigate([`ecommerce/links-view/${this.userId}`]);
  }
}
