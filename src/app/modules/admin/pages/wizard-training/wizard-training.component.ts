import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { Gpt3Service } from 'src/app/core/services/gpt3.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { WhatsappService } from 'src/app/core/services/whatsapp.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-wizard-training',
  templateUrl: './wizard-training.component.html',
  styleUrls: ['./wizard-training.component.scss'],
})
export class WizardTrainingComponent implements OnInit {
  openNavigation: boolean = false;
  env: string = environment.assetsUrl;
  knowledgeBaseEmbeddingsContent: string = null;
  embeddingsLines: FormArray = this.formBuilder.array([]);
  vectorsIdByLineIndex: Record<number, string> = {};
  merchantSaleflow: SaleFlow = null;
  loadingKnowledge: boolean = false;
  whatsappQrCodeGenerated: boolean = false;

  constructor(
    private gptService: Gpt3Service,
    private headerService: HeaderService,
    private saleflowsService: SaleFlowService,
    private merchantsService: MerchantsService,
    private toastrService: ToastrService,
    private formBuilder: FormBuilder,
    private whatsappService: WhatsappService
  ) {}

  async ngOnInit() {
    await this.headerService.checkIfUserIsAMerchantAndFetchItsData();
    this.merchantSaleflow = await this.saleflowsService.saleflowDefault(
      this.merchantsService.merchantData._id
    );

    this.loadingKnowledge = true;
    const embeddingQueryResponse =
      await this.gptService.fetchAllDataInVectorDatabaseNamespace(
        this.merchantSaleflow._id
      );

    if (embeddingQueryResponse?.data && embeddingQueryResponse?.data?.length) {
      embeddingQueryResponse?.data.forEach((lineObject) => {
        this.embeddingsLines.push(
          this.formBuilder.control(
            lineObject.text,
            Validators.compose([
              Validators.pattern(/[\S]/),
              Validators.required,
            ])
          )
        );

        this.vectorsIdByLineIndex[this.embeddingsLines.length - 1] =
          lineObject.id;
      });
    }

    this.loadingKnowledge = false;
  }

  async deleteKnowledgeData(index: number) {
    lockUI();

    try {
      if (this.vectorsIdByLineIndex[index]) {
        await this.gptService.deleteVectorInKnowledgeBase(
          this.vectorsIdByLineIndex[index]
        );
      }
      this.embeddingsLines.removeAt(index);
    } catch (error) {
      console.error(error);
    }

    unlockUI();
  }

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

  getFormControl(data: any): FormControl {
    return data;
  }

  getFormArray(data: any): FormArray {
    return data;
  }

  addALineToKnowledgeBase() {
    this.embeddingsLines.push(
      this.formBuilder.control(
        '',
        Validators.compose([Validators.pattern(/[\S]/), Validators.required])
      )
    );
  }

  async saveChangesInKnowledgeBaseData(index: number) {
    const knowledgeFieldControl = this.embeddingsLines.controls[index].value;

    lockUI();

    try {
      const vectorInserted =
        await this.gptService.feedKnowledgeBaseWithTextData(
          knowledgeFieldControl
        );

      this.vectorsIdByLineIndex[index] = vectorInserted.vector.id;
    } catch (error) {
      console.error(error);
    }

    unlockUI();
  }

  async updateChangesInKnowledgeBaseData(index: number) {
    lockUI();

    try {
      const knowledgeFieldControl = this.embeddingsLines.controls[index].value;

      const vectorInserted = await this.gptService.updateVectorInKnowledgeBase(
        this.vectorsIdByLineIndex[index],
        knowledgeFieldControl
      );

      this.vectorsIdByLineIndex[index] = vectorInserted.vector.id;
    } catch (error) {
      console.error(error);
    }

    unlockUI();
  }

  async createWhatsappClient() {
    lockUI();

    try {
      let qrCode = await this.whatsappService.createClient();
      
      const imgElement: HTMLElement =
        document.getElementById('whatsapp-qrcode');
      (imgElement as HTMLImageElement).src = qrCode;

      console.log("qrCode", qrCode),

      this.whatsappQrCodeGenerated = qrCode ? true : false;
    } catch (error) {
      console.error(error);
    }
    unlockUI();
  }

  async exportOrdersDataForTraining() {
    await this.gptService.exportOrdersDataForTraining(this.merchantsService.merchantData._id);
  }
}
