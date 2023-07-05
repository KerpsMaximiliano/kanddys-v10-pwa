import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-create-button-link',
  templateUrl: './create-button-link.component.html',
  styleUrls: ['./create-button-link.component.scss'],
})
export class CreateButtonLinkComponent implements OnInit {
  constructor(private translate: TranslateService) {
    translate.setDefaultLang('es');
    translate.use('es');
  }

  ngOnInit(): void {}
}
