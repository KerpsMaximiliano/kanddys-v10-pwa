import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment'; 

@Component({
  selector: 'app-open-form-responses',
  templateUrl: './open-form-responses.component.html',
  styleUrls: ['./open-form-responses.component.scss']
})
export class OpenFormResponsesComponent implements OnInit {
  env = environment.assetsUrl;

  constructor() { }

  ngOnInit(): void {
  }

}
