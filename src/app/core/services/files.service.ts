import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root',
  })
  export class FilesService{
    
    private file:string;

    getFile(){
        return this.file;
    }

    setFile(file:any){
        this.file = file;
    }

    dataURItoBlob(dataURI) {
        const type = dataURI.split(';')[0].split(':')[1];
        const base64Data = dataURI.split(',')[1];
        const byteString = window.atob(base64Data);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const int8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
          int8Array[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([int8Array], { type: type });    
        return blob;
      }
  }