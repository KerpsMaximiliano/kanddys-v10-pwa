import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Gpt3Service } from 'src/app/core/services/gpt3.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import {
  FormComponent,
  FormData,
} from 'src/app/shared/dialogs/form/form.component';
import { GeneralFormSubmissionDialogComponent } from 'src/app/shared/dialogs/general-form-submission-dialog/general-form-submission-dialog.component';
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
  generatedQA: {
    question: string;
    response: string;
  } = null;
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
  memoryName: string = null;
  queryParamsSubscription: Subscription;
  routeParamsSubscription: Subscription;
  memoryTextareaValueChangeSubscription: Subscription;
  memoryNameDialogSubscription: Subscription;
  vectorId: string = null;

  constructor(
    private gptService: Gpt3Service,
    public headerService: HeaderService,
    private dialog: DialogService,
    private matDialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.routeParamsSubscription = this.route.params.subscribe(
      async ({ vectorId }) => {
        this.vectorId = vectorId ? vectorId : null;

        this.queryParamsSubscription = this.route.queryParams.subscribe(
          async ({ jsondata }) => {
            const textarea: HTMLElement = document.querySelector('.base-text');

            textarea.addEventListener('input', () => {
              console.log('textarea scrollHeight', textarea.scrollHeight);
              if (textarea.scrollHeight > 171) {
                if (this.showExtendButton === false) {
                  this.showExtendButton = true;
                }

                if (this.alreadyClickedShowButton) {
                  textarea.style.height = 'auto'; // Reset height to auto
                  textarea.style.height = textarea.scrollHeight + 'px'; // Set the new height based on content
                  this.showExtendButton = false;
                }
                this.passedTextLimit = true;
              } else {
                this.showExtendButton = false;

                if (this.passedTextLimit) {
                  textarea.style.height = '171px';
                }
              }
            });

            document.addEventListener('keydown', (event: KeyboardEvent) => {
              const targetElement: HTMLElement = event.target as HTMLElement;

              if (
                (event.key === 'Delete' || event.key === 'Backspace') &&
                this.passedTextLimit &&
                targetElement.classList.contains('base-text') &&
                textarea.scrollHeight <= 171
              ) {
                textarea.style.height = '171px';
                this.showExtendButton = false;
                this.alreadyClickedShowButton = false;
              } else if (
                (event.key === 'Delete' || event.key === 'Backspace') &&
                this.passedTextLimit &&
                targetElement.classList.contains('base-text') &&
                textarea.scrollHeight >= 171
              ) {
                if (!this.timeoutDeleteKey)
                  this.timeoutDeleteKey = setTimeout(() => {
                    if (textarea.scrollHeight <= 171) {
                      textarea.style.height = '171px';
                      this.showExtendButton = false;
                      this.alreadyClickedShowButton = false;
                    }

                    clearTimeout(this.timeoutDeleteKey);
                  }, 400);
              }

              if (
                event.ctrlKey &&
                (event.key === 'x' || event.key === 'X') &&
                this.passedTextLimit &&
                targetElement.classList.contains('base-text')
              ) {
                // Your code to handle Ctrl + X here
                // Prevent the default behavior (cut action) if needed

                textarea.style.height = '171px';
                this.showExtendButton = false;
                this.alreadyClickedShowButton = false;

                if (!this.timeoutCutKey) {
                  this.timeoutCutKey = setTimeout(() => {
                    textarea.style.height = '171px';
                    this.showExtendButton = false;
                    this.alreadyClickedShowButton = false;
                  }, 400);
                }
                event.preventDefault();
              }
            });

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
            }

            if (this.vectorId) {
              await this.loadVectorData();
            }
          }
        );
      }
    );
  }

  async loadVectorData() {
    try {
      lockUI();

      const vectorData = await this.gptService.getVectorByIdInKnowledgeBase(
        this.vectorId
      );

      if (vectorData?.length) {
        this.form.get('memory').setValue(vectorData[0].text);
        this.memoryName = vectorData[0].name ? vectorData[0].name : null;

        setTimeout(() => {
          const textarea: HTMLElement = document.querySelector('.base-text');
          const event = new Event('input');

          textarea.dispatchEvent(event);
        }, 300);
      }

      unlockUI();
    } catch (error) {
      unlockUI();
      console.error(error);
    }
  }

  showMoreText() {
    const textarea: HTMLElement = document.querySelector('.base-text');
    textarea.style.height = 'auto'; // Reset height to auto
    textarea.style.height = textarea.scrollHeight + 'px'; // Set the new height based on content
    this.showExtendButton = false;
    this.alreadyClickedShowButton = true;
  }

  async testMemory() {
    try {
      lockUI();
      let response = await this.gptService.generateResponseForTemplate(
        {
          content: (this.form.get('memory').value as string).replace(/"/g, "'"),
          question: this.inputQuestionForm.get('question').value,
        },
        null,
        'Q&AExamples'
      );

      if (response) {
        response = ['.', ':'].includes(response[0])
          ? response.slice(1)
          : response;

        const qaObject = JSON.parse(response);

        this.generatedQA = {
          question: qaObject.question,
          response: qaObject.response,
        };

        // Usage example:
        if (this.isTextareaFullHeight('base-text')) {
          setTimeout(() => {
            // Call the function to scroll to the bottom smoothly
            this.scrollToBottom();
          }, 500);
        }
      }

      unlockUI();
    } catch (error) {
      unlockUI();
      this.headerService.showErrorToast();
      console.error(error);
    }
  }

  async editQA() {
    try {
      lockUI();

      let response = await this.gptService.generateResponseForTemplate(
        {
          question: this.generatedQA.question,
          previousResponse: this.generatedQA.response,
          newQuestion: this.questionForm.get('question').value,
          content: this.form.get('memory').value.replace(/"/g, "'"),
        },
        null,
        'Q&AEdit'
      );

      if (response) {
        response = ['.', ':'].includes(response[0])
          ? response.slice(1)
          : response;
        const qaObject = JSON.parse(response);

        this.generatedQA = {
          question: qaObject.question,
          response: qaObject.response,
        };
      }

      unlockUI();
    } catch (error) {
      unlockUI();
      this.headerService.showErrorToast();
      console.error(error);
    }
  }

  async editOrApplyQuestionChange() {
    if (this.editingQuestion) {
      const inputDivContent = document.querySelector(
        '#question-box-input'
      ).textContent;
      this.questionForm.get('question').setValue(inputDivContent)
      await this.editQA();
    }

    this.editingQuestion = !this.editingQuestion;

    if (this.editingQuestion) {
      setTimeout(() => {
        this.questionForm.get('question').setValue(this.generatedQA.question);
        const inputDiv = document.querySelector('#question-box-input');
        inputDiv.textContent = this.questionForm.get('question').value;

        (
          document.querySelector('#question-box-input') as HTMLInputElement
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

  back() {
    if (this.vectorId) {
      return this.router.navigate(['/ecommerce/laia-memories-management']);
    }

    return this.router.navigate(['/ecommerce/club-landing'], {
      queryParams: {
        tabarIndex: 2,
      },
    });
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

  ngOnDestroy() {
    this.routeParamsSubscription.unsubscribe();
    this.queryParamsSubscription.unsubscribe();
    this.memoryTextareaValueChangeSubscription.unsubscribe();
    this.memoryNameDialogSubscription?.unsubscribe();
  }
}
