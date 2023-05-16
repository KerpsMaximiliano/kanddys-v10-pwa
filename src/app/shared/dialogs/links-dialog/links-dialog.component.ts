import {
  Component,
  OnInit,
  ViewChildren,
  ElementRef,
  QueryList,
  Inject,
} from '@angular/core';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { environment } from 'src/environments/environment';

export interface DialogOptions {
  title: string;
  link?: string;
  icon?: string;
  callback: () => void;
}

export interface DialogSecondaryOptions {
  title: string;
  link?: string;
  callback: () => void;
}

export interface DialogTemplate {
  title: string;
  options: DialogOptions[];
  secondaryOptions: DialogSecondaryOptions[];
}

@Component({
  selector: 'app-links-dialog',
  templateUrl: './links-dialog.component.html',
  styleUrls: ['./links-dialog.component.scss'],
})
export class LinksDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: DialogTemplate[],
    private _bottomSheetRef: MatBottomSheetRef
  ) {}

  env: string = environment.assetsUrl;
  URI: string = environment.uri;
  @ViewChildren('qrcode', { read: ElementRef })
  private qr: QueryList<ElementRef>;

  @ViewChildren('secondaryQrcode', { read: ElementRef })
  private secondaryQr: QueryList<ElementRef>;

  ngOnInit(): void {}

  openLink(event?: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    if (event) event.preventDefault();
  }

  onClick(index: number, optionIndex: number, second?: boolean) {
    if (!second) {
      if (this.data[index].options[optionIndex].link) {
        this.downloadQr('qrcode' + index + optionIndex);
      }
      if (this.data[index].options[optionIndex].callback) {
        this.data[index].options[optionIndex].callback();
      }
    }
    if (second) {
      if (this.data[index].secondaryOptions[optionIndex].link) {
        this.downloadQr('qrcode' + index + optionIndex, second);
      }
      if (this.data[index].secondaryOptions[optionIndex].callback) {
        this.data[index].secondaryOptions[optionIndex].callback();
      }
    }
    this._bottomSheetRef.dismiss();
  }

  downloadQr(id: string, second?: boolean) {
    let qr: ElementRef<any>;
    if (!second) {
      qr = this.qr.toArray().find((element) => element.nativeElement.id === id);
    } else {
      qr = this.secondaryQr
        .toArray()
        .find((element) => element.nativeElement.id === id);
    }
    const parentElement = qr.nativeElement.querySelector('img').src;
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
