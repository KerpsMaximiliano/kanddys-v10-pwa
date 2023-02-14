import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-dot-loader',
  templateUrl: './dot-loader.component.html',
  styleUrls: ['./dot-loader.component.scss'],
  animations: [],
})
export class DotLoaderComponent implements OnInit {
  @Input() dotColor: string = '#000';

  constructor() {}

  ngOnInit(): void {}
}
