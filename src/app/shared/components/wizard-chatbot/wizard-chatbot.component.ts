import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { ItemSubOrderInput } from 'src/app/core/models/order';
import { Gpt3Service } from 'src/app/core/services/gpt3.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HeaderService } from 'src/app/core/services/header.service';
import { environment } from 'src/environments/environment';
import { NewlineToBrPipe } from 'src/app/core/pipes/newline.pipe';
import { LinkifyPipe } from 'src/app/core/pipes/linkify.pipe';
import { Router } from '@angular/router';

@Component({
  selector: 'app-wizard-chatbot',
  templateUrl: './wizard-chatbot.component.html',
  styleUrls: ['./wizard-chatbot.component.scss'],
})
export class WizardChatbotComponent implements OnInit {
  history: Array<{
    type: 'USER' | 'WIZARD' | 'ERROR';
    value?: string | SafeHtml;
  }> = [];
  loadingAnswer: boolean = false;
  qaForm: FormGroup = new FormGroup({
    input: new FormControl('', Validators.required),
  });
  chatBoxOpened: boolean = false;
  conversationId: null = null;
  assetsURL: string = environment.assetsUrl;

  constructor(public headerService: HeaderService, private router: Router) {}

  ngOnInit(): void {}

  goToChat() {
    this.router.navigate(
      [
        'ecommerce/' +
          this.headerService.saleflow.merchant?.slug +
          '/chat-merchant/',
      ],
      {
        queryParams: {
          fromStore: true,
        },
      }
    );
  }
}
