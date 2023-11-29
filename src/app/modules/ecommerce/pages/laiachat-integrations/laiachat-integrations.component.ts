import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Merchant } from 'src/app/core/models/merchant';
import { ChatService } from 'src/app/core/services/chat.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { WhatsappService } from 'src/app/core/services/whatsapp.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { OptionsMenuComponent } from 'src/app/shared/dialogs/options-menu/options-menu.component';
import { ShareLinkInfoComponent } from 'src/app/shared/dialogs/share-link-info/share-link-info.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-laiachat-integrations',
  templateUrl: './laiachat-integrations.component.html',
  styleUrls: ['./laiachat-integrations.component.scss']
})
export class LaiachatIntegrationsComponent implements OnInit {
  clientConnectionStatus: boolean = false;
  domains: Array<any>;
  merchantSlug: string = '';

  constructor(
    private location: Location,
    private whatsappService: WhatsappService,
    private router: Router,
    private bottomSheet: MatBottomSheet,
    private chatService: ChatService,
    private dialogService: DialogService,
    private headerService: HeaderService,
    private merchantsService: MerchantsService,
  ) { }

  async ngOnInit() {
    if(this.headerService.user) {
      lockUI();
      this.clientConnectionStatus = await this.whatsappService.clientConnectionStatus();
      console.log(this.clientConnectionStatus);
      const response = await this.chatService.getConfiguration();
      if(response?.data) this.domains = response.data?.domains;
      const merchantDefault: Merchant = await this.merchantsService.merchantDefault();
      this.merchantSlug = merchantDefault?.slug || '';
      unlockUI();
    } else this.location.back();
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

  removeDomain(domainId: string, name: string) {
    console.log(domainId)
    this.bottomSheet.open(
      OptionsMenuComponent,
      {
        data: {
          title: `¿Desvincular ${name}?`,
          options: [
            {
              value: 'Si, desvincular',
              callback: async () => {
                lockUI();
                try {
                  await this.chatService.removeDomain(domainId);
                  const response = await this.chatService.getConfiguration();
                  if(response?.data) this.domains = response.data?.domains;
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
  }

  showIframe(domainId: string) {
    this.dialogService.open(ShareLinkInfoComponent, {
      type: 'flat-action-sheet',
      props: {
        link: `${environment.chatAPI.url}/ecommerce/${this.merchantSlug}/chat-merchant?domainId=${domainId}`,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  generateDomain() {
    this.router.navigate(['/ecommerce/generate-domain']);
  }

  goBack() {
    this.location.back();
  }

}
