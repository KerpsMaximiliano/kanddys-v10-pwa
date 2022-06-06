import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { AuthService } from 'src/app/core/services/auth.service';
import { PostContent, PostsService } from 'src/app/core/services/posts.service';
import { RecordRTCService } from 'src/app/core/services/recordrtc.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { AudioRecorderComponent } from 'src/app/shared/components/audio-recorder/audio-recorder.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-post-edit',
  templateUrl: './post-edit.component.html',
  styleUrls: ['./post-edit.component.scss']
})
export class PostEditComponent implements OnInit {
  env: string = environment.assetsUrl;
  currentContent: PostContent;
  isEditing: boolean;
  editText: string;
  imageField: string | ArrayBuffer = '';
  image: File;
  audio: {
    blob: Blob;
    title: string;
  }
  error: string;
  content: PostContent[] = [];
  postId: string;
  previewMode: boolean;

  constructor(
    protected _DomSanitizer: DomSanitizer,
    private dialogService: DialogService,
    private recordRTCService: RecordRTCService,
    private postService: PostsService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if(!params.postId) return;
      this.postService.getPost(params.postId).then(async (data) => {
        lockUI();
        const { author } = data.post;
        const user = await this.authService.me();
        if (!user) return this.redirect();
        if(user._id !== author?._id) return this.redirect();
        this.postId = params.postId;
        const slideData = await this.postService.slidesByPost(params.postId);
        this.content = slideData.map((slide) => ({
          _id: slide._id,
          type: slide.type,
          text: slide.text,
          imageUrl: slide.media?.match(/\.(jpeg|jpg|gif|png)$/) != null ? slide.media : null,
          audio: slide.media?.match(/\.(3gp|flac|mpg|mpeg|mp3|mp4|m4a|oga|ogg|wav|webm)$/) != null ? { blob: slide.media } : null,
        }));
        unlockUI();
      });
    });
  }

  redirect() {
    unlockUI();
    this.router.navigate([`ecommerce/error-screen/`], {
      queryParams: { type: 'item' },
    });
  }

  edit(index: number) {
    if(this.content[index].type === 'audio') this.openRecorder();
    if(this.content[index].type === 'text') this.editText = this.content[index].text;
    if(this.content[index].type === 'poster') this.imageField = this.content[index].imageUrl
    this.isEditing = true;
    this.currentContent = this.content[index];
  }

  add(type: 'audio' | 'poster' | 'text') {
    this.currentContent = { type };
    if(type === 'audio') this.save();
  }

  save() {
    if(this.editText) this.currentContent.text = this.editText;
    if(this.audio) this.currentContent.audio = this.audio;
    if(this.image) {
      this.currentContent.poster = this.image;
      this.currentContent.imageUrl = this.imageField;
    }
    if(!this.isEditing) {
      this.content.push(this.currentContent);
    }
    this.postService.post = {
      slides: this.content.map((content, index) => ({
        text: content.text,
        type: content.type,
        index: index,
        media: content.poster || (content.audio && new File([content.audio.blob], content.audio.title || 'audio.mp3', {type: (<Blob>content.audio.blob)?.type})),
      }))
    }
    this.cancel();
  }

  cancel() {
    if(this.previewMode) return this.previewMode = false;
    this.isEditing = null;
    this.currentContent = null;
    this.editText = null;
    this.image = null;
    this.imageField = null;
    this.audio = null;
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
    const dialogSub = dialogref.events
      .pipe(filter((e) => e.type === 'result'))
      .subscribe((e) => {
        if(e.data) {
          this.audio = e.data;
          if(!this.currentContent) this.add('audio');
          else this.save();
        }
        this.audio = null;
        this.currentContent = null;
        this.recordRTCService.abortRecording();
        dialogSub.unsubscribe();
      });
  }

  async createOrUpdatePost() {
    if(this.postId) {
      try {
        this.content.forEach((content, index) => {
          const query = this.postService.updateSlide({
            text: content.text,
            type: content.type,
            index: index,
            media: content.poster || (content.audio && new File([content.audio.blob], content.audio.title || 'audio.mp3', {type: (<Blob>content.audio.blob)?.type})),
          }, content._id);
          lockUI(query.then((value) => {
            console.log(value)
          }));
        });
      } catch (error) {
        console.log(error)
      }
    } else {
      const query = this.postService.createPost(this.postService.post);
      lockUI(query.then((value) => {
        console.log(value)
      }))
    }
  }

}
