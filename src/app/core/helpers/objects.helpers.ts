import { environment } from "src/environments/environment"
import { downloadQr } from "../functions/qr-code"

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


export const shareStore = (data: any, labels: any, services: any) => {
  const URI = environment.uri
  const { slug } = data
  const {
    title,
    copyLink,
    qr: qrLabel,
    share: shareLabel,
    bottomLabel
  } = labels

  const {
    clipboard,
    snackBar,
    ngNavigatorShareService,
    storeQrCode
  } = services

  return {
    data: {
      title: title || `Comparte el Enlace de Compradores:`,
      options: [
        {
          value: copyLink || `Copia el link`,
          callback: async () => {
            const { mode, id } = data
            const url = `${URI}/ecommerce/arepera-que-molleja/article-detail/item/${id}?mode=${mode}`
            clipboard.copy(url)
            snackBar.open('Enlace copiado en el portapapeles', '', { duration: 2000, });
          },
        },
        {
          value: qrLabel || `Descarga el QR`,
          callback: () => downloadQr(storeQrCode),
        },
        {
          value: shareLabel || `Compártela`,
          callback: async () => {
            const { id, mode } = data
            const url = `${URI}/ecommerce/arepera-que-molleja/article-detail/item/${id}?mode=${mode}`
            ngNavigatorShareService.share({ title: '', url });
          },
        },
      ],
      styles: {
        fullScreen: true,
      },
      bottomLabel: bottomLabel ? `${URI}/${bottomLabel}` : `${URI}/ecommerce/${slug}/store`,
    },
  };
}
