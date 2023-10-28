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
import { SlideInput } from 'src/app/core/models/post';

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
  virtualMessage: boolean = true;
  imageFiles: string[] = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
  videoFiles: string[] = [
    'video/mp4',
    'video/webm',
    'video/m4v',
    'video/mpg',
    'video/mp4',
    'video/mpeg',
    'video/mpeg4',
    'video/mov',
    'video/3gp',
    'video/mts',
    'video/m2ts',
    'video/mxf',
  ];
  audioFiles: string[] = [];

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
        this.virtualMessage = false;
      }
      if (type && type === 'both') {
        this.messageFlow = 'TRADITIONAL-AND-VIRTUAL';
        this.type = 'TRADITIONAL-MESSAGE';
        this.virtualMessage = true;
      }

      if (!type) {
        this.virtualMessage = true;
      }

      if (!this.postsService.post) {
        this.postsService.post = {
          title: '',
          slides: [],
        };
        this.postForm = this.fb.group({
          emailAccessKey: ['', Validators.email],
          accessKey: [''],
          title: [''],
          message: [''],
          envelopeText: [''],
          defaultLayout: [this.postsService.post.layout || this.layout],
          ctaText: [''],
          ctaLink: [''],
        });
      } else {
        if (this.postsService.postReceiverEmail)
          this.isPhoneInputFocused = true;

        this.postForm = this.fb.group({
          emailAccessKey: [this.postsService.postReceiverEmail, Validators.email],
          accessKey: [this.postsService.postReceiverNumberObject],
          title: [this.postsService.post.title],
          message: [this.postsService.post.message],
          envelopeText: [this.postsService.post.envelopeText],
          defaultLayout: [this.postsService.post.layout || this.layout],
          ctaText: [this.postsService.post.ctaText],
          ctaLink: [this.postsService.post.ctaLink],
        });
      }
    });
  }

  emitFileInputClick() {
    (document.querySelector('#file') as HTMLElement).click();
  }

  async loadFile(event: Event) {
    const fileList = (event.target as HTMLInputElement).files;
    if (!fileList.length) return;
    let index = this.postsService.post.slides.length - 1;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList.item(i);

      if (
        ![...this.imageFiles, ...this.videoFiles, ...this.audioFiles].includes(
          file.type
        )
      )
        return;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async (e) => {
        let result = reader.result;
        const content: SlideInput = {
          text: 'test',
          title: 'test',
          media: file,
          type: 'poster',
          index: this.postsService.post.slides?.length || 0,
        };
        content['background'] = result;
        content['_type'] = file.type;

        this.postsService.post.slides.push(content);

        this.postsService.editingSlide =
          this.postsService.post.slides.length - 1;

        if (i === fileList.length - 1 && fileList.length === 1) {
          this.goToMediaUpload(true);
        } else if(i === fileList.length - 1 && fileList.length > 1){
          this.goToMediaUpload();
        }
      };
    }
  }

  goToMediaUpload(editSlide: boolean = false) {
    this.postsService.post.title = this.postForm.controls['title'].value;
    this.postsService.post.message = this.postForm.controls['message'].value;
    this.postsService.post.layout =
      this.postForm.controls['defaultLayout'].value;
    this.postsService.post.ctaText = this.postForm.controls['ctaText'].value;
    this.postsService.post.ctaLink = this.postForm.controls['ctaLink'].value;
    this.postsService.post.envelopeText =
      this.postForm.controls['envelopeText'].value;

    if (
      this.postForm.controls['emailAccessKey'].valid &&
      this.postForm.controls['emailAccessKey'].value
    ) {
      // this.postsService.postReceiverNumberObject =
      //   this.postForm.controls['accessKey'].value;
      this.postsService.postReceiverEmail =
        this.postForm.controls['emailAccessKey'].value;
    }

    let redirectionRoute = !editSlide
      ? 'ecommerce/' + this.headerService.saleflow.merchant.slug + '/qr-edit'
      : 'ecommerce/' +
        this.headerService.saleflow.merchant.slug +
        '/post-slide-editor';

    this.router.navigate([redirectionRoute], {
      queryParams: {
        flow: this.flow,
      },
    });
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
                styles: {
                  marginTop: '3em',
                },
                validators: [Validators.pattern(/[\S]/), Validators.required],
              },
            ];
            break;
        }

        const dialogRef = this.dialog.open(FormComponent, {
          data: fieldsToCreate,
        });

        dialogRef.afterClosed().subscribe((result: FormGroup) => {

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
    this.postsService.post.envelopeText =
      this.postForm.controls['envelopeText'].value;
    this.postsService.post.virtualMessage = this.virtualMessage;

    if (
      this.postForm.controls['emailAccessKey'].valid &&
      this.postForm.controls['emailAccessKey'].value
    ) {
      // this.postsService.postReceiverNumberObject =
      //   this.postForm.controls['accessKey'].value;
      this.postsService.postReceiverEmail =
        this.postForm.controls['emailAccessKey'].value
    }

    if (this.postForm.controls['emailAccessKey'].value) {
      this.postsService.privatePost = true;
      localStorage.setItem('privatePost', 'true');
    }
    else {
      this.postsService.privatePost = false;
      localStorage.setItem('privatePost', 'false');
    }



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
          '/new-address',
      ],
      {
        queryParams: {
          flow: this.flow,
          messageFlow: this.messageFlow
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

  selectLayout(value: 'EXPANDED-SLIDE' | 'ZOOMED-OUT-INFO') {
    this.layout = value;
    this.postForm.patchValue({
      defaultLayout: value,
    });
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
