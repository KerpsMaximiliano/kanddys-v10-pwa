import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
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
    private headerService: HeaderService,
    private toastrService: ToastrService
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

      this.toastrService.success(
        'Se ha entrenado al mago exitosamente con la data proporcionada'
      );
    } catch (error) {
      unlockUI();

      console.error(error);
      this.headerService.showErrorToast();
    }
  }

  async trainChatbotWithMyItems() {
    try {
      lockUI();

      await this.gptService.createEmbeddingsForMyMerchantItems();

      unlockUI();

      this.toastrService.success(
        'Se ha entrenado al mago exitosamente con los productos de tu tienda'
      );
    } catch (error) {
      unlockUI();

      console.error(error);
      this.headerService.showErrorToast();
    }
  }
}
