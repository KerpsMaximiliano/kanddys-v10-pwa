import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { WhatsappService } from 'src/app/core/services/whatsapp.service';
import { OptionsMenuComponent } from 'src/app/shared/dialogs/options-menu/options-menu.component';

@Component({
  selector: 'app-laiachat-integrations',
  templateUrl: './laiachat-integrations.component.html',
  styleUrls: ['./laiachat-integrations.component.scss']
})
export class LaiachatIntegrationsComponent implements OnInit {
  clientConnectionStatus: boolean = false;

  constructor(
    private location: Location,
    private whatsappService: WhatsappService,
    private router: Router,
    private bottomSheet: MatBottomSheet,
  ) { }

  async ngOnInit() {
    this.clientConnectionStatus = await this.whatsappService.clientConnectionStatus();
    console.log(this.clientConnectionStatus);
  }

  optionsWhatsApp() {
    if(this.clientConnectionStatus) {
      this.bottomSheet.open(
        OptionsMenuComponent,
        {
          data: {
            title: '¿Desvincular WhatsApp?',
            options: [
              {
                value: 'Si, desvincular',
                callback: async () => {
                  lockUI();
                  try {
                    await this.whatsappService.destroyClient();
                    this.clientConnectionStatus = false;
                  } catch (error) {
                    console.error(error);
                  }
                  unlockUI();
                },
              },
              {
                value: 'Volver atrás',
                callback: () => {
                  this.bottomSheet.dismiss();
                },
              },
            ],
          },
        }
      );
    } else {
      this.router.navigate(['/admin/wizard-training'], {
        queryParams: {
          triggerWhatsappClient: true
        }
      });
    }
  }

  goBack() {
    this.location.back();
  }

}
