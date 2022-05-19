import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-cta-buttons',
  templateUrl: './cta-buttons.component.html',
  styleUrls: ['./cta-buttons.component.scss']
})
export class CtaButtonsComponent implements OnInit {
    
  imageFolder: string; 

  @Input() mode: string = 'basic' || 'white' //Modos del boton
    
  @Input() btnColor: string = '#40772F'; //Basic
  @Input() ctaText: string = ''; //Basic

  @Input() borderc: string = '#2F6ED8'; //white
  @Input() borderw: string = '1px' //white
  @Input() fontColor: string = '#4773D8'; //white
  @Input() circle: boolean = false; //white
  @Input() icon: string; //white


  constructor() { 
      this.imageFolder = environment.assetsUrl;
  }

  ngOnInit(): void {
  }

}
