import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';
import { environment } from 'src/environments/environment';
import { Clipboard } from '@angular/cdk/clipboard';
import { ToastrService } from 'ngx-toastr';

interface Button {
  text: string;
  callback?(...params): any;
  asyncCallback?(...params): Promise<any>;
  styles?: Record<string, string | number>;
}

export interface SettingsDialogButton extends Button {}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  @Input() title: string = 'TITULO';
  @Input() cancelButton: Button = {
    text: 'Cerrar',
  };
  @Input() optionsList: Array<Button>;
  @Input() toggleListOptions: Array<Button>;
  @Input() qrCode: string;
  @Input() shareBtn: boolean;
  @Input() statuses: Array<{
    text: string;
    backgroundColor: string;
    color: string;
    asyncCallback(...params): Promise<any>;
    callbackParams?: Array<any>;
  }> = [];
  @Input() indexValue: number;
  currentStatusIndex: number = 0;
  env: string = environment.assetsUrl;

  @ViewChild('qrcode', { read: ElementRef }) qr: ElementRef;

  constructor(
    private ref: DialogRef,
    private router: Router,
    private toastr: ToastrService,
    private clipboard: Clipboard
  ) {}

  ngOnInit(): void {
    if(this.indexValue <= this.statuses.length -1){
      this.currentStatusIndex = this.indexValue;
    }
  }

  redirect(route: string, queryParams: Record<string, number | string> = null) {
    this.ref.close();
    if (!queryParams) this.router.navigate([route]);
    else {
      this.router.navigate([route], {
        queryParams,
      });
    }
  }

  async buttonCallback(callback?: () => void){
   callback? callback() : null;
   this.close();
  }

  async executeStatusButtonCallback() {
    if (
      !this.statuses[this.currentStatusIndex].callbackParams ||
      this.statuses[this.currentStatusIndex].callbackParams.length === 0
    )
      await this.statuses[this.currentStatusIndex].asyncCallback();
    else {
      await this.statuses[this.currentStatusIndex].asyncCallback(
        ...this.statuses[this.currentStatusIndex].callbackParams
      );
    }

    if (this.currentStatusIndex < this.statuses.length - 1)
      this.currentStatusIndex++;
    else this.currentStatusIndex = 0;
  }

  close() {
    this.ref.close();
  }

  copyLink() {
    this.clipboard.copy(window.location.href);
    this.toastr.info('Enlace copiado en el clipboard');
    this.close();
  }

  downloadQr() {
    const parentElement = this.qr.nativeElement.querySelector('img').src;
    let blobData = this.convertBase64ToBlob(parentElement);
    if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
      //IE
      (window.navigator as any).msSaveOrOpenBlob(blobData, 'Qrcode');
      this.close();
    } else {
      // chrome
      const blob = new Blob([blobData], { type: 'image/png' });
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
}
