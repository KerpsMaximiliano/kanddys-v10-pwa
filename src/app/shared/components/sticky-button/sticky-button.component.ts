import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { copyText } from 'src/app/core/helpers/strings.helpers';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

interface Extra {
  text?: string;
  bgColor?: string;
  width?: string;
  height?: string;
  fontSize?: string;
  return?: boolean;
  returnCallback?(...params): any;
  returnStyles?: Record<string, any>;
  icon?: {
    src: string;
    alt?: string;
    width: number;
    height: number;
    color?: string;
  };
}

@Component({
  selector: 'app-sticky-button',
  templateUrl: './sticky-button.component.html',
  styleUrls: ['./sticky-button.component.scss'],
})
export class StickyButtonComponent implements OnInit {
  @Input() mode:
    | 'basic'
    | 'fixed'
    | 'disabled'
    | 'disabled-fixed'
    | 'double'
    | 'fixed-v2' = 'basic';
  @Input() text: string;
  @Input() text2: string;
  @Input() auxText: string;
  @Input() link: string = 'linktest.com';
  @Input() icon: string;
  @Input() bgColor: string = '#27a2ff';
  @Input() padding: string = null;
  @Input() color: string;
  @Input() height: string = null;
  @Input() fontSize: string = null;
  @Input() size: 'small' | 'normal' = 'normal';
  @Input() customLeftButtonStyles: Record<string, any> = null;
  @Input() customRightButtonStyles: Record<string, any> = null;
  @Input() customTextStyles: Record<string, any> = null;
  @Input() addBottomSeparator: boolean = false;
  @Input() backButton: boolean;
  @Input() backButtonCallback: () => void;
  @Input() textCallback: () => void;

  @Input() extra: Extra; //Usado en modo "Double", inserta config

  @Output() left = new EventEmitter();
  @Output() right = new EventEmitter();
  @Output() added = new EventEmitter();

  env: string = environment.assetsUrl;
  private ngNavigatorShareService: NgNavigatorShareService;

  constructor(
    ngNavigatorShareService: NgNavigatorShareService,
    private toastr: ToastrService
  ) {
    this.ngNavigatorShareService = ngNavigatorShareService;
  }

  @ViewChild('qrcode', { read: ElementRef }) qr: ElementRef;

  ngOnInit(): void {}

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

  async copyToClipboard() {
    await copyText(this.link);
  }

  async share() {
    if (!this.ngNavigatorShareService.canShare()) {
      copyText(`${this.link}`);
      this.toastr.info('Enlace copiado en el clipboard');
    }

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

  leftButton() {
    this.left.emit();
  }

  rightButton() {
    this.right.emit();
  }

  extraButton() {
    this.added.emit();
  }
}
