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
  Answer,
  AnswersGroupedByUser,
  Question,
  Webform,
  answer,
} from 'src/app/core/models/webform';
import * as moment from 'moment';
import { ImageViewComponent } from '../../dialogs/image-view/image-view.component';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { Merchant } from 'src/app/core/models/merchant';
import { ItemSubOrderInput } from 'src/app/core/models/order';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { AppService } from 'src/app/app.service';

interface ExtendedAnswer extends Answer {
  responsesGroupedByQuestion: Array<{
    question: Question;
    value?: string;
    multipleValues?: Array<string>;
    label?: string;
    isMedia?: boolean;
  }>;
  merchant?: Merchant;
}

@Component({
  selector: 'app-form-responses',
  templateUrl: './form-responses.component.html',
  styleUrls: ['./form-responses.component.scss'],
})
export class FormResponsesComponent implements OnInit {
  currentView: 'FORM_SUBMISSIONS' | 'QUESTIONS' | 'FORM_SUBMISSION_RESPONSES' =
    'FORM_SUBMISSIONS';
  env: string = environment.assetsUrl;
  item: Item;
  webform: Webform;
  routeParamsSubscription: Subscription;
  answersForWebform: Array<ExtendedAnswer> = [];
  selectedFormSubmission: ExtendedAnswer = null;
  questionsByIdObject: Record<string, Question> = {};
  questionMetadata: Record<
    string,
    {
      numberOfAnswers: number;
      latestDate?: Date;
    }
  > = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private webformsService: WebformsService,
    private itemsService: ItemsService,
    private headerService: HeaderService,
    private authService: AuthService,
    private merchantService: MerchantsService,
    private saleflowService: SaleFlowService,
    private appService: AppService,
    private dialogService: DialogService
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

        this.answersForWebform = await this.webformsService.answerPaginate({
          findBy: {
            webform: formId,
          },
          options: {
            sortBy: 'createdAt:desc',
            limit: -1,
          },
        });

        for (const question of this.webform.questions) {
          this.questionsByIdObject[question._id] = question;
          this.questionMetadata[question._id] = {
            numberOfAnswers: 0,
          };
          /*
          answersByQuestionPromises.push(
            this.webformsService.ans
          );*/
        }

        for (const formSubmission of this.answersForWebform) {
          const questionsIdPassed = {};
          const questionIndexes = {};

          for (const response of formSubmission.response) {
            if (!questionsIdPassed[response.question]) {
              questionsIdPassed[response.question] = true;

              if (!formSubmission.responsesGroupedByQuestion)
                formSubmission.responsesGroupedByQuestion = [];

              formSubmission.responsesGroupedByQuestion.push({
                question: this.questionsByIdObject[response.question],
                isMedia: response.isMedia,
                label: response.label,
                value: response.value,
                multipleValues: [response.value],
              });

              questionIndexes[response.question] =
                formSubmission.responsesGroupedByQuestion.length - 1;
            } else {
              formSubmission.responsesGroupedByQuestion[
                questionIndexes[response.question]
              ].multipleValues.push(response.value);
            }
          }
        }

        //load the number of answers by each question
        for (const answer of this.answersForWebform) {
          for (const response of answer.response) {
            const responseDate = new Date(response.createdAt);

            if (this.questionMetadata[response.question]) {
              this.questionMetadata[response.question].numberOfAnswers++;

              if (!this.questionMetadata[response.question].latestDate)
                this.questionMetadata[response.question].latestDate =
                  responseDate;
              else if (
                this.questionMetadata[response.question].latestDate &&
                responseDate >
                  this.questionMetadata[response.question].latestDate
              ) {
                this.questionMetadata[response.question].latestDate =
                  responseDate;
              }
            }
          }
        }

        unlockUI();
      }
    );
  }

  getCreationDateDifferenceAsItsSaid(
    dateISOString,
    isAlreadyADateObject = false
  ) {
    const dateObj = !isAlreadyADateObject
      ? new Date(dateISOString)
      : dateISOString;
    const year = dateObj.getFullYear();
    const day = dateObj.getDate();
    const month = dateObj.getMonth();
    const hour = dateObj.getHours();

    moment.locale('es');
    return moment([year, month, day, hour]).fromNow();
  }

  changeView(
    view: 'FORM_SUBMISSIONS' | 'QUESTIONS' | 'FORM_SUBMISSION_RESPONSES',
    data?: any
  ) {
    this.currentView = view;

    if (view === 'FORM_SUBMISSION_RESPONSES') {
      this.selectedFormSubmission = data;
    } else {
      this.selectedFormSubmission = null;
    }
  }

  openImageModal(imageSourceURL: string) {
    this.dialogService.open(ImageViewComponent, {
      type: 'fullscreen-translucent',
      props: {
        imageSourceURL,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  goBack() {
    if (this.currentView === 'FORM_SUBMISSION_RESPONSES') {
      this.currentView = 'FORM_SUBMISSIONS' as any;
      this.selectedFormSubmission = null;
    }
  }

  getAnswerType(question: Question) {
    if (question.type === 'text' && question.answerTextType === 'default')
      return 'Respuesta de texto abierta';

    if (question.type === 'text' && question.answerTextType === 'email')
      return 'Correo electrónico';

    if (question.type === 'text' && question.answerTextType === 'phone')
      return 'Teléfono';

    if (question.type === 'text' && question.answerTextType === 'name')
      return 'Nombre y Apellido';

    if (question.type === 'text' && question.answerTextType === 'max12')
      return 'Menos de 12 palabras';

    if (question.type === 'text' && question.answerTextType === 'min12')
      return 'Más de 12 palabras';

    if (question.type === 'multiple' || question.type === 'multiple-text')
      return 'Selección entre opciones';
  }

  goToPreview = async () => {
    const product: ItemSubOrderInput = {
      item: this.item._id,
      amount: 1,
    };

    const saleflowDefault = await this.saleflowService.saleflowDefault(
      this.merchantService.merchantData._id
    );

    this.headerService.saleflow = saleflowDefault;

    this.headerService.emptyOrderProducts();

    this.headerService.storeOrderProduct(product);

    this.appService.events.emit({
      type: 'added-item',
      data: this.item._id,
    });

    this.router.navigate(
      ['/ecommerce/' + this.merchantService.merchantData.slug + '/checkout'],
      {
        queryParams: {
          webformPreview: true,
        },
      }
    );
  };
}
