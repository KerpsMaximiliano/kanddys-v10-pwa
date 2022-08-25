import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements OnInit {
  imageFolder: string;
  avatarImage =
    'https://wccfneca.org/wp-content/uploads/2021/04/male-placeholder-image.jpeg';

  constructor() {
    this.imageFolder = environment.assetsUrl;
  }

  ngOnInit(): void {}
}
