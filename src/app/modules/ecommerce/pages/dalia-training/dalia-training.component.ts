import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Gpt3Service } from 'src/app/core/services/gpt3.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { GeneralFormSubmissionDialogComponent } from 'src/app/shared/dialogs/general-form-submission-dialog/general-form-submission-dialog.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dalia-training',
  templateUrl: './dalia-training.component.html',
  styleUrls: ['./dalia-training.component.scss'],
})
export class DaliaTrainingComponent implements OnInit {
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
  laiaPlaceholder = `Ejemplo:\n\nTrabajamos de 8 a 9 de la noche, de lunes a viernes, y de 8 a 12pm los sábados, los domingos estamos cerrados. Trabajamos de 8 a 9 de la noche, de lunes a viernes, y de 8 a 12pm los sábados, los domingos estamos cerrados.\n\nTrabajamos de 8 a 9 de la noche, de lunes a viernes, y de 8 a 12pm los sábados, los domingos estamos cerrados.\n\n`;
  timeoutDeleteKey: any = null;
  timeoutCutKey: any = null;

  constructor(
    private gptService: Gpt3Service,
    public headerService: HeaderService,
    private dialog: DialogService,
    private saleflowsService: SaleFlowService
  ) {}

  ngOnInit(): void {
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
        response = response[0] === '.' ? response.slice(1) : response;

        const qaObject = JSON.parse(response);

        this.generatedQA = {
          question: qaObject.question,
          response: qaObject.response,
        };

        setTimeout(() => {
          // Call the function to scroll to the bottom smoothly
          this.scrollToBottom();
        }, 500);
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
        response = response[0] === '.' ? response.slice(1) : response;
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
      await this.editQA();
    } else {
      this.questionForm.get('question').setValue(this.generatedQA.question);
    }

    this.editingQuestion = !this.editingQuestion;
  }

  async saveMemoryInKnowledgeBase() {
    lockUI();

    try {
      await this.headerService.checkIfUserIsAMerchantAndFetchItsData();
      const dataFeeded = await this.gptService.feedKnowledgeBaseWithTextData(
        this.form.get('memory').value
      );

      if (dataFeeded) {
        this.dialog.open(GeneralFormSubmissionDialogComponent, {
          type: 'centralized-fullscreen',
          props: {
            message: 'Se ha registrado la memoria en laia exitosamente',
            icon: dataFeeded ? 'check-circle.svg' : 'sadFace.svg',
            showCloseButton: dataFeeded ? false : true,
          },
          customClass: 'app-dialog',
          flags: ['no-header'],
        });
      }
      unlockUI();
    } catch (error) {
      console.error(error);
      unlockUI();
    }
  }

  scrollToBottom() {
    const scrollElem = document.querySelector('#question-response-bottom');
    scrollElem.scrollIntoView();

    console.log('scrolleando');
  }
}
