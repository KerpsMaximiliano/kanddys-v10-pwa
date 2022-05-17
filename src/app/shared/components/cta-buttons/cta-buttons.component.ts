import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-cta-buttons',
  templateUrl: './cta-buttons.component.html',
  styleUrls: ['./cta-buttons.component.scss']
})
export class CtaButtonsComponent implements OnInit {

  @Input() btnColor: string = '#40772F';
  @Input() ctaText: string = '';

  constructor() { }

  ngOnInit(): void {
  }

}
