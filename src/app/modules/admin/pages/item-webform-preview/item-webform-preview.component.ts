import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Item } from 'src/app/core/models/item';
import { User } from 'src/app/core/models/user';
import { Webform } from 'src/app/core/models/webform';
import { DialogFlowService } from 'src/app/core/services/dialog-flow.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { WebformsService } from 'src/app/core/services/webforms.service';
import { EmbeddedComponentWithId } from 'src/app/core/types/multistep-form';
import { ClosedQuestionCardComponent } from 'src/app/shared/components/closed-question-card/closed-question-card.component';
import { WebformNameQuestionComponent } from 'src/app/shared/components/webform-name-question/webform-name-question.component';
import { WebformTextareaQuestionComponent } from 'src/app/shared/components/webform-textarea-question/webform-textarea-question.component';
import { SwiperOptions } from 'swiper';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-item-webform-preview',
  templateUrl: './item-webform-preview.component.html',
  styleUrls: ['./item-webform-preview.component.scss'],
})
export class ItemWebformPreviewComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  item: Item;
  webform: Webform;
  webformConfig: {
    webform: Webform;
    dialogs: Array<EmbeddedComponentWithId>;
    swiperConfig: SwiperOptions;
    dialogFlowFunctions: Record<string, any>;
    opened: boolean;
    valid?: boolean;
  } = null;
  logged: boolean;
  currentUser: User;
  env: string = environment.assetsUrl;

  constructor(
    private route: ActivatedRoute,
    private itemService: ItemsService,
    private webformService: WebformsService,
    private dialogFlowService: DialogFlowService,
    public headerService: HeaderService
  ) {}

  ngOnInit(): void {
    this.subscription = this.route.params.subscribe(async ({ itemId }) => {
      await this.getItemData(itemId);
      await this.getQuestions();
    });
  }

  async getItemData(itemId: string) {
    this.item = await this.itemService.item(itemId);
  }

  async getQuestions(): Promise<void> {
      const { webForms } = this.item;

      
      console.log("WEBFORM", webForms)

      //If there's at least 1 webform associated with the item, then, it loads the questions
      if (webForms && webForms.length > 0) {
        const itemWebform = webForms[0];

        const webformId = itemWebform.reference;
        const webform = await this.webformService.webform(webformId);

        //Sorts the question by subIndez
        webform.questions = webform.questions.sort(
          (a, b) => a.subIndex - b.subIndex
        );


        if (webform) {
          this.webformConfig = {
            webform,
            dialogs: [],
            swiperConfig: null,
            dialogFlowFunctions: {},
            opened: false,
          };
        }
      } else {
        this.webform = null;
      }

    this.createDialogFlowForEachQuestion();
  }

  //Creates a dialog flow that allows the user to answer each item questions
  createDialogFlowForEachQuestion() {
      if (this.webformConfig?.webform) {
        for (const question of this.webformConfig.webform
          .questions) {
          const lastDialogIndex =
            this.webformConfig.dialogs.length - 1;

          if (
            question.type === 'text' &&
            question.answerTextType.toUpperCase() !== 'NAME'
          ) {
            const validators = [Validators.required];

            if (question.answerTextType.toUpperCase() === 'EMAIL')
              validators.push(Validators.email);

            this.webformConfig.dialogs.push({
              component: WebformTextareaQuestionComponent,
              componentId: question._id,
              inputs: {
                label: question.value,
                containerStyles: {
                  opacity: '1',
                },
                dialogFlowConfig: {
                  dialogId: question._id,
                  flowId: 'preview-webform-item-' + this.item._id,
                },
                inputType: question.answerTextType.toUpperCase(),
                textarea: new FormControl('', validators),
              },
            });
          } else if (
            question.type === 'text' &&
            question.answerTextType.toUpperCase() === 'NAME'
          ) {
            this.webformConfig.dialogs.push({
              component: WebformNameQuestionComponent,
              componentId: question._id,
              inputs: {
                label: question.value,
                containerStyles: {
                  opacity: '1',
                },
                dialogFlowConfig: {
                  dialogId: question._id,
                  flowId: 'preview-webform-item-' + this.item._id,
                },
                inputType: question.answerTextType.toUpperCase(),
                name: new FormControl('', [
                  Validators.required,
                  Validators.pattern(/[\S]/),
                ]),
                lastname: new FormControl('', [
                  Validators.required,
                  Validators.pattern(/[\S]/),
                ]),
              },
            });
          } else if (
            question.type === 'multiple' ||
            question.type === 'multiple-text'
          ) {
            const activeOptions = question.answerDefault
              .filter((option) => option.active)
              .map((option) => ({
                ...option,
                selected: false,
                img: option.isMedia ? option.value : null,
              }));

              console.log("A", question.answerDefault);
              console.log("D", activeOptions);

            if (question.type === 'multiple-text')
              activeOptions.push({
                value: 'Otra respuesta',
                isMedia: false,
                selected: false,
                active: true,
                defaultValue: null,
                label: null,
                createdAt: null,
                updatedAt: null,
                img: null,
                _id: null,
              });

              console.log("OPCIONES", activeOptions);

            this.webformConfig.dialogs.push({
              component: ClosedQuestionCardComponent,
              componentId: question._id,
              inputs: {
                question: question.value,
                shadows: false,
                questionType: question.type,
                dialogFlowConfig: {
                  dialogId: question._id,
                  flowId: 'preview-webform-item-' + this.item._id,
                },
                multiple: question.answerLimit === 0,
                completeAnswers: activeOptions,
                required: question.required,
                restartFromEvent: true,
              },
            });
          }
        }
      }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
