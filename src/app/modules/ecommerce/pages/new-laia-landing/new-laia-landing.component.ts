import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
import { Gpt3Service } from 'src/app/core/services/gpt3.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { RecordRTCService } from 'src/app/core/services/recordrtc.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { AudioRecorderComponent } from 'src/app/shared/components/audio-recorder/audio-recorder.component';
import { StatusAudioRecorderComponent } from 'src/app/shared/dialogs/status-audio-recorder/status-audio-recorder.component';
import { environment } from 'src/environments/environment';
import { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-new-laia-landing',
  templateUrl: './new-laia-landing.component.html',
  styleUrls: ['./new-laia-landing.component.scss']
})
export class NewLaiaLandingComponent implements OnInit {

  swiperConfig: SwiperOptions = {
    direction: 'vertical',
    slidesPerView: 1,
    slidesPerColumn: 1,
    spaceBetween: 0.3,
    autoplay: {
      delay: 1000,
      disableOnInteraction: false
    },
    loop: true
  };
  assetsFolder: string = environment.assetsUrl;
  aiSlug: string = environment.ai.slug;
  audioText = new FormControl(null);
  convertAudioText: string = 'Conviertiéndo el audio a texto';
  inputFormGroup: FormGroup = new FormGroup({
    input: new FormControl(),
  });
  audio: {
    blob: Blob;
    title: string;
  };
  inputOpen: boolean = false;
  isMobile: boolean = false;

  constructor(private router: Router,
    private dialogService: DialogService,
    private recordRTCService: RecordRTCService,
    private gptService: Gpt3Service,
    public headerService: HeaderService,
    private translate: TranslateService,
    private renderer: Renderer2) {
      let language = navigator?.language ? navigator?.language?.substring(0, 2) : 'es';
      translate.setDefaultLang(language?.length === 2 ? language  : 'es');
      translate.use(language?.length === 2 ? language  : 'es');
  }

  ngOnInit(): void {
    const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    this.isMobile = regex.test(navigator.userAgent);
    this.translate.get("modal.convertAudioText").subscribe(translate => this.convertAudioText = translate);
  }

  sendLaiaMessage() {
    let message = this.inputFormGroup.get('input').value;
    console.log(message)
    this.router.navigate([`/ecommerce/${this.aiSlug}/chat-merchant`], {
      queryParams: {
        message: message,
      },
    });
  }

  speechToText(chatText: boolean = false) {
    const dialogref = this.dialogService.open(AudioRecorderComponent, {
      type: 'flat-action-sheet',
      props: { canRecord: true, isDialog: true },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
    const dialogSub = dialogref.events
      .pipe(filter((e) => e.type === 'result'))
      .subscribe((e) => {
        if (e.data) {
          this.audio = e.data;
          this.saveAudio(chatText);
        }
        this.audio = null;
        this.recordRTCService.abortRecording();
        dialogSub.unsubscribe();
      });
  }

  async saveAudio(chatText: boolean = false) {
    let dialogRef;
    try {
      dialogRef = this.dialogService.open(StatusAudioRecorderComponent, {
        type: 'flat-action-sheet',
        props: {
          message: this.convertAudioText,
          backgroundColor: '#181D17',
        },
        customClass: 'app-dialog',
        flags: ['no-header'],
      });

      if (!this.audio) return;
      console.log(this.audio)
      const result = await this.gptService.openAiWhisper((this.audio && new File([this.audio.blob], this.audio.title || 'audio.mp3', { type: (<Blob>this.audio.blob)?.type })),);

      if (chatText) {
        this.inputFormGroup.get('input').setValue(result);
        this.inputOpen = true;
      } else {
        this.router.navigate(['/ecommerce/laia-training'], {
          queryParams: {
            audioResult: result,
          },
        });
      }

      dialogRef.close();
    } catch (error) {
      dialogRef.close();

      console.error(error);
      this.headerService.showErrorToast();
    }
  }

  resizeTextarea(textarea) {
    const alturaActual = textarea.scrollHeight;
    const alturaMaxima = 146;
    const relacionAltura = alturaActual / alturaMaxima;
    const borderRadius = 146 - 146 * relacionAltura;
    const borderRadiusPx = getComputedStyle(textarea).borderRadius;

    if (borderRadiusPx === '22px') {
      this.renderer.setStyle(textarea, 'border-radius', '22px');
    } else {
      this.renderer.setStyle(textarea, 'border-radius', `${borderRadius}px`);
    };

    if (textarea.scrollHeight > 146) {
      textarea.style.height = 146 + "px";
      textarea.style.overflowY = "scroll";
      return;
    }
    console.log(textarea.scrollHeight > textarea.clientHeight)
    if (textarea.scrollHeight > textarea.clientHeight) {
      textarea.style.height = textarea.scrollHeight > 46 ? textarea.scrollHeight + "px" : 46 + "px";
    } else {
      textarea.style.height = 46 + "px";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }

}
