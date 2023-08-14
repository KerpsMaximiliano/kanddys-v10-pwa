import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OrderService } from 'src/app/core/services/order.service';

@Component({
  selector: 'app-progress-slider',
  templateUrl: './progress-slider.component.html',
  styleUrls: ['./progress-slider.component.scss']
})
export class ProgressSliderComponent implements OnInit {

  @Input() title: string = "";
  @Input() isAdmin: boolean = false;
  @Input() activeIndex: number = 0;
  @Input() orderId: string = "";
  @Input() statusList: Array<{
    name: string;
    status?:string;
  }> = [];
  @Output() statusUpdated: EventEmitter<string> = new EventEmitter<string>();


  constructor(
    private orderService: OrderService) { }

  ngOnInit(): void {
  }

  getProgressSelected(){
    const milestones = this.statusList.length;
    const progressPercentage = (this.activeIndex / (milestones - 1)) * 100;
    return `width: ${progressPercentage}%;`;
  }

  async updateStatus(status){
    if(this.isAdmin){
      await this.orderService.orderSetStatusDelivery(status, this.orderId);
      this.statusUpdated.emit(status);
    }
  }

  
}
