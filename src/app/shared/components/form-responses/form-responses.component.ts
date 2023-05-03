import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Item } from 'src/app/core/models/item';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { WebformsService } from 'src/app/core/services/webforms.service';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import {
  AnswersGroupedByUser,
  Question,
  Webform,
  answer,
} from 'src/app/core/models/webform';
import * as moment from 'moment';

@Component({
  selector: 'app-form-responses',
  templateUrl: './form-responses.component.html',
  styleUrls: ['./form-responses.component.scss'],
})
export class FormResponsesComponent implements OnInit {
  currentTab: 'USERS' | 'QUESTIONS' = 'USERS';
  env: string = environment.assetsUrl;
  item: Item;
  webform: Webform;
  routeParamsSubscription: Subscription;
  answersGroupedByUser: Array<AnswersGroupedByUser> = [];
  questions: Array<Question> = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private webformsService: WebformsService,
    private itemsService: ItemsService,
    private headerService: HeaderService,
    private authService: AuthService,
    private merchantService: MerchantsService
  ) {}

  ngOnInit(): void {
    this.routeParamsSubscription = this.route.params.subscribe(
      async ({ itemId, formId }) => {
        const user = await this.authService.me();
        const myMerchant = await this.merchantService.merchantDefault(
          user?._id
        );

        lockUI();

        this.item = await this.itemsService.item(itemId);

        const isUserTheOwner = this.item
          ? myMerchant?._id === this.item.merchant._id
          : null;

        if (!isUserTheOwner) this.router.navigate(['/auth/login']);

        if (itemId && !formId && this.item.webForms?.length > 0)
          formId = this.item.webForms[0].reference;

        if (formId) this.webform = await this.webformsService.webform(formId);
        else this.router.navigate(['/admin/article-editor/' + this.item._id]);

        const answersGroupedByUser =
          await this.webformsService.answersInWebformGroupedByUser(formId);

        this.answersGroupedByUser = answersGroupedByUser;

        unlockUI();
      }
    );
  }

  getCreationDateDifferenceAsItsSaid(dateISOString) {
    const dateObj = new Date(dateISOString);
    const year = dateObj.getFullYear();
    const day = dateObj.getDate();
    const month = dateObj.getMonth();
    const hour = dateObj.getHours();

    moment.locale('es');
    return moment([year, month, day, hour]).fromNow();
  }
}
