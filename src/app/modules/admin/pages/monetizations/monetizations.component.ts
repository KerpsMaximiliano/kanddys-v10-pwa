import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-monetizations',
  templateUrl: './monetizations.component.html',
  styleUrls: ['./monetizations.component.scss']
})
export class MonetizationsComponent implements OnInit {
  env : string = environment.assetsUrl;
  toggleSwitch: boolean = false;
  constructor() { }

  ngOnInit(): void {
  }

}
