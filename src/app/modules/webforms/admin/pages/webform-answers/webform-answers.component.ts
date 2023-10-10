import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { Merchant } from 'src/app/core/models/merchant';
import { User } from 'src/app/core/models/user';
import { Webform } from 'src/app/core/models/webform';
import { AuthService } from 'src/app/core/services/auth.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { WebformsService } from 'src/app/core/services/webforms.service';
import {
  WebformAnswerLayoutOption,
  webformAnswerLayoutOptionDefaultStyles
} from 'src/app/core/types/answer-selector';
import { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-webform-answers',
  templateUrl: './webform-answers.component.html',
  styleUrls: ['./webform-answers.component.scss'],
})
export class WebformAnswersComponent implements OnInit {
  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    freeMode: false,
    spaceBetween: 5,
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true,
    },
  };
  myUser: User;
  myMerchant: Merchant;
  loggedIn: boolean;
  webformData: Webform;
  currentQuestion: {
    id: string;
    index: number;
  } = null;
  webformAnswersPerUser: any[] = [];
  webformAnswersQueryResult: any[] = [];
  webformAnswersByQuestionHashTable: Record<string, any[]> = {};
  webformQuestionHashTable: Record<string, any[]> = {};

  questions: any[] = [];
  answersList: WebformAnswerLayoutOption[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private merchantsService: MerchantsService,
    private webformsService: WebformsService
  ) {}

  async ngOnInit(): Promise<void> {
    if (localStorage.getItem('session-token'))
      this.myUser = await this.authService.me();

    if (this.myUser) {
      this.loggedIn = true;
      this.myMerchant = await this.merchantsService.merchantDefault(
        this.myUser._id
      );
    }

    if (this.loggedIn) {
      this.webformData = this.webformsService.webformData;

      if (this.webformData) {
        this.questions = this.webformData.questions;

        if (this.questions.length > 0) {
          this.questions.forEach((question, index) => {
            if (index === 0) {
              this.currentQuestion = {
                index,
                id: question._id,
              };
            }

            this.webformQuestionHashTable[question._id] = question.value;
          });

          // TO FIX PaginationInput
          // this.webformAnswersPerUser = await this.webformsService.answerPaginate(
          //   this.webformData._id
          // );

          if (this.webformAnswersPerUser) {
            for (const userInfoAndAnswersObject of this.webformAnswersPerUser) {
              for (const answerObject of userInfoAndAnswersObject.response) {
                if (
                  !this.webformAnswersByQuestionHashTable[
                    answerObject.question //El Id de la pregunta
                  ]
                ) {
                  this.webformAnswersByQuestionHashTable[
                    answerObject.question //El Id de la pregunta
                  ] = [];
                }

                this.webformAnswersByQuestionHashTable[
                  answerObject.question //El Id de la pregunta
                ].push({
                  questionId: answerObject.question,
                  questionText:
                    this.webformQuestionHashTable[answerObject.question],
                  answer: answerObject.value,
                  whenWasAnswerCreated: userInfoAndAnswersObject.createdAt,
                  user: {
                    id: userInfoAndAnswersObject.user._id,
                    name: userInfoAndAnswersObject.user.name,
                  },
                });
              }
            }
          }

          this.renderAnswersBasedOnCurrentQuestionId(this.currentQuestion.id);
          /*
            this.webformAnswersQueryResult =
              await this.webformService.answerPaginate(this.webformId);

            if (this.webformAnswersQueryResult) {
              for (const answerObject of this.webformAnswersQueryResult) {
                if (
                  !this.webformAnswersByQuestionHashTable[
                    answerObject.question //El Id de la pregunta
                  ]
                ) {
                  this.webformAnswersByQuestionHashTable[
                    answerObject.question //El Id de la pregunta
                  ] = [];
                }

                console.log('pregunta', answerObject);

                this.webformAnswersByQuestionHashTable[
                  answerObject.question //El Id de la pregunta
                ].push({
                  questionId: answerObject.question,
                  questionText:
                    this.webformQuestionHashTable[answerObject.question],
                  answer: answerObject.value,
                });
              }

              console.log('filled', this.webformAnswersByQuestionHashTable);
            }*/
        }
      }
    }
  }

  renderAnswersBasedOnCurrentQuestionId(currentQuestionId: string) {
    this.answersList = [];
    for (const userAnswerObject of this.webformAnswersByQuestionHashTable[
      currentQuestionId
    ]) {
      this.answersList.push({
        type: 'WEBFORM-ANSWER',
        optionStyles: webformAnswerLayoutOptionDefaultStyles,
        selected: false,
        texts: {
          topRight: {
            text: this.getCreationDateDifferenceAsItsSaid(
              userAnswerObject.whenWasAnswerCreated
            ),
            styles: {
              color: '#7B7B7B',
            },
          },
          topLeft: {
            text: userAnswerObject.questionText,
            styles: {
              paddingBottom: '8px',
            },
          },
          middleTexts: [
            {
              text: userAnswerObject.answer,
            },
          ],
          bottomLeft: {
            text: userAnswerObject.user.name,
            styles: {
              paddingTop: '10px',
            },
          },
        },
      });
    }
  }

  /*
  this.getCreationDateDifferenceAsItsSaid(
                    question.createdAt
                  )
  */
  getCreationDateDifferenceAsItsSaid(dateISOString) {
    const dateObj = new Date(dateISOString);
    const year = dateObj.getFullYear();
    const day = dateObj.getDate();
    const month = dateObj.getMonth();
    const hour = dateObj.getHours();
    const minutes = dateObj.getMinutes();

    moment.locale('es');
    return moment([year, month, day, hour, minutes]).fromNow();
  }

  goBack() {}

  updateShownAnswersToMatchCurrentQuestion(slideChangeEventData: any) {
    const newCurrentQuestion = this.questions[slideChangeEventData.activeIndex];
    this.currentQuestion = {
      id: newCurrentQuestion._id,
      index: slideChangeEventData.activeIndex,
    };

    this.renderAnswersBasedOnCurrentQuestionId(this.currentQuestion.id);
  }
}
