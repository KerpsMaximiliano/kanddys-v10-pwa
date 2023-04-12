import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemOrder } from 'src/app/core/models/order';
import { AnswerDefault, Webform, answer } from 'src/app/core/models/webform';
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
  itemId: string;
  orders: Array<ItemOrder> = [];
  selectedOption: AnswerDefault;
  openResponses: boolean;
  ordersAndAnswers: Array<{
    order: ItemOrder;
    isMedia: boolean;
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
        const { formId, itemId } = params;

        this.webform = await this.webformService.webform(formId);
        this.itemId = itemId;
        this.openResponses = Boolean(openResponses);

        const selectedQuestion = this.webform?.questions.find(
          (questionInList) => questionInList._id === question
        );

        console.log('selectedQuestion', selectedQuestion);

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
            options: {
              limit: -1,
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
            options: {
              limit: -1,
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
              let shouldIncludeAnswers = false;

              //For questions of type text, that can accept any answer, we need to check if the answer is not a media
              if (
                selectedQuestion.type === 'text' &&
                !answersById[answer.reference].isMedia
              ) {
                shouldIncludeAnswers = true;
              }

              if (
                selectedQuestion._id &&
                answersById[answer.reference].question &&
                shouldIncludeAnswers
              )
                this.ordersAndAnswers.push({
                  order,
                  isMedia: answersById[answer.reference].isMedia,
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
            options: {
              limit: -1,
            },
          });

          console.log(answers);

          const answersById = {};

          answers.forEach((answer) => {
            answersById[answer._id] = answer.response.find((answer) => {
              return (
                answer.question === question &&
                !answer.value?.includes('http') &&
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
                isMedia: answersById[answer.reference].isMedia,
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

  isAnswerInOptions(answer, options) {}

  goToDetail = (order: ItemOrder) => {
    return this.router.navigate(['/ecommerce/order-detail/' + order._id], {
      queryParams: {
        from: this.router.url,
      },
    });
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
    this.router.navigate([
      '/admin/webform-metrics/' + this.webform._id + '/' + this.itemId,
    ]);
  }
}
