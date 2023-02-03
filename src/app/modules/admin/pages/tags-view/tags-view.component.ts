import { Component, OnInit } from '@angular/core';
import { Tag } from 'src/app/core/models/tags';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tags-view',
  templateUrl: './tags-view.component.html',
  styleUrls: ['./tags-view.component.scss'],
})
export class TagsViewComponent implements OnInit {
  env: string = environment.assetsUrl;
  tags: Tag[] = [];

  panelOpenState = false;
  constructor() {}

  ngOnInit(): void {}

  changeState() {
    this.panelOpenState = !this.panelOpenState;
  }
}
