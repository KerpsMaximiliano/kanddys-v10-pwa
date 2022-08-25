import { Component, OnInit } from '@angular/core';
/* import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref'; */
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderService } from 'src/app/core/services/header.service';

@Component({
  selector: 'app-post-privacy',
  templateUrl: './post-privacy.component.html',
  styleUrls: ['./post-privacy.component.scss']
})
export class PostPrivacyComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private header: HeaderService,
    private router: Router,
/*     private ref: DialogRef, */
  ) { }

  ngOnInit(): void {
  }

}
