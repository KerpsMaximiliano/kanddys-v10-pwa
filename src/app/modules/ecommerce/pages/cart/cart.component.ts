import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { Item } from 'src/app/core/models/item';
import { ItemSubOrderInput } from 'src/app/core/models/order';
import { User } from 'src/app/core/models/user';
import {
  Question,
  Webform,
  WebformAnswerInput,
  WebformResponseInput,
} from 'src/app/core/models/webform';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import {
  ResponsesByQuestion,
  WebformsService,
} from 'src/app/core/services/webforms.service';
import { EmbeddedComponentWithId } from 'src/app/core/types/multistep-form';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ExtendedAnswerDefault } from 'src/app/shared/components/webform-multiple-selection-question/webform-multiple-selection-question.component';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
import { environment } from 'src/environments/environment';
import { SwiperOptions } from 'swiper';
import { Subscription } from 'rxjs';
import { capitalize } from 'src/app/core/helpers/strings.helpers';
import { PostsService } from 'src/app/core/services/posts.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { OptionsMenuComponent } from 'src/app/shared/dialogs/options-menu/options-menu.component';
import { isVideo } from 'src/app/core/helpers/strings.helpers';
import {
  lockUI,
  playVideoOnFullscreen,
  unlockUI,
} from 'src/app/core/helpers/ui.helpers';
import { QuotationsService } from 'src/app/core/services/quotations.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { AuthService } from 'src/app/core/services/auth.service';

interface ExtendedItem extends Item {
  ready?: boolean;
}

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {
  env: string = environment.assetsUrl;

  currentUser: User;
  logged: boolean = false;

  items: ExtendedItem[] = [];
  itemObjects: Record<string, ItemSubOrderInput> = {};

  isItemInCart: boolean = false;

  webformsByItem: Record<
    string,
    {
      webform: Webform;
      swiperConfig: SwiperOptions;
      opened?: boolean;
      valid?: boolean;
    }
  > = {};
  areWebformsValid: boolean = false;
  answersByQuestion: Record<string, ResponsesByQuestion> = {};

  isCheckboxChecked: boolean = false;

  queryParamsSubscription: Subscription = null;

  capitalize = capitalize;
  wait: boolean = false;
  redirectFromFlowRoute: boolean = false;
  playVideoOnFullscreen = playVideoOnFullscreen;

  constructor(
    public headerService: HeaderService,
    private saleflowService: SaleFlowService,
    private itemsService: ItemsService,
    private dialogService: DialogService,
    private _WebformsService: WebformsService,
    private quotationsService: QuotationsService,
    private merchantsService: MerchantsService,
    private appService: AppService,
    private router: Router,
    private route: ActivatedRoute,
    public postsService: PostsService,
    private authService: AuthService,
    private _bottomSheet: MatBottomSheet
  ) {}

  async ngOnInit() {
    console.log(this.headerService.saleflow);
    this.queryParamsSubscription = this.route.queryParams.subscribe(
      async ({ item, wait, redirectFromFlowRoute }) => {
        this.wait = wait;
        this.redirectFromFlowRoute = Boolean(redirectFromFlowRoute);

        if (!this.headerService.redirectFromFlowRoute)
          this.headerService.redirectFromFlowRoute = this.redirectFromFlowRoute;
        else {
          this.redirectFromFlowRoute = this.headerService.redirectFromFlowRoute;
        }

        if (this.wait)
          this.headerService.ecommerceDataLoaded.subscribe({
            next: async (value: boolean) => {
              if (value) {
                if (item) await this.executeProcessesAfterLoading(item);
                else await this.executeProcessesAfterLoading();
              }
            },
          });
        else {
          if (item) await this.executeProcessesAfterLoading(item);
          else await this.executeProcessesAfterLoading();
        }
      }
    );
  }

  async executeProcessesAfterLoading(itemId?: string) {
    if (itemId) await this.addItemToCart(itemId);
    await this.getItems();
    this.checkLogged();
    await this.getQuestions();

    if (
      !this.headerService.saleflow.module.post ||
      !this.headerService.saleflow.module.post.isActive
    ) {
      this.isCheckboxChecked = true;
    }
  }

  private async getItems() {
    let items = this.headerService.order.products.map(
      (subOrder) => subOrder.item
    );
    if (!this.headerService.order?.products) console.log('No hay productos');
    if (!items.every((value) => typeof value === 'string')) {
      items = items.map((item: any) => item?._id || item);
    }
    if (!items?.length) console.log('No hay productos x2');
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

    // Check if some of the items in the cart have no amount (quantity that defines how many units of the item are getting ordered)
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
            swiperConfig: null,
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

    if (Object.keys(this.webformsByItem).length === 0)
      this.areWebformsValid = true;
    else {
      this.areItemsQuestionsAnswered();
    }
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

  //Opens each item webform
  openWebform(itemId: string, index: number) {
    this.router.navigate(
      [
        '/ecommerce/' +
          this.headerService.saleflow.merchant.slug +
          '/webform/' +
          itemId,
      ],
      {
        queryParams: {
          startAtQuestion: index,
          redirectTo: 'cart',
        },
      }
    );
  }

  changeAmount(itemId: string, type: 'add' | 'subtract') {
    const product = this.headerService.order.products.find(
      (product) => product.item === itemId
    );

    this.headerService.changeItemAmount(product.item, type);

    this.headerService.changedItemAmountSubject.subscribe({
      next: (value: Array<ItemSubOrderInput>) => {
        const itemsIdsDeleted = {};

        this.items.forEach((item) => {
          itemsIdsDeleted[item._id] = true;
        });

        this.headerService.order.products.forEach((product) => {
          if (product.amount) {
            this.itemObjects[product.item] = product;
            itemsIdsDeleted[product.item] = false;
          }
        });

        this.items = this.items.filter((item) => !itemsIdsDeleted[item._id]);

        Object.keys(itemsIdsDeleted).forEach((itemId) => {
          if (itemsIdsDeleted[itemId]) {
            delete this.webformsByItem[itemId];
          }
        });

        this.areItemsQuestionsAnswered();

        if (this.items.length === 0)
          this.router.navigate([
            '/ecommerce/' +
              this.headerService.saleflow.merchant.slug +
              '/store',
          ]);
      },
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

  goBack() {
    if (this.quotationsService.quotationInCart) {
      this.headerService.flowRoute =
        '/admin/quotation-bids/' + this.quotationsService.quotationInCart._id;
    }

    if (this.redirectFromFlowRoute)
      return this.headerService.redirectFromQueryParams();

    this.router.navigate([
      `/ecommerce/${this.headerService.saleflow.merchant.slug}/store`,
    ]);
  }

  selectOption = (
    question: Question,
    item: Item,
    restartDialogInDialogFlow: boolean = false,
    updatedOptions: {
      selectedOptions: Array<ExtendedAnswerDefault>;
      userProvidedAnswer?: string;
      valid: boolean;
    }
  ) => {
    const options = updatedOptions.selectedOptions;

    const isMultipleSelection =
      question.answerLimit === 0 || question.answerLimit > 1;

    if (!isMultipleSelection) {
      if (!updatedOptions.userProvidedAnswer) {
        const selected = options.find((option) => option.selected);

        const doesOptionsHaveMedia = question.answerDefault.some(
          (option) => option.isMedia
        );

        if (!doesOptionsHaveMedia) {
          if (selected) {
            this.answersByQuestion[question._id].response =
              !updatedOptions.userProvidedAnswer
                ? selected.value
                : updatedOptions.userProvidedAnswer;

            this.answersByQuestion[question._id].valid = Boolean(
              selected.value.length
            );
          }
        } else {
          if (selected) {
            this.answersByQuestion[question._id].response = selected.value;

            if (selected.label)
              this.answersByQuestion[question._id].responseLabel =
                selected.label;
            else {
              this.answersByQuestion[question._id].responseLabel = null;
            }

            this.answersByQuestion[question._id].valid = Boolean(
              selected.value.length
            );
          }
        }

        this.answersByQuestion[question._id].allOptions = options.map(
          (option) => ({
            fileInput: option.img,
            selected: option.selected,
            text: !option.value.includes('https') ? option.value : null,
          })
        );

        this._WebformsService.clientResponsesByItem[question._id] =
          this.answersByQuestion[question._id];
      } else {
        const options = updatedOptions.selectedOptions;

        options.forEach((option) => (option.selected = false));

        this.answersByQuestion[question._id].response =
          updatedOptions.userProvidedAnswer;

        this.answersByQuestion[question._id].valid = Boolean(
          updatedOptions.userProvidedAnswer.length
        );

        this.answersByQuestion[question._id].allOptions = options.map(
          (option) => ({
            fileInput: option.img,
            selected: option.selected,
            text: !option.value.includes('https') ? option.value : null,
          })
        );

        this._WebformsService.clientResponsesByItem[question._id] =
          this.answersByQuestion[question._id];
      }
    } else {
      const selectedOptions = options.filter((option) => option.selected);

      this.answersByQuestion[question._id].allOptions = options.map(
        (option) => ({
          fileInput: option.img,
          selected: option.selected,
          text: !option.value.includes('https') ? option.value : null,
        })
      );

      if (selectedOptions.length) {
        this.answersByQuestion[question._id].multipleResponses = [];

        selectedOptions.forEach((optionSelected, index) => {
          this.answersByQuestion[question._id].multipleResponses.push({
            response: optionSelected.value,
            responseLabel: optionSelected.label ? optionSelected.label : null,
            isProvidedByUser: optionSelected.userProvidedAnswer ? true : false,
            isMedia: optionSelected.isMedia,
          });

          if (
            index === selectedOptions.length - 1 &&
            updatedOptions.userProvidedAnswer &&
            updatedOptions.userProvidedAnswer !== ''
          ) {
            this.answersByQuestion[question._id].multipleResponses.push({
              response: updatedOptions.userProvidedAnswer,
              isProvidedByUser: true,
              isMedia: false,
            });
          }

          this._WebformsService.clientResponsesByItem[question._id].valid =
            true;
        });

        this._WebformsService.clientResponsesByItem[question._id] =
          this.answersByQuestion[question._id];
      } else {
        if (
          selectedOptions.length === 0 &&
          updatedOptions.userProvidedAnswer !== ''
        ) {
          this.answersByQuestion[question._id].multipleResponses = [];

          this.answersByQuestion[question._id].multipleResponses.push({
            response: updatedOptions.userProvidedAnswer,
            isProvidedByUser: true,
            isMedia: false,
          });

          this._WebformsService.clientResponsesByItem[question._id].valid =
            question.required
              ? this.answersByQuestion[question._id].multipleResponses.length >
                0
              : true;

          this._WebformsService.clientResponsesByItem[question._id] =
            this.answersByQuestion[question._id];
        } else {
          this.answersByQuestion[question._id].multipleResponses = [];
          this._WebformsService.clientResponsesByItem[question._id].valid =
            question.required
              ? this.answersByQuestion[question._id].multipleResponses.length >
                0
              : true;
        }
      }
    }

    this.areItemsQuestionsAnswered();
  };

  areItemsQuestionsAnswered() {
    const itemRequiredQuestions: Record<
      string,
      {
        requiredQuestions: number;
        valid: boolean;
      }
    > = {}; // {itemId: {requiredQuestions: number; valid: boolean}}

    for (const item of this.items) {
      if (this.webformsByItem[item._id]) {
        itemRequiredQuestions[item._id] = {
          requiredQuestions: 0,
          valid: false,
        };

        for (const question of this.webformsByItem[item._id].webform
          .questions) {
          if (question.required) {
            itemRequiredQuestions[item._id].requiredQuestions++;
          }
        }
      }
    }

    for (const item of this.items) {
      if (this.webformsByItem[item._id]) {
        let requiredQuestionsAnsweredCounter = 0;

        for (const question of this.webformsByItem[item._id].webform
          .questions) {
          if (
            question.required &&
            this._WebformsService.clientResponsesByItem[question._id]?.valid
          ) {
            requiredQuestionsAnsweredCounter++;
          }
        }

        if (
          itemRequiredQuestions[item._id].requiredQuestions ===
            requiredQuestionsAnsweredCounter ||
          itemRequiredQuestions[item._id].requiredQuestions === 0
        ) {
          this.webformsByItem[item._id].valid = true;
        } else {
          this.webformsByItem[item._id].valid = false;
        }
      }
    }

    let areWebformsValid = true;

    Object.keys(this.webformsByItem).forEach((itemId) => {
      areWebformsValid = this.webformsByItem[itemId]
        ? areWebformsValid && this.webformsByItem[itemId].valid
        : true;
    });

    //console.log('VALIDANDO WEBFORMS');

    this.areWebformsValid = areWebformsValid;

    this._WebformsService.areWebformsValid = this.areWebformsValid;
  }

  // async submit() {
  //   this.headerService.flowRoute = this.router.url;
  //   localStorage.setItem('flowRoute', this.router.url);

  //   this.areItemsQuestionsAnswered();

  //   if (
  //     !this.headerService.order.receiverData ||
  //     !this.headerService.receiverDataNew
  //   ) {
  //     this.router.navigate([
  //       '/ecommerce/' +
  //         this.headerService.saleflow.merchant.slug +
  //         '/receiver-form',
  //     ]);
  //   } else {
  //     this.router.navigate(
  //       [
  //         '/ecommerce/' +
  //           this.headerService.saleflow.merchant.slug +
  //           '/new-address',
  //       ],
  //       { queryParams: { flow: 'unAnsweredQuestions' } }
  //     );
  //   }
  // }

  async addItemToCart(itemId: string) {
    if (!(await this.checkIfItemisAvailable(itemId))) return;

    if (!this.isItemInCart) {
      if (
        !this.isItemInCart &&
        !this.headerService.saleflow.canBuyMultipleItems
      )
        this.headerService.emptyOrderProducts();

      const product: ItemSubOrderInput = {
        item: itemId,
        amount: 1,
      };

      this.headerService.storeOrderProduct(product);

      this.appService.events.emit({
        type: 'added-item',
        data: itemId,
      });

      this.itemInCart(itemId);
    }
  }

  async checkIfItemisAvailable(itemId: string) {
    const result = await this.itemsService.item(itemId);
    if (
      !result ||
      !result.active ||
      result.status === 'disabled' ||
      result.status === 'archived' ||
      result.status === 'draft'
    )
      return false;

    this.itemInCart(itemId);

    const exists = this.headerService.saleflow.items.find(
      (item) => item.item._id === result._id
    );
    return exists ? true : false;
  }

  itemInCart(itemId: string) {
    const productData = this.headerService.order?.products.map(
      (subOrder) => subOrder.item
    );
    if (productData?.length) {
      this.isItemInCart = productData.some((item) => item === itemId);
    } else this.isItemInCart = false;

    // Validation to avoid getting deleted or unavailable items in the count of the cart
    const itemsInCart = this.headerService.saleflow.items.filter((item) =>
      productData?.some((product) => product === item.item._id)
    );

    console.log(this.isItemInCart);

    // this.itemsAmount = itemsInCart.length > 0 ? itemsInCart.length + '' : null;
  }

  openSubmitDialog() {
    if (
      !this.isSuppliersBuyerFlow(this.items) &&
      this.headerService.saleflow?.module?.post &&
      this.headerService.saleflow?.module?.post?.post &&
      this.headerService.saleflow?.module?.post?.isActive
    ) {
      this._bottomSheet.open(OptionsMenuComponent, {
        data: {
          title: `¿Quieres añadir un mensaje de regalo?`,
          options: [
            {
              value: `Sin mensajes de regalo`,
              callback: () => {
                this.postsService.post = null;
                return this.router.navigate(
                  [
                    `/ecommerce/${this.headerService.saleflow.merchant.slug}/new-address`,
                  ],
                  {
                    queryParams: {
                      flow: 'cart',
                      redirectTo: 'cart',
                    },
                  }
                );
              },
            },
            {
              value: `Mensaje tradicional, lo escribiremos en la tarjeta dedicatoria`,
              callback: () => {
                this.postsService.post = null;
                // TODO - Agregar query param a la ruta para que se sepa que es un mensaje tradicional
                return this.router.navigate(
                  [
                    `/ecommerce/${this.headerService.saleflow.merchant.slug}/new-symbol`,
                  ],
                  {
                    queryParams: {
                      redirectTo: 'cart',
                      type: 'traditional',
                    },
                  }
                );
              },
            },
            {
              value: `Mensaje virtual, con texto, fotos y videos`,
              callback: () => {
                this.postsService.post = null;
                // TODO - Agregar query param a la ruta para que se sepa que es un mensaje virtual
                return this.router.navigate(
                  [
                    `/ecommerce/${this.headerService.saleflow.merchant.slug}/new-symbol`,
                  ],
                  {
                    queryParams: {
                      redirectTo: 'cart',
                    },
                  }
                );
              },
            },
            {
              value: `Mensaje tradicional y virtual`,
              callback: () => {
                this.postsService.post = null;
                // TODO - Agregar query param a la ruta para que se sepa que es un mensaje tradicional y virtual
                return this.router.navigate(
                  [
                    `/ecommerce/${this.headerService.saleflow.merchant.slug}/new-symbol`,
                  ],
                  {
                    queryParams: {
                      redirectTo: 'cart',
                      type: 'both',
                    },
                  }
                );
              },
            },
          ],
          styles: {
            fullScreen: true,
          },
        },
      });
    } else {
      if (this.isSuppliersBuyerFlow(this.items)) {
        this._bottomSheet.open(OptionsMenuComponent, {
          data: {
            title: `Confirmación de precios y disponibilidad:`,
            description: `Te recomendamos que te asegures la disponibilidad y precio de ${this.headerService.saleflow.merchant.name} compartiendo la cotización.`,
            options: [
              {
                value: `Compartir cotización con ${capitalize(
                  this.headerService.saleflow.merchant.name
                )}`,
                callback: async () => {
                  try {
                    lockUI();

                    const merchantDefault =
                      await this.merchantsService.merchantDefault();


                    const quotationInCartId = localStorage.getItem("quotationInCart");

                    if(!this.quotationsService.quotationInCart && quotationInCartId) {
                      this.quotationsService.quotationInCart  = await this.quotationsService.quotation(quotationInCartId);
                    }

                    if (
                      !merchantDefault ||
                      !this.quotationsService.quotationInCart
                    ) {
                      unlockUI();
                      return this.router.navigate([
                        '/ecommerce/' +
                          this.headerService.saleflow.merchant.slug +
                          '/store',
                      ]);
                    } 
                    

                    const supplierRegistrationLink = (
                      await this.authService.generateMagicLinkNoAuth(
                        null,
                        '/admin/supplier-register',
                        this.quotationsService.quotationInCart._id,
                        'QuotationAccess',
                        {
                          jsondata: JSON.stringify({
                            supplierMerchantId:
                              this.headerService.saleflow.merchant._id,
                            requesterId: merchantDefault._id,
                            items:
                              this.quotationsService.quotationInCart.items.join(
                                '-'
                              ),
                          }),
                        },
                        [],
                        true
                      )
                    )?.generateMagicLinkNoAuth;

                    let itemsContent = ``;
                    this.items.forEach((item) => {
                      itemsContent += `- ${
                        item?.name ? item?.name : 'Artículo sin nombre'
                      }, $${item.pricing}\n`;
                    });
                    const message = `Hola ${capitalize(
                      this.headerService.saleflow.merchant.name
                    )},\n\nSoy ${
                      this.currentUser?.name ||
                      this.currentUser?.phone ||
                      this.currentUser?.email
                    } y estoy interesado en confirmar la disponibilidad y el precio de los siguientes productos para mi próxima orden:\n${itemsContent}\nSi necesitas ajustar los precios antes de mi orden, por favor hazlo a través de este enlace ${supplierRegistrationLink}\n\nUna vez me confirmes pasaré a finalizar mi orden desde este enlace: ${
                      environment.uri +
                      '/admin/quotation-bids/' +
                      this.quotationsService.quotationInCart._id
                    }`;
                    const whatsappLink = `https://api.whatsapp.com/send?phone=${
                      this.headerService.saleflow.merchant
                        .receiveNotificationsMainPhone
                        ? this.headerService.saleflow.merchant.owner.phone
                        : this.headerService.saleflow.merchant
                            ?.secondaryContacts?.length
                        ? this.headerService.saleflow.merchant
                            ?.secondaryContacts[0]
                        : '19188156444'
                    }&text=${encodeURIComponent(message)}`;

                    unlockUI();

                    console.log("whatsappLink", whatsappLink)

                    window.open(whatsappLink, '_blank');
                  } catch (error) {
                    console.error('error', error);
                  }
                },
              },
              {
                value: `Continuar a la prefactura`,
                callback: () => {
                  // TODO - Validar que la redirección ocurra al módulo que esté disponible
                  return this.goToAddressForm();
                },
              },
            ],
            styles: {
              fullScreen: true,
            },
          },
        });
      } else this.goToAddressForm(); // TODO - Validar que la redirección ocurra al módulo que esté disponible
    }
  }

  isSuppliersBuyerFlow(items: Item[]): boolean {
    return items.some((item) => item.type === 'supplier');
  }

  goToAddressForm() {
    this.router.navigate(
      [`/ecommerce/${this.headerService.saleflow.merchant.slug}/new-address`],
      {
        queryParams: {
          flow: 'cart',
          redirectTo: 'cart',
        },
      }
    );
  }

  goToReceiverForm() {
    this.router.navigate(
      [`/ecommerce/${this.headerService.saleflow.merchant.slug}/receiver-form`],
      {
        queryParams: {
          flow: 'cart',
          redirectTo: 'cart',
        },
      }
    );
  }

  goToSymbolCreation() {
    this.areItemsQuestionsAnswered();

    this.router.navigate([
      '/ecommerce/' + this.headerService.saleflow.merchant.slug + '/new-symbol',
    ]);
  }

  goToArticleDetail(itemId: string) {
    this.headerService.flowRoute = this.router.url;
    this.router.navigate(
      [
        `/ecommerce/'${this.headerService.saleflow.merchant.slug}/article-detail/item/${itemId}`,
      ],
      {
        queryParams: {
          mode: 'saleflow',
        },
      }
    );
  }

  toggleCheckbox(event: any) {
    this.isCheckboxChecked = event;

    if (this.isCheckboxChecked) this.postsService.post = null;
  }

  ngOnDestroy(): void {
    this.queryParamsSubscription.unsubscribe();
  }

  urlIsVideo(url: string) {
    return isVideo(url);
  }
}
