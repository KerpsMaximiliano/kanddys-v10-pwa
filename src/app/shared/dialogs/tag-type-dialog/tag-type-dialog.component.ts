import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { Clipboard } from '@angular/cdk/clipboard';
import { Router } from '@angular/router';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';

@Component({
  selector: 'app-tag-type-dialog',
  templateUrl: './tag-type-dialog.component.html',
  styleUrls: ['./tag-type-dialog.component.scss']
})
export class TagTypeDialogComponent implements OnInit {
  env: string = environment.assetsUrl;
  URI: string = environment.uri;
  options: string[] = [
    'Para articulos',
    'Para facturas',
    'Para compradores',
  ];
  link: string = null;
  constructor(
    private _Router: Router, 
    private _DialogRef: DialogRef
  ) {}

  @ViewChild('qrcode', { read: ElementRef }) qr: ElementRef;

  ngOnInit(): void {
    this.link = `${this.URI}/${window.location.href
      .split('/')
      .slice(3)
      .join('/')}`;
  }

  async handleClick(option: string) {
    const dict = {
      "Para articulos": () => {
        this._Router.navigate(["admin", "create-tag"], {
          queryParams: {
            entity: "item",
          },
        });
        this._DialogRef.close();
      },
      "Para facturas": () => {
        this._Router.navigate(["admin", "create-tag"], {
          queryParams: {
            entity: "order",
          },
        });
        this._DialogRef.close();
      },
      "Para compradores": () => {
        this._DialogRef.close();
      },
    };
    dict[option]();
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
