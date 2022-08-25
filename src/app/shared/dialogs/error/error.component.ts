import { Component, OnInit, Input} from '@angular/core';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {

  constructor() { }

  @Input() data: string;
  env: string = environment.assetsUrl;

  ngOnInit(): void {
  }

}
