import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { PostsService } from 'src/app/core/services/posts.service';

@Component({
  selector: 'app-posts-xls',
  templateUrl: './posts-xls.component.html',
  styleUrls: ['./posts-xls.component.scss'],
})
export class PostsXlsComponent implements OnInit {
  controller: FormControl = new FormControl('', [
    Validators.required,
    Validators.pattern('^[0-9]*$'),
  ]);
  constructor(private _PostsService: PostsService) {}

  ngOnInit(): void {}

  submit(): void {
    if (this.controller.invalid) return;
    console.log(this.controller.value);
    for (const item of this.fillList(+this.controller.value))
      this._PostsService.createPost({});
  }

  fillList(n: number): any[] {
    const result = [...Array(n).keys()].map(() => '');
    return result;
  }
}
