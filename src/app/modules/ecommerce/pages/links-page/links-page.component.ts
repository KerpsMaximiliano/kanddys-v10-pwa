import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-links-page',
  templateUrl: './links-page.component.html',
  styleUrls: ['./links-page.component.scss'],
})
export class LinksPageComponent implements OnInit {
  env: string = environment.assetsUrl;
  userId: string;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
      this.userId = params.userId;
      console.log(this.userId);
    });
  }
}
