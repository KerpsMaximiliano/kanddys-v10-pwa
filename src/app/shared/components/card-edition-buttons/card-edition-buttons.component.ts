import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-card-edition-buttons',
  templateUrl: './card-edition-buttons.component.html',
  styleUrls: ['./card-edition-buttons.component.scss']
})
export class CardEditionButtonsComponent implements OnInit {
  env: string = environment.assetsUrl;  
  frontImage: string = null;
  backImage: string = null;
  @Output() frontImageOutput = new EventEmitter();
  @Output() backImageOutput = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  openFileInput(typeOfImage) {
    const fileInput = document.querySelector('#' + typeOfImage) as HTMLInputElement;

    fileInput.click();
  }

  loadFile(typeOfImage: string, event: any) {
    const reader = new FileReader();

    const file = (event.target as HTMLInputElement).files[0];

    reader.readAsDataURL(file);

    reader.onload = () => {
      this[typeOfImage] = reader.result;

      this[typeOfImage + 'Output'].emit({
        typeOfImage,
        base64: reader.result
      });
    };

    reader.onerror = function (error) {
      console.log('Error: ', error);
    };
  }

}
