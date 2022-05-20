import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-pre-visualizer',
  templateUrl: './pre-visualizer.component.html',
  styleUrls: ['./pre-visualizer.component.scss']
})
export class PreVisualizerComponent implements OnInit {

    @Input() mode: string;
    @Input() image: string;
    @Input() posterTitle: string= 'Titulo del Poster';
    @Input() textPost: string = 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita';
    @Input() duration: string = '-0:21';

  constructor() { }

  ngOnInit(): void {
  }

  action(){
      console.log('yes');
  }

}
