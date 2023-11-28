import { Component, OnInit } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ChatService } from 'src/app/core/services/chat.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { environment } from 'src/environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { Merchant } from 'src/app/core/models/merchant';
import { MerchantsService } from 'src/app/core/services/merchants.service';

@Component({
  selector: 'app-generate-domain',
  templateUrl: './generate-domain.component.html',
  styleUrls: ['./generate-domain.component.scss']
})
export class GenerateDomainComponent implements OnInit {

  domainOptions = this.fb.group({
    name: [null, Validators.required],
    activeAssistant: [true, Validators.required]
  });
  iframe: string;
  merchantSlug: string;
  isMobile: boolean = false;
  calculateMargin = '0px';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private chatService: ChatService,
    private headerService: HeaderService,
    private translate: TranslateService,
    private clipboard: Clipboard,
    private toastrService: ToastrService,
    private merchantsService: MerchantsService
  ) {
    let language = navigator?.language ? navigator?.language?.substring(0, 2) : 'es';
    translate.setDefaultLang(language?.length === 2 ? language  : 'es');
    translate.use(language?.length === 2 ? language  : 'es');
  }

  async ngOnInit() {
    if(this.headerService.user) {
      const merchantDefault: Merchant = await this.merchantsService.merchantDefault();
      this.merchantSlug = merchantDefault?.slug || '';
      const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      this.isMobile = regex.test(navigator.userAgent);
      this.calculateMargin = `calc(${window.innerHeight}px - 745px)`;
    } else this.router.navigate(['ecommerce/laiachat-landing']);
  }

  async addDomain() {
    let body = {
      name: this.domainOptions.value.name,
      activeAssistant: this.domainOptions.value.activeAssistant,
    }

    try {
      const response = await this.chatService.addDomain(body);
      const configuration = await this.chatService.getConfiguration();
      const domainId = configuration?.data?.domains?.filter((domain) => domain?.name === this.domainOptions.value.name)[0]?._id;
      this.iframe = `<iframe src="${environment?.chatAPI?.url}/ecommerce/${this.merchantSlug}/chat-merchant?domainId=${domainId}" width="100%" height="100%" frameborder="0"></iframe>`;
      this.domainOptions.reset();
    } catch (error) {
      console.error(error);
      this.headerService.showErrorToast();
    }
  }

  copyLink() {
    this.clipboard.copy(this.iframe);
    this.toastrService.success(
      'Enlace copiado satisfactoriamente'
    );
  }

  goBack() {
    this.router.navigate(['/ecommerce/laiachat-integrations']);
  }

}
