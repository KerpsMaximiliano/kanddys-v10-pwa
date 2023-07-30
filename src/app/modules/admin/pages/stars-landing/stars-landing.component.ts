import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import {
  FormComponent,
  FormData,
} from 'src/app/shared/dialogs/form/form.component';
import { Clipboard } from '@angular/cdk/clipboard';
import { environment } from '../../../../../environments/environment';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { Router } from '@angular/router';
@Component({
  selector: 'app-stars-landing',
  templateUrl: './stars-landing.component.html',
  styleUrls: ['./stars-landing.component.scss'],
})
export class StarsLandingComponent implements OnInit {
  merchant: any = {};
  merchantFunctionality: any = { reward: {} };
  active = false;
  @ViewChild('qrcode', { read: ElementRef }) qr: ElementRef;
  @ViewChild('qrcodeTemplate', { read: ElementRef }) qrcodeTemplate: ElementRef;
  openNavigation = false;
  constructor(
    private merchantService: MerchantsService,
    public dialog: MatDialog,
    private clipboard: Clipboard,
    private ngNavigatorShareService: NgNavigatorShareService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.merchantDefault();
    await this.getMerchantFunctionality();
  }

  async merchantDefault() {
    const merchant = await this.merchantService.merchantDefault();
    console.log(merchant);
    this.merchant = merchant;
  }

  async getMerchantFunctionality() {
    let result = await this.merchantService.merchantFuncionality(
      this.merchant._id
    );
    if (result != undefined) {
      this.merchantFunctionality = result;
      this.active = result.reward?.active;
    }
  }

  openForm() {
    let fieldsToCreate: FormData = {
      fields: [
        {
          label:
            '¿% del monto facturado que invertirás en recompensar al comprador?',
          name: 'item-percentage',
          type: 'number',
          placeholder: 'Escribe el %...',
          validators: [
            Validators.max(100),
            Validators.min(0),
            Validators.required,
          ],
        },
        {
          label: '¿Descuento de la recompensa?',
          name: 'item-value',
          type: 'number',
          placeholder: 'Escribe el monto que descontarás...',
          validators: [Validators.min(0), Validators.required],
        },
      ],
    };
    const dialogRef = this.dialog.open(FormComponent, {
      data: fieldsToCreate,
    });

    dialogRef.afterClosed().subscribe((result: FormGroup) => {
      if (
        result &&
        result.get('item-percentage').valid &&
        result.get('item-value').valid
      )
        this.updateMerchantFunctionality(
          result.get('item-percentage').value,
          result.get('item-value').value
        );
    });
  }

  async updateMerchantFunctionality(rewardPercentage, amountBuyer) {
    let result = await this.merchantService.updateMerchantFuncionality(
      {
        reward: {
          active: true,
          rewardPercentage: rewardPercentage / 100,
          rewardPercentageReferral: 0,
          amountBuyer: parseFloat(amountBuyer),
        },
      },
      this.merchant._id
    );
    if (result != undefined) this.merchantFunctionality = result;
    this.active = true;
  }

  copyClipboard() {
    let url = environment.uri + '/ecommerce/' + this.merchant.slug + '/store';
    this.clipboard.copy(url);
  }

  share() {
    let url = environment.uri + '/ecommerce/' + this.merchant.slug + '/store';
    this.ngNavigatorShareService.share({
      title: '',
      url,
    });
  }

  navigate() {
    this.router.navigate(['ecommerce/' + this.merchant.slug + '/store']);
  }

  downloadQr() {
    const parentElement =
      this.qrcodeTemplate.nativeElement.querySelector('img').src;
    let blobData = this.convertBase64ToBlob(parentElement);
    const blob = new Blob([blobData], { type: 'image/png' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'qr';
    link.click();
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

  getUrl() {
    return environment.uri + '/ecommerce/' + this.merchant.slug + '/store';
  }
}
