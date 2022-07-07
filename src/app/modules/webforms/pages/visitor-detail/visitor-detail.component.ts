import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-visitor-detail',
  templateUrl: './visitor-detail.component.html',
  styleUrls: ['./visitor-detail.component.scss']
})
export class VisitorDetailComponent implements OnInit {

    answerList: [{
        headline: 'Respuesta ID',
        answer: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita sapiente impedit in, soluta nam aperiam facere. Rem est sunt dolorum ipsum ratione, quam distinctio reiciendis inventore, aliquid natus perferendis laudantium!',
        date: '06/06/2022'
    },{
        headline: 'Respuesta ID',
        answer: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita sapiente impedit in, soluta nam aperiam facere. Rem est sunt dolorum ipsum ratione, quam distinctio reiciendis inventore, aliquid natus perferendis laudantium!',
        date: '06/06/2022'
    },{
        headline: 'Respuesta ID',
        answer: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Expedita sapiente impedit in, soluta nam aperiam facere. Rem est sunt dolorum ipsum ratione, quam distinctio reiciendis inventore, aliquid natus perferendis laudantium!',
        date: '06/06/2022'
    },];
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
