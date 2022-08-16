import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-loading-screen',
  templateUrl: './loading-screen.component.html',
  styleUrls: ['./loading-screen.component.scss']
})
export class LoadingScreenComponent implements OnInit {
  @Input() backgroundColor: string = "skyblue";
  @Input() logoBackgroundColor: string = "white";
  @Input() logo: string = "./assets/images/abeja04.png";
  @Input() title: string = "Kanddys";
  @Input() titleStyles: Record<string, any> = {};
  

  constructor() { }

  ngOnInit(): void {
  }

}
