import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'

@Component({
  selector: 'app-post-auth',
  templateUrl: './post-auth.component.html',
  styleUrls: ['./post-auth.component.scss']
})
export class PostAuthComponent implements OnInit {

    condition1: boolean = false;
    condition2: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  redirect(){
      console.log('Demuestra que no eres spam');
  }
}
