import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { base64ToFile } from 'src/app/core/helpers/files.helpers';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Merchant } from 'src/app/core/models/merchant';
import { FilesService } from 'src/app/core/services/files.service';
import { Gpt3Service } from 'src/app/core/services/gpt3.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { RecordRTCService } from 'src/app/core/services/recordrtc.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { WhatsappService } from 'src/app/core/services/whatsapp.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { AudioRecorderComponent } from 'src/app/shared/components/audio-recorder/audio-recorder.component';
import {
  FormComponent,
  FormData,
} from 'src/app/shared/dialogs/form/form.component';
import { GeneralFormSubmissionDialogComponent } from 'src/app/shared/dialogs/general-form-submission-dialog/general-form-submission-dialog.component';
import { OptionsMenuComponent } from 'src/app/shared/dialogs/options-menu/options-menu.component';
import { StatusAudioRecorderComponent } from 'src/app/shared/dialogs/status-audio-recorder/status-audio-recorder.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dalia-training',
  templateUrl: './dalia-training.component.html',
  styleUrls: ['./dalia-training.component.scss'],
})
export class DaliaTrainingComponent implements OnInit, OnDestroy {
  assetsFolder: string = environment.assetsUrl;
  showExtendButton: boolean = false;
  alreadyClickedShowButton: boolean = false;
  passedTextLimit: boolean = false;
  form: FormGroup = new FormGroup({
    memory: new FormControl(''),
  });
  questionForm: FormGroup = new FormGroup({
    question: new FormControl(''),
  });
  inputQuestionForm: FormGroup = new FormGroup({
    question: new FormControl(''),
  });
  generatedQAQueryParam: {
    question: string;
    response: string;
  } = null;
  generatedQA: Array<{
    question: string;
    response: string;
  }> = null;
  editingQuestion: boolean = false;
  laiaPlaceholder = `Ejemplo:\n\nTrabajamos de 8 a 9 de la noche, de lunes a viernes, y de 8 a 12pm los sábados, los domingos estamos cerrados.`;
  timeoutDeleteKey: any = null;
  timeoutCutKey: any = null;
  showLogin: boolean = false;
  loginData = {
    redirectionRoute: '/ecommerce/laia-training',
    redirectionRouteId: null,
    entity: 'MerchantAccess',
    jsondata: '',
  };
  loginDataUpload = {
    redirectionRoute: '/ecommerce/laia-training',
    redirectionRouteId: null,
    entity: 'MerchantAccess',
    jsondata: '',
  };
  memoryName: string = null;
  queryParamsSubscription: Subscription;
  routeParamsSubscription: Subscription;
  memoryTextareaValueChangeSubscription: Subscription;
  memoryNameDialogSubscription: Subscription;
  vectorId: string = null;
  showTextError = false;
  timer: any;
  requestResponse: boolean = false;
  memories: Array<{
    content: string;
    vectorId: string;
    name?:string;
  }> = [];
  showDots: boolean = false;
  editingIndex: number = -1;
  clientConnectionStatus = false;
  uploadFile: boolean = false;
  sendUrl: boolean = false;
  event: Event;
  url: string;
  audio: {
    blob: Blob;
    title: string;
  }
  audioText = new FormControl({ value: null, disabled: false }, Validators.required);
  file: File;
  typeFile: string;
  clicked: boolean = true;
  showTextareaMemory: boolean = false;
  vectorText: string = null;
  showMemories: boolean = false;

  constructor(
    private gptService: Gpt3Service,
    public headerService: HeaderService,
    private dialog: DialogService,
    private matDialog: MatDialog,
    private bottomSheet: MatBottomSheet,
    private router: Router,
    private route: ActivatedRoute,
    private merchantsService: MerchantsService,
    private whatsappService: WhatsappService,
    private toastrService: ToastrService,
    private recordRTCService: RecordRTCService,
    private filesService: FilesService,
  ) {}

  async ngOnInit() {
    this.clientConnectionStatus = await this.whatsappService.clientConnectionStatus();
    console.log(this.clientConnectionStatus);

    this.routeParamsSubscription = this.route.params.subscribe(
      async ({ vectorId }) => {
        this.vectorId = vectorId ? vectorId : null;

        this.queryParamsSubscription = this.route.queryParams.subscribe(
          async ({ jsondata, message, audioResult, typeFile }) => {
            if (message) {
              if(this.headerService.user) {
                this.requestResponse = true;
                this.testMemoryQueryParam(message);
                return;
              } else this.router.navigate(['/ecommerce/laia-memories-management']);
            };

            if (audioResult) {
              this.form.get('memory').setValue(audioResult);
              this.testMemory();
            }

            if (typeFile) {
              const base64 = this.filesService.getFile();
              this.file = await base64ToFile(base64);
              this.typeFile = typeFile;
              this.clicked = false;
            }

            this.memoryTextareaValueChangeSubscription = this.form
              .get('memory')
              .valueChanges.subscribe((change) => {
                this.loginData.jsondata = JSON.stringify({
                  memoryToSave: this.form.get('memory').value,
                  memoryName: this.memoryName,
                });
              });

            if (jsondata) {
              let parsedData = JSON.parse(decodeURIComponent(jsondata));

              if (parsedData.memoryToSave) {
                this.form.get('memory').setValue(parsedData.memoryToSave);
                this.memoryName = parsedData.memoryName;
                await this.saveMemoryInKnowledgeBase();

                const urlWithoutQueryParams = this.router.url.split('?')[0];

                window.history.replaceState(
                  {},
                  'SaleFlow',
                  urlWithoutQueryParams
                );
              }

              if(parsedData.url) {
                this.url = parsedData.url;
                await this.saveUrl();

                const urlWithoutQueryParams = this.router.url.split('?')[0];

                window.history.replaceState(
                  {},
                  'SaleFlow',
                  urlWithoutQueryParams
                );
              }
            }

            if (this.vectorId) {
              this.showDots = true;
              await this.loadVectorData();
            }

            const textarea = document.getElementById('autoExpandTextarea');

            textarea.addEventListener('input', function () {
              this.style.height = 'auto';
              this.style.height = (this.scrollHeight) + 'px';
            });

            const textareaMemory: HTMLElement = document.querySelector('.base-text');

            textareaMemory.addEventListener('input', function () {
              this.style.height = 'auto';
              this.style.height = (this.scrollHeight) + 'px';
            });

            // textarea?.addEventListener('input', () => {
            //   console.log('textarea scrollHeight', textarea.scrollHeight);
            //   if (textarea.scrollHeight > 215) {
            //     if (this.showExtendButton === false) {
            //       this.showExtendButton = true;
            //     }

            //     if (this.alreadyClickedShowButton) {
            //       textarea.style.height = 'auto'; // Reset height to auto
            //       textarea.style.height = textarea.scrollHeight + 'px'; // Set the new height based on content
            //       this.showExtendButton = false;
            //     }
            //     this.passedTextLimit = true;
            //   } else {
            //     this.showExtendButton = false;

            //     if (this.passedTextLimit) {
            //       textarea.style.height = '215px';
            //     }
            //   }
            // });

            // document.addEventListener('keydown', (event: KeyboardEvent) => {
            //   const targetElement: HTMLElement = event.target as HTMLElement;

            //   if (
            //     (event.key === 'Delete' || event.key === 'Backspace') &&
            //     this.passedTextLimit &&
            //     targetElement.classList.contains('base-text') &&
            //     textarea.scrollHeight <= 215
            //   ) {
            //     textarea.style.height = '215px';
            //     this.showExtendButton = false;
            //     this.alreadyClickedShowButton = false;
            //   } else if (
            //     (event.key === 'Delete' || event.key === 'Backspace') &&
            //     this.passedTextLimit &&
            //     targetElement.classList.contains('base-text') &&
            //     textarea.scrollHeight >= 215
            //   ) {
            //     if (!this.timeoutDeleteKey)
            //       this.timeoutDeleteKey = setTimeout(() => {
            //         if (textarea.scrollHeight <= 215) {
            //           textarea.style.height = '215px';
            //           this.showExtendButton = false;
            //           this.alreadyClickedShowButton = false;
            //         }

            //         clearTimeout(this.timeoutDeleteKey);
            //       }, 400);
            //   }

            //   if (
            //     event.ctrlKey &&
            //     (event.key === 'x' || event.key === 'X') &&
            //     this.passedTextLimit &&
            //     targetElement.classList.contains('base-text')
            //   ) {
            //     // Your code to handle Ctrl + X here
            //     // Prevent the default behavior (cut action) if needed

            //     textarea.style.height = '215px';
            //     this.showExtendButton = false;
            //     this.alreadyClickedShowButton = false;

            //     if (!this.timeoutCutKey) {
            //       this.timeoutCutKey = setTimeout(() => {
            //         textarea.style.height = '215px';
            //         this.showExtendButton = false;
            //         this.alreadyClickedShowButton = false;
            //       }, 400);
            //     }
            //     event.preventDefault();
            //   }
            // });
          }
        );
      }
    );
  }

  onKeyUp() {
    this.showDots = true;
    const words = this.form.get('memory')?.value.trim()?.split(/\s+/);
    
    // if(this.form.get('memory')?.value !== null) this.generatedQA = null;
    
    this.showTextError = this.form.get('memory')?.value === '' ? false : words?.length < 3 ? true : false;

    if(words?.length >= 3) {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.testMemory();
      }, 2000);
    }
  }

  async loadVectorData() {
    try {
      lockUI();

      const vectorData = await this.gptService.getVectorByIdInKnowledgeBase(
        this.vectorId
      );

      if (vectorData?.length) {
        this.showDots = true;
        this.vectorText = vectorData[0].text;
        this.form.get('memory').setValue(vectorData[0].text);
        this.memoryName = vectorData[0].name ? vectorData[0].name : null;
        this.clicked = false;

        // this.testMemory();

        // setTimeout(() => {
        //   const textarea: HTMLElement = document.querySelector('.base-text');
        //   const event = new Event('input');

        //   textarea.dispatchEvent(event);
        // }, 300);
      }

      unlockUI();
    } catch (error) {
      unlockUI();
      console.error(error);
    }
  }

  // showMoreText() {
  //   const textarea: HTMLElement = document.querySelector('.base-text');
  //   textarea.style.height = 'auto'; // Reset height to auto
  //   textarea.style.height = textarea.scrollHeight + 'px'; // Set the new height based on content
  //   this.showExtendButton = false;
  //   this.alreadyClickedShowButton = true;
  // }

  async testMemory(audioQuestion?: boolean) {
    try {
      if(audioQuestion) lockUI();
      let response = await this.gptService.generateResponseForTemplate(
        {
          content: this.form.get('memory').value ? (this.form.get('memory').value as string).replace(/"/g, "'") : '',
          question: audioQuestion ? this.audioText.value : '',
        },
        null,
        'Q&AExamples'
      );

      if (response) {
        response = ['.', ':'].includes(response[0])
          ? response.slice(1)
          : response;

        const qaObject = JSON.parse(response);

        if (this.generatedQA) {
          this.generatedQA.push({
            question: qaObject.question,
            response: qaObject.response,
          });
        } else {
          this.generatedQA = [{
            question: qaObject.question,
            response: qaObject.response,
          }];
        }

        // Usage example:
        if (this.isTextareaFullHeight('base-text')) {
          setTimeout(() => {
            // Call the function to scroll to the bottom smoothly
            this.scrollToBottom();
          }, 500);
        }
      }

      this.showDots = false;
      this.showTextareaMemory = true;

      if(audioQuestion) {
        unlockUI();
        this.audioText.setValue(null);
        const textarea = document.getElementById('autoExpandTextarea');
        textarea.style.height = '51px';
      };
    } catch (error) {
      if(audioQuestion) unlockUI();
      this.showDots = false;
      this.headerService.showErrorToast();
      console.error(error);
    }
  }

  async openAiRequestResponseFromFile() {
    try {
      let response = await this.gptService.openAiRequestResponseFromFile(
        this.file,
        this.audioText.value,
      );

      if (response) {
        if (this.generatedQA) {
          this.generatedQA.push({
            question: this.audioText.value,
            response: response?.response,
          });
        } else {
          this.generatedQA = [{
            question: this.audioText.value,
            response: response?.response,
          }];
        }
      }
      this.showDots = false;
      this.audioText.setValue(null);
    } catch (error) {
      this.showDots = false;
      this.headerService.showErrorToast();
      console.error(error);
    }
  }

  async editQA(index?: number) {
    console.log(this.generatedQA[index])
    try {
      lockUI();

      let response = await this.gptService.generateResponseForTemplate(
        {
          question: this.generatedQA[index]?.question,
          previousResponse: this.generatedQA[index]?.response,
          newQuestion: this.questionForm.get('question').value,
          content: this.form.get('memory').value ? this.form.get('memory').value.replace(/"/g, "'") : '',
        },
        null,
        'Q&AEdit'
      );

      if (response) {
        response = ['.', ':'].includes(response[0])
          ? response.slice(1)
          : response;
        const qaObject = JSON.parse(response);

        this.generatedQA.splice(index, 1, {
          question: qaObject.question,
          response: qaObject.response,
        });
        // this.generatedQA = {
        //   question: qaObject.question,
        //   response: qaObject.response,
        // };
      }

      this.editingIndex = -1;
      unlockUI();
    } catch (error) {
      this.editingIndex = -1;
      unlockUI();
      this.headerService.showErrorToast();
      console.error(error);
    }
  }

  async testMemoryQueryParam(message: string) {
    try {
      lockUI();

      const merchant = await this.merchantsService.merchantDefault();

      const input = {
        prompt: message,
        userId: merchant?.owner?._id,
        merchantId: merchant?._id,
        isAuthorization: true,
      };

      let response = (await this.gptService.requestResponseFromKnowledgeBaseJson(input))?.response;

      if (response) {
        this.memories = response?.metadatas;
        this.generatedQAQueryParam = {
          question: message,
          response: response?.message,
        };
      }

      unlockUI();
    } catch (error) {
      unlockUI();
      this.generatedQAQueryParam = {
        question: message,
        response: 'No tenemos respuesta a eso en este momento',
      };
      console.error(error);
    }
  }

  async editQAQueryParam() {
    try {
      lockUI();

      const merchant = await this.merchantsService.merchantDefault();

      const input = {
        prompt: this.questionForm.get('question').value,
        userId: merchant?.owner?._id,
        merchantId: merchant?._id,
        isAuthorization: true,
      };

      let response = (await this.gptService.requestResponseFromKnowledgeBaseJson(input))?.response;

      if (response) {
        this.memories = response?.metadatas;
        this.generatedQAQueryParam = {
          question: this.questionForm.get('question').value,
          response: response?.message,
        };
      }

      unlockUI();
    } catch (error) {
      unlockUI();
      this.headerService.showErrorToast();
      console.error(error);
    }
  }

  async editOrApplyQuestionChange(index?: number) {
    this.editingIndex = index;
    console.log(index);
    if (this.editingQuestion) {
      const inputDivContent = document.querySelector(
        (index || index === 0) ? `#question-box-input${index}` : '#question-box-input'
      ).textContent;
      this.questionForm.get('question').setValue(inputDivContent)
      this.requestResponse ? await this.editQAQueryParam() : await this.editQA(index);
    }

    this.editingQuestion = !this.editingQuestion;

    if (this.editingQuestion) {
      setTimeout(() => {
        this.questionForm.get('question').setValue('');
        const inputDiv = document.querySelector((index || index === 0) ? `#question-box-input${index}` : '#question-box-input');
        inputDiv.textContent = this.questionForm.get('question').value;

        (
          document.querySelector((index || index === 0) ? `#question-box-input${index}` : '#question-box-input') as HTMLInputElement
        ).focus();
      }, 200);
    }
  }

  async saveMemoryInKnowledgeBase() {
    if (this.headerService.user) {
      this.showLogin = false;

      lockUI();

      try {
        await this.headerService.checkIfUserIsAMerchantAndFetchItsData();

        let success = false;

        if (!this.vectorId) {
          const dataFeeded =
            await this.gptService.feedKnowledgeBaseWithTextData(
              this.form.get('memory').value,
              this.memoryName
            );

          success = dataFeeded ? true : false;
        } else {
          const vectorInserted =
            await this.gptService.updateVectorInKnowledgeBase(
              this.vectorId,
              this.form.get('memory').value,
              this.memoryName
            );

          if (vectorInserted?.vector) {
            this.vectorId = vectorInserted.vector.id;
            success = true;
          }
        }

        this.dialog.open(GeneralFormSubmissionDialogComponent, {
          type: 'centralized-fullscreen',
          props: {
            message: success
              ? 'Se ha registrado la memoria en laia exitosamente'
              : 'Ocurrió un error inesperado',
            icon: success ? 'check-circle.svg' : 'sadFace.svg',
            showCloseButton: success ? false : true,
          },
          customClass: 'app-dialog',
          flags: ['no-header'],
        });

        unlockUI();
      } catch (error) {
        console.error(error);
        unlockUI();
      }
    } else {
      this.showLogin = !this.showLogin;
    }
  }

  scrollToBottom() {
    const scrollElem = document.querySelector('#question-response-bottom');
    scrollElem.scrollIntoView();

    console.log('scrolleando');
  }

  isTextareaFullHeight(textareaId: string) {
    const textarea = document.getElementById(textareaId); // Replace 'yourTextareaId' with the actual ID of your textarea element

    const textareaHeight = textarea.offsetHeight;
    const windowHeight = window.innerHeight;

    return textareaHeight >= windowHeight;
  }

  goBack() {
    // if (
    //   (this.form.get('memory').value && (this.generatedQA && this.generatedQA?.length > 0 && this.generatedQA[0]?.response)) 
    //   || (this.form.get('memory').value === null && (this.generatedQA && this.generatedQA?.length > 0 && this.generatedQA[0]?.response))
    // ) {
    //   this.saveMemoryInKnowledgeBase();
    // }

    if (this.vectorId || this.requestResponse) {
      return this.router.navigate(['/ecommerce/laia-memories-management']);
    }

    return this.router.navigate(['/ecommerce/laiachat-landing']);
  }

  editMemory(id: string) {
    this.router.navigate(['/ecommerce/laia-training/' + id]);
  }

  editMemoryName = () => {
    let fieldsToCreate: FormData = {
      fields: [
        {
          label: 'Nombre de la memoria',
          name: 'memoryName',
          type: 'text',
          validators: [Validators.pattern(/[\S]/), Validators.required],
        },
      ],
      automaticallyFocusFirstField: true,
    };

    const dialogRef = this.matDialog.open(FormComponent, {
      data: fieldsToCreate,
    });

    this.memoryNameDialogSubscription = dialogRef
      .afterClosed()
      .subscribe(async (result: FormGroup) => {
        if (result?.value['memoryName']) {
          this.memoryName = result?.value['memoryName'];

          this.loginData.jsondata = JSON.stringify({
            memoryToSave: this.form.get('memory').value,
            memoryName: this.memoryName,
          });

          if (
            this.vectorId &&
            this.form.get('memory').value &&
            this.memoryName
          ) {
            lockUI();

            await this.gptService.updateVectorInKnowledgeBase(
              this.vectorId,
              this.form.get('memory').value,
              this.memoryName
            );

            unlockUI();
          }
        }
      });
  };

  openIntegrationsDialog() {
    let data: {
      data: {
        description: string;
        options: {
            value: string;
            callback: () => void;
            settings?: {
              value: string;
              callback: () => void;
            }
        }[];
      };
    } = {
      data: {
        description: 'Integraciones:',
        options: [
          {
            value: 'Custom Website',
            callback: () => {
              
            },
          },
          {
            value: 'Enlace',
            callback: () => {
              
            },
          },
          {
            value: 'Shopify',
            callback: () => {
              
            },
          },
          {
            value: 'WordPress',
            callback: () => {
              
            },
          },
          {
            value: 'Squarespace',
            callback: () => {
              
            },
          },
          {
            value: 'Instagram',
            callback: () => {
              
            },
          },
        ],
      },
    };

    if (this.clientConnectionStatus) {
      data.data.options.splice(1, 0, {
        value: 'WhatsApp vinculado',
        callback: () => {
          return this.router.navigate(['/admin/wizard-training'], {
            queryParams: {
              triggerWhatsappClient: true
            }
          });
        },
        settings: {
          value: 'fa fa-gear',
          callback: () => {
            this.bottomSheet.open(
              OptionsMenuComponent,
              {
                data: {
                  title: '¿Desvincular WhatsApp?',
                  options: [
                    {
                      value: 'Si, desvincular',
                      callback: async () => {
                        lockUI();
                        try {
                          await this.whatsappService.destroyClient();
                          this.clientConnectionStatus = false;
                        } catch (error) {
                          console.error(error);
                        }
                        unlockUI();
                      },
                    },
                    {
                      value: 'Volver atrás',
                      callback: () => {
                        this.bottomSheet.open(
                          OptionsMenuComponent,
                          data
                        );
                      },
                    },
                  ],
                },
              }
            )
          },
        }
      });
    } else {
      data.data.options.splice(1, 0, {
        value: 'WhatsApp (dura 20segs. y debes escanear el QR que te saldrá desde tu WhatsApp Mobile)',
        callback: () => {
          return this.router.navigate(['/admin/wizard-training'], {
            queryParams: {
              triggerWhatsappClient: true
            }
          });
        },
      });
    }

    const dialog = this.bottomSheet.open(
      OptionsMenuComponent,
      data
    )
  }

  openUploadFile() {
    let data = {
      data: {
        description: 'Agrega:',
        options: [
          {
            value: 'URL',
            callback: () => {
              this.openFormUrl();
            },
          },
          {
            value: 'PDF',
            callback: () => {
              const fileInput = document.getElementById('file') as HTMLInputElement;
              fileInput.accept = '.pdf';
              fileInput.click();
            },
          },
          {
            value: 'CSV',
            callback: () => {
              
            },
          },
          {
            value: 'XLS',
            callback: () => {
              const fileInput = document.getElementById('file') as HTMLInputElement;
              fileInput.accept = '.xls';
              fileInput.click();
            },
          },
          {
            value: 'TXT',
            callback: () => {
              const fileInput = document.getElementById('file') as HTMLInputElement;
              fileInput.accept = '.txt';
              fileInput.click();
            },
          },
        ],
      },
    };

    if(window.location.hostname === 'laiachat.com') {
      data.data.options.push(
        {
          value: 'Funcionalidades del Ecommerce',
          callback: () => {
            this.router.navigate(['/ecommerce/club-landing']);
          },
        },
      );
    }

    const dialog = this.bottomSheet.open(
      OptionsMenuComponent,
      data
    )
  }

  async openFormUrl() {
    let fieldsToCreate: FormData = {
      fields: [],
    };

    const urlPattern = /^(https?|ftp|file):\/\/[-a-zA-Z0-9+&@#/%?=~_|!:,.;]*[-a-zA-Z0-9+&@#/%=~_|]/;

    fieldsToCreate.fields = [
      {
        label: 'URL',
        name: 'url',
        type: 'text',
        validators: [Validators.compose([Validators.required, Validators.pattern(urlPattern)])],
      },
    ];

    const dialogRef = this.matDialog.open(FormComponent, {
      data: fieldsToCreate,
    });

    dialogRef.afterClosed().subscribe(async (result: FormGroup) => {
      if (result.value['url']) {
        this.url = result.value['url'];
        if(!this.headerService.user) {
          this.loginDataUpload.jsondata = JSON.stringify({
            url: this.url,
          });
          this.showLogin = !this.showLogin;
          this.sendUrl = true;
          return;
        }

        lockUI()

        try {
          const merchantId: string = await this.getMerchantDefault();
          const resultScraper = await this.gptService.scraperMerchant(
            [this.url],
            merchantId
          );

          this.toastrService.success(
            'Todas las solicitudes se han completado correctamente.'
          );
          
          unlockUI();
        } catch (error) {
          console.log(error);
          this.headerService.showErrorToast(error);
          unlockUI();
        }
      }
    });
  }

  async saveUrl() {
    lockUI()
    this.sendUrl = false;

    try {
      const merchantId: string = await this.getMerchantDefault();
      const resultScraper = await this.gptService.scraperMerchant(
        [this.url],
        merchantId
      );

      let success = resultScraper ? true : false;

      this.dialog.open(GeneralFormSubmissionDialogComponent, {
        type: 'centralized-fullscreen',
        props: {
          message: success
            ? 'Todas las solicitudes se han completado correctamente.'
            : 'Ocurrió un error inesperado',
          icon: success ? 'check-circle.svg' : 'sadFace.svg',
          showCloseButton: success ? false : true,
        },
        customClass: 'app-dialog',
        flags: ['no-header'],
      });
      unlockUI();
    } catch (error) {
      console.log(error);
      this.headerService.showErrorToast(error);
      unlockUI();
    }
  }

  async getMerchantDefault() {
    try {
      const merchantDefault: Merchant = await this.merchantsService.merchantDefault();
      return merchantDefault._id;
    } catch (error) {
      console.log(error);
    }
  }

  async loadFile(event?: Event) {
    if(!this.headerService.user) {
      this.showLogin = !this.showLogin;
      this.uploadFile = true;
      this.event = event;
      return;
    }
    
    const fileList = event ? (event.target as HTMLInputElement).files : (this.event.target as HTMLInputElement).files;
    this.uploadFile = false;

    try {
      lockUI();

      if (!fileList.length) return;
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList.item(i);

        await this.gptService.feedFileToKnowledgeBase(file);
      }

      unlockUI();

      this.toastrService.success(
        'Se ha entrenado al mago exitosamente con la data proporcionada'
      );
    } catch (error) {
      unlockUI();

      console.error(error);
      this.headerService.showErrorToast();
    }
  }

  openRecorder() {
    const dialogref = this.dialog.open(AudioRecorderComponent,{
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

  async saveAudio() {
    let dialogRef;
    try {
      dialogRef = this.dialog.open(StatusAudioRecorderComponent, {
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

      this.audioText.setValue(result);
      if(this.typeFile) this.showDots = true;
      if(!this.typeFile) {
        const textarea = document.getElementById('autoExpandTextarea');
        const inputEvent = new Event('input', { bubbles: true });
        textarea.dispatchEvent(inputEvent);
      }
      dialogRef.close();
    } catch (error) {
      dialogRef.close();
      if(this.typeFile) this.showDots = true;
      console.error(error);
      this.headerService.showErrorToast();
    }
  }

  ngOnDestroy() {
    this.routeParamsSubscription.unsubscribe();
    this.queryParamsSubscription.unsubscribe();
    this.memoryTextareaValueChangeSubscription?.unsubscribe();
    this.memoryNameDialogSubscription?.unsubscribe();
  }
}
