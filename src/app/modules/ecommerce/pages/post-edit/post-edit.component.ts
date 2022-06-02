import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { RecordRTCService } from 'src/app/core/services/recordrtc.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { AudioRecorderComponent } from 'src/app/shared/components/audio-recorder/audio-recorder.component';
import { environment } from 'src/environments/environment';

interface PostContent {
  type: 'audio' | 'poster' | 'text';
  audio?: Blob,
  poster?: File,
  imageUrl?: string | ArrayBuffer;
  text?: string
}
@Component({
  selector: 'app-post-edit',
  templateUrl: './post-edit.component.html',
  styleUrls: ['./post-edit.component.scss']
})
export class PostEditComponent implements OnInit {
  env: string = environment.assetsUrl;
  inPreview: boolean = true;
  isEditing: PostContent;
  editText: string;
  imageField: string | ArrayBuffer = '';
  image: File;
  audio: Blob;
  error: string;
  content: PostContent[] = [];

  constructor(
    protected _DomSanitizer: DomSanitizer,
    private dialogService: DialogService,
    private recordRTCService: RecordRTCService,
  ) {}

  ngOnInit(): void {
  }

  edit(index: number) {
    if(this.content[index].type === 'audio') this.openRecorder();
    this.isEditing = this.content[index];
  }

  add(type: 'audio' | 'poster' | 'text') {
    let content: PostContent = { type };
    if(type === 'text') {
      if(this.content.some((post) => post.type === 'text')) return;
      content.text = '';
    }
    if(type === 'audio') content.audio = this.audio;
    this.content.push(content);
    if(type !== 'audio') this.edit(this.content.length - 1)
  }

  cancel() {
    this.isEditing = null;
    this.editText = null;
    this.image = null;
    this.imageField = null;
  }

  save() {
    if(this.editText) this.isEditing.text = this.editText;
    if(this.audio) this.isEditing.audio = this.audio;
    if(this.image) {
      this.isEditing.poster = this.image;
      this.isEditing.imageUrl = this.imageField;
    }
    this.cancel();
  }

  sanitize(image: string | ArrayBuffer) {
    return this._DomSanitizer.bypassSecurityTrustStyle(
      `url(${image}) no-repeat center center / contain #fff`
    );
  }

  fileProgress(e: Event) {
    const files = (e.target as HTMLInputElement).files;
    const allowedTypes = ['png', 'jpg', 'jpeg']
    if (!files.length) return
    if (
      (allowedTypes.length > 0 &&
        !allowedTypes.some((type) => files[0].type.includes(type))) ||
      !files[0].type.includes('image/')
    ) {
      if (!this.imageField) this.error = 'Ingresa in tipo de imagen correcto';
      return;
    }
    this.error = null;
    this.image = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imageField = reader.result;
    };
    reader.readAsDataURL(files[0]);
    return;
  }

  openRecorder() {
    const dialogref = this.dialogService.open(AudioRecorderComponent,{
      type: 'flat-action-sheet',
      props: { canRecord: true, isDialog: true },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
    const sub: Subscription = this.recordRTCService.getRecordedAudioBlob().subscribe((data) => {
      this.audio = data.blob;
    });
    const dialogSub = dialogref.events
      .pipe(filter((e) => e.type === 'result'))
      .subscribe((e) => {
        if(e.data === 'save') {
          if(!this.isEditing) this.add('audio');
          else this.save();
        }
        this.audio = null;
        this.isEditing = null;
        this.recordRTCService.abortRecording();
        dialogSub.unsubscribe();
        sub.unsubscribe();
      });
  }

}
