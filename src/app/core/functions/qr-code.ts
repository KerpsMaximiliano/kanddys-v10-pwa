import { base64ToBlob } from "../helpers/files.helpers";

export const downloadQr = (qrCode) => {
  const parentElement = qrCode.nativeElement.querySelector('img').src;
  let blobData = base64ToBlob(parentElement);
  if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
    //IE
    (window.navigator as any).msSaveOrOpenBlob(
      blobData,
      'Enlace a vista de compradores de mi KiosKo'
    );
  } else {
    // chrome
    const blob = new Blob([blobData], { type: 'image/png' });
    const url = window.URL.createObjectURL(blob);
    // window.open(url);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Enlace a vista de compradores de mi KiosKo';
    link.click();
  }
}
