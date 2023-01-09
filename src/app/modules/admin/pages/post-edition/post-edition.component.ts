import { Component, OnInit, Input } from '@angular/core';
import { PostInput } from 'src/app/core/models/post';
import { Tag } from 'src/app/core/models/tags';

@Component({
  selector: 'app-post-edition',
  templateUrl: './post-edition.component.html',
  styleUrls: ['./post-edition.component.scss'],
})
export class PostEditionComponent implements OnInit {
  data:PostInput = {
    title: 'test',
    message: 'test2',
    from: 'tester'
  }
  constructor() {}

  ngOnInit(): void {}
}
