import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Question, Webform } from 'src/app/core/models/webform';
import { AuthService } from 'src/app/core/services/auth.service';
import { WebformsService } from 'src/app/core/services/webforms.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-webform-metrics',
  templateUrl: './webform-metrics.component.html',
  styleUrls: ['./webform-metrics.component.scss'],
})
export class WebformMetricsComponent implements OnInit {
  env: string = environment.assetsUrl;
  sub: Subscription;
  webform: Question | any = {};
  webformQuestions: Record<string, Question> = {};

  constructor(
    private _WebformsService: WebformsService,
    private _AuthService: AuthService,
    private _ActivatedRoute: ActivatedRoute,
    private location: Location,
    private _Router: Router
  ) {}

  ngOnInit(): void {
    this.sub = this._ActivatedRoute.params.subscribe(({ formId }) => {
      (async () => {
        const { _id: userId } = await this._AuthService.me();
        const { _id, user, ...webform } = await this._WebformsService.webform(
          formId
        );
        const { _id: webformUserId } = user || {};
        if (userId !== webformUserId) this._Router.navigate(['auth', 'login']);
        const answerFrequent = await this._WebformsService.answerFrequent(_id);

        webform.questions.forEach((question) => {
          this.webformQuestions[question._id] = question;
        });

        const metrics = webform.questions
          .sort(({ subIndex: a }, { subIndex: b }) => (a > b ? 1 : -1))
          .map((question: Question | any) => {
            const { _id, type } = question;
            const _answerFrequent: any = answerFrequent.find(
              ({ question: questionId }: any) => questionId === _id
            );

            const currentQuestion = this.webformQuestions[question._id];

            switch (type) {
              case 'multiple':
                question.answers = currentQuestion.answerDefault.map(
                  (option) => ({
                    text:
                      '0 ' +
                      (!option.label && !option.isMedia
                        ? option.value
                        : option.label
                        ? option.label
                        : ''),
                    link: '/',
                    file: option.isMedia ? option.value : null,
                    optionValue:
                      !option.label && !option.isMedia
                        ? option.value
                        : option.label,
                  })
                );

                if (_answerFrequent?.response) {
                  for (const optionNumbers of _answerFrequent?.response) {
                    const { value, label, count } = optionNumbers;

                    for (const option of question.answers) {
                      if (option.optionValue === label && option.file) {
                        if (label) option.text = `${count} ${label}`;
                        else option.text = `${count}`;
                      }

                      if (option.file && option.file === value) {
                        option.text = `${count}`;
                      }

                      if (option.optionValue && option.optionValue === value) {
                        if (value) option.text = `${count} ${value}`;
                        else option.text = `${count}`;
                      }
                    }
                  }
                }
                break;
              default:
                const total =
                  _answerFrequent?.response.length > 1
                    ? _answerFrequent.response.reduce(
                        (total, currentAnswer) => total + currentAnswer.count,
                        0
                      )
                    : _answerFrequent?.response[0]?.count || 0;
                question.total = total;
                break;
            }
            const result: any = question;
            return question;
          });
        const metricsQuestions = metrics.filter(
          ({ answers = [], total }) => answers?.length || total !== undefined
        );
        this.webform = { ...webform, _id, user };
      })();
    });
  }

  async goBack() {
    this.location.back();
  }
}
