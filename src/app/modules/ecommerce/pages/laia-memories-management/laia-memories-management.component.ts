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

  inputOpen: boolean = false;
  audio: {
    blob: Blob;
    title: string;
  };
  typeFile: string;

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
  ) {}

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
    let data = {
      data: {
        description: 'Selecciona como adicionar el contenido:',
        options: [
          {
            value: 'Escribe o pega un texto',
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
            value: 'Adiciona un website',
            complete: true,
            callback: () => {
              
            },
            settings: {
              value: 'fal fa-keyboard',
              color: '#87CD9B',
              callback: () => {
              },
            }
          },
          {
            value: 'Texto desde tu micrófono',
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
            value: 'Carga un PDF',
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
            value: 'Carga un archivo de Excel',
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
  }

  async saveAudio() {
    let dialogRef;
    try {
      dialogRef = this.dialogService.open(StatusAudioRecorderComponent, {
        type: 'flat-action-sheet',
        props: {
          message: 'Conviertiéndo el audio a texto..',
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

  goBack() {
    this.router.navigate(['/ecommerce/club-landing'], {
      queryParams: {
        tabarIndex: 2,
      },
    });
  }

  resizeTextarea(textarea) {
    if(textarea.scrollHeight > 253) {
      textarea.style.height = 253 + "px";
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
}
