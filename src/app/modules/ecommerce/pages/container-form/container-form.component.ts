import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-container-form',
  templateUrl: './container-form.component.html',
  styleUrls: ['./container-form.component.scss']
})
export class ContainerFormComponent implements OnInit {

  @Input() tagName: string = 'tagName';
  @Input() providerID: string = 'providerID';
  nameLast: string = '';
  constructor() { }

  ngOnInit(): void {
  }

  nameIn(event){
      this.nameLast = event.target.value;
  }
}
