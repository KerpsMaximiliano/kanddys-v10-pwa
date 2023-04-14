import { Injectable } from '@angular/core';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { environment } from 'src/environments/environment';
import * as logo from './logo.js';

@Injectable({
  providedIn: 'root',
})
export class ExportExcelService {
  imageFolder: string;

  constructor() {
    this.imageFolder = environment.assetsUrl;
  }

  exportExcel(
    excelData,
    images?: Array<{
      image: {
        base64: string;
        extension: 'png' | 'jpeg';
      };
      cellRange: string;
    }>
  ) {
    //Title, Header & Data
    const title = excelData.title;
    const header = excelData.headers;
    const data = excelData.data;

    //Create a workbook with a worksheet
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('Sales Data');

    //Add Row and formatting
    worksheet.mergeCells('B1', 'C5');
    let titleRow = worksheet.getCell('B1');
    titleRow.value = title;
    titleRow.font = {
      name: 'Calibri',
      size: 16,
      underline: 'single',
      bold: true,
      color: { argb: '0085A3' },
    };
    titleRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Date
    worksheet.mergeCells('D1:E5');
    let d = new Date();
    let date = d.getDate() + '-' + d.getMonth() + '-' + d.getFullYear();
    let dateCell = worksheet.getCell('D1');
    dateCell.value = date;
    dateCell.font = {
      name: 'Calibri',
      size: 12,
      bold: true,
    };
    dateCell.alignment = { vertical: 'middle', horizontal: 'center' };

    //Add Image
    let myLogoImage = workbook.addImage({
      base64: logo.imgBase64,
      extension: 'png',
    });
    worksheet.mergeCells('A1:A4');
    worksheet.addImage(myLogoImage, 'A1:A4');

    //Blank Row
    worksheet.addRow([]);

    //Adding Header Row
    let headerRow = worksheet.addRow(header);
    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4167B8' },
        bgColor: { argb: '' },
      };
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFF' },
        size: 12,
      };
    });

    // Adding Data with Conditional Formatting
    data.forEach((d) => {
      let row = worksheet.addRow(d);

      // let sales = row.getCell(6);
      // let color = 'FF99 FF99';
      // if (+sales.value < 200000) {
      //   color = 'FF9999'
      // }

      // sales.fill = {
      //   type: 'pattern',
      //   pattern: 'solid',
      //   fgColor: { argb: color }
      // }
    });

    if (images && images.length > 0) {
      let index = 0;
      for (const image of images) {
        let myImage = workbook.addImage({
          base64: image.image.base64,
          extension: image.image.extension,
        });
        worksheet.addImage(myImage, image.cellRange);
        const row = worksheet.getRow(8 + index);
        row.height = 120;
        index++;
      }
    }

    worksheet.getColumn(1).width = 60;
    worksheet.getColumn(2).width = 30;
    worksheet.getColumn(3).width = 20;
    worksheet.getColumn(4).width = 30;
    worksheet.addRow([]);

    //Footer Row
    let footerRow = worksheet.addRow([
      'Example Post Report created at ' + date,
    ]);
    footerRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFB050' },
    };

    //Merge Cells
    worksheet.mergeCells(`A${footerRow.number}:F${footerRow.number}`);

    //Generate & Save Excel File
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      fs.saveAs(blob, title + '.xlsx');
    });
  }
}
