import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-kiosko-view',
  templateUrl: './kiosko-view.component.html',
  styleUrls: ['./kiosko-view.component.scss'],
})
export class KioskoViewComponent implements OnInit {
  constructor() {}

  panelOpenState: boolean = false;

  ngOnInit(): void {}

  togglePanel() {
    this.panelOpenState = !this.panelOpenState;
    console.log(this.panelOpenState);
  }
}
