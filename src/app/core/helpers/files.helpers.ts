import Compressor from 'compressorjs';
import { lockUI, unlockUI } from './ui.helpers';

export function base64ToFile(base64: string): File {
  const [datatype, data] = base64.split(',');
  const mime = datatype.match(/:(.*?);/)[1];
  const filename = `${+new Date()}${mime.replace(/\/+/, '.')}`;
  const bstr = atob(data);

  const u8arr = new Uint8Array(bstr.length);
  let n = bstr.length;
  while (n--) u8arr[n] = bstr.charCodeAt(n);

  return new File([u8arr], filename, { type: mime });
}

export function base64ToBlob(base64: string): Blob {
  // SPLIT INTO TWO PARTS
  const parts = base64.split(';base64,');
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


export function fileToBase64(file: File): Promise<any> {
  const base64File = new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

  return base64File;
}

export const arrayOfRoutesToBase64 = async (
  imageRoutes: any[]
): Promise<{ image: string; label: string }[]> => {
  lockUI();

  const base64Strings = await Promise.all(
    imageRoutes.map(async (imageObject) => {
      if (imageObject.isMedia) {
        const response = await fetch(imageObject.value);
        const blob = await response.blob();
        const base64String = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });
        return {
          image: base64String,
          label: imageObject.label,
        };
      } else {
        return {
          label: imageObject.value,
          image: null,
        };
      }
    })
  );

  unlockUI();

  return base64Strings;
};

export async function compressImage(
  file: File | Blob,
  quality: number = 0.6
): Promise<File> {
  return new Promise((resolve, reject) => {
    // TODO CHECK IF COMPRESS BY PARAMETER
    const compressor = new Compressor(file, {
      quality,
      convertSize: 2000000,
      maxWidth: 1280,
      maxHeight: 720,
      success: (result: File) => resolve(result),
      error: (err) => reject(err),
    });
  });
}
