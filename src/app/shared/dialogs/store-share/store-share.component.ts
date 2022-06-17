import { Clipboard } from '@angular/cdk/clipboard';
import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';
import { environment } from 'src/environments/environment';

interface IconSize {
  width: number;
  height: number;
}
interface StoreShareIcon {
  src: string;
  alt?: string;
  color?: string;
  size: IconSize;
}

interface StoreShareOption {
  text: string;
  icon?: StoreShareIcon;
  func?: () => void;
  link?: string;
  mode?: 'clipboard' | 'share' | 'func' | 'qr';
}

export interface StoreShareList {
  title: string;
  options: StoreShareOption[];
}

@Component({
  selector: 'app-store-share',
  templateUrl: './store-share.component.html',
  styleUrls: ['./store-share.component.scss']
})
export class StoreShareComponent implements OnInit {
  env: string = environment.assetsUrl;
  @ViewChild("qrcode", { read: ElementRef }) qr: ElementRef;
  @Input() list: StoreShareList[] = [];

  constructor(
    private ngNavigatorShareService: NgNavigatorShareService,
    private clipboard: Clipboard,
    private ref: DialogRef,
  ) { }

  ngOnInit(): void {
    if(!this.list || !this.list.length) throw new Error('Ingresa opciones para mostrar')
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

  copyLink(link: string) {
    this.clipboard.copy(link);
    this.close();
  }

  async share(link: string) {
    this.close();
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

  close() {
    this.ref.close();
  }

  inputFunc(callback: () => void) {
    callback();
    this.close();
  }

}
