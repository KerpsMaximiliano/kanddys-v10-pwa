import { Component, OnInit } from '@angular/core';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Gpt3Service } from 'src/app/core/services/gpt3.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-wizard-training',
  templateUrl: './wizard-training.component.html',
  styleUrls: ['./wizard-training.component.scss'],
})
export class WizardTrainingComponent implements OnInit {
  openNavigation: boolean = false;
  env: string = environment.assetsUrl;

  constructor(
    private gptService: Gpt3Service,
    private headerService: HeaderService
  ) {}

  ngOnInit(): void {}

  async loadFile(event: Event) {
    const fileList = (event.target as HTMLInputElement).files;

    try {
      lockUI();

      if (!fileList.length) return;
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList.item(i);

        await this.gptService.feedFileToKnowledgeBase(file);
      }

      unlockUI();
    } catch (error) {
      unlockUI();
      
      console.error(error);
      this.headerService.showErrorToast();
    }
  }
}
