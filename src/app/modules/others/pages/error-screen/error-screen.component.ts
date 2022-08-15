import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-error-screen',
  templateUrl: './error-screen.component.html',
  styleUrls: ['./error-screen.component.scss']
})
export class ErrorScreenComponent implements OnInit {

  type: string;
  param: string;

  constructor(private route: ActivatedRoute, ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.param = params.type;
      if (this.param === 'order') this.type = 'Order not found';
      if (this.param === 'item') this.type = 'Item not found';
    });
  }

}
