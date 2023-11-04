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
  }

}
