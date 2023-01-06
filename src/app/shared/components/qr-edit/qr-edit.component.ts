import { Component, OnInit } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { environment } from 'src/environments/environment';
import { SlideInput } from 'src/app/core/models/post';

@Component({
  selector: 'app-qr-edit',
  templateUrl: './qr-edit.component.html',
  styleUrls: ['./qr-edit.component.scss']
})
export class QrEditComponent implements OnInit {

  environment: string = environment.assetsUrl;
  imageFiles: string[] = ['image/png', 'image/jpg', 'image/jpeg'];
  videoFiles: string[] = [];
  audioFiles: string[] = [];
  


  gridArray: Array<any> = [
  ];

  constructor() { }

  ngOnInit(): void {
  }

  async dropTagDraggable(event: CdkDragDrop<{ gridItem: any; index: number }>) {
    this.gridArray[event.previousContainer.data.index].index = event.container.data.index;
    this.gridArray[event.container.data.index].index = event.previousContainer.data.index;
    this.gridArray[event.previousContainer.data.index] =
      event.container.data.gridItem;
    this.gridArray[event.container.data.index] =
      event.previousContainer.data.gridItem;
    console.log('this.gridArray: ', this.gridArray);
  }

  loadFile(event: any) {
    const [file] = event.target.files;
    if(![...this.imageFiles, ...this.videoFiles, ...this.audioFiles].includes(
      file.type
    ))
      return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async (e) => {
      const { type } = file;
      let result = reader.result;
      const content:SlideInput = {
        text: 'test',
        title: 'test',
        media: file,
        type: 'poster',
        index: this.gridArray.length
      };
      content['background'] = result;
      this.gridArray.push(content);
    };
  }
}
