import { Component, OnInit } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { environment } from 'src/environments/environment';
import { SlideInput } from 'src/app/core/models/post';
import { PostsService } from 'src/app/core/services/posts.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { SingleActionDialogComponent } from '../../dialogs/single-action-dialog/single-action-dialog.component';
import { Item } from 'src/app/core/models/item';
import { ItemsService } from 'src/app/core/services/items.service';
import { playVideoOnFullscreen } from 'src/app/core/helpers/ui.helpers';
import { isVideo } from 'src/app/core/helpers/strings.helpers';
import { WebformsService } from 'src/app/core/services/webforms.service';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-media-upload-dnd-component',
  templateUrl: './media-upload-dnd-component.component.html',
  styleUrls: ['./media-upload-dnd-component.component.scss'],
})
export class MediaUploadDndComponentComponent implements OnInit {
  environment: string = environment.assetsUrl;
  spinnerGif: string = `${environment.assetsUrl}/spinner2.gif`;
  imageFiles: string[] = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
  videoFiles: string[] = [
    'video/mp4',
    'video/webm',
    'video/m4v',
    'video/mpg',
    'video/mp4',
    'video/mpeg',
    'video/mpeg4',
    'video/mov',
    'video/3gp',
    'video/mts',
    'video/m2ts',
    'video/mxf',
  ];
  audioFiles: string[] = [];
  availableFiles: string;
  item: Item;
  entity: 'ITEM' | 'POST' | 'WEBFORM-QUESTION' = 'WEBFORM-QUESTION';
  gridArray: Array<any> = [];
  playVideoOnFullscreen = playVideoOnFullscreen;
  webformQuestionIndex: number = null;
  webformSelectedOption: number = null;
  itemId: string = null;
  isUserOnAMobileDevice: boolean;

  constructor(
    private itemsService: ItemsService,
    private webformsService: WebformsService,
    private postsService: PostsService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: DialogService
  ) {
    this.isUserOnAMobileDevice = this.isMobileDevice();
  }

  async ngOnInit() {
    this.route.params.subscribe(({ entity, entityId }) => {
      this.route.queryParams.subscribe(
        ({
          webformQuestionIndex,
          webformSelectedOption,
          webformQuestionID,
          itemId,
        }) => {
          this.entity = entity;
          this.webformQuestionIndex = Number(webformQuestionIndex);

          if (
            this.entity.toUpperCase() === 'WEBFORM-QUESTION' &&
            this.webformQuestionIndex >= 0
          ) {
            this.itemId = itemId;

            if (
              this.webformsService.formCreationData?.steps[
                1 + this.webformQuestionIndex
              ].fields.controls['responseOptions']?.value?.fileInput?.length
            ) {
            }

            if (
              !this.webformsService.formCreationData?.steps[
                1 + this.webformQuestionIndex
              ].fields.controls['responseOptions'] &&
              !this.webformsService.formCreationData
            )
              this.router.navigate(['/admin/form-creator/' + this.itemId]);
          }

          this.availableFiles = [
            ...this.imageFiles,
            ...this.videoFiles,
            ...this.audioFiles,
          ].join(', ');
        }
      );
    });
  }

  async dropTagDraggable(event: CdkDragDrop<{ gridItem: any; index: number }>) {
    //const { _id: itemId } = this.item;
    this.gridArray[event.previousContainer.data.index].index =
      event.container.data.index;
    this.gridArray[event.container.data.index].index =
      event.previousContainer.data.index;
    this.gridArray[event.previousContainer.data.index] =
      event.container.data.gridItem;
    this.gridArray[event.container.data.index] =
      event.previousContainer.data.gridItem;

    /*
    const { _id, index } = this.gridArray[event.container.data.index];
    const { _id: _id2, index: index2 } =
      this.gridArray[event.previousContainer.data.index];
    const itemImage = { index, active: true };
    const result = await this.itemsService.itemUpdateImage(
      itemImage,
      _id,
      itemId
    );
    const itemImage2 = { index: index2, active: true };
    const result2 = await this.itemsService.itemUpdateImage(
      itemImage2,
      _id2,
      itemId
    );*/
  }

  async loadFile(event: Event) {
    const fileList = (event.target as HTMLInputElement).files;
    if (!fileList.length) return;
    let index = this.gridArray.length - 1;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList.item(i);

      if (this.entity.toUpperCase() === 'WEBFORM-QUESTION') {
        if (
          ![
            ...this.imageFiles,
            ...this.videoFiles,
            ...this.audioFiles,
          ].includes(file.type)
        )
          return;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async (e) => {
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
      index++;
    }
  }

  async submit() {
    if (
      this.entity.toUpperCase() === 'WEBFORM-QUESTION' &&
      this.webformQuestionIndex >= 0 &&
      this.gridArray.length > 0
    ) {
      (
        this.webformsService.formCreationData.steps[
          1 + this.webformQuestionIndex
        ].fields.controls['responseOptions'] as FormArray
      ).clear();

      this.gridArray.forEach((gridItem) => {
        const BASE64_MARKER = ';base64,';
        const parts = gridItem.background.split(BASE64_MARKER);
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);

        for (let i = 0; i < rawLength; ++i) {
          uInt8Array[i] = raw.charCodeAt(i);
        }

        const blob = new Blob([uInt8Array], { type: contentType });
        const fileData = URL.createObjectURL(blob);

        (
          this.webformsService.formCreationData.steps[
            1 + this.webformQuestionIndex
          ].fields.controls['responseOptions'] as FormArray
        ).push(
          new FormGroup({
            text: new FormControl(''),
            fileInput: new FormControl(gridItem.media),
            fileData: new FormControl(fileData),
          })
        );
      });

      this.router.navigate(['/admin/form-creator/' + this.itemId]);
    }

    if (
      this.entity.toUpperCase() === 'WEBFORM-QUESTION' &&
      this.webformQuestionIndex >= 0 &&
      this.gridArray.length === 0
    ) {
      this.router.navigate(['/admin/form-creator/' + this.itemId]);
    }
  }

  deleteSlide(index: number) {
    this.dialog.open(SingleActionDialogComponent, {
      type: 'fullscreen-translucent',
      props: {
        title: 'Eliminar este slide del símbolo',
        buttonText: 'Sí, borrar',
        mainButton: () => {
          this.deleteImage(index);
        },
        btnBackgroundColor: '#272727',
        btnMaxWidth: '133px',
        btnPadding: '7px 2px',
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  async deleteImage(index: number) {
    if (this.item) {
      this.itemsService.itemImages.splice(index, 1);

      if (this.item.images.length === 1) {
        await this.itemsService.updateItem(
          {
            showImages: false,
          },
          this.item._id
        );
      }
      if (
        this.item.images.some(
          (itemImage) => itemImage.value === this.gridArray[index].background
        )
      ) {
        await this.itemsService.itemRemoveImage(
          [this.item.images[index]._id],
          this.item._id
        );
      }
      this.gridArray.splice(index, 1);
      return;
    }
    this.gridArray.splice(index, 1);
    if (this.postsService.post?.slides.length)
      this.postsService.post.slides.splice(index, 1);
  }

  isSlideVideo(index: number) {
    return isVideo(this.gridArray[index].background);
  }

  isMobileDevice() {
    return (
      typeof window.orientation !== 'undefined' ||
      navigator.userAgent.indexOf('IEMobile') !== -1
    );
  }
}
