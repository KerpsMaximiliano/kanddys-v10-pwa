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
import {
  DeliveryZone,
  DeliveryZoneInput,
} from 'src/app/core/models/deliveryzone';
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
import { DeliveryZonesService } from 'src/app/core/services/deliveryzones.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { OrderService } from 'src/app/core/services/order.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { WebformsService } from 'src/app/core/services/webforms.service';
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';
import { EmbeddedComponentWithId } from 'src/app/core/types/multistep-form';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { LoginDialogComponent } from 'src/app/modules/auth/pages/login-dialog/login-dialog.component';
import { ClosedQuestionCardComponent } from 'src/app/shared/components/closed-question-card/closed-question-card.component';
import {
  ExtendedAnswerDefault,
  WebformMultipleSelectionQuestionComponent,
} from 'src/app/shared/components/webform-multiple-selection-question/webform-multiple-selection-question.component';
import { WebformNameQuestionComponent } from 'src/app/shared/components/webform-name-question/webform-name-question.component';
import { WebformTextareaQuestionComponent } from 'src/app/shared/components/webform-textarea-question/webform-textarea-question.component';
import { GeneralDialogComponent } from 'src/app/shared/components/general-dialog/general-dialog.component';
import { ConfirmationDialogComponent } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
import { MediaDialogComponent } from 'src/app/shared/dialogs/media-dialog/media-dialog.component';
import { environment } from 'src/environments/environment';
import { SwiperOptions } from 'swiper';
import { filter } from 'rxjs/operators';

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
  deliveryZones: DeliveryZone[] = [];
  deliveryZone: DeliveryZoneInput;
  hasDeliveryZone: boolean = false;
  reservation: ReservationInput;
  payment: number;
  hasPaymentModule: boolean;
  disableButton: boolean;
  currentUser: User;
  date: {
    year: string;
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
      multipleResponses?: Array<{
        response: any;
        responseLabel?: string;
        isMedia?: boolean;
        isProvidedByUser?: boolean;
      }>;
      isMedia?: boolean;
      isMultipleResponse?: boolean;
      multipleSelection?: boolean;
      selectedIndex?: number;
      selectedImageIndex?: number;
      selectedIndexes?: Array<number>;
      selectedImageIndexes?: Array<number>;
      multipleChoicesType?: WebformMultipleChoicesType;
      valid?: boolean;
    }
  > = {};
  areWebformsValid: boolean = false;
  webformPreview: boolean = false;

  constructor(
    private _DomSanitizer: DomSanitizer,
    private dialogService: DialogService,
    public headerService: HeaderService,
    private saleflowService: SaleFlowService,
    private postsService: PostsService,
    public orderService: OrderService,
    private appService: AppService,
    public location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private authService: AuthService,
    public matDialog: MatDialog,
    public dialog: MatDialog,
    private dialogFlowService: DialogFlowService,
    private _WebformsService: WebformsService,
    private deliveryzonesService: DeliveryZonesService
  ) {}

  async ngOnInit(): Promise<void> {
    this.webformPreview = Boolean(
      this.route.snapshot.queryParamMap.get('webformPreview')
    );
    this.saleflowId = this.headerService.saleflow.merchant._id;
    let items = this.headerService.order.products.map(
      (subOrder) => subOrder.item
    );
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

    await this.getDeliveryZones(this.headerService.saleflow.merchant._id);

    this.deliveryZone = this.headerService.getZone();
    this.deliveryLocation = this.headerService.getLocation();
    // Validation for stores with only one address of pickup and no delivery for customers
    if (!this.deliveryLocation) {
      if (
        this.headerService.saleflow.module.delivery?.pickUpLocations.length ==
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
        year: fromDate.toLocaleString('es-MX', {
          year: 'numeric',
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
    if (
      !this.headerService.orderInputComplete() ||
      (this.hasDeliveryZone &&
        this.deliveryLocation.street &&
        !this.deliveryZone)
    ) {
      this.missingOrderData = true;
    }

    if (this.webformPreview) {
      this.post = {
        message: 'Dummy post',
        from: 'Emisor',
        to: 'Receptor',
      };

      this.reservation = {
        breakTime: 15,
        calendar: 'dummyid',
        date: {
          dateType: 'RANGE',
          from: new Date('2023-04-07T16:00:00.000Z').toISOString(),
          until: new Date('2023-04-07T17:00:00.000Z').toISOString(),
          fromHour: '16:00',
          toHour: '16:45',
        },
        merchant: this.headerService.saleflow.merchant._id,
        type: 'ORDER',
      };

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
          year: fromDate.toLocaleString('es-MX', {
            year: 'numeric',
          }),
          time: `De ${this.formatHour(fromDate)} a ${this.formatHour(
            untilDate,
            this.reservation.breakTime
          )}`,
        };
        this.headerService.orderProgress.reservation = true;
      }
    }
  }

  editOrder(
    mode: 'item' | 'message' | 'address' | 'reservation' | 'customizer'
  ) {
    this.headerService.checkoutRoute = `ecommerce/${this.headerService.saleflow.merchant.slug}/checkout`;

    if (this.webformPreview) return;

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
        if (
          !this.headerService.orderInputComplete() ||
          (this.hasDeliveryZone &&
            this.deliveryLocation.street &&
            !this.deliveryZone)
        )
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
    let dialogRef = this.matDialog.open(ConfirmationDialogComponent, {
      data: {
        title: `Borrar producto`,
        description: `Estás seguro que deseas borrar ${
          this.items[index].name || 'este producto'
        }?`,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirm') {
        delete this.webformsByItem[deletedID];

        if (index >= 0) this.items.splice(index, 1);
        this.headerService.removeOrderProduct(deletedID);
        this.headerService.removeItem(deletedID);
        this.updatePayment();
        if (!this.items.length) this.editOrder('item');

        this.dialogFlowService.resetDialogFlow('webform-item-' + deletedID);

        this.areItemsQuestionsAnswered();
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

    if (!this.areWebformsValid || this.webformPreview) return;

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

        if (
          this.hasDeliveryZone &&
          this.deliveryZone &&
          this.deliveryLocation.street
        ) {
          await this.orderService.orderSetDeliveryZone(
            this.deliveryZone.id,
            createdOrder,
            this.headerService.user._id
          );
        }
      } else {
        createdOrder = (
          await this.orderService.createPreOrder(this.headerService.order)
        )?.createPreOrder._id;

        if (
          this.hasDeliveryZone &&
          this.deliveryZone &&
          this.deliveryLocation.street
        ) {
          await this.orderService.orderSetDeliveryZone(
            this.deliveryZone.id,
            createdOrder
          );
        }
      }
      this.headerService.deleteSaleflowOrder();
      this.headerService.resetOrderProgress();
      this.headerService.orderId = createdOrder;
      this.headerService.currentMessageOption = undefined;
      this.headerService.post = undefined;

      //Answer the webforms of each item and adds it to the order
      for await (const item of this.items) {
        if (
          item.webForms &&
          item.webForms.length &&
          this.webformsByItem[item._id]
        ) {
          const answer = this.getWebformAnswer(item._id);

          const response = await this._WebformsService.createAnswer(answer);

          if (response) {
            await this._WebformsService.orderAddAnswer(
              response._id,
              createdOrder
            );

            this.dialogFlowService.resetDialogFlow('webform-item-' + item._id);
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
          const matDialogRef = this.matDialog.open(LoginDialogComponent, {
            data: {
              loginType: 'phone',
            },
          });
          matDialogRef.afterClosed().subscribe(async (value) => {
            if (!value) return;
            if (value.user?._id || value.session.user._id) {
              await this.orderService.authOrder(createdOrder, value._id);
              this.router.navigate([`../../order-detail/${createdOrder}`], {
                relativeTo: this.route,
                replaceUrl: true,
              });
            }
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

  async getDeliveryZones(merchanId: string) {
    try {
      const result = await this.deliveryzonesService.deliveryZones({
        options: {
          limit: -1,
          sortBy: 'createdAt:desc',
        },
        findBy: {
          merchant: merchanId,
          active: true,
        },
      });
      this.deliveryZones = result;
      if (this.deliveryZones.length > 0) this.hasDeliveryZone = true;
    } catch (error) {
      console.log(error);
    }
  }

  openDeliveryZones() {
    const zones = this.deliveryZones.map((zone) => {
      return {
        text: zone.zona,
        subText: {
          text: `RD $${zone?.amount ? zone.amount : 0}`,
          styles: {
            display: 'block',
            fontFamily: '"SFProLight"',
            fontStyle: 'italic',
            fontSize: '15px',
            color: '#7B7B7B',
            marginLeft: '19.5px',
          },
        },
      };
    });

    const dialog = this.dialogService.open(GeneralDialogComponent, {
      type: 'centralized-fullscreen',
      props: {
        // dialogId: 'start',
        // omitTabFocus: false,
        containerStyles: {
          background: 'rgb(255, 255, 255)',
          borderRadius: '12px',
          opacity: '1',
          padding: '37px 36.6px 18.9px 31px',
        },
        header: {
          styles: {
            fontSize: '21px',
            fontFamily: 'SfProBold',
            marginBottom: '21.2px',
            marginTop: '0',
            color: '#4F4F4F',
          },
          text: '¿En qué zona entregaremos?',
        },
        title: {
          styles: {
            fontSize: '15px',
            color: '#7B7B7B',
            fontStyle: 'italic',
            margin: '0',
          },
          text: '',
        },
        fields: {
          list: [
            {
              name: 'deliveryType',
              value: '',
              validators: [Validators.required],
              type: 'selection',
              selection: {
                styles: {
                  display: 'block',
                  fontFamily: '"SfProBold"',
                  fontSize: '17px',
                  color: '#272727',
                  marginLeft: '19.5px',
                },
                list: zones,
              },
              // styles: {},
              prop: 'text',
            },
          ],
        },
        isMultiple: false,
        optionAction: (data) => {
          const selectedIndex = zones.findIndex(
            (zone) => zone.text === data.value.deliveryType[0]
          );
          const { ...deliveryZoneInput } = this.deliveryZones[selectedIndex];

          this.headerService.storeZone({
            amount: deliveryZoneInput.amount,
            zona: deliveryZoneInput.zona,
            id: deliveryZoneInput._id,
          });

          this.deliveryZone = this.headerService.getZone();

          if (
            !this.headerService.orderInputComplete() ||
            (this.hasDeliveryZone &&
              this.deliveryLocation.street &&
              !this.deliveryZone)
          ) {
            this.missingOrderData = true;
          } else {
            this.missingOrderData = false;
          }

          dialog.close();
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

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
    if (this.webformPreview) return;

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
        if (
          !this.headerService.orderInputComplete() ||
          (this.hasDeliveryZone &&
            this.deliveryLocation.street &&
            !this.deliveryZone)
        ) {
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
              ['multiple', 'multiple-text'].includes(question.type) &&
              question.answerLimit === 0;
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

            this.answersByQuestion[question._id] = {
              question,
              response,
              isMedia,
              isMultipleResponse: multipleResponse,
            };

            if (
              this.dialogFlowService.dialogsFlows['webform-item-' + item._id] &&
              this.dialogFlowService.dialogsFlows['webform-item-' + item._id][
                question._id
              ]
            ) {
              if (
                question.type === 'text' &&
                question.answerTextType !== 'name'
              ) {
                const { textarea, valid } =
                  this.dialogFlowService.dialogsFlows[
                    'webform-item-' + item._id
                  ][question._id].fields;

                this.answersByQuestion[question._id].valid = valid;

                if (valid) {
                  this.answersByQuestion[question._id].response = textarea;
                } else {
                  this.answersByQuestion[question._id].response = null;
                }
              } else if (
                question.type === 'text' &&
                question.answerTextType === 'name'
              ) {
                const { name, lastname, valid } =
                  this.dialogFlowService.dialogsFlows[
                    'webform-item-' + item._id
                  ][question._id].fields;

                if (valid) {
                  this.answersByQuestion[question._id].response = name;
                  this.answersByQuestion[question._id].responseLabel = lastname;
                } else {
                  this.answersByQuestion[question._id].response = null;
                  this.answersByQuestion[question._id].responseLabel = null;
                }

                this.answersByQuestion[question._id].valid = valid;
              } else if (
                ['multiple', 'multiple-text'].includes(question.type) &&
                this.dialogFlowService.dialogsFlows['webform-item-' + item._id][
                  question._id
                ]?.fields?.options
              ) {
                const selectedOption = (
                  this.dialogFlowService.dialogsFlows[
                    'webform-item-' + item._id
                  ][question._id].fields.options as Array<ExtendedAnswerDefault>
                ).find((option) => option.selected);

                if (!multipleResponse) {
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
                } else {
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
                }
              }
            }
          }
        }
      }
    }

    this.createDialogFlowForEachQuestion();

    if (Object.keys(this.webformsByItem).length === 0)
      this.areWebformsValid = true;
    else {
      this.areItemsQuestionsAnswered();
    }
  }

  //Creates a dialog flow that allows the user to answer each item questions
  createDialogFlowForEachQuestion() {
    for (const item of this.items) {
      if (this.webformsByItem[item._id]?.webform && item.webForms[0]?.active) {
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
                    const flowId = 'webform-item-' + item._id;
                    const dialogId = question._id;
                    const { textarea, valid } =
                      this.dialogFlowService.dialogsFlows[flowId][dialogId]
                        .fields;

                    if (valid)
                      this.answersByQuestion[question._id].response = textarea;
                    else this.answersByQuestion[question._id].response = null;

                    this.answersByQuestion[question._id].valid = valid;

                    this.areItemsQuestionsAnswered();
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
                containerStyles: {
                  opacity: '1',
                },
                dialogFlowConfig: {
                  dialogId: question._id,
                  flowId: 'webform-item-' + item._id,
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
              outputs: [
                {
                  name: 'inputDetected',
                  callback: (inputDetected) => {
                    const flowId = 'webform-item-' + item._id;
                    const dialogId = question._id;
                    const { name, lastname, valid } =
                      this.dialogFlowService.dialogsFlows[flowId][dialogId]
                        .fields;

                    if (valid) {
                      this.answersByQuestion[question._id].response =
                        name + ' ' + lastname;
                      this.answersByQuestion[question._id].response =
                        name?.trim();
                      this.answersByQuestion[question._id].responseLabel =
                        lastname?.trim();
                    } else {
                      this.answersByQuestion[question._id].response = null;
                      this.answersByQuestion[question._id].responseLabel = null;
                    }

                    this.answersByQuestion[question._id].valid = valid;

                    this.areItemsQuestionsAnswered();
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
              component: ClosedQuestionCardComponent,
              componentId: question._id,
              inputs: {
                question: question.value,
                shadows: false,
                questionType: question.type,
                dialogFlowConfig: {
                  dialogId: question._id,
                  flowId: 'webform-item-' + item._id,
                },
                startWithDialogFlow:
                  this.answersByQuestion[question._id]?.response ||
                  this.answersByQuestion[question._id]?.responseLabel || this.answersByQuestion[question._id]?.multipleResponses?.length > 0 ,
                multiple: question.answerLimit === 0,
                completeAnswers: activeOptions,
                required: question.required,
                restartFromEvent: true,
              },
              outputs: [
                {
                  name: 'onSelector',
                  callback: () => {
                    this.selectOption(question, item);
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

  //Get Webform Answer
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
          value: this.answersByQuestion[question._id].response,
        };

        if (this.answersByQuestion[question._id].responseLabel)
          response.label = this.answersByQuestion[question._id].responseLabel;

        response.isMedia = response.value.includes('http');

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

          response.isMedia = response.value.includes('http');

          answerInput.response.push(response);
        }
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
        const flowId = 'webform-item-' + item._id;

        for (const question of this.webformsByItem[item._id].webform
          .questions) {
          const dialogId = question._id;

          if (
            question.required &&
            this.dialogFlowService.dialogsFlows[flowId]?.[dialogId]?.fields
              .valid
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

    this.areWebformsValid = areWebformsValid;
  }

  addOptionalUserDefinedAnswer(question: Question, multiple: boolean = false) {
    const copyOptions: Array<ExtendedAnswerDefault> = JSON.parse(
      JSON.stringify(question.answerDefault)
    );

    if (question.type === 'multiple-text' && !multiple) {
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

    if (question.type === 'multiple-text' && multiple) {
      const didUserWriteACustomAnswer =
        this.answersByQuestion[question._id].multipleResponses[
          this.answersByQuestion[question._id].multipleResponses.length - 1
        ]?.isProvidedByUser;

      copyOptions.push({
        value: 'Otra respuesta',
        isMedia: false,
        active: true,
        defaultValue: null,
        userProvidedAnswer: didUserWriteACustomAnswer
          ? this.answersByQuestion[question._id].multipleResponses[
              this.answersByQuestion[question._id].multipleResponses.length - 1
            ].response
          : null,
        label: null,
        createdAt: null,
        updatedAt: null,
        _id: null,
      });
    }
    return copyOptions;
  }

  selectOption = (
    question: Question,
    item: Item,
    restartDialogInDialogFlow: boolean = false
  ) => {
    const flowId = 'webform-item-' + item._id;
    const dialogId = question._id;
    const options =
      this.dialogFlowService.dialogsFlows[flowId][dialogId].fields.options;

    const isMultipleSelection = question.answerLimit === 0;

    if (!isMultipleSelection) {
      const selected = options.find((option) => option.selected);

      const selectedIndex = options.findIndex((option) => option.selected);

      const doesOptionsHaveMedia = question.answerDefault.some(
        (option) => option.isMedia
      );

      if (!doesOptionsHaveMedia) {
        if (selected) {
          /* PORSIACASO
          this.answersByQuestion[question._id].response =
            question.type === 'multiple'
              ? selected.value
              : selected.userProvidedAnswer;
              */

          this.answersByQuestion[question._id].response =
            question.type === 'multiple'
              ? selected.value
              : question.type === 'multiple-text' &&
                selected.userProvidedAnswer === undefined
              ? selected.value
              : selected.userProvidedAnswer;

          this.answersByQuestion[question._id].valid = Boolean(
            question.type === 'multiple'
              ? selected.value.length
              : selectedIndex === options.length - 1
              ? selected.userProvidedAnswer &&
                selected.userProvidedAnswer.length
              : selected.value.length
          );
        }
      } else {
        if (selected) {
          this.answersByQuestion[question._id].response =
            question.type === 'multiple'
              ? selected.value
              : selectedIndex === options.length - 1
              ? selected.userProvidedAnswer || null
              : selected.value;

          if (selected.label)
            this.answersByQuestion[question._id].responseLabel = selected.label;
          else {
            this.answersByQuestion[question._id].responseLabel = null;
          }

          this.answersByQuestion[question._id].valid = Boolean(
            question.type === 'multiple'
              ? selected.value.length
              : selectedIndex === options.length - 1
              ? selected.userProvidedAnswer &&
                selected.userProvidedAnswer.length
              : selected.value.length
          );
        }
      }
    } else {
      const selectedOptions = options.filter((option) => option.selected);

      if (selectedOptions.length) {
        this.answersByQuestion[question._id].multipleResponses = [];
        for (const optionSelected of selectedOptions) {
          this.answersByQuestion[question._id].multipleResponses.push({
            response: optionSelected.userProvidedAnswer
              ? optionSelected.userProvidedAnswer
              : optionSelected.value,
            responseLabel: optionSelected.label ? optionSelected.label : null,
            isProvidedByUser: optionSelected.userProvidedAnswer ? true : false,
            isMedia: optionSelected.isMedia,
          });
        }
      }
    }

    if (restartDialogInDialogFlow) {
      this.dialogFlowService.updateMultipleSelectionDialog.emit({
        flowId,
        dialogId,
      });
    }

    this.areItemsQuestionsAnswered();
  };
}
