import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-visitor-detail',
  templateUrl: './visitor-detail.component.html',
  styleUrls: ['./visitor-detail.component.scss']
})
export class VisitorDetailComponent implements OnInit {
    env: string = environment.assetsUrl;

  constructor(
    public router: Router,
    public route: ActivatedRoute
  ) { }

  ngOnInit(): void {
  }


  toUser = () => {
    this.router.navigate([`ecommerce/home`]); //Placeholder
  }
}
