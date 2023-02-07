import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Clipboard } from '@angular/cdk/clipboard';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { formatID } from 'src/app/core/helpers/strings.helpers';
import { NgNavigatorShareService } from 'ng-navigator-share';

@Component({
  selector: 'app-links-dialog',
  templateUrl: './links-dialog.component.html',
  styleUrls: ['./links-dialog.component.scss'],
})
export class LinksDialogComponent implements OnInit {
  constructor(
    private _bottomSheetRef: MatBottomSheetRef,
    private clipboard: Clipboard,
    private toastr: ToastrService,
    private router: Router,
    private ngNavigatorShareService: NgNavigatorShareService
  ) {}

  URI: string = environment.uri;
  @ViewChild('qrcode', { read: ElementRef }) qr: ElementRef;
  link: string = 'https://www.google.com/';
  link2: string = 'https://fast.com/es/';

  ngOnInit(): void {}

  options1: string[] = [
    'Ver como lo verá el visitante',
    'Compartir el Link',
    'Copiar el Link',
    'Descargar el qrCode',
  ];
  options2: string[] = [
    'Descargar el qrCode del admin',
    'Posibilidades de "ADS" para promocionarlo',
  ];

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }

  async handleClick(option: string) {
    switch (option) {
      case 'Descargar el qrCode':
        this.downloadQr();
        break;
      case 'Descargar el qrCode del admin':
        this.downloadQr();
        break;
      case 'Copiar el Link':
        this.clipboard.copy(
          `${this.URI}/${window.location.href.split('/').slice(3).join('/')}`
        );
        this.toastr.info('Enlace copiado en el portapapeles', null, {
          timeOut: 2000,
        });
        break;
      case 'Ver como lo verá el visitante':
        this.router.navigate([`/ecommerce/arepera-que-molleja/store`]);
        this._bottomSheetRef.dismiss();
        break;
      case 'Compartir el Link':
        this.share();
        break;
    }
  }
  downloadQr() {
    const parentElement = this.qr.nativeElement.querySelector('img').src;
    let blobData = this.convertBase64ToBlob(parentElement);
    if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
      //IE
      (window.navigator as any).msSaveOrOpenBlob(blobData, 'Qrcode');
    } else {
      // chrome
      const blob = new Blob([blobData], { type: 'image/png' });
      const url = window.URL.createObjectURL(blob);
      // window.open(url);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Qrcode';
      link.click();
    }
  }

  private convertBase64ToBlob(Base64Image: any) {
    // SPLIT INTO TWO PARTS
    const parts = Base64Image.split(';base64,');
    // HOLD THE CONTENT TYPE
    const imageType = parts[0].split(':')[1];
    // DECODE BASE64 STRING
    const decodedData = window.atob(parts[1]);
    // CREATE UNIT8ARRAY OF SIZE SAME AS ROW DATA LENGTH
    const uInt8Array = new Uint8Array(decodedData.length);
    // INSERT ALL CHARACTER CODE INTO UINT8ARRAY
    for (let i = 0; i < decodedData.length; ++i) {
      uInt8Array[i] = decodedData.charCodeAt(i);
    }
    // RETURN BLOB IMAGE AFTER CONVERSION
    return new Blob([uInt8Array], { type: imageType });
  }

  formatId(dateId: string) {
    return formatID(dateId);
  }

  async share() {
    const link = `${this.URI}/ecommerce/arepera-que-molleja/store`;

    await this.ngNavigatorShareService
      .share({
        title: '',
        url: link,
      })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
