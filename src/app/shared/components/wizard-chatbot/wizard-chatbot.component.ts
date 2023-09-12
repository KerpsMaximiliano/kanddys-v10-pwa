import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { ItemSubOrderInput } from 'src/app/core/models/order';
import { Gpt3Service } from 'src/app/core/services/gpt3.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-wizard-chatbot',
  templateUrl: './wizard-chatbot.component.html',
  styleUrls: ['./wizard-chatbot.component.scss'],
})
export class WizardChatbotComponent implements OnInit {
  history: Array<{
    type: 'USER' | 'WIZARD' | 'ERROR';
    value?: string;
  }> = [];
  loadingAnswer: boolean = false;
  qaForm: FormGroup = new FormGroup({
    input: new FormControl('', Validators.required),
  });
  chatBoxOpened: boolean = false;
  assetsURL: string = environment.assetsUrl;

  constructor(
    private gpt3Service: Gpt3Service,
    public headerService: HeaderService
  ) {}

  ngOnInit(): void {}

  async sendQuestion() {
    try {
      if (this.qaForm.valid) {
        const chatContainer = document.querySelector(
          '.questions-and-answers-wrapper'
        ) as HTMLElement;

        this.loadingAnswer = true;
        this.qaForm.get('input').disable();

        const prompt = this.qaForm.get('input').value;

        this.qaForm.get('input').reset();

        const requestResult =
          await this.gpt3Service.requestResponseFromKnowledgeBase(
            prompt,
            this.headerService.saleflow._id
          );

        if (requestResult) {
          this.history.push({
            type: 'USER',
            value: prompt,
          });

          this.history.push({
            type: 'WIZARD',
            value: requestResult.response,
          });
        }

        chatContainer.scrollTop = chatContainer.scrollHeight;

        this.loadingAnswer = false;
        this.qaForm.get('input').enable();
      }
    } catch (error) {
      this.loadingAnswer = false;
      this.qaForm.get('input').enable();
      console.error('Error', error);
      this.history.push({
        type: 'ERROR',
        value: 'Ocurrió un error, intenta de nuevo',
      });
    }
  }
}
