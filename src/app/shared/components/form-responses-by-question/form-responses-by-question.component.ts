import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ItemsService } from 'src/app/core/services/items.service';
import { WebformsService } from 'src/app/core/services/webforms.service';

@Component({
  selector: 'app-form-responses-by-question',
  templateUrl: './form-responses-by-question.component.html',
  styleUrls: ['./form-responses-by-question.component.scss'],
})
export class FormResponsesByQuestionComponent implements OnInit {
  routeParamsSubscription: Subscription;
  queryParamsSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private webformsService: WebformsService,
    private itemsService: ItemsService
  ) {}

  ngOnInit(): void {
    this.routeParamsSubscription = this.route.params.subscribe(
      async ({ itemId, questionId }) => {

      }
    );
  }
}
