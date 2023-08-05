import { Component } from '@angular/core';

@Component({
  selector: 'app-monetizations-form',
  templateUrl: './monetizations-form.component.html',
  styleUrls: ['./monetizations-form.component.scss'],
})
export class MonetizationsFormComponent {
  isSwitchActive = true;
  switchButtonGreenIcon = '../../../../../assets/icons/switch-green.svg';
  switchButtonRedIcon = '../../../../../assets/icons/switch-red.svg';
  switchButtonIcon = '';

  sliderData = [
    {
      src: 'https://plus.unsplash.com/premium_photo-1667566994072-399f46a79597?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    },
    {
      src: 'https://plus.unsplash.com/premium_photo-1667566994072-399f46a79597?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    },
    {
      src: 'https://plus.unsplash.com/premium_photo-1667566994072-399f46a79597?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    },
    {
      src: 'https://plus.unsplash.com/premium_photo-1667566994072-399f46a79597?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    },
  ];

  constructor() {}

  setSwitchIcon(): string {
    return this.isSwitchActive
      ? this.switchButtonGreenIcon
      : this.switchButtonRedIcon;
  }
}
