import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { truncateString } from 'src/app/core/helpers/strings.helpers';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Gpt3Service } from 'src/app/core/services/gpt3.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { WhatsappService } from 'src/app/core/services/whatsapp.service';
import { OptionsMenuComponent } from 'src/app/shared/dialogs/options-menu/options-menu.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-laiachat-landing',
  templateUrl: './laiachat-landing.component.html',
  styleUrls: ['./laiachat-landing.component.scss']
})
export class LaiachatLandingComponent implements OnInit {
  loginflow: boolean = false;
  assetsFolder: string = environment.assetsUrl;

  loginEmail: string = null;
  magicLink: boolean = false;
  redirectionRoute: string = '/ecommerce/club-landing';
  redirectionRouteId: string | null = null;
  entity: string = 'MerchantAccess';
  jsondata: string = JSON.stringify({
    openNavigation: true,
  });
  clientConnectionStatus = false;

  constructor(
    public headerService: HeaderService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private bottomSheet: MatBottomSheet,
    private gptService: Gpt3Service,
    private toastrService: ToastrService,
    private whatsappService: WhatsappService
  ) { }

  async ngOnInit() {
    if(this.headerService.user) {
      this.clientConnectionStatus = await this.whatsappService.clientConnectionStatus();
      console.log(this.clientConnectionStatus);
    }
  }

  truncateString(word) {
    return truncateString(word, 12);
  }

  resetLoginDialog(event) {
    this.loginflow = false;
    this.changeDetectorRef.detectChanges();
    // if (this.tabarIndex === 3 && this.headerService.user) {
    //   this.openLinkDialog();
    // }
  }

  goClubLandingShowGanas() {
    this.router.navigate(['/ecommerce/club-landing'], {
      queryParams: {
        showGanas: true,
      },
    });
  }

  goLaiaTraining() {
    this.router.navigate(['/ecommerce/laia-training']);
  }
   
  goClubLanding() {
    this.router.navigate(['/ecommerce/club-landing']);
  }

  openUploadFile() {
    let data = {
      data: {
        description: 'Agrega:',
        options: [
          {
            value: 'URL',
            callback: () => {
              
            },
          },
          {
            value: 'PDF',
            callback: () => {
              const fileInput = document.getElementById('file') as HTMLInputElement;
              fileInput.accept = '.pdf';
              fileInput.click();
            },
          },
          {
            value: 'CSV',
            callback: () => {
              
            },
          },
          {
            value: 'XLS',
            callback: () => {
              const fileInput = document.getElementById('file') as HTMLInputElement;
              fileInput.accept = '.xls';
              fileInput.click();
            },
          },
          {
            value: 'TXT',
            callback: () => {
              const fileInput = document.getElementById('file') as HTMLInputElement;
              fileInput.accept = '.txt';
              fileInput.click();
            },
          },
        ],
      },
    };

    if(window.location.hostname === 'laiachat.com') {
      data.data.options.push(
        {
          value: 'Funcionalidades del Ecommerce',
          callback: () => {
            this.router.navigate(['/ecommerce/club-landing']);
          },
        },
      );
    }

    const dialog = this.bottomSheet.open(
      OptionsMenuComponent,
      data
    )
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

  async goLaiaWhatsapp() {
    if (this.clientConnectionStatus) {
      lockUI();
      try {
        await this.whatsappService.destroyClient();
        this.clientConnectionStatus = false;
      } catch (error) {
        console.error(error);
      }
      unlockUI();
    } else {
      this.router.navigate(['/admin/wizard-training'], {
        queryParams: {
          triggerWhatsappClient: true
        }
      });
    }
  }
}
