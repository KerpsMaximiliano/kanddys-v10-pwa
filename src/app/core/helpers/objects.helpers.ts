import { environment } from "src/environments/environment"
import { downloadQr } from "../functions/qr-code"
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { Inject } from "@angular/core";
export const deleteIrrelevantDataFromObject = (dataObject) => {
  if (dataObject) {
    Object.keys(dataObject).forEach(key => {
      if (typeof dataObject[key] !== 'object' && dataObject[key].length === 0) {
        delete dataObject[key];
      }

      if (typeof dataObject[key] === 'object' && !Array.isArray(dataObject[key])) {
        dataObject[key] = deleteIrrelevantDataFromObject(dataObject[key]);
      }

      if (typeof dataObject[key] === 'object' && Array.isArray(dataObject[key])) {
        dataObject[key].forEach((element, index) => {
          //Delete irrelevant content from array indexes that arent nested arrays
          if (typeof element === 'object' && !Array.isArray(element)) {
            dataObject[key][index] = deleteIrrelevantDataFromObject(element);
          }

          //Delete irrelevant content from array indexes that are nested arrays
          if (typeof element === 'object' && Array.isArray(element)) {
            element.forEach((innerElement, index2) => {
              if (
                typeof innerElement === 'object' &&
                !Array.isArray(innerElement)
              ) {
                dataObject[key][index][index2] = deleteIrrelevantDataFromObject(innerElement);
              }
            })
          }
        })
      }
    })
    return dataObject;
  }
}


export const shareStore = (data: any, labels: any) => {
  const URI = environment.uri
  const { slug, mode, storeQrCode } = data
  const {
    title,
    copyLink,
    qr: qrLabel,
    share: shareLabel,
  } = labels

  const clipboard = Inject(Clipboard)
  const snackBar = Inject(MatSnackBar)
  const ngNavigatorShareService = Inject(NgNavigatorShareService)

  return {
    data: {
      title: title || `Comparte el Enlace de Compradores:`,
      options: [
        {
          value: copyLink || `Copia el link`,
          callback: async () => {
            clipboard.copy(`${URI}/ecommerce/${slug}/store?mode=${mode}`);
            snackBar.open('Enlace copiado en el portapapeles', '', {
              duration: 2000,
            });
          },
        },
        {
          value: qrLabel || `Descarga el QR`,
          callback: async () => downloadQr(storeQrCode),
        },
        {
          value: shareLabel || `Compártela`,
          callback: async () => {
            ngNavigatorShareService.share({
              title: '',
              url: `${URI}/ecommerce/${slug}/store?mode=${mode}`,
            });
          },
        },
      ],
      styles: {
        fullScreen: true,
      },
      bottomLabel: `${URI}/ecommerce/${slug}/store`,
    },
  };
}
