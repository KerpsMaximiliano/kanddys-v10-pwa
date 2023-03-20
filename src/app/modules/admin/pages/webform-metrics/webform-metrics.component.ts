import { Location } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Item } from 'src/app/core/models/item';
import { ItemSubOrderInput } from 'src/app/core/models/order';
import { Question, Webform } from 'src/app/core/models/webform';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { WebformsService } from 'src/app/core/services/webforms.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-webform-metrics',
  templateUrl: './webform-metrics.component.html',
  styleUrls: ['./webform-metrics.component.scss'],
})
export class WebformMetricsComponent implements OnInit, OnDestroy {
  env: string = environment.assetsUrl;
  sub: Subscription;
  sub2: Subscription;
  webform: Question | Webform | any = {};
  webformQuestions: Record<string, Question> = {};
  itemId: string = null;
  itemData: Item = null;
  webformStatus: 'ACTIVE' | 'INACTIVE' = 'ACTIVE';
  resumingWebformCreation: boolean = false;
  webformInternalId: string = null;
  openedDialogFlow: boolean = false;

  constructor(
    private _WebformsService: WebformsService,
    private _AuthService: AuthService,
    private _ActivatedRoute: ActivatedRoute,
    private location: Location,
    private itemService: ItemsService,
    public headerService: HeaderService,
    private appService: AppService,
    private merchantsService: MerchantsService,
    private saleflowService: SaleFlowService,
    private _Router: Router,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    await this.executeInitProcesses();
  }

  executeInitProcesses = async () => {
    this.sub = this._ActivatedRoute.params.subscribe(
      async ({ formId, itemId }) => {
        this.sub2 = this._ActivatedRoute.queryParams.subscribe(
          async ({ resumeWebform }) => {
            const { _id: userId } = await this._AuthService.me();
            const { _id, user, ...webform } =
              await this._WebformsService.webform(formId);
            this.itemId = itemId;
            this.itemData = await this.itemService.item(itemId);

            if (this.itemData.webForms.length) {
              this.webformStatus = this.itemData.webForms[0].active
                ? 'ACTIVE'
                : 'INACTIVE';
              this.webformInternalId = this.itemData.webForms[0]._id;
            }

            const { _id: webformUserId } = user || {};
            if (userId !== webformUserId)
              this._Router.navigate(['auth', 'login']);
            const answerFrequent = await this._WebformsService.answerFrequent(
              _id
            );

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
                  case 'multiple-text':
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

                    const additionalAnswers = [];

                    if (_answerFrequent?.response) {
                      for (const optionNumbers of _answerFrequent?.response) {
                        const { value, label, count } = optionNumbers;

                        const isADeclaredOption = question.answers.find(
                          (option) =>
                            option.optionValue === value ||
                            value === option.file ||
                            value === option.label
                        );

                        if (!isADeclaredOption)
                          additionalAnswers.push({
                            text: count + ' ' + value,
                            userProvided: true,
                          });

                        for (const option of question.answers) {
                          if (option.optionValue === label && option.file) {
                            if (label) option.text = `${count} ${label}`;
                            else option.text = `${count}`;
                          } else if (option.file && option.file === value) {
                            option.text = `${count} veces escogida`;
                          } else if (
                            option.optionValue &&
                            option.optionValue === value
                          ) {
                            if (value) option.text = `${count} ${value}`;
                            else option.text = `${count} veces escogida`;
                          }
                        }
                      }
                    }

                    if (additionalAnswers.length) {
                      const toAdd = [
                        {
                          text: additionalAnswers.length + ' Otras respuestas',
                          freeResponse: true,
                        },
                      ];

                      question.answers = question.answers.concat(toAdd);
                    }
                    break;
                  default:
                    const total =
                      _answerFrequent?.response.length > 1
                        ? _answerFrequent.response.reduce(
                            (total, currentAnswer) =>
                              total + currentAnswer.count,
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
              ({ answers = [], total }) =>
                answers?.length || total !== undefined
            );
            this.webform = { ...webform, _id, user };

            if (resumeWebform && this._WebformsService.webformCreatorLastDialogs.length) {
              this.openedDialogFlow = true;
              this.resumingWebformCreation = true;
            }
          }
        );
      }
    );
  };

  async goBack() {
    this.location.back();
  }

  goToPreview = async () => {
    const product: ItemSubOrderInput = {
      item: this.itemId,
      amount: 1,
    };

    const saleflowDefault = await this.saleflowService.saleflowDefault(
      this.merchantsService.merchantData._id
    );

    this.headerService.saleflow = saleflowDefault;

    this.headerService.emptyOrderProducts();
    this.headerService.emptyItems();

    this.headerService.storeOrderProduct(product);

    this.appService.events.emit({
      type: 'added-item',
      data: this.itemData._id,
    });
    this.headerService.storeItem(
      // this.selectedParam ? itemParamValue :
      this.itemData
    );

    this._Router.navigate(
      ['/ecommerce/' + this.merchantsService.merchantData.slug + '/checkout'],
      {
        queryParams: {
          webformPreview: true,
        },
      }
    );
  };

  addNewQuestion = async () => {
    this.openedDialogFlow = !this.openedDialogFlow;
  };

  switchWebformStatus = () => {
    lockUI();

    this._WebformsService
      .itemUpdateWebForm(
        {
          active: this.webformStatus === 'ACTIVE' ? false : true,
        },
        this.webformInternalId,
        this.itemId
      )
      .then((response) => {
        if (response) {
          this.webformStatus =
            this.webformStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

          unlockUI();

          this.snackBar.open('Cambio aplicado con exito', '', {
            duration: 2000,
          });
        }
      })
      .catch((error) => {
        console.error(error);
        unlockUI();
      });
  };

  async reloadWebform() {
    this.openedDialogFlow = false;

    await this.executeInitProcesses();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.sub2.unsubscribe();
  }
}
