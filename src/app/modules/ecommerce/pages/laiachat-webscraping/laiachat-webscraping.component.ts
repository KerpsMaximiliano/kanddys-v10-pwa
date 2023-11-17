import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Merchant } from 'src/app/core/models/merchant';
import { Gpt3Service } from 'src/app/core/services/gpt3.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-laiachat-webscraping',
  templateUrl: './laiachat-webscraping.component.html',
  styleUrls: ['./laiachat-webscraping.component.scss']
})
export class LaiachatWebscrapingComponent implements OnInit {
  @ViewChild('baseText') memoryTextarea: ElementRef;
  assetsFolder: string = environment.assetsUrl;
  clicked: boolean = true;
  urlPattern = /^(https?|ftp|file):\/\/[-a-zA-Z0-9+&@#/%?=~_|!:,.;]*[-a-zA-Z0-9+&@#/%=~_|]/;
  textareaUrl = new FormControl(null, Validators.compose([Validators.required, Validators.pattern(this.urlPattern)]));
  showLogin: boolean = false;
  loginDataUpload = {
    redirectionRoute: '/ecommerce/laiachat-webscraping',
    redirectionRouteId: null,
    entity: 'MerchantAccess',
    jsondata: '',
  };
  queryParamsSubscription: Subscription;
  isMobile: boolean = false;
  calculateMargin = '0px';

  constructor(
    private headerService: HeaderService,
    private toastrService: ToastrService,
    private gptService: Gpt3Service,
    private merchantsService: MerchantsService,
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
  ) {
    let language = navigator?.language ? navigator?.language?.substring(0, 2) : 'es';
    translate.setDefaultLang(language?.length === 2 ? language  : 'es');
    translate.use(language?.length === 2 ? language  : 'es');
  }

  ngOnInit(): void {
    const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    this.isMobile = regex.test(navigator.userAgent);
    this.calculateMargin = `calc(${window.innerHeight}px - 745px)`;
    this.queryParamsSubscription = this.route.queryParams.subscribe(
      async ({ jsondata }) => {
        if (jsondata) {
          let parsedData = JSON.parse(decodeURIComponent(jsondata));

          console.log(parsedData)

          if(parsedData.url) {
            this.textareaUrl.setValue(parsedData.url);
            await this.saveUrl();

            const urlWithoutQueryParams = this.router.url.split('?')[0];

            window.history.replaceState(
              {},
              'SaleFlow',
              urlWithoutQueryParams
            );
          }
        }

        const textareaMemory: HTMLElement = document.querySelector('.base-text');

        textareaMemory.addEventListener('input', function () {
          this.style.height = 'auto';
          this.style.height = (this.scrollHeight) + 'px';
        });
      }
    );

    
    if (this.isMobile) {
      setTimeout(() => {
        this.memoryTextarea.nativeElement.focus();
      }, 500);
    }
  }

  async saveUrl() {
    if(!this.headerService.user) {
      this.loginDataUpload.jsondata = JSON.stringify({
        url: this.textareaUrl.value,
      });
      this.showLogin = !this.showLogin;
      return;
    }

    lockUI()

    try {
      const merchantId: string = await this.getMerchantDefault();
      const resultScraper = await this.gptService.scraperMerchant(
        [this.textareaUrl.value],
        merchantId
      );

      console.log(resultScraper);

      this.toastrService.success(
        'Tú solicitud de la página web esta en proceso.'
      );
      
      unlockUI();
    } catch (error) {
      console.log(error);
      this.headerService.showErrorToast(error);
      unlockUI();
    }
  }

  async getMerchantDefault() {
    try {
      const merchantDefault: Merchant = await this.merchantsService.merchantDefault();
      return merchantDefault._id;
    } catch (error) {
      console.log(error);
    }
  }

  resizeTextarea(textarea) {
    if(textarea.scrollHeight > 314) {
      textarea.style.height = 314 + "px";
      textarea.style.overflowY = "scroll";
      return;
    }
    if(textarea.scrollHeight > textarea.clientHeight) {
      textarea.style.height = textarea.scrollHeight > 118 ? textarea.scrollHeight + "px" : 118 + "px";
    } else {
      textarea.style.height = 0 + "px";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }

  async getClipboardText() {
    try {
      const text = await navigator.clipboard.readText();
      this.textareaUrl.setValue(text ?? null);
    } catch (err) {
      this.headerService.showErrorToast();
    }
  }

  goBack() {
   this.location.back();
  }
}
