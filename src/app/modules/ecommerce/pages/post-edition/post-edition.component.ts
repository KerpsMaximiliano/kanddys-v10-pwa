import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { PostInput } from 'src/app/core/models/post';
// import { Tag } from 'src/app/core/models/tags';
import { HeaderService } from 'src/app/core/services/header.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-post-edition',
  templateUrl: './post-edition.component.html',
  styleUrls: ['./post-edition.component.scss'],
})
export class PostEditionComponent implements OnInit {
  env: string = environment.assetsUrl;
  postInput: PostInput = {
    title: 'test',
    message: 'test2',
    from: 'tester',
  };
  constructor(
    private postsService: PostsService,
    private router: Router,
    public headerService: HeaderService
  ) {}

  ngOnInit(): void {
    const storedPost = localStorage.getItem('post');
    this.postInput = storedPost
      ? JSON.parse(storedPost)
      : this.postsService.post;

    if (storedPost) {
      this.postsService.post = JSON.parse(storedPost);
    }
  }

  goToPostPreview() {
    return this.router.navigate([
      'ecommerce/' +
        this.headerService.saleflow.merchant.slug +
        '/post-preview',
    ]);
  }

  goBack() {
    localStorage.setItem(
      'post',
      JSON.stringify({
        message: this.postsService.post.message,
        title: this.postsService.post.title,
        to: this.postsService.post.to,
        from: this.postsService.post.from,
      })
    );

    return this.router.navigate([
      'ecommerce/' + this.headerService.saleflow.merchant.slug + '/checkout',
    ]);
  }

  doSomething() {
    //
  }
}
