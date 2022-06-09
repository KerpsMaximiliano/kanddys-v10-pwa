import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-store-share',
  templateUrl: './store-share.component.html',
  styleUrls: ['./store-share.component.scss']
})
export class StoreShareComponent implements OnInit {
  env: string = environment.assetsUrl;
  @ViewChild("qrcode", { read: ElementRef }) qr: ElementRef;
  @Input() link: string;
  @Input() func: () => void;

  constructor(
    private ngNavigatorShareService: NgNavigatorShareService,
    private ref: DialogRef
  ) { }

  ngOnInit(): void {
  }

  downloadQr() {
    const parentElement = this.qr.nativeElement.querySelector("img").src;
    let blobData = this.convertBase64ToBlob(parentElement);
    if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) { //IE
      (window.navigator as any).msSaveOrOpenBlob(blobData, 'Qrcode');
      this.close();
    } else { // chrome
      const blob = new Blob([blobData], { type: "image/png" });
      const url = window.URL.createObjectURL(blob);
      // window.open(url);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Qrcode';
      link.click();
      this.close();
    }
  }

  private convertBase64ToBlob(Base64Image: string) {
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

  async share() {
    this.close();
    await this.ngNavigatorShareService
      .share({
        title: 'Gift a Box',
        text: '¡Ordena ya tus servilletas!',
        url: this.link,
      })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  close() {
    this.ref.close();
  }

}
