import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-pre-visualizer',
  templateUrl: './pre-visualizer.component.html',
  styleUrls: ['./pre-visualizer.component.scss']
})
export class PreVisualizerComponent implements OnInit {
  @Input() mode: 'audio' | 'poster' | 'text';
  @Input() image: string;
  @Input() posterTitle: string = 'Titulo del Poster';
  @Input() audio: Blob;
  audioBlobUrl: SafeUrl;
  @Input() textTitle: string;
  @Input() textPost: string = 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita';
  @Input() duration: string = '-0:21';
  env: string = environment.assetsUrl;
  

  constructor(
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit(): void {
    if(this.audio) this.audioBlobUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(this.audio));
  }

  action() {
  }

}
