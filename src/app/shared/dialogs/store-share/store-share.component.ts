import { Clipboard } from '@angular/cdk/clipboard';
import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  HostListener,
  Output,
  EventEmitter,
  SimpleChanges,
  SimpleChange,
} from '@angular/core';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';

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
  plus?: boolean;
  func?: () => void;
  link?: string;
  mode?: 'clipboard' | 'share' | 'func' | 'qr';
}

interface Label {
  text: string;
  func?: () => void;
  textArray?: Array<string>;
  labelStyles?: Record<string, any>;
  stylesArray?: Array<Record<string, any>>;
  valueUpdate?: () => any;
}

export interface StoreShareList {
  title?: string;
  titleStyles?: Record<string, any>;
  label?: Label;
  description?: string;
  descriptionPosition?: 'MIDDLE' | 'BOTTOM';
  message?: string;
  messageCallback?: (...args: any[]) => void;
  qrlink?: string;
  options?: StoreShareOption[];
}

@Component({
  selector: 'app-store-share',
  templateUrl: './store-share.component.html',
  styleUrls: ['./store-share.component.scss'],
})
export class StoreShareComponent implements OnInit {
  env: string = environment.assetsUrl;
  @ViewChild('qrcode', { read: ElementRef }) qr: ElementRef;
  @Input() list: StoreShareList[] = [];
  @Input() alternate: boolean;
  @Input() buttonText: string = 'Cancel';
  @Input() public buttonCallback: () => void;
  @Input() hideCancelButtton: boolean = false;
  @Input() relativePositioning: boolean = false;
  @Input() dynamicStyles: {
    container?: Record<string, string | number>;
    titleWrapper?: Record<string, string | number>;
    dialogCard?: Record<string, string | number>;
    button?: Record<string, string | number>;
    description?: Record<string, string | number>;
  };
  @Input() headerIcon?: {
    src: string;
    alt?: string;
    cursor?: string;
    styles: {
      image: Record<string, string | number>;
      wrapper: Record<string, string | number>;
    };
    callback?: () => void;
  } = null;
  size: number = 150;
  @Output() messageEvent = new EventEmitter();
  screenWidth: number;

  constructor(
    private ngNavigatorShareService: NgNavigatorShareService,
    private clipboard: Clipboard,
    //private ref: DialogRef,
    private toastr: ToastrService
  ) {
    // this.onResize(); /* actualiza dinamicamente el tamaño del qr */
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes);
    const list: SimpleChange = changes.list;
    console.log('Old value:', list.previousValue);
    console.log('New value:', list.currentValue);
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

  copyLink(link: string) {
    this.clipboard.copy(link);
    this.toastr.info('Enlace copiado en el clipboard');
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
    //this.ref.close();
  }

  inputFunc(callback: () => void) {
    callback();
    this.close();
  }

  secondInput(callback: () => void) {
    let label = this.list[0].label;
    const currentStatusIndex = label.valueUpdate();
    label.text = label.textArray[currentStatusIndex];
    console.log(currentStatusIndex, label.stylesArray);
    label.labelStyles = label.stylesArray[currentStatusIndex];

    callback();
  }

  defaultButton() {
    if (this.buttonCallback) {
      this.buttonCallback();
      this.close();
    } else {
      this.close();
    }
  }
}
