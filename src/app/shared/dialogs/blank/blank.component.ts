import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-blank',
  templateUrl: './blank.component.html',
  styleUrls: ['./blank.component.scss'],
})
export class BlankComponent implements OnInit {
  @Input() containerStyles: Record<string, any> = {
    height: '200px',
    width: '90%',
  };

  constructor() {}

  ngOnInit(): void {}
}
