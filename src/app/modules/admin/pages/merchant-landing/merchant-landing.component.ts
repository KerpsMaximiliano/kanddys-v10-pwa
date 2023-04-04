import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { MerchantStepperFormComponent } from 'src/app/shared/components/merchant-stepper-form/merchant-stepper-form.component';
import { Item, ItemImageInput, ItemInput } from 'src/app/core/models/item';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CommunitiesService } from 'src/app/core/services/communities.service';

@Component({
  selector: 'app-merchant-landing',
  templateUrl: './merchant-landing.component.html',
  styleUrls: ['./merchant-landing.component.scss'],
})
export class MerchantLandingComponent implements OnInit {
  env: string = environment.assetsUrl;
  allCommunities;

  infoCards = [
    {
      bg: '#fff',
      title: 'Recibe el dinero de lo vendido',
      subtitle:
        'Vende tu producto por WhatsApp y las redes sociales, recibe el pago por transferencia, tarjeta de crédito, paypal',
      bottom: true,
      bottomTextBold: '87 DoCoins',
      bottomText: 'US $0.87 por factura para mantener el cloud',
      img: '../assets/images/noimage.png',
    },
    {
      bg: '#fff',
      title: 'Categorías de la vitrina',
      subtitle:
        'Vende tu producto por WhatsApp y las redes sociales, recibe el pago por transferencia, tarjeta de crédito, paypal',
      bottom: true,
      bottomTextBold: '3 DoCoins',
      bottomText: 'US $0.03 por factura para mantener el cloud',
      img: '../assets/images/noimage.png',
    },
    {
      bg: '#fff',
      title: 'Colecciones de Ofertas',
      subtitle:
        'Con esta funcionalidad, podrás organizar y segmentar tus productos de manera más eficiente…',
      bottom: false,
      img: '../assets/images/noimage.png',
    },
    {
      bg: '#fff',
      title: 'Programa de Recompensas',
      subtitle:
        'Con esta funcionalidad, podrás organizar y segmentar tus productos de manera más eficiente…',
      bottom: false,
      img: '../assets/images/noimage.png',
    },
    {
      bg: '#fff',
      title: 'Clubes & Comunidades',
      subtitle:
        'Con esta funcionalidad, podrás organizar y segmentar tus productos de manera más eficiente…',
      bottom: false,
      img: '../assets/images/noimage.png',
    },
    {
      bg: '#fff',
      title: 'Comisiones & Colaboraciones',
      subtitle:
        'Con esta funcionalidad, podrás organizar y segmentar tus productos de manera más eficiente…',
      bottom: false,
      img: '../assets/images/noimage.png',
    },
  ];

  constructor(
    public dialog: MatDialog,
    public _MerchantsService: MerchantsService,
    private _ItemsService: ItemsService,
    private _SaleflowService: SaleFlowService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  async ngOnInit() {}

  async openDialog() {
    this.router.navigate(
      [
        `/ecommerce/arepera-que-molleja/article-detail/item/63f6a229e2f51cbd1a4f3f71`,
      ],
      { queryParams: { signup: 'true' } }
    );
    // let dialogRef = this.dialog.open(MerchantStepperFormComponent);
    // dialogRef
    //   .afterClosed()
    //   .subscribe(
    //     async (result: {
    //       name: string;
    //       lastname: string;
    //       email: string;
    //       phone: number;
    //     }) => {
    //       if (!result) return;
    //       const { name, lastname, email, phone } = result;

    //       const newMerchantData = {
    //         name: name,
    //         lastname: lastname,
    //         email: email,
    //         phone: phone,
    //       };
    //       console.log(newMerchantData);

    //       this.snackBar.open('Listo papa!', '', {
    //         duration: 5000,
    //       });
    //       unlockUI();
    //     }
    //   );
  }
}
