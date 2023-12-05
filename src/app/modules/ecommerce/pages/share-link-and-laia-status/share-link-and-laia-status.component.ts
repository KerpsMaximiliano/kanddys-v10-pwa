import { Component, OnDestroy, OnInit } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { Gpt3Service } from 'src/app/core/services/gpt3.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { ChatService } from 'src/app/core/services/chat.service';

@Component({
  selector: 'app-share-link-and-laia-status',
  templateUrl: './share-link-and-laia-status.component.html',
  styleUrls: ['./share-link-and-laia-status.component.scss']
})
export class ShareLinkAndLaiaStatusComponent implements OnInit, OnDestroy {
  sub: Subscription;
  link: string = 'www.laichat.com/userID';
  assetsFolder: string = environment.assetsUrl;
  usersStatus: boolean = true;
  whatsappStatus: boolean = true;
  iframeStatus: boolean = true;
  autoResponse: boolean;
  calculateMargin = '0px';
  isMobile: boolean = false;

  constructor(
    private clipboard: Clipboard,
    private toastrService: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private gptService: Gpt3Service,
    private headerService: HeaderService,
    private chatService: ChatService,
  ) {
    let language = navigator?.language ? navigator?.language?.substring(0, 2) : 'es';
    translate.setDefaultLang(language?.length === 2 ? language  : 'es');
    translate.use(language?.length === 2 ? language  : 'es');
  }

  async ngOnInit() {
    const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    this.isMobile = regex.test(navigator.userAgent);
    this.calculateMargin = `calc(${window.innerHeight}px - 745px)`;
    if(!this.isMobile) {
      const element : HTMLElement = document.querySelector('.dialog-frame');
      element?.style?.setProperty('max-width', '427px', 'important');
    }
    this.sub = this.route.queryParams.subscribe(({ link }) => {
      if (link) this.link = link;
    });
    this.checkAutoResponse();
    const response = await this.chatService.getConfiguration();
    if(response?.data) {
      this.usersStatus = response.data?.logged;
      this.whatsappStatus = response.data?.whatsapp;
      this.iframeStatus = response.data?.iframe;
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  copyLink() {
    this.clipboard.copy(this.link);
    this.toastrService.success(
      'Enlace copiado satisfactoriamente'
    );
  }

  async checkAutoResponse() {
    let id = this.headerService.user._id;
    await this.gptService.doUsersHaveAssistantActivated(
        [
          id
        ]
      ).then((res) => {
        this.autoResponse = res[`${id}`];
    });
  }

  async updateConfiguration(type: string, status: boolean) {
    let body;
    if(type === 'users') body = { logged: status, notLogged: status };
    else if(type === 'whatsapp') body = { whatsapp: status};
    else if(type === 'iframe') body = { iframe: status};

    try {
      const response = await this.chatService.updateConfiguration(body);
      if(type === 'users') this.usersStatus = !this.usersStatus;
      else if(type === 'whatsapp') this.whatsappStatus = !this.whatsappStatus;
      else if(type === 'iframe') this.iframeStatus = !this.iframeStatus;
    } catch (error) {
      console.error(error);
      this.headerService.showErrorToast();
    }
  }

  async autoResponseSwitch() {
    try {
      await this.gptService.changeAssistantResponseMode().then((res)=> {
        this.autoResponse = res.automaticModeActivated;
      });
    } catch (error) {
      console.error(error);
      this.headerService.showErrorToast();
    }
  }

  goLaiaIntegrations() {
    this.router.navigate(['/ecommerce/laiachat-integrations']);
  }

  goBack() {
    this.router.navigate(['/ecommerce/laiachat-landing']);
  }
}
