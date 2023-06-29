import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { CreateButtonLinkComponent } from 'src/app/shared/dialogs/create-button-link/create-button-link.component';

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
    private dialog:DialogService
  ) {
        translate.setDefaultLang('en');
        translate.use('en');
  }

  ngOnInit(): void {
    const flow = this.route.snapshot.queryParamMap.get('flow');
    if (flow) this.flow = flow as 'cart' | 'checkout';

    if (!this.postsService.post) {
      this.postsService.post = {
        title: '',
        slides: [],
      };
      this.postForm = this.fb.group({
        message: [''],
        defaultLayout: [this.postsService.post.layout || this.layout],
      });
    } else {
      console.log("layout que ya estaba", this.postsService.post.layout);

      this.postForm = this.fb.group({
        message: [this.postsService.post.message],
        defaultLayout: [this.postsService.post.layout || this.layout],
      });
    }
  }

  goToMediaUpload() {
    this.postsService.post.message = this.postForm.controls['message'].value;
    this.router.navigate(
      ['ecommerce/' + this.headerService.saleflow.merchant.slug + '/qr-edit'],
      {
        queryParams: {
          flow: this.flow,
        },
      }
    );
  }

  save() {
    this.postsService.post.message = this.postForm.controls['message'].value;
    this.postsService.post.layout = this.postForm.controls['defaultLayout'].value;
    this.postsService.appliesMessage = true;

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
    this.postsService.post.message = this.postForm.controls['message'].value;
    this.postsService.post.layout = this.postForm.controls['defaultLayout'].value;

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

  openButtonLinkDialog(){
      this.dialog.open(CreateButtonLinkComponent, {
         type: 'action-sheet',
         props: {
            closeEvent: ()=> {
            }
         },
         customClass: 'app-dialog',
         flags: ['no-header'],
      });
  }
}
