import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { PostsService } from 'src/app/core/services/posts.service';

@Component({
  selector: 'app-new-symbol',
  templateUrl: './new-symbol.component.html',
  styleUrls: ['./new-symbol.component.scss'],
})
export class NewSymbolComponent implements OnInit {
  postForm: FormGroup;

  constructor(
    private router: Router,
    private headerService: HeaderService,
    private merchantsService: MerchantsService,
    public postsService: PostsService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    if (!this.postsService.post) {
      this.postsService.post = {
        title: '',
        slides: [],
      };
      this.postForm = this.fb.group({
        message: [''],
      });
    } else {
      this.postForm = this.fb.group({
        message: [this.postsService.post.message],
      });
    }
  }

  goToMediaUpload() {
    this.postsService.post.message = this.postForm.controls['message'].value;
    this.router.navigate([
      'ecommerce/' + this.headerService.saleflow.merchant.slug + '/qr-edit',
    ]);
  }

  save() {
    this.postsService.post.message = this.postForm.controls['message'].value;
    this.postsService.appliesMessage = true;

    this.headerService.flowRoute = this.router.url;
    localStorage.setItem('flowRoute', this.router.url);

    this.router.navigate([
      'ecommerce/' +
        this.headerService.saleflow.merchant.slug +
        '/giftcard-details',
    ]);
  }

  goBack() {
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
        },
      }
    );
  }
}
