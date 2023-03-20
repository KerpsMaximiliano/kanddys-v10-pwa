import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemOrder } from 'src/app/core/models/order';
import { AnswerDefault, Webform } from 'src/app/core/models/webform';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { WebformsService } from 'src/app/core/services/webforms.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { Location } from '@angular/common';

@Component({
  selector: 'app-form-responses',
  templateUrl: './form-responses.component.html',
  styleUrls: ['./form-responses.component.scss'],
})
export class FormResponsesComponent implements OnInit {
  env = environment.assetsUrl;
  webform: Webform;
  orders: Array<ItemOrder> = [];
  selectedOption: AnswerDefault;
  openResponses: boolean;
  ordersAndAnswers: Array<{
    order: ItemOrder;
    answer: string;
  }> = [];

  constructor(
    private webformService: WebformsService,
    private merchantsService: MerchantsService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit() {
    this.route.params.subscribe(async (params) => {
      this.route.queryParams.subscribe(async (queryParams) => {
        const { question, selectedOption, openResponses } = queryParams;
        const { formId } = params;

        this.webform = await this.webformService.webform(formId);
        this.openResponses = Boolean(openResponses);

        const selectedQuestion = this.webform?.questions.find(
          (questionInList) => questionInList._id === question
        );

        if (
          selectedOption !== null &&
          selectedOption !== undefined &&
          !openResponses
        ) {
          const selectedAnswerDefault =
            selectedQuestion.answerDefault[selectedOption];

          this.selectedOption = selectedAnswerDefault;

          if (!this.selectedOption) {
            this.router.navigate(['others/error-screen']);
          }

          const answers = await this.webformService.answerPaginate({
            findBy: {
              'response.question': question,
              'response.value': selectedAnswerDefault.value,
            },
          });

          const answerIds = answers.map((answerInList) => answerInList._id);

          const { ordersByMerchant } =
            await this.merchantsService.ordersByMerchant(
              this.merchantsService.merchantData._id,
              {
                findBy: {
                  'answers.reference': {
                    $in: answerIds,
                  },
                },
                options: {
                  limit: -1,
                },
              }
            );

          this.orders = ordersByMerchant;
        }

        if (openResponses && selectedQuestion.type === 'text') {
          const answers = await this.webformService.answerPaginate({
            findBy: {
              'response.question': question,
            },
          });

          const answersById = {};

          answers.forEach((answer) => {
            answersById[answer._id] = answer.response.find(
              (answer) => answer.question === question
            );
          });

          const answerIds = answers.map((answerInList) => answerInList._id);

          const { ordersByMerchant } =
            await this.merchantsService.ordersByMerchant(
              this.merchantsService.merchantData._id,
              {
                findBy: {
                  'answers.reference': {
                    $in: answerIds,
                  },
                },
                options: {
                  limit: -1,
                },
              }
            );

          for (const order of ordersByMerchant) {
            const answer = order.answers.find(
              (answer) => answersById[answer.reference]
            );

            if (answer) {
              this.ordersAndAnswers.push({
                order,
                answer:
                  answersById[answer.reference].isMedia &&
                  answersById[answer.reference].label
                    ? answersById[answer.reference].label
                    : !answersById[answer.reference].isMedia &&
                      answersById[answer.reference].label
                    ? answersById[answer.reference].value +
                      ' ' +
                      answersById[answer.reference].label
                    : answersById[answer.reference].value,
              });
            }
          }

          this.orders = ordersByMerchant;
        }

        if (openResponses && selectedQuestion.type === 'multiple-text') {
          const optionsForQuestion = {};

          selectedQuestion.answerDefault.forEach((option) => {
            if (option.isMedia && option.label)
              optionsForQuestion[option.label] = true;
            else if (!option.isMedia && option.value)
              optionsForQuestion[option.value] = true;
          });

          const answers = await this.webformService.answerPaginate({
            findBy: {
              'response.question': question,
            },
          });

          const answersById = {};

          answers.forEach((answer) => {
            answersById[answer._id] = answer.response.find((answer) => {
              return (
                answer.question === question &&
                !answer.value.includes('http') &&
                optionsForQuestion[answer.value] === undefined &&
                optionsForQuestion[answer.label] === undefined
              );
            });
          });

          const answerIds = answers.map((answerInList) => answerInList._id);

          const { ordersByMerchant } =
            await this.merchantsService.ordersByMerchant(
              this.merchantsService.merchantData._id,
              {
                findBy: {
                  'answers.reference': {
                    $in: answerIds,
                  },
                },
                options: {
                  limit: -1,
                  sortBy: 'createdAt:desc',
                },
              }
            );

          for (const order of ordersByMerchant) {
            const answer = order.answers.find(
              (answer) => answersById[answer.reference]
            );

            if (answer) {
              this.ordersAndAnswers.push({
                order,
                answer:
                  answersById[answer.reference].isMedia &&
                  answersById[answer.reference].label
                    ? answersById[answer.reference].label
                    : answersById[answer.reference].value,
              });
            }
          }

          this.orders = ordersByMerchant;
        }
      });
    });
  }

  goToDetail = (order: ItemOrder) => {
    return this.router.navigate(['/ecommerce/order-detail/' + order._id]);
  };

  getCreationDateDifferenceAsItsSaid(dateISOString) {
    const dateObj = new Date(dateISOString);
    const year = dateObj.getFullYear();
    const day = dateObj.getDate();
    const month = dateObj.getMonth();
    const hour = dateObj.getHours();

    moment.locale('es');
    return moment([year, month, day, hour]).fromNow();
  }

  back() {
    this.location.back();
  }
}
