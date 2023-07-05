import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { CreateButtonLinkComponent } from 'src/app/shared/dialogs/create-button-link/create-button-link.component';
import {
  FormComponent,
  FormData,
} from 'src/app/shared/dialogs/form/form.component';

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
    const flow = this.route.snapshot.queryParamMap.get('flow');
    if (flow) this.flow = flow as 'cart' | 'checkout';

    if (!this.postsService.post) {
      console.log('no post');
      this.postsService.post = {
        title: '',
        slides: [],
      };
      this.postForm = this.fb.group({
        title: [''],
        message: [''],
        defaultLayout: [this.postsService.post.layout || this.layout],
        ctaText: [''],
        ctaLink: [''],
      });
    } else {
      console.log('post');
      this.postForm = this.fb.group({
        title: [this.postsService.post.title],
        message: [this.postsService.post.message],
        defaultLayout: [this.postsService.post.layout || this.layout],
        ctaText: [this.postsService.post.ctaText],
        ctaLink: [this.postsService.post.ctaLink],
      });
    }
  }

  goToMediaUpload() {
    this.postsService.post.title = this.postForm.controls['title'].value;
    this.postsService.post.message = this.postForm.controls['message'].value;
    this.postsService.post.layout =
      this.postForm.controls['defaultLayout'].value;
    this.postsService.post.ctaText = this.postForm.controls['ctaText'].value;
    this.postsService.post.ctaLink = this.postForm.controls['ctaLink'].value;
    this.router.navigate(
      ['ecommerce/' + this.headerService.saleflow.merchant.slug + '/qr-edit'],
      {
        queryParams: {
          flow: this.flow,
        },
      }
    );
  }

  openFormForField(field: 'TITLE' | 'LARGE-TEXT' | 'LINK-BUTTON') {
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
      ])
      .subscribe((translations) => {
        switch (field) {
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

    this.headerService.flowRoute = this.router.url;
    localStorage.setItem('flowRoute', this.router.url);

    this.router.navigate(
      [
        'ecommerce/' +
          this.headerService.saleflow.merchant.slug +
          '/giftcard-details',
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
