import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { PostsService } from 'src/app/core/services/posts.service';
import {
  FormComponent,
  FormData,
} from 'src/app/shared/dialogs/form/form.component';
import { CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-new-symbol',
  templateUrl: './new-symbol.component.html',
  styleUrls: ['./new-symbol.component.scss'],
})
export class NewSymbolComponent implements OnInit {
  postForm: FormGroup;
  isLayoutDropdownOpened = false;
  layout: 'EXPANDED-SLIDE' | 'ZOOMED-OUT-INFO' = 'EXPANDED-SLIDE';
  flow: 'cart' | 'checkout' = 'cart';
  introductionTexts: Array<string> = [
    'Nosotros transformamos tu mensaje en un código QR que se imprime y se pone en tu regalo.',
    'Cuando la persona recibe tu regalo, solo tiene que escanear el código QR con su teléfono. Esto les enviará un enlace a su teléfono o correo electrónico. Al hacer clic en el enlace, pueden ver tu mensaje, las fotos y los videos que has enviado',
    '¡Y lo mejor de todo es que solo ellos pueden verlo, nadie más!',
  ];
  introTextDisplayed: boolean = false;
  CountryISO = CountryISO.DominicanRepublic;
  preferredCountries: CountryISO[] = [
    CountryISO.DominicanRepublic,
    CountryISO.UnitedStates,
  ];
  PhoneNumberFormat = PhoneNumberFormat;
  isPhoneInputFocused: boolean = false;
  assetsFolder: string = environment.assetsUrl;
  type: 'VIRTUAL-MESSAGE' | 'TRADITIONAL-MESSAGE' = 'VIRTUAL-MESSAGE';
  messageFlow:
    | 'VIRTUAL-MESSAGE'
    | 'TRADITIONAL-MESSAGE'
    | 'TRADITIONAL-AND-VIRTUAL' = 'VIRTUAL-MESSAGE';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private headerService: HeaderService,
    private merchantsService: MerchantsService,
    public postsService: PostsService,
    private fb: FormBuilder,
    private translate: TranslateService,
    public dialog: MatDialog
  ) {
    translate.setDefaultLang('en');
    translate.use('en');
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(({ flow, type }) => {
      if (flow) this.flow = flow as 'cart' | 'checkout';

      if (type && type === 'traditional') {
        this.messageFlow = 'TRADITIONAL-MESSAGE';
        this.type = 'TRADITIONAL-MESSAGE';
      }
      if (type && type === 'both') {
        this.messageFlow = 'TRADITIONAL-AND-VIRTUAL';
        this.type = 'TRADITIONAL-MESSAGE';
      }

      if (!this.postsService.post) {
        console.log('no post');
        this.postsService.post = {
          title: '',
          slides: [],
        };
        this.postForm = this.fb.group({
          accessKey: [''],
          title: [''],
          message: [''],
          defaultLayout: [this.postsService.post.layout || this.layout],
          ctaText: [''],
          ctaLink: [''],
        });
      } else {
        if(this.postsService.postReceiverNumberObject) this.isPhoneInputFocused = true;

        this.postForm = this.fb.group({
          accessKey: [this.postsService.postReceiverNumberObject],
          title: [this.postsService.post.title],
          message: [this.postsService.post.message],
          defaultLayout: [this.postsService.post.layout || this.layout],
          ctaText: [this.postsService.post.ctaText],
          ctaLink: [this.postsService.post.ctaLink],
        });
      }
    });
  }

  goToMediaUpload() {
    this.postsService.post.title = this.postForm.controls['title'].value;
    this.postsService.post.message = this.postForm.controls['message'].value;
    this.postsService.post.layout =
      this.postForm.controls['defaultLayout'].value;
    this.postsService.post.ctaText = this.postForm.controls['ctaText'].value;
    this.postsService.post.ctaLink = this.postForm.controls['ctaLink'].value;

    if (
      this.postForm.controls['accessKey'].valid &&
      this.postForm.controls['accessKey'].value
    ) {
      this.postsService.postReceiverNumberObject =
        this.postForm.controls['accessKey'].value;
      this.postsService.postReceiverNumber =
        this.postForm.controls['accessKey'].value.e164Number.split('+')[1];
    }

    this.router.navigate(
      ['ecommerce/' + this.headerService.saleflow.merchant.slug + '/qr-edit'],
      {
        queryParams: {
          flow: this.flow,
        },
      }
    );
  }

  openFormForField(
    field: 'SHORT-TEXT' | 'TITLE' | 'LARGE-TEXT' | 'LINK-BUTTON'
  ) {
    let fieldsToCreate: FormData = {
      fields: [],
    };

    this.translate
      .get([
        'new-symbol.longer-text',
        'new-symbol.button-name-placeholder',
        'button',
        'link',
        'paste-url',
        'new-symbol.short-text',
      ])
      .subscribe((translations) => {
        switch (field) {
          case 'SHORT-TEXT':
            fieldsToCreate.fields = [
              {
                label: translations['new-symbol.short-text'],
                name: 'short-text',
                type: 'text',
                validators: [Validators.pattern(/[\S]/)],
              },
            ];
            break;
          case 'LARGE-TEXT':
            fieldsToCreate.fields = [
              {
                label: translations['new-symbol.longer-text'],
                name: 'large-text',
                type: 'text',
                validators: [Validators.pattern(/[\S]/)],
              },
            ];
            break;
          case 'LINK-BUTTON':
            fieldsToCreate.fields = [
              {
                label: translations['button'],
                name: 'button-name',
                placeholder: translations['new-symbol.button-name-placeholder'],
                type: 'text',
                validators: [Validators.pattern(/[\S]/), Validators.required],
              },
              {
                label: translations['link'],
                name: 'link-url',
                placeholder: translations['paste-url'],
                type: 'text',
                validators: [Validators.pattern(/[\S]/), Validators.required],
              },
            ];
            break;
        }

        const dialogRef = this.dialog.open(FormComponent, {
          data: fieldsToCreate,
        });

        dialogRef.afterClosed().subscribe((result: FormGroup) => {
          console.log(result.value);

          if (result.value['short-text']) {
            this.postForm.patchValue({
              title: result.value['short-text'],
            });
          }

          if (result.value['large-text']) {
            this.postForm.patchValue({
              message: result.value['large-text'],
            });
          }

          if (result.value['button-name']) {
            this.postForm.patchValue({
              ctaText: result.value['button-name'],
            });
          }

          if (result.value['link-url']) {
            this.postForm.patchValue({
              ctaLink: result.value['link-url'],
            });
          }
        });
      });
  }

  save() {
    this.postsService.post.title = this.postForm.controls['title'].value;
    this.postsService.post.message = this.postForm.controls['message'].value;
    this.postsService.post.layout =
      this.postForm.controls['defaultLayout'].value;
    this.postsService.appliesMessage = true;
    this.postsService.post.ctaText = this.postForm.controls['ctaText'].value;
    this.postsService.post.ctaLink = this.postForm.controls['ctaLink'].value;

    if (
      this.postForm.controls['accessKey'].valid &&
      this.postForm.controls['accessKey'].value
    ) {
      this.postsService.postReceiverNumberObject =
        this.postForm.controls['accessKey'].value;
      this.postsService.postReceiverNumber =
        this.postForm.controls['accessKey'].value.e164Number.split('+')[1];
    }

    this.postsService.privatePost = true;
    localStorage.setItem('privatePost', 'true');

    this.headerService.flowRoute = this.router.url;
    localStorage.setItem('flowRoute', this.router.url);

    this.postsService.post.envelopePresentation = 'QR-TEXT';

    this.headerService.flowRoute = this.router.url;
    localStorage.setItem('flowRoute', this.router.url);

    if (this.flow === 'checkout')
      return this.router.navigate([
        '/ecommerce/' + this.headerService.saleflow.merchant.slug + '/checkout',
      ]);

    this.router.navigate(
      [
        'ecommerce/' +
          this.headerService.saleflow.merchant.slug +
          '/receiver-form',
      ],
      {
        queryParams: {
          flow: this.flow,
        },
      }
    );
  }

  goBack() {
    if (this.flow === 'checkout')
      return this.router.navigate([
        'ecommerce/' + this.headerService.saleflow.merchant.slug + '/checkout',
      ]);

    if (
      (!this.postsService.post.slides ||
        this.postsService.post.slides.length === 0) &&
      (!this.postsService.post.message ||
        !this.postsService.post.message.length)
    ) {
      this.postsService.post = null;
    }

    this.router.navigate([
      'ecommerce/' + this.headerService.saleflow.merchant.slug + '/cart',
    ]);
  }

  goToPostDetail(mode: 'DEMO' | 'PREVIEW') {
    this.postsService.post.title = this.postForm.controls['title'].value;
    this.postsService.post.message = this.postForm.controls['message'].value;
    this.postsService.post.layout =
      this.postForm.controls['defaultLayout'].value;
    this.postsService.post.ctaText = this.postForm.controls['ctaText'].value;
    this.postsService.post.ctaLink = this.postForm.controls['ctaLink'].value;
    this.headerService.flowRoute = this.router.url;

    localStorage.setItem('flowRoute', this.router.url);

    this.router.navigate(
      [
        'ecommerce/' +
          this.headerService.saleflow.merchant.slug +
          '/article-detail/post',
      ],
      {
        queryParams: {
          mode,
          redirectTo: 'post-edit',
          flow: this.flow,
        },
      }
    );
  }

  focusPhoneInput() {
    const ngxIntlPhoneInput = document.querySelector('#phone');

    (ngxIntlPhoneInput.querySelector('#phone') as HTMLInputElement).focus();
  }

  saveTraditionalMessage() {
    if (this.messageFlow === 'TRADITIONAL-AND-VIRTUAL') {
      this.type = 'VIRTUAL-MESSAGE';
    } else {
      this.save();
    }
  }

  /*
  openButtonLinkDialog() {
    this.dialog.open(CreateButtonLinkComponent, {
      type: 'action-sheet',
      props: {
        closeEvent: () => {},
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }*/
}
