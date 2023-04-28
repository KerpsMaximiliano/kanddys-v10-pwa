import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-reportings',
  templateUrl: './reportings.component.html',
  styleUrls: ['./reportings.component.scss']
})
export class ReportingsComponent implements OnInit {
  env: string = environment.assetsUrl;
  constructor() { }

  ngOnInit(): void {
  }

}
