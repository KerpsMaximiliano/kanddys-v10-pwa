import { Component, OnInit } from '@angular/core';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { CustomFieldsComponent } from 'src/app/shared/dialogs/custom-fields/custom-fields.component';
import { MagicLinkDialogComponent } from 'src/app/shared/components/magic-link-dialog/magic-link-dialog.component';
import { CollaborationsComponent } from 'src/app/shared/dialogs/collaborations/collaborations.component';
import { StoreShareComponent } from 'src/app/shared/dialogs/store-share/store-share.component';
import {
  ItemDashboardOptionsComponent,
  DashboardOption,
} from 'src/app/shared/dialogs/item-dashboard-options/item-dashboard-options.component';
import { GeneralFormSubmissionDialogComponent } from 'src/app/shared/dialogs/general-form-submission-dialog/general-form-submission-dialog.component';
import { Questions } from '../../../../shared/components/form-questions/form-questions.component';
import { Tag } from '../../../../core/models/tags';
import { StoreShareList } from '../../../../shared/dialogs/store-share/store-share.component';
import { ReloadComponent } from 'src/app/shared/dialogs/reload/reload.component';
import { FormStep, FormField } from 'src/app/core/types/multistep-form';
import { FormControl } from '@angular/forms';
import { SettingsComponent } from 'src/app/shared/dialogs/settings/settings.component';
import { MediaDialogComponent } from 'src/app/shared/dialogs/media-dialog/media-dialog.component';
import { ItemsService } from 'src/app/core/services/items.service';
import { ItemInput } from 'src/app/core/models/item';
import { base64ToFile } from 'src/app/core/helpers/files.helpers';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { Merchant } from 'src/app/core/models/merchant';
import { SaleFlow } from 'src/app/core/models/saleflow';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
})
export class TestComponent implements OnInit {
  imageField: (string | ArrayBuffer)[] = [''];
  merchant: Merchant;
  saleflow: SaleFlow;

  constructor(
    private dialog: DialogService,
    private itemsService: ItemsService,
    private merchantService: MerchantsService,
    private saleflowService: SaleFlowService
  ) {}

  async ngOnInit() {
    this.merchant = await this.merchantService.merchantDefault();
    this.saleflow = await this.saleflowService.saleflowDefault(
      this.merchant._id
    );
  }

  fileProgressMultiple(e: Event) {
    const fileList = (e.target as HTMLInputElement).files;

    if (fileList.length > 0) {
      this.imageField = [];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList.item(i);

        const reader = new FileReader();
        reader.onload = (e) => {
          this.imageField[i] = reader.result;
        };

        reader.readAsDataURL(file);
      }

      (e.target as HTMLInputElement).value = null;
      return;
    }
  }

  async createItemForEachLoadedImage() {
    let productIndex = 0;
    for await (const image of this.imageField) {
      try {
        const itemInput: ItemInput = {
          name: 'Producto sin nombre #' + productIndex,
          description: null,
          pricing: 1,
          images: [base64ToFile(image as string)],
          merchant: this.merchant?._id,
          content: [],
          currencies: [],
          hasExtraPrice: false,
          purchaseLocations: [],
        };

        const { createItem } = await this.itemsService.createItem(itemInput);

        await this.saleflowService.addItemToSaleFlow(
          {
            item: createItem._id,
          },
          this.saleflow._id
        );
        productIndex++;
      } catch (error) {
        console.log(error);
      }
    }

    if (productIndex === this.imageField.length) {
      alert('productos creados exitosamente');
    }
  }
}
