import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/app.service';
import { isVideo } from 'src/app/core/helpers/strings.helpers';
import {
  lockUI,
  playVideoOnFullscreen,
  unlockUI,
} from 'src/app/core/helpers/ui.helpers';
import { Item } from 'src/app/core/models/item';
import { ItemOrderInput, ItemSubOrderInput } from 'src/app/core/models/order';
import { PostInput } from 'src/app/core/models/post';
import { ReservationInput } from 'src/app/core/models/reservation';
import { DeliveryLocationInput } from 'src/app/core/models/saleflow';
import { User, UserInput } from 'src/app/core/models/user';
import {
  ItemWebform,
  Question,
  Webform,
  AnswerInput,
  WebformAnswerInput,
  WebformResponseInput,
  AnswerDefault,
} from 'src/app/core/models/webform';
import { AuthService } from 'src/app/core/services/auth.service';
import { DialogFlowService } from 'src/app/core/services/dialog-flow.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { OrderService } from 'src/app/core/services/order.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { WebformsService } from 'src/app/core/services/webforms.service';
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';
import { EmbeddedComponentWithId } from 'src/app/core/types/multistep-form';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import {
  ExtendedAnswerDefault,
  WebformMultipleSelectionQuestionComponent,
} from 'src/app/shared/components/webform-multiple-selection-question/webform-multiple-selection-question.component';
import { WebformNameQuestionComponent } from 'src/app/shared/components/webform-name-question/webform-name-question.component';
import { WebformTextareaQuestionComponent } from 'src/app/shared/components/webform-textarea-question/webform-textarea-question.component';
import { ConfirmationDialogComponent } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
import { MediaDialogComponent } from 'src/app/shared/dialogs/media-dialog/media-dialog.component';
import { environment } from 'src/environments/environment';
import { SwiperOptions } from 'swiper';

const options = [
  {
    status: true,
    click: true,
    value: 'No tendrá mensaje de regalo',
    valueStyles: {
      'font-family': 'SfProBold',
      'font-size': '13px',
      color: '#202020',
    },
  },
  // {
  //   status: true,
  //   click: true,
  //   value: 'Con mensaje virtual e impreso',
  //   valueStyles: {
  //     'font-family': 'SfProBold',
  //     'font-size': '13px',
  //     color: '#202020',
  //   },
  //   subtexts: [
  //     {
  //       text: `Para compartir fotos, videos, canciones desde el qrcode de la tarjeta y texto a la tarjeta impresa.`,
  //       styles: {
  //         fontFamily: 'SfProRegular',
  //         fontSize: '1rem',
  //         color: '#7B7B7B',
  //       },
  //     },
  //   ],
  // },
  // {
  //   status: true,
  //   click: true,
  //   value: 'Mensaje virtual',
  //   valueStyles: {
  //     'font-family': 'SfProBold',
  //     'font-size': '13px',
  //     color: '#202020',
  //   },
  //   subtexts: [
  //     {
  //       text: `Para compartir fotos, videos, canciones desde el qrcode de la tarjeta.`,
  //       styles: {
  //         fontFamily: 'SfProRegular',
  //         fontSize: '1rem',
  //         color: '#7B7B7B',
  //       },
  //     },
  //   ],
  // },
  {
    status: true,
    click: true,
    value: 'Mensaje impreso',
    valueStyles: {
      'font-family': 'SfProBold',
      'font-size': '13px',
      color: '#202020',
    },
    subtexts: [
      {
        text: `Agregue texto a la tarjeta.`,
        styles: {
          fontFamily: 'SfProRegular',
          fontSize: '1rem',
          color: '#7B7B7B',
        },
      },
    ],
  },
];

interface ExtendedItem extends Item {
  ready?: boolean;
}

enum WebformMultipleChoicesType {
  'JUST-TEXT' = 1,
  'JUST-IMAGES',
  'IMAGES-AND-TEXT',
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit {
  order: ItemOrderInput;
  items: ExtendedItem[];
  post: PostInput;
  deliveryLocation: DeliveryLocationInput;
  reservation: ReservationInput;
  payment: number;
  hasPaymentModule: boolean;
  disableButton: boolean;
  currentUser: User;
  date: {
    month: string;
    day: number;
    weekday: string;
    time: string;
  };
  logged: boolean;
  env: string = environment.assetsUrl;
  options: OptionAnswerSelector[] = options;
  selectedPostOption: number;
  missingOrderData: boolean;
  postSlideImages: (string | ArrayBuffer)[] = [];
  postSlideVideos: (string | ArrayBuffer)[] = [];
  postSlideAudio: SafeUrl[] = [];
  saleflowId: string;
  playVideoOnFullscreen = playVideoOnFullscreen;
  itemObjects: Record<string, ItemSubOrderInput> = {};
  showAnswers: boolean = false;
  swiperConfig: SwiperOptions = null;
  dialogFlowFunctions: Record<string, any> = {};
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
  answersByQuestion: Record<
    string,
    {
      question: Question;
      response: any;
      responseLabel?: string;
      isMedia?: boolean;
      multipleSelection?: boolean;
      selectedIndex?: number;
      selectedImageIndex?: number;
      selectedIndexes?: Array<number>;
      multipleChoicesType?: WebformMultipleChoicesType;
    }
  > = {};
  areWebformsValid: boolean = false;

  constructor(
    private _DomSanitizer: DomSanitizer,
    private dialogService: DialogService,
    public headerService: HeaderService,
    private saleflowService: SaleFlowService,
    private postsService: PostsService,
    public orderService: OrderService,
    private appService: AppService,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private authService: AuthService,
    public dialog: MatDialog,
    private dialogFlowService: DialogFlowService,
    private _WebformsService: WebformsService
  ) {}

  async ngOnInit(): Promise<void> {
    this.saleflowId = this.headerService.saleflow.merchant._id;
    let items = this.headerService.getItems();
    if (!items.every((value) => typeof value === 'string')) {
      items = items.map((item: any) => item?._id || item);
    }
    this.items = (
      await this.saleflowService.listItems({
        findBy: {
          _id: {
            __in: ([] = [...items]),
          },
        },
      })
    )?.listItems;
    this.getQuestions();

    for (const item of this.items as Array<ExtendedItem>) {
      item.ready = false;
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

    if (!this.items?.length) this.editOrder('item');
    this.post = this.headerService.getPost();
    if (this.post?.slides?.length) {
      this.post.slides.forEach((slide) => {
        if (slide.media?.type.includes('image')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.postSlideImages.push(reader.result);
          };
          reader.readAsDataURL(slide.media);
        }
        if (slide.media?.type.includes('video')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.postSlideVideos.push(reader.result);
          };
          reader.readAsDataURL(slide.media);
        }
        if (slide.media?.type.includes('audio')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.postSlideAudio.push(
              this._DomSanitizer.bypassSecurityTrustUrl(
                URL.createObjectURL(slide.media)
              )
            );
          };
          reader.readAsDataURL(slide.media);
        }
      });
    }
    this.deliveryLocation = this.headerService.getLocation();
    // Validation for stores with only one address of pickup and no delivery for customers
    if (!this.deliveryLocation) {
      if (
        this.headerService.saleflow.module.delivery.pickUpLocations.length ==
          1 &&
        !this.headerService.saleflow.module.delivery.deliveryLocation
      ) {
        this.deliveryLocation =
          this.headerService.saleflow.module.delivery.pickUpLocations[0];
        this.headerService.storeLocation(this.deliveryLocation);
        this.headerService.orderProgress.delivery = true;
        this.headerService.storeOrderProgress();
      }
    }
    this.reservation = this.headerService.getReservation().reservation;
    if (this.reservation) {
      const fromDate = new Date(this.reservation.date.from);
      if (fromDate < new Date()) {
        this.headerService.emptyReservation();
        this.editOrder('reservation');
      }
      const untilDate = new Date(this.reservation.date.until);
      this.date = {
        day: fromDate.getDate(),
        weekday: fromDate.toLocaleString('es-MX', {
          weekday: 'short',
        }),
        month: fromDate.toLocaleString('es-MX', {
          month: 'short',
        }),
        time: `De ${this.formatHour(fromDate)} a ${this.formatHour(
          untilDate,
          this.reservation.breakTime
        )}`,
      };
      this.headerService.orderProgress.reservation = true;
    }
    this.headerService.checkoutRoute = null;
    this.headerService.order.products.forEach((product) => {
      if (product.amount) this.itemObjects[product.item] = product;
      else {
        this.headerService.removeOrderProduct(product.item);
        this.headerService.removeItem(product.item);
      }
    });

    this.updatePayment();
    if (this.headerService.saleflow?.module?.paymentMethod?.paymentModule?._id)
      this.hasPaymentModule = true;
    this.checkLogged();
    if (!this.headerService.orderInputComplete()) {
      this.missingOrderData = true;
    }
  }

  editOrder(
    mode: 'item' | 'message' | 'address' | 'reservation' | 'customizer'
  ) {
    this.headerService.checkoutRoute = `ecommerce/${this.headerService.saleflow.merchant.slug}/checkout`;
    switch (mode) {
      case 'item': {
        this.router.navigate([`../store`], {
          relativeTo: this.route,
          replaceUrl: true,
        });
        break;
      }
      case 'message': {
        this.post = null;
        this.headerService.emptyPost();
        if (!this.headerService.orderInputComplete())
          this.missingOrderData = true;
        break;
      }
      case 'address': {
        this.router.navigate([`../new-address`], {
          relativeTo: this.route,
          replaceUrl: true,
        });
        break;
      }
      case 'reservation': {
        this.router.navigate(
          [
            `../reservations/${this.headerService.saleflow.module.appointment.calendar._id}`,
          ],
          {
            relativeTo: this.route,
            queryParams: {
              saleflowId: this.headerService.saleflow._id,
            },
          }
        );
        break;
      }
      case 'customizer': {
        this.router.navigate(
          [`../provider-store/${this.items[0]._id}/quantity-and-quality`],
          {
            relativeTo: this.route,
            replaceUrl: true,
          }
        );
        break;
      }
    }
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

  formatHour(date: Date, breakTime?: number) {
    if (breakTime) date = new Date(date.getTime() - breakTime * 60000);

    let result = date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (result.startsWith('0:')) {
      result = result.replace('0:', '12:');
    }

    return result;
  }

  deleteProduct(i: number) {
    let deletedID = this.items[i]._id;
    const index = this.items.findIndex((product) => product._id === deletedID);
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: `Borrar producto`,
        description: `Estás seguro que deseas borrar ${
          this.items[index].name || 'este producto'
        }?`,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirm') {
        if (index >= 0) this.items.splice(index, 1);
        this.headerService.removeOrderProduct(deletedID);
        this.headerService.removeItem(deletedID);
        this.updatePayment();
        if (!this.items.length) this.editOrder('item');
      }
    });
  }

  updatePayment() {
    this.payment = this.items?.reduce((prev, item, itemIndex) => {
      return prev + item.pricing * this.itemObjects[item._id].amount;
    }, 0);
  }

  changeAmount(itemId: string, type: 'add' | 'subtract') {
    const product = this.headerService.order.products.find(
      (product) => product.item === itemId
    );

    this.headerService.changeItemAmount(product.item, type);
    this.headerService.order.products.forEach((product) => {
      if (product.amount) this.itemObjects[product.item] = product;
      else {
        this.headerService.removeOrderProduct(product.item);
        this.headerService.removeItem(product.item);
      }
    });
    this.updatePayment();
  }

  createOrder = async () => {
    if (this.missingOrderData) {
      if (
        this.headerService.saleflow?.module?.appointment?.isActive &&
        this.headerService.saleflow.module?.appointment?.calendar?._id &&
        !this.reservation
      ) {
        this.router.navigate(
          [
            `../reservations/${this.headerService.saleflow.module.appointment.calendar._id}`,
          ],
          {
            relativeTo: this.route,
            queryParams: {
              saleflowId: this.headerService.saleflow._id,
            },
          }
        );
        return;
      }
      if (
        this.headerService.saleflow.module?.delivery &&
        !this.deliveryLocation
      ) {
        this.router.navigate([`../new-address`], {
          relativeTo: this.route,
        });
        return;
      }
      return;
    }

    if (!this.areWebformsValid) return;

    this.disableButton = true;
    lockUI();
    const userInput = JSON.parse(
      localStorage.getItem('registered-user')
    ) as UserInput;
    if (!this.headerService.user && userInput) {
      const user = await this.authService.signup(
        {
          ...userInput,
          deliveryLocations: [this.deliveryLocation],
        },
        'none',
        null,
        false
      );
      localStorage.setItem('registered-user', JSON.stringify(user));
    }
    this.headerService.order.products[0].saleflow =
      this.headerService.saleflow._id;
    this.headerService.order.products[0].deliveryLocation =
      this.deliveryLocation;
    if (this.reservation)
      this.headerService.order.products[0].reservation = this.reservation;
    // ---------------------- Managing Post ----------------------------
    if (this.headerService.saleflow.module?.post) {
      try {
        const postResult = (await this.postsService.createPost(this.post))
          ?.createPost?._id;
        this.headerService.order.products[0].post = postResult;
      } catch (error) {
        const post: PostInput = this.headerService.getPost();

        try {
          this.post = post;

          const postResult = (await this.postsService.createPost(this.post))
            ?.createPost?._id;
          this.headerService.order.products[0].post = postResult;
        } catch (error) {
          this.toastr.error('Ocurrió un error, intente más tarde', null, {
            timeOut: 5000,
          });

          unlockUI();

          this.disableButton = false;

          return;
        }
      }
    }
    // ++++++++++++++++++++++ Managing Post ++++++++++++++++++++++++++++
    try {
      let createdOrder: string;
      const anonymous = this.headerService.getOrderAnonymous();
      if (this.headerService.order.itemPackage)
        delete this.headerService.order.itemPackage;
      if (this.headerService.user && !anonymous) {
        createdOrder = (
          await this.orderService.createOrder(this.headerService.order)
        ).createOrder._id;
      } else {
        createdOrder = (
          await this.orderService.createPreOrder(this.headerService.order)
        )?.createPreOrder._id;
      }
      this.headerService.deleteSaleflowOrder();
      this.headerService.resetOrderProgress();
      this.headerService.orderId = createdOrder;
      this.headerService.currentMessageOption = undefined;
      this.headerService.post = undefined;

      //Answer the webforms of each item and adds it to the order
      for await (const item of this.items) {
        if (item.webForms && item.webForms.length) {
          const answer = this.getWebformAnswer(item._id);

          const response = await this._WebformsService.createAnswer(answer);

          if (response) {
            await this._WebformsService.orderAddAnswer(
              response._id,
              createdOrder
            );
          }
        }
      }

      this.appService.events.emit({ type: 'order-done', data: true });
      if (this.hasPaymentModule) {
        this.router.navigate([`../payments/${this.headerService.orderId}`], {
          relativeTo: this.route,
          replaceUrl: true,
        });
      } else {
        if (!this.headerService.user || anonymous) {
          this.router.navigate([`/auth/login`], {
            queryParams: {
              orderId: createdOrder,
              auth: 'anonymous',
            },
          });
          return;
        }
        this.router.navigate([`../../order-detail/${createdOrder}`], {
          relativeTo: this.route,
          replaceUrl: true,
        });
        return;
      }
      unlockUI();
    } catch (error) {
      console.log(error);
      unlockUI();
      this.disableButton = false;
    }
  };

  async checkLogged() {
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

  selectSelect(index: number) {
    switch (index) {
      case 0: {
        this.post = {
          message: '',
          targets: [
            {
              name: '',
              emailOrPhone: '',
            },
          ],
          from: '',
          socialNetworks: [
            {
              url: '',
            },
          ],
        };
        this.headerService.storePost(this.post);
        if (!this.headerService.orderInputComplete()) {
          this.missingOrderData = true;
        } else {
          this.missingOrderData = false;
        }
        break;
      }
      // case 1: {
      //   this.router.navigate([`../create-giftcard`], {
      //     queryParams: {
      //       symbols: 'virtual',
      //     },
      //     relativeTo: this.route,
      //     replaceUrl: true,
      //   });
      //   break;
      // }
      // case 2: {
      //   this.headerService.checkoutRoute = `ecommerce/${this.headerService.saleflow.merchant.slug}/checkout`;
      //   this.router.navigate([`../create-article`], {
      //     relativeTo: this.route,
      //     replaceUrl: true,
      //   });
      //   break;
      // }
      case 1: {
        this.headerService.checkoutRoute = `ecommerce/${this.headerService.saleflow.merchant.slug}/checkout`;
        this.router.navigate([`../create-giftcard`], {
          relativeTo: this.route,
          replaceUrl: true,
        });
        break;
      }
    }
  }

  fullscreenDialog(type?: string, src?: any) {
    this.dialogService.open(MediaDialogComponent, {
      props: {
        inputType: type,
        src: src,
      },
      type: 'fullscreen-translucent',
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  mouseDown: boolean;
  startX: number;
  scrollLeft: number;

  startDragging(e: MouseEvent, el: HTMLDivElement) {
    this.mouseDown = true;
    this.startX = e.pageX - el.offsetLeft;
    this.scrollLeft = el.scrollLeft;
  }

  stopDragging() {
    this.mouseDown = false;
  }

  moveEvent(e: MouseEvent, el: HTMLDivElement) {
    e.preventDefault();
    if (!this.mouseDown) {
      return;
    }
    const x = e.pageX - el.offsetLeft;
    const scroll = x - this.startX;
    el.scrollLeft = this.scrollLeft - scroll;
  }

  urlIsVideo(url: string) {
    return isVideo(url);
  }

  goToArticleDetail(itemID: string) {
    this.headerService.flowRoute = `ecommerce/${this.headerService.saleflow.merchant.slug}/checkout`;
    this.router.navigate([`../article-detail/item/${itemID}`], {
      relativeTo: this.route,
      replaceUrl: true,
    });
  }

  async getQuestions(): Promise<void> {
    for (const item of this.items) {
      const { webForms } = item;

      //If there's at least 1 webform associated with the item, then, it loads the questions
      if (webForms && webForms.length > 0) {
        const itemWebform = webForms[0];

        const webformId = itemWebform.reference;
        const webform = await this._WebformsService.webform(webformId);
        webform.questions = webform.questions.sort((a, b) => a.index - b.index);

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
            const isMedia =
              question.answerDefault &&
              question.answerDefault.length &&
              question.answerDefault[0].isMedia;

            if (isMedia) {
              question.answerDefault = question.answerDefault.map((option) => ({
                ...option,
                img: option.value,
                isMedia: option.isMedia,
              }));
            }

            let response = '';
            let responseLabel = '';
            let selectedIndex = null;

            this.answersByQuestion[question._id] = {
              question,
              response,
              isMedia,
            };

            if (
              this.dialogFlowService.dialogsFlows['webform-item-' + item._id] &&
              this.dialogFlowService.dialogsFlows['webform-item-' + item._id][
                question._id
              ]
            ) {
              if (question.type === 'text') {
                this.answersByQuestion[question._id].response =
                  this.dialogFlowService.dialogsFlows[
                    'webform-item-' + item._id
                  ][question._id].fields.textarea;
              } else if (question.type === 'multiple') {
                const selectedOption = (
                  this.dialogFlowService.dialogsFlows[
                    'webform-item-' + item._id
                  ][question._id].fields.options as Array<any>
                ).find((option) => option.selected);

                const selectedIndex = (
                  this.dialogFlowService.dialogsFlows[
                    'webform-item-' + item._id
                  ][question._id].fields.options as Array<any>
                ).findIndex((option) => option.selected);

                if (selectedOption && !selectedOption.isMedia) {
                  response = selectedOption.value;
                }

                if (
                  selectedOption &&
                  selectedOption.isMedia &&
                  selectedOption.label
                ) {
                  response = selectedOption.value;
                  responseLabel = selectedOption.label;
                }

                if (
                  selectedOption &&
                  selectedOption.isMedia &&
                  !selectedOption.label
                ) {
                  response = selectedOption.value;
                }

                if (response && response !== '')
                  this.answersByQuestion[question._id]['response'] = response;

                if (responseLabel && responseLabel !== '')
                  this.answersByQuestion[question._id]['responseLabel'] =
                    responseLabel;

                if (selectedIndex >= 0) {
                  this.answersByQuestion[question._id]['selectedIndex'] =
                    selectedIndex;
                }
              }
            }
          }
        }
      } else {
        this.areWebformsValid = true;
      }
    }

    this.createDialogFlowForEachQuestion();
  }

  //Creates a dialog flow that allows the user to answer each item questions
  createDialogFlowForEachQuestion() {
    for (const item of this.items) {
      if (this.webformsByItem[item._id]?.webform) {
        for (const question of this.webformsByItem[item._id].webform
          .questions) {
          const lastDialogIndex =
            this.webformsByItem[item._id].dialogs.length - 1;

          if (
            question.type === 'text' &&
            question.answerTextType.toUpperCase() !== 'NAME'
          ) {
            const validators = [Validators.required];

            if (question.answerTextType.toUpperCase() === 'EMAIL')
              validators.push(Validators.email);

            this.webformsByItem[item._id].dialogs.push({
              component: WebformTextareaQuestionComponent,
              componentId: question._id,
              inputs: {
                label: question.value,
                skipValidationBlock: true,
                containerStyles: {
                  opacity: '1',
                },
                dialogFlowConfig: {
                  dialogId: question._id,
                  flowId: 'webform-item-' + item._id,
                },
                inputType: question.answerTextType.toUpperCase(),
                textarea: new FormControl('', validators),
              },
              outputs: [
                {
                  name: 'inputDetected',
                  callback: (inputDetected) => {
                    this.answersByQuestion[question._id].response =
                      inputDetected;

                    this.areWebformsValid = this.areItemsQuestionsAnswered();
                  },
                },
              ],
            });
          } else if (
            question.type === 'text' &&
            question.answerTextType.toUpperCase() === 'NAME'
          ) {
            this.webformsByItem[item._id].dialogs.push({
              component: WebformNameQuestionComponent,
              componentId: question._id,
              inputs: {
                label: question.value,
                skipValidationBlock: true,
                containerStyles: {
                  opacity: '1',
                },
                dialogFlowConfig: {
                  dialogId: question._id,
                  flowId: 'webform-item-' + item._id,
                },
                inputType: question.answerTextType.toUpperCase(),
                name: new FormControl('', Validators.required),
                lastname: new FormControl('', Validators.required),
              },
              outputs: [
                {
                  name: 'inputDetected',
                  callback: (inputDetected) => {
                    this.answersByQuestion[question._id].response =
                      inputDetected.split(' ')[0]?.trim();
                    this.answersByQuestion[question._id].responseLabel =
                      inputDetected.split(' ')[1]?.trim();

                    this.areWebformsValid = this.areItemsQuestionsAnswered();
                  },
                },
              ],
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
              }));

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
                _id: null,
              });

            this.webformsByItem[item._id].dialogs.push({
              component: WebformMultipleSelectionQuestionComponent,
              componentId: question._id,
              inputs: {
                label: question.value,
                containerStyles: {
                  opacity: '1',
                },
                shadows: false,
                dialogFlowConfig: {
                  dialogId: question._id,
                  flowId: 'webform-item-' + item._id,
                },
                questionType: question.type,
                multiple: !question.answerLimit || question.answerLimit > 1,
                options: activeOptions,
              },
              outputs: [
                {
                  name: 'inputDetected',
                  callback: (
                    inputDetected: Array<{
                      value: string;
                      selected: boolean;
                      label?: string;
                      isMedia?: boolean;
                      userProvidedAnswer?: string;
                    }>
                  ) => {
                    const selected = inputDetected.find(
                      (option) => option.selected
                    );

                    const selectedIndex = inputDetected.findIndex(
                      (option) => option.selected
                    );

                    //////////////// SEPARATES IMAGES GRID FROM OPTIONS IN THE LIST ///////////////
                    //Get the selected index for the image grid
                    let selectedIndexFromImageGrid = null;
                    const justImagesGrid = inputDetected.filter(
                      (option, index) => option.isMedia && option.value
                    );
                    selectedIndexFromImageGrid = justImagesGrid.findIndex(
                      (option) =>
                        option.value === inputDetected[selectedIndex]?.value
                    );

                    //Get the selected index for the list of options in the answer selector
                    let selectedIndexFromList = null;
                    const listOptionsGrid = inputDetected.filter(
                      (option, index) =>
                        (!option.isMedia && option.value) ||
                        (option.isMedia && option.label)
                    );
                    selectedIndexFromList = listOptionsGrid.findIndex(
                      (option) =>
                        option.value === inputDetected[selectedIndex]?.value ||
                        option.label === inputDetected[selectedIndex]?.value
                    );

                    //////////////// SEPARATES IMAGES GRID FROM OPTIONS IN THE LIST ///////////////
                    if (!question.answerDefault[0].isMedia) {
                      if (selected)
                        this.answersByQuestion[question._id].response =
                          question.type === 'multiple'
                            ? selected.value
                            : selected.userProvidedAnswer;
                    } else {
                      if (selected) {
                        this.answersByQuestion[question._id].response =
                          question.type === 'multiple'
                            ? selected.value
                            : selected.userProvidedAnswer;
                        this.answersByQuestion[question._id].selectedIndex =
                          selectedIndexFromList;

                        if (selectedIndexFromImageGrid > -1)
                          this.answersByQuestion[
                            question._id
                          ].selectedImageIndex = selectedIndexFromImageGrid;
                      }

                      if (selected && selected.label)
                        this.answersByQuestion[question._id].responseLabel =
                          selected.label;
                      else {
                        this.answersByQuestion[question._id].responseLabel =
                          null;
                      }
                    }

                    this.areWebformsValid = this.areItemsQuestionsAnswered();
                  },
                },
              ],
            });
          }
        }
      }
    }
  }

  //Opens each item webform
  openWebform(itemId: string, index: number) {
    this.webformsByItem[itemId].dialogFlowFunctions.moveToDialogByIndex(index);
    this.webformsByItem[itemId].opened = !this.webformsByItem[itemId].opened;
  }

  //Select an image from the webform multiple option
  selectWebformMediaOption = (
    selectedOptions: {
      option: number;
      image: number;
      selectedOptionOrText: string;
    },
    item: ExtendedItem,
    question: Question
  ) => {
    const options =
      this.dialogFlowService.dialogsFlows['webform-item-' + item._id][
        question._id
      ].fields.options;

    //Get the selected index from the full list(images-grid, list-option)
    const selectedOptionIndex = options.findIndex((option, index) => {
      if (
        selectedOptions.option === index &&
        question.type === 'multiple-text'
      ) {
        return true;
      }

      if (
        option.isMedia &&
        (option.value === selectedOptions.selectedOptionOrText ||
          option.label === selectedOptions.selectedOptionOrText)
      )
        return true;
      if (
        !option.isMedia &&
        option.value === selectedOptions.selectedOptionOrText
      )
        return true;
    });

    const updatedOptions = options.map((option, index) => ({
      ...option,
      selected: index === selectedOptionIndex,
    }));

    //Adds the user provided answer to the output sent to the parent component
    if (
      question.type === 'multiple-text' &&
      selectedOptions.option === options.length - 1
    ) {
      updatedOptions[selectedOptionIndex].userProvidedAnswer =
        selectedOptions.selectedOptionOrText;

      this.answersByQuestion[question._id].response =
        selectedOptions.selectedOptionOrText;
    }

    this.dialogFlowService.dialogsFlows['webform-item-' + item._id][
      question._id
    ].fields.options = updatedOptions;
  };

  //Get Webform Answer
  getWebformAnswer(itemId: string): WebformAnswerInput {
    const answerInput: WebformAnswerInput = {
      webform: this.webformsByItem[itemId].webform._id,
      response: [],
      entity: 'ITEM',
      reference: itemId,
    };

    for (const question of this.webformsByItem[itemId].webform.questions) {
      if (this.answersByQuestion[question._id].response) {
        const response: WebformResponseInput = {
          question: question._id,
          value: this.answersByQuestion[question._id].response,
        };

        if (this.answersByQuestion[question._id].responseLabel)
          response.label = this.answersByQuestion[question._id].responseLabel;

        answerInput.response.push(response);
      }
    }

    return answerInput;
  }

  //See if each item questions are answered
  areItemsQuestionsAnswered() {
    const itemRequiredQuestions: Record<
      string,
      {
        requiredQuestions: number;
        valid: boolean;
      }
    > = {}; // {itemId: {requiredQuestions: number; valid: boolean}}

    for (const item of this.items) {
      itemRequiredQuestions[item._id] = { requiredQuestions: 0, valid: false };

      for (const question of this.webformsByItem[item._id].webform.questions) {
        if (question.required) {
          itemRequiredQuestions[item._id].requiredQuestions++;
        }
      }
    }

    for (const item of this.items) {
      let requiredQuestionsAnsweredCounter = 0;

      for (const question of this.webformsByItem[item._id].webform.questions) {
        if (
          question.required &&
          this.answersByQuestion[question._id].response
        ) {
          requiredQuestionsAnsweredCounter++;
        }
      }

      if (
        itemRequiredQuestions[item._id].requiredQuestions ===
          requiredQuestionsAnsweredCounter ||
        itemRequiredQuestions[item._id].requiredQuestions === 0
      ) {
        itemRequiredQuestions[item._id].valid = true;
      }
    }

    let doesAnyItemHaveRequiredQuestionLeftUnanswered = false;

    for (const item of this.items) {
      if (!itemRequiredQuestions[item._id].valid)
        doesAnyItemHaveRequiredQuestionLeftUnanswered = true;
    }

    return !doesAnyItemHaveRequiredQuestionLeftUnanswered;
  }

  addOptionalUserDefinedAnswer(question: Question) {
    const copyOptions: Array<ExtendedAnswerDefault> = JSON.parse(
      JSON.stringify(question.answerDefault)
    );

    if (question.type === 'multiple-text') {
      copyOptions.push({
        value: 'Otra respuesta',
        isMedia: false,
        active: true,
        defaultValue: null,
        userProvidedAnswer: this.answersByQuestion[question._id].response,
        label: null,
        createdAt: null,
        updatedAt: null,
        _id: null,
      });
    }

    return copyOptions;
  }
}
