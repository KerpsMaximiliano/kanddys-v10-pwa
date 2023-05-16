import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { ItemOrder, OrderStatusDeliveryType } from 'src/app/core/models/order';
import { OrderService } from 'src/app/core/services/order.service';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';
import { environment } from 'src/environments/environment';
import { LinksDialogComponent } from '../links-dialog/links-dialog.component';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { base64ToBlob, fileToBase64 } from 'src/app/core/helpers/files.helpers';
import { formatID } from 'src/app/core/helpers/strings.helpers';

@Component({
  selector: 'app-order-info',
  templateUrl: './order-info.component.html',
  styleUrls: ['./order-info.component.scss'],
})
// No se está usando
export class OrderInfoComponent implements OnInit {
  @ViewChild('orderQrCode', { read: ElementRef }) orderQrCode: ElementRef;

  URI: string = environment.uri;
  @Input() order: ItemOrder;
  link: string;
  statusList: OrderStatusDeliveryType[] = [
    'in progress',
    'pending',
    'pickup',
    'shipped',
    'delivered',
  ];

  orderDeliveryStatus = this.orderService.orderDeliveryStatus;
  formatId = formatID;

  constructor(
    public router: Router,
    public dialogRef: DialogRef,
    private orderService: OrderService,
    private ngNavigatorShareService: NgNavigatorShareService,
    private matBottomSheet: MatBottomSheet,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.link = `${this.URI}/ecommerce/order-detail/${this.order._id}`;
  }

  // share() {
  //   this.ngNavigatorShareService.share({
  //     title: '',
  //     url: this.link,
  //   });
  //   this.dialogRef.close();
  // }

  share() {
    const link = `${this.URI}/ecommerce/order-detail/${this.order._id}`;
    this.matBottomSheet.open(LinksDialogComponent, {
      data: [
        {
          title: `Vista e interfaz con toda la info`,
          options: [
            {
              title: 'Ver como lo verá el visitante',
              callback: () => {
                this.router.navigate(
                  [`/ecommerce/order-detail/${this.order._id}`],
                  { queryParams: { redirectTo: this.router.url } }
                );
              },
            },
            {
              title: 'Compartir el Link de esta sola factura',
              callback: () => {
                this.ngNavigatorShareService.share({
                  title: '',
                  url: link,
                });
              },
            },
            {
              title: 'Copiar el Link de esta sola factura',
              callback: () => {
                this.clipboard.copy(link);
                this.snackBar.open('Enlace copiado en el portapapeles', '', {
                  duration: 2000,
                });
              },
            },
            {
              title: 'Descargar el qrCode de esta sola factura',
              callback: () => this.downloadQr(),
            },
          ],
        },
        {
          title: `Opciones para el mensajero`,
          options: [
            {
              title: 'Compartir el Link',
              callback: () => {
                this.ngNavigatorShareService.share({
                  title: '',
                  url: `${this.URI}/ecommerce/order-process/${this.order.items[0].saleflow.merchant._id}?view=delivery`,
                });
              },
            },
            {
              title: 'Copiar el Link',
              callback: () => {
                this.clipboard.copy(
                  `${this.URI}/ecommerce/order-process/${this.order.items[0].saleflow.merchant._id}?view=delivery`
                );
                this.snackBar.open('Enlace copiado en el portapapeles', '', {
                  duration: 2000,
                });
              },
            },
          ],
        },
        {
          title: `Opciones para quien prepara la orden`,
          options: [
            {
              title: 'Compartir el Link',
              callback: () => {
                this.ngNavigatorShareService.share({
                  title: '',
                  url: `${this.URI}/ecommerce/order-process/${this.order.items[0].saleflow.merchant._id}?view=assistant`,
                });
              },
            },
            {
              title: 'Copiar el Link',
              callback: () => {
                this.clipboard.copy(
                  `${this.URI}/ecommerce/order-process/${this.order.items[0].saleflow.merchant._id}?view=assistant`
                );
                this.snackBar.open('Enlace copiado en el portapapeles', '', {
                  duration: 2000,
                });
              },
            },
          ],
        },
      ],
    });
    this.dialogRef.close();
  }

  downloadQr() {
    const parentElement =
      this.orderQrCode.nativeElement.querySelector('img').src;
    let blobData = base64ToBlob(parentElement);
    if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
      //IE
      (window.navigator as any).msSaveOrOpenBlob(
        blobData,
        this.formatId(this.order.dateId)
      );
    } else {
      // chrome
      const blob = new Blob([blobData], { type: 'image/png' });
      const url = window.URL.createObjectURL(blob);
      // window.open(url);
      const link = document.createElement('a');
      link.href = url;
      link.download = this.formatId(this.order.dateId);
      link.click();
    }
  }
}
