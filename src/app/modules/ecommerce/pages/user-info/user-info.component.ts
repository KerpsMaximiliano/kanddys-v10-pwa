import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderService } from 'src/app/core/services/header.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { WarningStepsComponent } from '../../../../shared/dialogs/warning-steps/warning-steps.component';
import { MagicLinkDialogComponent } from 'src/app/shared/components/magic-link-dialog/magic-link-dialog.component';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss'],
})
export class UserInfoComponent implements OnInit {
  constructor(
    private dialog: DialogService,
    private router: Router,
    public header: HeaderService
  ) {}

  warningSteps: {
    name: string;
    url: string;
    status: boolean;
  }[] = [];

  ngOnInit(): void {}

  redirect() {
    if (this.isDataMissing()) this.openWarningDialog();
    else {
      this.openMagicLinkDialog();
      // this.router.navigate([`ecommerce/flow-completion`])
    }
  }

  openWarningDialog() {
    const dialogref = this.dialog.open(WarningStepsComponent, {
      type: 'action-sheet',
      customClass: 'app-dialog',
      flags: ['no-header'],
      props: { steps: this.warningSteps },
    });
    const sub = dialogref.events
      .pipe(filter((e) => e.type === 'result'))
      .subscribe((e) => {
        if (e.data)
          this.router.navigate([`ecommerce/provider-store/${e.data}`]);
        sub.unsubscribe();
      });
  }

  openMagicLinkDialog() {
    this.dialog.open(MagicLinkDialogComponent, {
      type: 'flat-action-sheet',
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  isDataMissing(): boolean {
    this.warningSteps = [];
    if (
      this.header.saleflow.module.delivery &&
      this.header.saleflow.module.delivery.isActive
    ) {
      if (this.header.isComplete.delivery) {
        this.warningSteps.push({
          name: 'Entrega',
          url: 'pick-location',
          status: true,
        });
      } else {
        this.warningSteps.push({
          name: 'Entrega',
          url: 'pick-location',
          status: false,
        });
      }
    }
    if (this.header.items.some((item) => item.customizerId)) {
      if (this.header.isComplete.customizer) {
        this.warningSteps.push({
          name: 'Personalización',
          url: 'redirect-to-customizer',
          status: true,
        });
      } else {
        this.warningSteps.push({
          name: 'Personalización',
          url: 'redirect-to-customizer',
          status: false,
        });
      }
      if (this.header.isComplete.qualityQuantity) {
        this.warningSteps.push({
          name: 'Calidades',
          url: 'quantity-and-quality',
          status: true,
        });
      } else {
        this.warningSteps.push({
          name: 'Calidades',
          url: 'quantity-and-quality',
          status: false,
        });
      }
    }
    if (
      this.header.saleflow.module.appointment &&
      this.header.saleflow.module.appointment.isActive
    ) {
      if (this.header.isComplete.reservation) {
        this.warningSteps.push({
          name: 'Reservación',
          url: `reservation/${this.header.saleflow._id}`,
          status: true,
        });
      } else {
        this.warningSteps.push({
          name: 'Reservación',
          url: `reservation/${this.header.saleflow._id}`,
          status: false,
        });
      }
    }
    if (this.header.hasScenarios) {
      if (this.header.isComplete.scenarios) {
        this.warningSteps.push({
          name: 'Escenarios',
          url: 'select-pack',
          status: true,
        });
      } else {
        this.warningSteps.push({
          name: 'Escenarios',
          url: 'select-pack',
          status: false,
        });
      }
    }
    if (
      this.header.saleflow.module.post &&
      this.header.saleflow.module.post.isActive
    ) {
      if (this.header.isComplete.message) {
        this.warningSteps.push({
          name: 'Mensaje',
          url: 'gift-message',
          status: true,
        });
      } else {
        this.warningSteps.push({
          name: 'Mensaje',
          url: 'gift-message',
          status: false,
        });
      }
    }
    const isDataMissing = this.warningSteps.some(
      (value) => value.status === false
    );
    return isDataMissing;
  }
}
