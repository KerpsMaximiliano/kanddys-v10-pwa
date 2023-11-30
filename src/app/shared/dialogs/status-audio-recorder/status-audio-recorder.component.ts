import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-status-audio-recorder',
  templateUrl: './status-audio-recorder.component.html',
  styleUrls: ['./status-audio-recorder.component.scss']
})
export class StatusAudioRecorderComponent implements OnInit {
  @Input() backgrounColor: string = '#181D17';
  @Input() message: string = 'Conviertiéndo el audio a texto..';

  constructor() { }

  ngOnInit(): void {
    const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const isMobile = regex.test(navigator.userAgent);
    if(!isMobile) {
      const element : HTMLElement = document.querySelector('.dialog-frame');
      element?.style?.setProperty('max-width', '427px', 'important');
    }
  }

}
