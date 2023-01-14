import { Component, OnInit } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { environment } from 'src/environments/environment';
import { PostInput, SlideInput } from 'src/app/core/models/post';
import { PostsService } from 'src/app/core/services/posts.service';
import { Router } from '@angular/router';
import { HeaderService } from 'src/app/core/services/header.service';

@Component({
  selector: 'app-qr-edit',
  templateUrl: './qr-edit.component.html',
  styleUrls: ['./qr-edit.component.scss'],
})
export class QrEditComponent implements OnInit {
  environment: string = environment.assetsUrl;
  imageFiles: string[] = ['image/png', 'image/jpg', 'image/jpeg'];
  videoFiles: string[] = ['video/mp4', 'video/webm'];
  audioFiles: string[] = [];
  availableFiles: string;

  gridArray: Array<any> = [];

  constructor(
    private _PostsService: PostsService,
    private _Router: Router,
    private headerService: HeaderService
  ) {}

  ngOnInit(): void {
    if (!this._PostsService.post) {
      const storedPost = localStorage.getItem('post');

      if (storedPost) this._PostsService.post = JSON.parse(storedPost);
    }

    if (!this._PostsService.post) {
      this._Router.navigate([
        'ecommerce/' + this.headerService.saleflow.merchant.slug + '/store',
      ]);
    }

    this.availableFiles = [
      ...this.imageFiles,
      ...this.videoFiles,
      ...this.audioFiles,
    ].join(', ');
  }

  async dropTagDraggable(event: CdkDragDrop<{ gridItem: any; index: number }>) {
    this.gridArray[event.previousContainer.data.index].index =
      event.container.data.index;
    this.gridArray[event.container.data.index].index =
      event.previousContainer.data.index;
    this.gridArray[event.previousContainer.data.index] =
      event.container.data.gridItem;
    this.gridArray[event.container.data.index] =
      event.previousContainer.data.gridItem;
    console.log('this.gridArray: ', this.gridArray);
  }

  loadFile(event: any) {
    const [file] = event.target.files;
    if (!file) return;
    if (
      ![...this.imageFiles, ...this.videoFiles, ...this.audioFiles].includes(
        file.type
      )
    )
      return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async (e) => {
      const { type } = file;
      let result = reader.result;
      const content: SlideInput = {
        text: 'test',
        title: 'test',
        media: file,
        type: 'poster',
        index: this.gridArray.length,
      };
      content['background'] = result;
      content['_type'] = file.type;
      this.gridArray.push(content);
    };
  }

  submit(): void {
    const slides: Array<SlideInput> = this.gridArray.map(
      ({ text, title, media, type, index }) => {
        const result = {
          text,
          title,
          media,
          type,
          index,
        };
        return result;
      }
    );

    this._PostsService.post.slides = slides;

    this._Router.navigate([
      'ecommerce',
      this.headerService.saleflow.merchant.slug,
      'post-edition',
    ]);
    return;
  }
}
