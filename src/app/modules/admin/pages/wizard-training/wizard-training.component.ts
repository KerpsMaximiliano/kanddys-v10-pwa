import { Location } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
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
export class WizardTrainingComponent implements OnInit, OnDestroy {
  openNavigation: boolean = false;
  env: string = environment.assetsUrl;
  knowledgeBaseEmbeddingsContent: string = null;
  embeddingsLines: FormArray = this.formBuilder.array([]);
  vectorsIdByLineIndex: Record<number, string> = {};
  merchantSaleflow: SaleFlow = null;
  loadingKnowledge: boolean = false;
  whatsappQrCodeGenerated: boolean = false;
  whatsappConnected: boolean = false;
  triggerWhatsappClient: boolean = false;
  queryParamsSubscription: Subscription;
  pollingInterval = 5000; // Polling interval in milliseconds (15 seconds)
  abortController = new AbortController();
  signal = this.abortController.signal;
  pollingTimeout;

  constructor(
    private gptService: Gpt3Service,
    private headerService: HeaderService,
    private saleflowsService: SaleFlowService,
    private merchantsService: MerchantsService,
    private toastrService: ToastrService,
    private formBuilder: FormBuilder,
    private whatsappService: WhatsappService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
  ) {}

  async ngOnInit() {
    this.queryParamsSubscription = this.route.queryParams.subscribe(
      async ({ triggerWhatsappClient }) => {
        this.triggerWhatsappClient = JSON.parse(
          triggerWhatsappClient || 'false'
        );

        await this.headerService.checkIfUserIsAMerchantAndFetchItsData();
        this.merchantSaleflow = await this.saleflowsService.saleflowDefault(
          this.merchantsService.merchantData._id
        );

        this.whatsappService
          .clientConnectionStatus()
          .then((connected): any => {
            this.whatsappConnected = connected;

            if (!this.whatsappConnected && triggerWhatsappClient) {
              try {
                lockUI();
                this.createWhatsappClient();
                unlockUI();
              } catch (error) {
                unlockUI();
                console.error(error);
              }
            }
          })
          .catch((err) => console.error(err));

        this.loadingKnowledge = true;
        const embeddingQueryResponse =
          await this.gptService.fetchAllDataInVectorDatabaseNamespace(
            this.merchantSaleflow._id
          );

        if (
          embeddingQueryResponse?.data &&
          embeddingQueryResponse?.data?.length
        ) {
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
    );
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
        'Se ha entrenado a laia exitosamente con los productos de tu tienda'
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

      this.whatsappQrCodeGenerated = qrCode ? true : false;

      if (this.whatsappQrCodeGenerated) {
        this.pollingMechanismForWhatsappStatus();
      }
    } catch (error) {
      console.error(error);
    }
    unlockUI();
  }

  async exportOrdersDataForTraining() {
    await this.gptService.exportOrdersDataForTraining(
      this.merchantsService.merchantData._id
    );
  }

  async unlinkWhatsapp() {
    lockUI();
    try {
      const unlinked = await this.whatsappService.destroyClient();

      this.whatsappConnected = !unlinked;
      this.whatsappQrCodeGenerated = false;
    } catch (error) {
      console.error(error);
    }
    unlockUI();
  }

  pollingMechanismForWhatsappStatus = async () => {
    // Cancel the previous request if it's still ongoing
    this.abortController?.abort();

    this.abortController = new AbortController();
    this.signal = this.abortController.signal;

    fetch(`${environment.api.url}/whatsapp/clientConnectionStatus`, {
      signal: this.signal,
      headers: {
        'App-Key': `${environment.api.key}`,
        Authorization: 'Bearer ' + localStorage.getItem('session-token'),
      },
    })
      .then((response) => {
        console.log('then 1');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (typeof data === 'boolean') {
          this.whatsappConnected = data;

          if (this.whatsappConnected) {
            console.log('limpiando interval');
            clearInterval(this.pollingTimeout);
          }
        } else {
          throw Error('Error while checking whatsapp status');
        }
      })
      .catch((error) => {
        if (error.name === 'AbortError') {
          console.log('Previous request was aborted.');
        } else {
          console.error('Error fetching data:', error);
        }
      });

    if (!this.pollingTimeout && !this.whatsappConnected) {
      console.log('seteando timeout', this.pollingTimeout);
      this.pollingTimeout = setInterval(
        this.pollingMechanismForWhatsappStatus,
        this.pollingInterval
      );
      console.log('timeout seteado', this.pollingTimeout);
    }
  };

  back() {
    this.location.back();
  }

  ngOnDestroy(): void {
    this.queryParamsSubscription?.unsubscribe();
  }
}
