import { Component, OnInit, Input } from '@angular/core';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-menu-button',
  templateUrl: './menu-button.component.html',
  styleUrls: ['./menu-button.component.scss'],
})
export class MenuButtonComponent implements OnInit {
  uri: string = environment.uri;
  @Input() mode: string = 'basic';
  @Input() phone: string;
  @Input() link: string;

  constructor(private ngNavigatorShareService: NgNavigatorShareService) {}

  ngOnInit(): void {}

  goToWhatsapp() {
    window.location.href = `https://wa.me/${this.phone}?text=Hola`;
  }

  shareStore() {
    this.ngNavigatorShareService
      .share({
        title: '',
        url: this.link,
      })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
