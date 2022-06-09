import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-header-info-admin',
  templateUrl: './header-info-admin.component.html',
  styleUrls: ['./header-info-admin.component.scss']
})
export class HeaderInfoAdminComponent implements OnInit {

  @Input() data: Array<any> = [{
    icon: '',
    text: '',
    func: () => { this.event.emit(); console.log('OCURRIENDO') }
  }];

  @Output() event: EventEmitter<any> = new EventEmitter;
  @Input() whatsApp: boolean = false;
  @Input() merchant: boolean = false;
  on: boolean = false;
  env: string = environment.assetsUrl;
  constructor() { }

  ngOnInit(): void {
  }

  turnOn() {
    this.on = !this.on;
  }
}
