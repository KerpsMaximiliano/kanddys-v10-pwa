import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Question } from 'src/app/core/models/webform';
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

  constructor(
    private _WebformsService: WebformsService,
    private _AuthService: AuthService,
    private _ActivatedRoute: ActivatedRoute,
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
        const _questions = webform.questions
          .sort(({ subIndex: a }, { subIndex: b }) => (a > b ? 1 : -1))
          .map((question: Question | any) => {
            const { _id, type } = question;
            const _answerFrequent: any = answerFrequent.find(
              ({ question: questionId }: any) => questionId === _id
            );
            if (_answerFrequent)
              switch (type) {
                case 'multiple':
                  question.answers = _answerFrequent.response.map(
                    ({ value, count }) => ({
                      text: `${count} ${value}`,
                      link: '/',
                    })
                  );
                  break;
                default:
                  const total =
                    _answerFrequent.response.length > 1
                      ? _answerFrequent.response.reduce(
                          ({ count: a }, { count: b }) => a + b
                        )
                      : _answerFrequent.response[0]?.count || 0;
                  question.total = total;
                  break;
              }
            const result: any = question;
            return result;
          });
        webform.questions = _questions.filter(
          ({ answers = [], total }) => answers?.length || total !== undefined
        );
        this.webform = webform;
      })();
    });
  }
}
