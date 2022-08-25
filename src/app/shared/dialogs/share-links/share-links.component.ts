import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-share-links',
  templateUrl: './share-links.component.html',
  styleUrls: ['./share-links.component.scss']
})
export class ShareLinksComponent implements OnInit {
  env: string = environment.assetsUrl;
  @Input() url: string;
  constructor() { }

  ngOnInit(): void {
  }

}
