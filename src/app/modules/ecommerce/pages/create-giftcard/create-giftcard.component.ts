import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { HeaderService } from 'src/app/core/services/header.service';
import { environment } from 'src/environments/environment';
import { FormStep } from 'src/app/core/types/multistep-form';
import { FormBuilder } from '@angular/forms';
import { PostsService } from 'src/app/core/services/posts.service';

const lightLabelStyles = {
  fontFamily: 'RobotoRegular',
  fontSize: '19px',
  fontWeight: 300,
  marginBottom: '18px',
};

@Component({
  selector: 'app-create-giftcard',
  templateUrl: './create-giftcard.component.html',
  styleUrls: ['./create-giftcard.component.scss'],
})
export class CreateGiftcardComponent implements OnInit {
  env = environment.assetsUrl;
  giftMessageForm = this.fb.group({
    message: '',
    from: '',
    title: '',
  });

  constructor(
    private header: HeaderService,
    private router: Router,
    private route: ActivatedRoute,
    private postsService: PostsService,
    private fb: FormBuilder
  ) {}

  virtual: boolean = false;

  async ngOnInit(): Promise<void> {
    if (!this.postsService.post) {
      const storedPost = localStorage.getItem('post');

      if (storedPost) this.postsService.post = JSON.parse(storedPost);
    }

    this.giftMessageForm.patchValue({
      message: this.postsService.post.message,
      title: this.postsService.post.title,
      from: this.postsService.post.from,
    });
  }

  submit() {
    const { message, title, from } = this.giftMessageForm.value;

    this.postsService.post.message = message;
    this.postsService.post.title = title;
    this.postsService.post.from = from;

    localStorage.setItem(
      'post',
      JSON.stringify({
        message: this.postsService.post.message,
        title: this.postsService.post.title,
        to: this.postsService.post.to,
        from: this.postsService.post.from,
        joke: this.postsService.post.joke,
      })
    );

    this.router.navigate([
      'ecommerce/' + this.header.saleflow.merchant.slug + '/post-edition',
    ]);
  }
}
