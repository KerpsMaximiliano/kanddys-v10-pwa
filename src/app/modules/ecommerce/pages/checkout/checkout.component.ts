import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  Validators,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
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
import { EntityTemplate } from 'src/app/core/models/entity-template';
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
  Answer,
  AnswerInput,
  Question,
  Webform,
  WebformAnswerInput,
  WebformResponseInput,
} from 'src/app/core/models/webform';
import { AuthService } from 'src/app/core/services/auth.service';
import { CustomizerValueService } from 'src/app/core/services/customizer-value.service';
import { DialogFlowService } from 'src/app/core/services/dialog-flow.service';
import { EntityTemplateService } from 'src/app/core/services/entity-template.service';
import { Gpt3Service } from 'src/app/core/services/gpt3.service';
import { DeliveryZonesService } from 'src/app/core/services/deliveryzones.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { OrderService } from 'src/app/core/services/order.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import {
  ResponsesByQuestion,
  WebformsService,
} from 'src/app/core/services/webforms.service';
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';
import { EmbeddedComponentWithId } from 'src/app/core/types/multistep-form';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { LoginDialogComponent } from 'src/app/modules/auth/pages/login-dialog/login-dialog.component';
import { ClosedQuestionCardComponent } from 'src/app/shared/components/closed-question-card/closed-question-card.component';
import { ExtendedAnswerDefault } from 'src/app/shared/components/webform-multiple-selection-question/webform-multiple-selection-question.component';
import { WebformNameQuestionComponent } from 'src/app/shared/components/webform-name-question/webform-name-question.component';
import { WebformTextareaQuestionComponent } from 'src/app/shared/components/webform-textarea-question/webform-textarea-question.component';
import { GeneralDialogComponent } from 'src/app/shared/components/general-dialog/general-dialog.component';
import { ConfirmationDialogComponent } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
import { MediaDialogComponent } from 'src/app/shared/dialogs/media-dialog/media-dialog.component';
import { environment } from 'src/environments/environment';
import { SwiperOptions } from 'swiper';
import { Dialogs } from './dialogs';
import { NotificationsService } from 'src/app/core/services/notifications.service';
import { filter } from 'rxjs/operators';
import { QuotationsService } from 'src/app/core/services/quotations.service';

interface ExtendedItem extends Item {
  ready?: boolean;
}

interface ExtendedItem extends Item {
  ready?: boolean;
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
    year?: string;
    month: string;
    day: number;
    weekday: string;
    time: string;
  };
  logged: boolean;
  env: string = environment.assetsUrl;
  selectedPostOption: number;
  missingOrderData: boolean;
  postSlideImages: (string | ArrayBuffer)[] = [];
  postSlideVideos: (string | ArrayBuffer)[] = [];
  postSlideAudio: SafeUrl[] = [];
  playVideoOnFullscreen = playVideoOnFullscreen;
  openedDialogFlow: boolean = false;
  swiperConfig: SwiperOptions = null;
  status: 'OPEN' | 'CLOSE' = 'CLOSE';
  dialogFlowFunctions: Record<string, any> = {};
  addedPhotosToTheQr: boolean = false;
  addedJokesToTheQr: boolean = false;
  temporalDialogs: Array<EmbeddedComponentWithId> = [];
  temporalDialogs2: Array<EmbeddedComponentWithId> = [];
  dialogs: Array<EmbeddedComponentWithId> = [];
  itemObjects: Record<string, ItemSubOrderInput> = {};
  showAnswers: boolean = false;
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
  areWebformsValid: boolean = false;
  webformPreview: boolean = false;
  URI: string = environment.uri;
  atStart:
    | 'auth-order-and-create-answers-for-every-item'
    | 'auth-entity-template-and-add-recipients' = null;

  totalItems: number = 0;
  panelOpenState = false;

  orderInMemory: ItemOrderInput;

  constructor(
    private _DomSanitizer: DomSanitizer,
    private dialogService: DialogService,
    public headerService: HeaderService,
    private saleflowService: SaleFlowService,
    public postsService: PostsService,
    public orderService: OrderService,
    private quotationsService: QuotationsService,
    private appService: AppService,
    public location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private dialogFlowService: DialogFlowService,
    private entityTemplateService: EntityTemplateService,
    private gpt3Service: Gpt3Service,
    public dialog: MatDialog,
    private notificationsService: NotificationsService,
    public matDialog: MatDialog,
    private toastr: ToastrService,
    private _WebformsService: WebformsService,
    private deliveryzonesService: DeliveryZonesService
  ) {
    window.scroll(0, 0);
  }

  async ngOnInit(): Promise<void> {
    for (let i = 0; i < this.headerService.order.products.length; i++) {
      this.totalItems += this.headerService.order.products[i].amount;
    }
    this.webformPreview = Boolean(
      this.route.snapshot.queryParamMap.get('webformPreview')
    );
    this.route.queryParams.subscribe(async (queryParams) => {
      const {
        startOnDialogFlow,
        addedQr,
        addedPhotos,
        addedAIJoke,
        atStart,
        orderId,
        answers,
        data,
      } = queryParams;

      //Handles magic link cases
      this.atStart = atStart;

      let queryParamsDecoded: any;
      if (data) {
        queryParamsDecoded = JSON.parse(decodeURIComponent(data));

        if (queryParamsDecoded.atStart) {
          this.atStart = queryParamsDecoded.atStart;
        }
      }

      if (this.atStart === 'auth-order-and-create-answers-for-every-item') {
        const answersDecoded: Array<{
          item: string;
          answer: WebformAnswerInput;
        }> = JSON.parse(decodeURIComponent(answers));
        const orderIdDecoded = decodeURIComponent(orderId);

        await this.orderService.authOrder(
          orderIdDecoded,
          this.headerService.user._id
        );

        //Adds the webform answers to the order
        for (const listIndex of answersDecoded) {
          const response = await this._WebformsService.createAnswer(
            listIndex.answer,
            this.headerService.user._id
          );

          if (response) {
            await this._WebformsService.orderAddAnswer(
              response._id,
              orderIdDecoded
            );
          }
        }

        if (this.quotationsService.quotationInCart)
          this.quotationsService.quotationInCart = null;

        this.appService.events.emit({ type: 'order-done', data: true });
        if (this.hasPaymentModule) {
          if (this.postsService.privatePost && !this.logged) {
            //REEMPLAZAR AQUI
          }
          localStorage.removeItem('privatePost');
          this.postsService.privatePost = false;
          unlockUI();
          this.router.navigate([`../payments/${orderIdDecoded}`], {
            relativeTo: this.route,
            replaceUrl: true,
          });
          return;
        } else {
          this.router.navigate([`../../order-detail/${orderIdDecoded}`], {
            relativeTo: this.route,
            replaceUrl: true,
          });
          return;
        }

        return;
      } else if (this.atStart === 'auth-entity-template-and-add-recipients') {
        this.postsService.postReceiverNumber =
          queryParamsDecoded.entityTemplateRecipient;

        this.postsService.postAddUser(
          queryParamsDecoded.post,
          this.headerService.user._id
        );

        await this.orderService.authOrder(
          queryParamsDecoded.orderId,
          this.headerService.user._id
        );

        await this.createEntityTemplateForOrderPost(queryParamsDecoded.post);

        if (this.quotationsService.quotationInCart)
          this.quotationsService.quotationInCart = null;

        this.appService.events.emit({ type: 'order-done', data: true });
        if (this.hasPaymentModule) {
          if (this.postsService.privatePost && !this.logged) {
            //REEMPLAZAR AQUI
          }
          localStorage.removeItem('privatePost');
          this.postsService.privatePost = false;
          unlockUI();
          this.router.navigate([`../payments/${queryParamsDecoded.orderId}`], {
            relativeTo: this.route,
            replaceUrl: true,
          });
          return;
        } else {
          this.router.navigate(
            [`../../order-detail/${queryParamsDecoded.orderId}`],
            {
              relativeTo: this.route,
              replaceUrl: true,
            }
          );
          return;
        }

        return;
      }

      if (
        this.postsService.dialogs?.length ||
        this.postsService.temporalDialogs?.length ||
        this.postsService.temporalDialogs2?.length
      ) {
        this.openedDialogFlow = Boolean(startOnDialogFlow);
      }

      this.createDialogs();

      let storedPrivatePost: string = localStorage.getItem('privatePost');
      this.postsService.privatePost = storedPrivatePost === 'true';

      if (!this.postsService.post) {
        const storedPost = localStorage.getItem('post');

        if (storedPost) this.postsService.post = JSON.parse(storedPost);
      }

      if (this.openedDialogFlow) {
        this.addedJokesToTheQr = Boolean(this.postsService.post.joke);
        this.addedPhotosToTheQr = Boolean(
          this.postsService.post.slides && this.postsService.post.slides.length
        );

        this.createDialogs();

        if (this.postsService.dialogs.length !== 0 && startOnDialogFlow) {
          this.dialogs = this.postsService.dialogs;
          this.temporalDialogs = this.postsService.temporalDialogs;
          this.temporalDialogs2 = this.postsService.temporalDialogs2;
        }

        setTimeout(() => {
          let generatedMessage = false;

          let lastActiveDialogIndex = this.dialogs.findIndex((dialog) => {
            const doesTheDialogsIdsMatch =
              dialog.componentId ===
              this.dialogFlowService.previouslyActiveDialogId;

            if (
              doesTheDialogsIdsMatch &&
              dialog.componentId === 'receiverRelationshipDialog' &&
              this.postsService.post.message &&
              this.postsService.post.title &&
              this.postsService.post.to
            ) {
              generatedMessage = true;
            }

            return doesTheDialogsIdsMatch;
          });

          if (generatedMessage) lastActiveDialogIndex += 1;

          // if (addedQr) {
          //   if (addedPhotos || addedAIJoke) {
          //     this.dialogs[this.dialogs.length - 1].inputs.header.text =
          //       '¿Deseas incluir alguna otra cosa?';

          //     this.dialogs[
          //       this.dialogs.length - 1
          //     ].inputs.fields.list[0].selection.list[0].text = 'No';

          //     this.dialogs[
          //       this.dialogs.length - 1
          //     ].inputs.fields.list[0].selection.list[1].text = addedPhotos
          //       ? 'Un chiste de la IA'
          //       : 'Fotos, videos de mi device';
          //   }

          //   return this.dialogFlowFunctions.moveToDialogByIndex(
          //     this.dialogs.length - 1
          //   );
          // }

          this.dialogFlowFunctions.moveToDialogByIndex(lastActiveDialogIndex);
        }, 500);
      }

      let items = this.headerService.order.products.map(
        (subOrder) => subOrder.item
      );
      if (!this.headerService.order?.products) this.editOrder('item');
      if (!items.every((value) => typeof value === 'string')) {
        items = items.map((item: any) => item?._id || item);
      }
      if (!items?.length) this.editOrder('item');
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

      console.log('obteniendo post 1');

      this.post = this.headerService?.post || this.postsService?.post;

      console.log('leyendo slides 1');

      if (this.post?.slides.length)
        this.post?.slides.forEach((slide: any) => {
          if (slide.background) delete slide.background;
          if (slide._type) delete slide._type;
          if (slide?.media && !slide.media?.type) delete slide.media;
        });

      const storedPost = localStorage.getItem('post');

      if (storedPost && !this.post) {
        console.log('obteniendo post 2');
        this.headerService.post = JSON.parse(storedPost);
        this.post = this.headerService.post;
      }

      console.log('leyendo slides 2');

      console.log(this.post);
      console.log(this.post?.slides);

      console.log(this.postsService.post);

      if (this.post?.slides?.length) {
        this.post.slides.forEach((slide) => {
          if (slide.media?.type?.includes('image')) {
            const reader = new FileReader();
            reader.onload = (e) => {
              this.postSlideImages.push(reader.result);
            };
            reader.readAsDataURL(slide.media);
          }
          if (slide.media?.type?.includes('video')) {
            const reader = new FileReader();
            reader.onload = (e) => {
              this.postSlideVideos.push(reader.result);
            };
            reader.readAsDataURL(slide.media);
          }
          if (slide.media?.type?.includes('audio')) {
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

      console.log('obteniendo delivery zones');

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
        else this.headerService.removeOrderProduct(product.item);
      });
      this.updatePayment();
      if (
        this.headerService.saleflow?.module?.paymentMethod?.paymentModule?._id
      )
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
    });
  }

  createDialogs() {
    this.dialogs = new Dialogs(
      this.dialogService,
      this.headerService,
      this.postsService,
      this.orderService,
      this.appService,
      this.location,
      this.router,
      this.route,
      this.authService,
      this.dialogFlowService,
      this.entityTemplateService,
      this.gpt3Service,
      this.toastr,
      this.dialogFlowFunctions,
      this.temporalDialogs,
      this.temporalDialogs2,
      this.addedPhotosToTheQr,
      this.addedJokesToTheQr
    ).inject();
  }

  editOrder(
    mode: 'item' | 'message' | 'address' | 'reservation' | 'customizer'
  ) {
    this.headerService.checkoutRoute = `ecommerce/${this.headerService.saleflow.merchant.slug}/checkout`;

    if (this.webformPreview) return;

    switch (mode) {
      case 'item': {
        if (this.isSuppliersBuyerFlow(this.items)) {
          return this.router.navigate([`/ecommerce/quotations`]);
        }

        this.router.navigate([`../cart`], {
          relativeTo: this.route,
          replaceUrl: true,
          queryParams: {
            progress: 'checkout'
          }
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
    }
  }

  back = () => {
    localStorage.removeItem('privatePost');
    this.editOrder('item');
  };

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
        this.updatePayment();
        if (!this.items.length) this.editOrder('item');

        //this.dialogFlowService.resetDialogFlow('webform-item-' + deletedID);

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
    this.totalItems = 0;
    const product = this.headerService.order.products.find(
      (product) => product.item === itemId
    );

    this.headerService.changeItemAmount(product.item, type);
    this.headerService.order.products.forEach((product) => {
      if (product.amount) this.itemObjects[product.item] = product;
      else this.headerService.removeOrderProduct(product.item);
    });

    for (let i = 0; i < this.headerService.order.products.length; i++) {
      this.totalItems += this.headerService.order.products[i].amount;
    }

    // console.log(this.totalItems);

    this.updatePayment();
  }

  createOrder = async () => {
    //this property was set for the case when the product isn't part of the saleflow's items, but is included as part of the order
    //it has to be deleted for createOrder() to work
    this.headerService.order.products.forEach((product, index) => {
      delete this.headerService.order.products[index].notAvailable;
    });

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

    try {
      await this.createOrderFromCheckout();
      unlockUI();
    } catch (error) {
      console.log(error);
      unlockUI();
      this.disableButton = false;
    }
  };

  createOrderFromCheckout = async () => {
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
    this.orderInMemory = this.headerService.order;

    if (this.headerService.saleflow.module?.post?.isActive) {
      if (!this.post)
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
      localStorage.removeItem('post');
      localStorage.removeItem('postReceiverNumber');
      delete this.post.joke;

      this.orderInMemory = this.headerService.order;

      /*
      let hasTheUserAnsweredAnyWebform = false;

      for await (const item of this.items) {
        if (
          item.webForms &&
          item.webForms.length &&
          this.webformsByItem[item._id]
        ) {
          const answer = this.getWebformAnswer(item._id);

          if (answer.response.length > 0) hasTheUserAnsweredAnyWebform = true;
        }
      }*/

      if (this.logged) {
        const postResult = (await this.postsService.createPost(this.post))
          ?.createPost?._id;
        this.headerService.order.products[0].post = postResult;

        await this.createEntityTemplateForOrderPost(postResult);
        await this.finishOrderCreation();
      } else if (
        this.postsService?.post?.slides?.length ||
        this.postsService?.post?.message ||
        this.postsService?.post?.envelopeText
      ) {
        console.log('Creando post pro');

        unlockUI();

        lockUI();

        const postResult = (await this.postsService.createPost(this.post))
          ?.createPost?._id;

        this.headerService.order.products[0].post = postResult;

        const entityTemplate =
          await this.entityTemplateService.precreateEntityTemplate();

        const createdOrder = (
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

        unlockUI();

        const matDialogRef = this.matDialog.open(LoginDialogComponent, {
          data: {
            loginType: 'phone',
            route:
              'ecommerce/' +
              this.headerService.saleflow.merchant.slug +
              '/checkout',
            justReturnUser: true,
          },
        });
        matDialogRef.afterClosed().subscribe(async (value) => {
          if (!value) return;

          if (value.user?._id || value.session.user._id) {
            this.logged = true;
            this.headerService.alreadyInputtedloginDialogUser =
              value.user || value.session.user;

            this.headerService.order.products[0].post = postResult;

            await this.createEntityTemplateForOrderPost(
              postResult,
              entityTemplate,
              true,
              this.headerService.alreadyInputtedloginDialogUser._id
            );
            await this.finishOrderCreation();

            unlockUI();
          }
        });

        return;
      } else if (!this.logged && this.areWebformsValid) {
        const matDialogRef = this.matDialog.open(LoginDialogComponent, {
          data: {
            loginType: 'phone',
            route:
              'ecommerce/' +
              this.headerService.saleflow.merchant.slug +
              '/checkout',
            justReturnUser: true,
          },
        });
        matDialogRef.afterClosed().subscribe(async (value) => {
          if (!value) return;

          if (value.user?._id || value.session.user._id) {
            this.logged = true;
            this.headerService.alreadyInputtedloginDialogUser =
              value.user || value.session.user;

            await this.finishOrderCreation(true);
            unlockUI();
          }
        });
      } else {
        unlockUI();
        const postResult = (await this.postsService.createPost(this.post))
          ?.createPost?._id;

        this.headerService.order.products[0].post = postResult;

        await this.createEntityTemplateForOrderPost(postResult);
        await this.finishOrderCreation();
      }
    } else {
      const matDialogRef = this.matDialog.open(LoginDialogComponent, {
        data: {
          loginType: 'phone',
          route:
            'ecommerce/' +
            this.headerService.saleflow.merchant.slug +
            '/checkout',
          justReturnUser: true,
        },
      });
      matDialogRef.afterClosed().subscribe(async (value) => {
        if (!value) return;

        if (value.user?._id || value.session.user._id) {
          this.logged = true;
          this.headerService.alreadyInputtedloginDialogUser =
            value.user || value.session.user;

          await this.finishOrderCreation(true);
          unlockUI();
        }
      });
    }
  };

  finishOrderCreation = async (skipLogin: boolean = false) => {
    try {
      let createdOrder: string;
      const anonymous = this.headerService.getOrderAnonymous();
      this.headerService.order.orderStatusDelivery = 'in progress';
      this.orderInMemory.orderStatusDelivery = 'in progress';

      if (this.isSuppliersBuyerFlow(this.items)) {
        this.headerService.order.orderType = 'supplier';
        this.orderInMemory.orderType = 'supplier';
      }

      if (this.headerService.user && !anonymous) {
        console.log(this.headerService.order);
        createdOrder = (await this.orderService.createOrder(this.orderInMemory))
          .createOrder._id;

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
          await this.orderService.createPreOrder(this.orderInMemory)
        )?.createPreOrder._id;

        this.headerService.deleteSaleflowOrder();
        this.headerService.resetOrderProgress();
        this.headerService.orderId = createdOrder;
        this.headerService.currentMessageOption = undefined;
        this.headerService.post = undefined;

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
      await this.createAnswerForEveryWebformItem(createdOrder);

      if (this.quotationsService.quotationInCart)
        this.quotationsService.quotationInCart = null;

      this.appService.events.emit({ type: 'order-done', data: true });
      if (this.hasPaymentModule) {
        if (this.postsService.privatePost && !this.logged) {
          //REEMPLAZAR AQUI
        }
        localStorage.removeItem('privatePost');
        this.postsService.privatePost = false;
        unlockUI();
        this.router.navigate([`../payments/${this.headerService.orderId}`], {
          relativeTo: this.route,
          replaceUrl: true,
        });
      } else {
        if (this.headerService.alreadyInputtedloginDialogUser && skipLogin) {
          await this.orderService.authOrder(
            createdOrder,
            this.headerService.alreadyInputtedloginDialogUser._id
          );

          unlockUI();
          this.router.navigate([`../../order-detail/${createdOrder}`], {
            relativeTo: this.route,
            replaceUrl: true,
          });
          return;
        }

        if (!this.headerService.user || (anonymous && !skipLogin)) {
          const matDialogRef = this.matDialog.open(LoginDialogComponent, {
            data: {
              loginType: 'phone',
              route:
                'ecommerce/' +
                this.headerService.saleflow.merchant.slug +
                '/checkout',
              justReturnUser: true,
            },
          });
          matDialogRef.afterClosed().subscribe(async (value) => {
            if (!value) return;
            if (value.user?._id || value.session.user._id) {
              await this.orderService.authOrder(createdOrder, value.user?._id || value.session.user._id);
              unlockUI();
              this.router.navigate([`../../order-detail/${createdOrder}`], {
                relativeTo: this.route,
                replaceUrl: true,
              });
            }
          });
          return;
        }
        unlockUI();
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

  createAnswerForEveryWebformItem = async (createdOrderId: string) => {
    //Answer the webforms of each item and adds it to the order
    for await (const item of this.items) {
      if (
        item.webForms &&
        item.webForms.length &&
        this.webformsByItem[item._id]
      ) {
        const answer = this.getWebformAnswer(item._id);

        const response = await this._WebformsService.createAnswer(
          answer,
          this.headerService.user
            ? this.headerService.user._id
            : this.headerService.alreadyInputtedloginDialogUser._id
        );

        if (response) {
          await this._WebformsService.orderAddAnswer(
            response._id,
            createdOrderId
          );

          //this.dialogFlowService.resetDialogFlow('webform-item-' + item._id);
        }
      }
    }
  };

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

  createEntityTemplateForOrderPost = async (
    postId: string,
    entityTemplateToUpdate: EntityTemplate = null,
    withoutAuth: boolean = false,
    userId: string = null
  ) => {
    try {
      const entityTemplate = !entityTemplateToUpdate
        ? await this.entityTemplateService.createEntityTemplate()
        : entityTemplateToUpdate;

      if (!withoutAuth) {
        await this.entityTemplateService.entityTemplateAuthSetData(
          entityTemplate._id,
          {
            reference: postId,
            entity: 'post',
            access: Boolean(
              this.postsService.privatePost ||
                this.postsService.postReceiverNumber?.length > 0
            )
              ? 'private'
              : 'public',
            /*templateNotifications:
            this.postsService.entityTemplateNotificationsToAdd.map(
              (keyword) => ({
                key: keyword,
                message:
                  keyword === 'SCAN'
                    ? 'Han escaneado el QR de tu mensaje de regalo!!!\nRecuerda que puedes acceder a el usando este link: ' +
                      this.URI +
                      '/qr/article-template/' +
                      entityTemplate._id
                    : 'Han accedido a tu mensaje de regalo!!!\nRecuerda que puedes acceder a el usando este link: ' +
                      this.URI +
                      '/qr/article-template/' +
                      entityTemplate._id +
                      '\nAccedió el receptor: ',
              })
            ),*/
          }
        );
      } else {
        await this.entityTemplateService.entityTemplateSetData(
          entityTemplate._id,
          {
            reference: postId,
            entity: 'post',
            access: Boolean(
              this.postsService.privatePost ||
                this.postsService.postReceiverEmail?.length > 0
            )
              ? 'private'
              : 'public',
          }
        );
      }

      const recipientUser = this.postsService.postReceiverEmail;

      if (recipientUser && !withoutAuth) {
        const recipient = await this.entityTemplateService.createRecipient({
          email: this.postsService.postReceiverEmail,
        });

        if (
          this.postsService.privatePost ||
          this.postsService.postReceiverEmail?.length > 0
        ) {
          await this.entityTemplateService.entityTemplateAddRecipient(
            entityTemplate._id,
            {
              edit: false,
              recipient: recipient._id,
            }
          );
        }

        this.postsService.entityTemplateNotificationsToAdd = [];
      } else if (recipientUser && withoutAuth) {
        const recipient =
          await this.entityTemplateService.createRecipientWithoutAuth(
            {
              email: this.postsService?.postReceiverEmail,
            },
            userId
          );

        if (
          this.postsService.privatePost ||
          this.postsService.postReceiverEmail?.length > 0
        ) {
          await this.entityTemplateService.entityTemplateAddRecipientWithoutAuth(
            entityTemplate._id,
            {
              edit: false,
              recipient: recipient._id,
            }
          );
        }

        this.postsService.entityTemplateNotificationsToAdd = [];
      }
    } catch (error) {
      console.error('ocurrio un error al crear el simbolo', error);
    }
  };

  login() {
    localStorage.removeItem('privatePost');
    this.router.navigate(['auth/login'], {
      queryParams: {
        redirect: `ecommerce/${this.headerService.saleflow.merchant.slug}/checkout`,
      },
    });
  }

  async getDeliveryZones(merchanId: string) {
    try {
      const result = await this.deliveryzonesService.deliveryZones({
        options: {
          limit: -1,
          // sortBy: 'createdAt:desc',
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
          maxHeight: '90vh',
          overflowY: 'scroll',
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

  createOrEditMessage() {
    const queryParams: Record<string, string> = {
      flow: 'checkout',
    };

    if (!this.postsService.post.virtualMessage) {
      queryParams.type = 'traditional';
    }

    this.router.navigate(
      [
        'ecommerce/' +
          this.headerService.saleflow.merchant.slug +
          '/new-symbol',
      ],
      {
        queryParams,
      }
    );

    // if (this.postsService.post) {
    //   this.router.navigate([
    //     'ecommerce/' +
    //       this.headerService.saleflow.merchant.slug +
    //       '/post-edition',
    //   ]);
    // } else {
    //   this.executeProcessesBeforeOpening();
    //   this.openedDialogFlow = !this.openedDialogFlow;
    // }
  }

  editReceiver() {
    this.router.navigate(
      [
        'ecommerce/' +
          this.headerService.saleflow.merchant.slug +
          '/receiver-form',
      ],
      {
        queryParams: {
          redirectTo: 'checkout',
        },
      }
    );

    // if (this.postsService.post) {
    //   this.router.navigate([
    //     'ecommerce/' +
    //       this.headerService.saleflow.merchant.slug +
    //       '/post-edition',
    //   ]);
    // } else {
    //   this.executeProcessesBeforeOpening();
    //   this.openedDialogFlow = !this.openedDialogFlow;
    // }
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

  deletePost() {
    let dialogRef = this.matDialog.open(ConfirmationDialogComponent, {
      data: {
        title: `Borrar mensaje`,
        description: `No se guardarán los datos ingresados. Deseas borrar tu mensaje?`,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirm') {
        this.postsService.post = null;
        localStorage.removeItem('post');
        localStorage.removeItem('postReceiverNumber');
        this.openedDialogFlow = false;
        this.dialogFlowService.resetDialogFlow('flow1');
        this.createDialogs();
        this.dialogFlowFunctions.moveToDialogByIndex(0);
      }
    });
  }

  executeProcessesBeforeOpening() {
    this.postsService.post = {
      from: null,
      to: null,
      message: null,
      title: null,
      joke: null,
    };
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

    if (Object.keys(this.webformsByItem).length === 0)
      this.areWebformsValid = true;
    else {
      this.areItemsQuestionsAnswered();
    }
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
          redirectTo: 'checkout',
        },
      }
    );
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

  isSuppliersBuyerFlow(items: Item[]): boolean {
    return items.some((item) => item.type === 'supplier');
  }

  goToReceiver() {
    this.router.navigate([`ecommerce/receiver-form`], {
      queryParams: {
        redirectTo: 'checkout',
      },
    });
  }
}
