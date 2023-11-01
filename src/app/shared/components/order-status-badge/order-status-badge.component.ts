import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'app-order-status-badge',
  templateUrl: './order-status-badge.component.html',
  styleUrls: ['./order-status-badge.component.scss']
})
export class OrderStatusBadgeComponent implements OnInit {

  @ViewChild('color') color: ElementRef;
  @Input() status:string = "";
  statusLabel: string = "";

  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
    
  }

  ngAfterViewInit() {
    setTimeout(() => {
      switch(this.status){
        case "in progress":
          this.renderer.setStyle(this.color.nativeElement, 'background-color', '#702015');
          this.statusLabel = "Processing";
          break;
        case "pending":
          this.renderer.setStyle(this.color.nativeElement, 'background-color', '#CA8113');
          this.statusLabel = "Preparing";
          break;
        case "pickup":
          this.renderer.setStyle(this.color.nativeElement, 'background-color', '#D9D9D9');
          this.statusLabel = "Pick up";
          break;
        case "shipped":
          this.renderer.setStyle(this.color.nativeElement, 'background-color', '#F7D455');
          this.statusLabel = "Shipped";
          break;
        case "delivered":
          this.renderer.setStyle(this.color.nativeElement, 'background-color', '#39BA45');
          this.statusLabel = "Delivered";
          break;
        default:
          this.renderer.setStyle(this.color.nativeElement, 'background-color', '#702015');
          this.statusLabel = "Processing";
          break;
      }
    }, 500);
  }

}
