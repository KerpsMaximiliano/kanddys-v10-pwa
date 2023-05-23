import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Item } from 'src/app/core/models/item';
import { ItemSubOrderInput } from 'src/app/core/models/order';
import { User } from 'src/app/core/models/user';
import { Webform, WebformAnswerInput, WebformResponseInput } from 'src/app/core/models/webform';
import { HeaderService } from 'src/app/core/services/header.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { ResponsesByQuestion, WebformsService } from 'src/app/core/services/webforms.service';
import { EmbeddedComponentWithId } from 'src/app/core/types/multistep-form';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
import { environment } from 'src/environments/environment';
import { SwiperOptions } from 'swiper';

interface ExtendedItem extends Item {
  ready?: boolean;
}

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {

  env: string = environment.assetsUrl;

  currentUser: User;
  logged: boolean = false;

  items: ExtendedItem[] = [];
  itemObjects: Record<string, ItemSubOrderInput> = {};

  webformsByItem: Record<
    string,
    {
      webform: Webform;
      dialogs: Array<EmbeddedComponentWithId>;
      swiperConfig: SwiperOptions;
      dialogFlowFunctions: Record<string, any>;
      opened: boolean;
      valid?: boolean;
    }
  > = {};

  answersByQuestion: Record<string, ResponsesByQuestion> = {};

  constructor(
    public headerService: HeaderService,
    private saleflowService: SaleFlowService,
    private dialogService: DialogService,
    private _WebformsService: WebformsService,
    private router: Router
  ) { }

  async ngOnInit() {
    await this.executeProcessesAfterLoading();
  }

  async executeProcessesAfterLoading() {
    await this.getItems();
    this.checkLogged();
    await this.getQuestions();
  }

  private async getItems() {
    let items = this.headerService.order.products.map(
      (subOrder) => subOrder.item
    );
    if (!this.headerService.order?.products) console.log("No hay productos");
    if (!items.every((value) => typeof value === 'string')) {
      items = items.map((item: any) => item?._id || item);
    }
    if (!items?.length) console.log("No hay productos x2");
    this.items = (
      await this.saleflowService.listItems({
        findBy: {
          _id: {
            __in: ([] = [...items]),
          },
        },
      })
    )?.listItems;

    this.fixImagesURL();

    // Check if some of the items in the cart has no amount (quantity that defines how many units of the item are getting ordered)
    this.headerService.order.products.forEach((product) => {
      if (product.amount) this.itemObjects[product.item] = product;
      else this.headerService.removeOrderProduct(product.item);
    });
  }

  // Checks if the URL has no HTTPS then fixes it
  private fixImagesURL() {
    for (const item of this.items as Array<ExtendedItem>) {
      item.ready = false;
      item.images = item.images.sort(({ index: a }, { index: b }) =>
        a > b ? 1 : -1
      );
      for (const image of item.images) {
        if (
          image.value &&
          !image.value.includes('http') &&
          !image.value.includes('https')
        ) {
          image.value = 'https://' + image.value;
        }
      }
    }
  }

  private async checkLogged() {
    try {
      const anonymous = this.headerService.getOrderAnonymous();
      const registeredUser = JSON.parse(
        localStorage.getItem('registered-user')
      ) as User;
      if ((this.headerService.user || registeredUser) && !anonymous) {
        this.currentUser = this.headerService.user || registeredUser;
        this.logged = true;
      } else this.logged = false;
    } catch (e) {
      console.log(e);
      return;
    }
  }

  async getQuestions(): Promise<void> {
    for (const item of this.items) {
      const { webForms } = item;

      const firstActiveWebformIndex = webForms.findIndex(
        (webform) => webform.active
      );

      //If there's at least 1 webform associated with the item, then, it loads the questions
      if (
        webForms &&
        webForms.length > 0 &&
        firstActiveWebformIndex >= 0 &&
        webForms[firstActiveWebformIndex].active
      ) {
        const itemWebform = webForms[firstActiveWebformIndex];

        const webformId = itemWebform.reference;
        const webform = await this._WebformsService.webform(webformId);

        //Sorts the question by subIndez
        webform.questions = webform.questions.sort(
          (a, b) => a.subIndex - b.subIndex
        );

        if (webform) {
          this.webformsByItem[item._id] = {
            webform,
            dialogs: [],
            swiperConfig: null,
            dialogFlowFunctions: {},
            opened: false,
          };

          //loads the questions in an object that associates each answer with each question
          for (const question of webform.questions) {
            let multipleResponse =
              (['multiple', 'multiple-text'].includes(question.type) &&
                question.answerLimit === 0) ||
              question.answerLimit > 1;
            const isMedia = Boolean(
              question.answerDefault &&
                question.answerDefault.length &&
                question.answerDefault.some((option) => option.isMedia)
            );

            if (isMedia) {
              question.answerDefault = question.answerDefault.map((option) => ({
                ...option,
                img: option.isMedia ? option.value : null,
                isMedia: option.isMedia,
              }));
            }

            let response = '';
            let responseLabel = '';
            let selectedIndex = null;

            if (!this._WebformsService.clientResponsesByItem[question._id]) {
              this.answersByQuestion[question._id] = {
                question,
                response,
                isMedia,
                isMultipleResponse: multipleResponse,
              };
              this._WebformsService.clientResponsesByItem[question._id] =
                this.answersByQuestion[question._id];
            } else {
              this.answersByQuestion[question._id] =
                this._WebformsService.clientResponsesByItem[question._id];

              if (
                question.type === 'text' &&
                question.answerTextType === 'name'
              ) {
                this.answersByQuestion[question._id].response =
                  this._WebformsService.clientResponsesByItem[
                    question._id
                  ].response;
                this.answersByQuestion[question._id].responseLabel =
                  this._WebformsService.clientResponsesByItem[
                    question._id
                  ].responseLabel;

                //this.answersByQuestion[question._id].valid = valid;
              } else if (
                ['multiple', 'multiple-text'].includes(question.type)
              ) {
                if (
                  !multipleResponse &&
                  this.answersByQuestion[question._id].allOptions
                ) {
                  const selectedIndex = (
                    this.answersByQuestion[question._id]
                      .allOptions as Array<any>
                  ).findIndex((option) => option.selected);

                  response = this.answersByQuestion[question._id].response;
                  if (response && response !== '')
                    this.answersByQuestion[question._id]['response'] = response;

                  if (selectedIndex >= 0) {
                    this.answersByQuestion[question._id]['selectedIndex'] =
                      selectedIndex;
                  }
                } /*else {
                  const selectedOptions = (
                    this.dialogFlowService.dialogsFlows[
                      'webform-item-' + item._id
                    ][question._id].fields
                      .options as Array<ExtendedAnswerDefault>
                  ).filter((option) => option.selected);

                  if (selectedOptions.length > 0) {
                    this.answersByQuestion[question._id]['multipleResponses'] =
                      selectedOptions.map((option) => ({
                        response: option.userProvidedAnswer
                          ? option.userProvidedAnswer
                          : option.value,
                        responseLabel: option.label ? option.label : null,
                        isProvidedByUser: option.userProvidedAnswer
                          ? true
                          : false,
                        isMedia: option.isMedia,
                      }));
                  }
                }*/
              }
            }
          }
        }
      }
    }

    // if (Object.keys(this.webformsByItem).length === 0)
    //   this.areWebformsValid = true;
    // else {
    //   this.areItemsQuestionsAnswered();
    // }
  }

  getItemAnswers(): Array<{
    item: string;
    answer: WebformAnswerInput;
  }> {
    const answers: Array<{
      item: string;
      answer: WebformAnswerInput;
    }> = [];
    for (const item of this.items) {
      if (
        item.webForms &&
        item.webForms.length &&
        this.webformsByItem[item._id]
      ) {
        const answer = this.getWebformAnswer(item._id);
        answers.push({
          item: item._id,
          answer: answer,
        });
      }
    }

    return answers;
  }

  getWebformAnswer(itemId: string): WebformAnswerInput {
    const answerInput: WebformAnswerInput = {
      webform: this.webformsByItem[itemId].webform._id,
      response: [],
      entity: 'ITEM',
      reference: itemId,
    };

    for (const question of this.webformsByItem[itemId].webform.questions) {
      if (
        !this.answersByQuestion[question._id].isMultipleResponse &&
        this.answersByQuestion[question._id].response
      ) {
        const response: WebformResponseInput = {
          question: question._id,
          isMedia: this.answersByQuestion[question._id].isMedia,
          value:
            typeof this.answersByQuestion[question._id].response === 'number'
              ? this.answersByQuestion[question._id].response.toString()
              : this.answersByQuestion[question._id].response,
        };

        if (this.answersByQuestion[question._id].responseLabel)
          response.label = this.answersByQuestion[question._id].responseLabel;

        response.isMedia =
          typeof response.value !== 'number' &&
          response.value &&
          response.value.includes('http');

        answerInput.response.push(response);
      }

      if (
        this.answersByQuestion[question._id].isMultipleResponse &&
        this.answersByQuestion[question._id].multipleResponses?.length
      ) {
        for (const responseInList of this.answersByQuestion[question._id]
          .multipleResponses) {
          const response: WebformResponseInput = {
            question: question._id,
            isMedia: this.answersByQuestion[question._id].isMedia,
            value: responseInList.response,
          };

          if (responseInList.responseLabel)
            response.label = responseInList.responseLabel;

          response.isMedia =
            typeof response.value !== 'number' &&
            response.value &&
            response.value.includes('http');

          answerInput.response.push(response);
        }
      }
    }

    return answerInput;
  }

  changeAmount(itemId: string, type: 'add' | 'subtract') {
    const product = this.headerService.order.products.find(
      (product) => product.item === itemId
    );

    this.headerService.changeItemAmount(product.item, type);
    this.headerService.order.products.forEach((product) => {
      if (product.amount) this.itemObjects[product.item] = product;
      else this.headerService.removeOrderProduct(product.item);
    });
  }

  openImageModal(imageSourceURL: string | ArrayBuffer) {
    this.dialogService.open(ImageViewComponent, {
      type: 'fullscreen-translucent',
      props: {
        imageSourceURL,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  goToStore() {
    // this.router.navigate([``])
  }

}
