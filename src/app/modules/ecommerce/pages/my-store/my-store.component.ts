import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-my-store',
  templateUrl: './my-store.component.html',
  styleUrls: ['./my-store.component.scss']
})
export class MyStoreComponent implements OnInit {

  env: string = environment.assetsUrl;
  tapped: boolean = false;
  tagsData: Array<any> = [ '', '', '', ''];
  constructor() { }

  ngOnInit(): void {
  }

  tapping(){
    this.tapped = !this.tapped;
  }
}
