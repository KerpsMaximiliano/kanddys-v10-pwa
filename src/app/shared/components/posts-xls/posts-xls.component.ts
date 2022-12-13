import {
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  ElementRef,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { EntityTemplateService } from 'src/app/core/services/entity-template.service';
import { ExportExcelService } from 'src/app/core/services/export-excel.service';
import { environment } from 'src/environments/environment';
import * as JSZIP from 'jszip';
import * as fs from 'file-saver';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';

@Component({
  selector: 'app-posts-xls',
  templateUrl: './posts-xls.component.html',
  styleUrls: ['./posts-xls.component.scss'],
})
export class PostsXlsComponent implements OnInit {
  controller: FormControl = new FormControl('', [
    Validators.required,
    Validators.pattern('^[0-9]*$'),
  ]);
  env: string = environment.assetsUrl;
  dataForExcel = [];
  empPerformance = [];
  linksInXls: Array<string> = [];

  @ViewChildren('qrcode', { read: ElementRef })
  qrElements: QueryList<ElementRef>;

  constructor(
    private _EntityTemplateService: EntityTemplateService,
    public ete: ExportExcelService
  ) {}

  ngOnInit(): void {}

  submit(): void {
    if (this.controller.invalid) return;
    let result = [];
    const createPosts = async () => {
      try {
        lockUI();

        for await (const item of this.fillList(+this.controller.value)) {
          const entityTemplate =
            await this._EntityTemplateService.createEntityTemplate();
          result.push(entityTemplate);
        }

        unlockUI();

        this.linksInXls = [];
        result = result.map((createEntityTemplate) => {
          this.linksInXls.push(
            `${window.location.origin}/qr/article-template/${createEntityTemplate._id}`
          );

          return {
            ...createEntityTemplate,
            qrCode: null,
            _id: `${window.location.origin}/qr/article-template/${createEntityTemplate._id}`,
          };
        });

        setTimeout(() => {
          const qrCodesImages: Array<{
            image: {
              base64: string;
              extension: 'png' | 'jpeg';
            };
            cellRange: string;
          }> = [];

          let index = 0;
          for (const linkElement of this.qrElements.toArray()) {
            const dataURI = linkElement.nativeElement.querySelector('img').src;

            qrCodesImages.push({
              cellRange: 'D' + (8 + index) + ':' + 'D' + (8 + index),
              image: {
                base64: dataURI,
                extension: 'png',
              },
            });
            index++;
          }

          this.exportToExcel(result, qrCodesImages);
        }, 1000);
      } catch (error) {
        console.error(error);
        unlockUI();
      }
    };
    createPosts();
  }

  async generateZipFileForQrCodes() {
    try {
      if (this.controller.invalid) return;

      let result = [];
      lockUI();
      for await (const item of this.fillList(+this.controller.value)) {
        const entityTemplate =
          await this._EntityTemplateService.createEntityTemplate();
        result.push(entityTemplate);
      }
      unlockUI();
      this.linksInXls = [];
      result.forEach((createEntityTemplate) => {
        this.linksInXls.push(
          `${window.location.origin}/qr/article-template/${createEntityTemplate._id}`
        );

        return {
          ...createEntityTemplate,
          qrCode: null,
          _id: `${window.location.origin}/qr/article-template/${createEntityTemplate._id}`,
        };
      });

      const jzipInstance = new JSZIP();

      const photoZip = jzipInstance.folder('qrcodes');

      setTimeout(() => {
        const qrCodesImages: Array<{
          image: {
            base64: string;
            extension: 'png' | 'jpeg';
          };
          cellRange: string;
        }> = [];

        let index = 0;
        for (const linkElement of this.qrElements.toArray()) {
          const dataURI = linkElement.nativeElement.querySelector('img').src;
          let blobData = this.convertBase64ToBlob(dataURI);

          qrCodesImages.push({
            cellRange: 'D' + (8 + index) + ':' + 'D' + (8 + index),
            image: {
              base64: dataURI,
              extension: 'png',
            },
          });

          photoZip.file('qrcode' + index + '.png', blobData, {
            binary: true,
          });
          index++;
        }

        photoZip.generateAsync({ type: 'blob' }).then(function (blob) {
          fs.saveAs(blob, 'qrCodes.zip');
        });
      }, 1000);
    } catch (error) {
      console.error(error);
    }
  }

  fillList(n: number): any[] {
    const result = [...Array(n).keys()].map(() => '');
    return result;
  }

  exportToExcel(
    list,
    imagesData?: Array<{
      image: {
        base64: string;
        extension: 'png' | 'jpeg';
      };
      cellRange: string;
    }>
  ) {
    list.forEach((row: any) => {
      this.dataForExcel.push(Object.values(row));
    });

    let reportData = {
      title: 'Post Report',
      data: this.dataForExcel,
      headers: Object.keys(list[0]),
    };

    this.ete.exportExcel(reportData, imagesData);
  }

  downloadLinksZipFile() {
    const photoZip = JSZIP.folder('qrcodes');

    let index = 0;
    for (const link of this.linksInXls) {
      //photoZip.file("qrcode_" + index + ".png", )
      index++;
    }

    JSZIP.generateAsync({ type: 'base64' }).then(function (blob) {});
    /*
    let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    fs.saveAs(blob, title + '.xlsx');
    */
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
