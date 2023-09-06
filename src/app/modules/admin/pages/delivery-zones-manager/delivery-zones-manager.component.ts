import { Component, OnInit } from '@angular/core';

import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { DeliveryZonesService } from 'src/app/core/services/deliveryzones.service';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { FormData, FormComponent } from 'src/app/shared/dialogs/form/form.component';
import { HeaderService } from 'src/app/core/services/header.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { DeliveryZone, DeliveryZoneInput } from 'src/app/core/models/deliveryzone';

@Component({
  selector: 'app-delivery-zones-manager',
  templateUrl: './delivery-zones-manager.component.html',
  styleUrls: ['./delivery-zones-manager.component.scss']
})
export class DeliveryZonesManagerComponent implements OnInit {

  deliveryzones = [];

  constructor(
    private merchantsService: MerchantsService,
    private deliveryZonesService: DeliveryZonesService,
    private headerService: HeaderService,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.generate()
  }
  
  async generate() {
    lockUI()
    const merchant = await this.merchantsService.merchantDefault();
    this.deliveryzones = await this.deliveryZonesService.deliveryZones(
      {
        options: {
          limit: -1
        },
        findBy: {
          merchant: merchant._id
        }
      }
    )
    console.log(this.deliveryzones)
    unlockUI()
  }

  priceFormat(price: any) : any {
    return Number(price).toFixed(2);
  }

  createZone() {
    let fieldsToCreateForFormDialog: FormData = {
      fields: [],
    };
    const fieldsArrayForFieldValidation: Array<{
      fieldName: string;
      fieldKey: string;
      fieldTextDescription: string;
    }> = [];
    fieldsToCreateForFormDialog.fields = [
      {
        label: 'Nombra la Zona',
        name: 'zona',
        type: 'text',
        validators: [Validators.pattern(/[\S]/)],
      },
      {
        label: 'Descripción',
        name: 'name',
        type: 'text',
        validators: [Validators.pattern(/[\S]/)],
      },
    ];
    fieldsArrayForFieldValidation.push({
      fieldName: 'stock',
      fieldKey: 'zona',
      fieldTextDescription: 'Nombra la Zona',
    });
    fieldsArrayForFieldValidation.push({
      fieldName: 'notificationStockLimit',
      fieldKey: 'name',
      fieldTextDescription: 'Descripción',
    });
    const dialogRef = this.dialog.open(FormComponent, {
      data: fieldsToCreateForFormDialog,
    });

    dialogRef.afterClosed().subscribe(async (result: FormGroup) => {
      let isError = false;
      fieldsArrayForFieldValidation.forEach((field) => {
        let error = `${field.fieldTextDescription} invalido`;

        try {
          if (
            result?.value[field.fieldKey] &&
            result?.controls[field.fieldKey].valid
          ) {
          } else {
            isError = true;
            this.headerService.showErrorToast(error);
          }
        } catch (error) {
          console.error(error);
          this.headerService.showErrorToast(error);
        }
      });
      if (!isError) {
        lockUI()
        const merchant = await this.merchantsService.merchantDefault();
        console.log(result?.value)
        const {zona, name} = result?.value;
        const deliveryZone = await this.deliveryZonesService.create(
          merchant._id,
          {
            zona,
            name,
            type: "free"
          }
        )
        console.log(deliveryZone);
        this.generate()
        unlockUI()
      }
    });
  }

  editExtra(type: number, zone: any) {
    let label = ""
    if (type == 0) label = "Comprador pagará extra:"
    else if (type == 1) label = "Comprador pagará extra solo cuando el monto de su factura se menos a:"
    else label = "¿Cuánto te cuesta a ti hacer la entrega en esta zona?"
    let fieldsToCreateForFormDialog: FormData = {
      fields: [],
    };
    const fieldsArrayForFieldValidation: Array<{
      fieldName: string;
      fieldKey: string;
      fieldTextDescription: string;
    }> = [];
    fieldsToCreateForFormDialog.fields = [
      {
        label: label,
        name: 'price',
        type: 'number',
        validators: [Validators.pattern(/[\S]/), Validators.min(0.1)],
      },
    ];
    fieldsArrayForFieldValidation.push({
      fieldName: 'pricing',
      fieldKey: 'price',
      fieldTextDescription: label,
    });
    const dialogRef = this.dialog.open(FormComponent, {
      data: fieldsToCreateForFormDialog,
    });
    dialogRef.afterClosed().subscribe((result: FormGroup) => {
      let isError = false;
      fieldsArrayForFieldValidation.forEach((field) => {
        let error = `${field.fieldTextDescription} invalido`;

        try {
          if (
            result?.value[field.fieldKey] &&
            result?.controls[field.fieldKey].valid
          ) {
            // this.itemFormData.patchValue({
            //   [field.fieldName]: result?.value[field.fieldKey],
            // });
            console.log("King:", result?.value[field.fieldKey])
          } else {
            this.headerService.showErrorToast(error);
            isError = true;
          }
        } catch (error) {
          console.error(error);
          this.headerService.showErrorToast(error);
        }
      });
      if (!isError) {
        if (type == 0) this.updateDeliveryZone(zone, result?.value);
        if (type == 1) this.updateLesser(zone, result?.value);
        if (type == 2) this.updateExpenditure(zone, result?.value);
      }
    });

  }

  async updateDeliveryZone(zone : DeliveryZone, data: {price: string}) {
    // console.log("updateDeliveryZone", zone, data)
    let input: DeliveryZoneInput = {
      amount: Number(data.price)
    }
    if (!zone.lesserAmount) input.type = "zone"
    if (zone.lesserAmount) input.type = "lesser"
    lockUI()
    const deliveryZone = await this.deliveryZonesService.update(zone._id, input);
    console.log(deliveryZone);
    this.generate()
    unlockUI()
  }

  async updateLesser(zone : DeliveryZone, data: {price: string}) {
    // console.log("updateDeliveryZone", zone, data)
    const input: DeliveryZoneInput = {
      lesserAmount: Number(data.price),
      type: "lesser"
    }
    lockUI()
    const deliveryZone = await this.deliveryZonesService.update(zone._id, input);
    console.log(deliveryZone);
    this.generate()
    unlockUI()
  }

  async updateExpenditure(zone : DeliveryZone, data: {price: string}) {
    lockUI()
    if (zone.expenditure.length > 0) {
      const id = zone.expenditure[0];
      const expenditure = await this.deliveryZonesService.updateExpenditure(
        {
          amount: Number(data.price),
        },
        id
      );
      // console.log(expenditure)
    } else {
      const merchant = await this.merchantsService.merchantDefault()
      const expenditure = await this.deliveryZonesService.createExpenditure(
        merchant._id,
        {
          type: "delivery-zone",
          amount: Number(data.price),
        }
      );
      await this.deliveryZonesService.addExpenditure(expenditure._id, zone._id);
    }
    unlockUI()
  }

}
