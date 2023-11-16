import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { Gpt3Service } from 'src/app/core/services/gpt3.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { environment } from 'src/environments/environment';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { AudioRecorderComponent } from 'src/app/shared/components/audio-recorder/audio-recorder.component';
import { RecordRTCService } from 'src/app/core/services/recordrtc.service';
import { FilesService } from 'src/app/core/services/files.service';
import { OptionsMenuComponent } from 'src/app/shared/dialogs/options-menu/options-menu.component';
import { StatusAudioRecorderComponent } from 'src/app/shared/dialogs/status-audio-recorder/status-audio-recorder.component';
import { fileToBase64 } from 'src/app/core/helpers/files.helpers';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-laia-memories-management',
  templateUrl: './laia-memories-management.component.html',
  styleUrls: ['./laia-memories-management.component.scss'],
})
export class LaiaMemoriesManagementComponent implements OnInit {
  openNavigation: boolean = false;
  env: string = environment.assetsUrl;
  knowledgeBaseEmbeddingsContent: string = null;
  vectorsFromVectorDatabase: Array<{
    id: string;
    name?: string;
    text: string;
  }> = [];
  vectorsIdByIndex: Record<number, string> = {};
  merchantSaleflow: SaleFlow = null;
  loadingKnowledge: boolean = false;
  authEventSubscription: Subscription;
  assetsFolder: string = environment.assetsUrl;
  message: FormControl = new FormControl(null);

  autoResponse: boolean;

  inputOpen: boolean = false;
  audio: {
    blob: Blob;
    title: string;
  };
  typeFile: string;
  isMobile: boolean = false;
  textareaAudio: boolean = false;
  convertAudioText: string = 'Conviertiéndo el audio a texto';

  constructor(
    private gptService: Gpt3Service,
    private headerService: HeaderService,
    private saleflowsService: SaleFlowService,
    private merchantsService: MerchantsService,
    private appService: AppService,
    private router: Router,
    private bottomSheet: MatBottomSheet,
    private dialogService: DialogService,
    private recordRTCService: RecordRTCService,
    private filesService: FilesService,
    private translate: TranslateService,
  ) {
    let language = navigator?.language ? navigator?.language?.substring(0, 2) : 'es';
    translate.setDefaultLang(language?.length === 2 ? language  : 'es');
    translate.use(language?.length === 2 ? language  : 'es');
  }

  async ngOnInit() {
    const existToken = localStorage.getItem('session-token');
    if (existToken) {
      if (!this.headerService.user) {
        this.authEventSubscription = this.appService.events
          .pipe(filter((e) => e.type === 'auth'))
          .subscribe((e) => {
            setTimeout(() => this.executeInitProcesses(), 500);
            this.authEventSubscription.unsubscribe();
          });
      } else {
        this.executeInitProcesses();
      }
    } else {
      this.router.navigate(['/ecommerce/club-landing']);
    }
    const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    this.isMobile = regex.test(navigator.userAgent);
    this.translate.get("modal.convertAudioText").subscribe(translate => this.convertAudioText = translate);
  }

  async executeInitProcesses() {
    try {
      lockUI();

      await this.headerService.checkIfUserIsAMerchantAndFetchItsData();
      this.merchantSaleflow = await this.saleflowsService.saleflowDefault(
        this.merchantsService.merchantData?._id
      );

      this.loadingKnowledge = true;
      const embeddingQueryResponse =
        await this.gptService.fetchAllDataInVectorDatabaseNamespace(
          this.merchantSaleflow?._id
        );

      if (
        embeddingQueryResponse?.data &&
        embeddingQueryResponse?.data?.length
      ) {
        this.vectorsFromVectorDatabase = embeddingQueryResponse?.data;
      }

      this.loadingKnowledge = false;
      
      this.checkAutoResponse();
      unlockUI();
    } catch (error) {
      console.error(error);

      unlockUI();
    }
  }

  editMemory(id: string) {
    this.router.navigate(['/ecommerce/laia-training/' + id]);
  }

  addMemory() {
    this.translate.get([
      "modal.options-menu-title",
      "model.mailToOne",
      "model.mailToTwo",
      "model.writeOrCopy",
      "model.addWebUrl",
      "model.audioText",
      "model.uploadPdf",
      "model.uploadExcel",
    ]).subscribe(translations => {
      let data = {
        data: {
          description: translations["modal.options-menu-title"],
          options: [
            {
              value: `${translations["model.mailToOne"]} ${this.headerService?.user?.email ? `${translations["model.mailToTwo"]} ${this.headerService?.user?.email}` : ''}`,
              complete: true,
              callback: () => {
                const enlaceMailto = `mailto:memorias@laichat.com}`;
                window.location.href = enlaceMailto;
              },
              settings: {
                value: 'fal fa-envelope',
                color: '#87CD9B',
                callback: () => {
                },
              }
            },
            {
              value: translations["model.writeOrCopy"],
              complete: true,
              callback: () => {
                this.router.navigate(['/ecommerce/laia-training']);
              },
              settings: {
                value: 'fal fa-keyboard',
                color: '#87CD9B',
                callback: () => {
                },
              }
            },
            {
              value: translations["model.addWebUrl"],
              complete: true,
              callback: () => {
                this.router.navigate(['/ecommerce/laiachat-webscraping']);
              },
              settings: {
                value: 'fal fa-keyboard',
                color: '#87CD9B',
                callback: () => {
                },
              }
            },
            {
              value: translations["model.audioText"],
              complete: true,
              callback: () => {
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
                      this.saveAudio();
                    }
                    this.audio = null;
                    this.recordRTCService.abortRecording();
                    dialogSub.unsubscribe();
                  });
              },
              settings: {
                value: 'fal fa-waveform-path',
                color: '#87CD9B',
                callback: () => {
                },
              }
            },
            {
              value: translations["model.uploadPdf"],
              complete: true,
              callback: () => {
                const fileInput = document.getElementById('file') as HTMLInputElement;
                fileInput.accept = '.pdf';
                fileInput.click();
                this.typeFile = 'pdf';
              },
              settings: {
                value: 'fal fa-file-pdf',
                color: '#87CD9B',
                callback: () => {
                },
              }
            },
            {
              value: translations["model.uploadExcel"],
              complete: true,
              callback: () => {
                const fileInput = document.getElementById('file') as HTMLInputElement;
                fileInput.accept = '.xls';
                fileInput.click();
                this.typeFile = 'xls';
              },
              settings: {
                value: 'fal fa-file-excel',
                color: '#87CD9B',
                callback: () => {
                },
              }
            },
          ],
        },
      };
  
      this.bottomSheet.open(OptionsMenuComponent, data);
    });
  }

  async saveAudio() {
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
      const result = await this.gptService.openAiWhisper((this.audio && new File([this.audio.blob], this.audio.title || 'audio.mp3', {type: (<Blob>this.audio.blob)?.type})),);

      this.router.navigate(['/ecommerce/laia-training'], {
        queryParams: {
          audioResult: result,
        },
      });

      dialogRef.close();
    } catch (error) {
      dialogRef.close();

      console.error(error);
      this.headerService.showErrorToast();
    }
  }

  async loadFileOption(event: Event) {
    const fileList = (event.target as HTMLInputElement).files;

    try {
      if (!fileList.length) return;
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList.item(i);
      
        const base64 = await fileToBase64(file);

        this.filesService.setFile(base64);
        this.router.navigate(['/ecommerce/laia-training'], {
          queryParams: {
            typeFile: this.typeFile,
          },
        });
      }
    } catch (error) {
      unlockUI();

      console.error(error);
      this.headerService.showErrorToast();
    }
  }

  goLaiaTraining() {
    this.router.navigate(['/ecommerce/laia-training'], {
      queryParams: {
        message: this.message.value,
      },
    });
  }

  resizeTextarea(textarea) {
    if(textarea.scrollHeight > 146) {
      textarea.style.height = 146 + "px";
      textarea.style.overflowY = "scroll";
      return;
    }
    if(textarea.scrollHeight > textarea.clientHeight) {
      textarea.style.height = textarea.scrollHeight > 39 ? textarea.scrollHeight + "px" : 39 + "px";
    } else {
      textarea.style.height = 0 + "px";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }

  onTextareaClick() {
    if(!this.message.value) {
      this.textareaAudio = true;
    }
  }

  onTextareaBlur() {
    if(!this.message.value) {
      this.textareaAudio = false;
    }
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
          this.saveAudio();
        }
        this.audio = null;
        this.recordRTCService.abortRecording();
        dialogSub.unsubscribe();
      });
  }

  goBack() {
    return this.router.navigate(['/ecommerce/laiachat-landing']);
  }

  async checkAutoResponse() {
    let id = this.headerService.user._id;
    await this.gptService.doUsersHaveAssistantActivated(
        [
          id
        ]
      ).then((res) => {
        console.log(res)
        console.log(res[`${id}`])
        this.autoResponse = res[`${id}`];
    });
  }

  async autoResponseSwitch() {
    try {
      await this.gptService.changeAssistantResponseMode().then((res)=> {
        this.autoResponse = res.automaticModeActivated;
      });
    } catch (error) {
      console.error(error);
      this.headerService.showErrorToast();
    }
  }
}
