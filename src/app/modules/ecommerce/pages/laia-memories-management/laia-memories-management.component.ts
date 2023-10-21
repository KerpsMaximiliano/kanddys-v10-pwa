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

  constructor(
    private gptService: Gpt3Service,
    private headerService: HeaderService,
    private saleflowsService: SaleFlowService,
    private merchantsService: MerchantsService,
    private appService: AppService,
    private router: Router
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
    this.router.navigate(['/ecommerce/laia-training']);
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
}
