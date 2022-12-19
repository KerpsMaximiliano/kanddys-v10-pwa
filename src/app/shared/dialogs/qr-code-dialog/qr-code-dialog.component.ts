import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-qr-code-dialog',
  templateUrl: './qr-code-dialog.component.html',
  styleUrls: ['./qr-code-dialog.component.scss'],
})
export class QrCodeDialogComponent implements OnInit {
  env: string = environment.assetsUrl;
  URI: string = environment.uri;
  options: string[] = [
    'Descarga el qrCode del enlace',
    'Copia el enlace de este qrCode',
    'Menú de compartir',
  ];
  link: string = null;
  constructor(
    private ngNavigatorShareService: NgNavigatorShareService,
    private toastr: ToastrService,
    private clipboard: Clipboard
  ) {}

  @ViewChild('qrcode', { read: ElementRef }) qr: ElementRef;

  ngOnInit(): void {
    this.link = `${this.URI}/${window.location.href
      .split('/')
      .slice(3)
      .join('/')}`;
  }

  async handleClick(option: string) {
    switch (option) {
      case 'Descarga el qrCode del enlace':
        this.downloadQr();
        break;
      case 'Copia el enlace de este qrCode':
        this.clipboard.copy(
          `${this.URI}/${window.location.href.split('/').slice(3).join('/')}`
        );
        this.toastr.info('Enlace copiado en el portapapeles', null, {
          timeOut: 2000,
        });
        break;
      case 'Menú de compartir':
        await this.ngNavigatorShareService
          .share({
            title: '',
            url: `${this.URI}/${window.location.href
              .split('/')
              .slice(3)
              .join('/')}`,
          })
          .then((response) => {
            console.log(response);
          })
          .catch((error) => {
            console.log(error);
          });

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
}
