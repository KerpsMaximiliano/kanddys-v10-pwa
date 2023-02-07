import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import { ItemOrderInput } from 'src/app/core/models/order';
import { PostInput } from 'src/app/core/models/post';
import { ReservationInput } from 'src/app/core/models/reservation';
import { DeliveryLocationInput } from 'src/app/core/models/saleflow';
import { User, UserInput } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { OrderService } from 'src/app/core/services/order.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';
import { EmbeddedComponentWithId } from 'src/app/core/types/multistep-form';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { GeneralDialogComponent } from 'src/app/shared/components/general-dialog/general-dialog.component';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
import { MediaDialogComponent } from 'src/app/shared/dialogs/media-dialog/media-dialog.component';
import { environment } from 'src/environments/environment';
import { SwiperOptions } from 'swiper';
import { Validators } from '@angular/forms';
import { DialogFlowService } from 'src/app/core/services/dialog-flow.service';
import { OptionsGridComponent } from 'src/app/shared/dialogs/options-grid/options-grid.component';
import { Gpt3Service } from 'src/app/core/services/gpt3.service';
import { EntityTemplateService } from 'src/app/core/services/entity-template.service';
import { EntityTemplate } from 'src/app/core/models/entity-template';
import { Dialogs } from './dialogs';
import { CustomizerValueService } from 'src/app/core/services/customizer-value.service';

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
  {
    status: true,
    click: true,
    value: 'Con mensaje virtual e impreso',
    valueStyles: {
      'font-family': 'SfProBold',
      'font-size': '13px',
      color: '#202020',
    },
    subtexts: [
      {
        text: `Para compartir fotos, videos, canciones desde el qrcode de la tarjeta y texto a la tarjeta impresa.`,
        styles: {
          fontFamily: 'SfProRegular',
          fontSize: '1rem',
          color: '#7B7B7B',
        },
      },
    ],
  },
  {
    status: true,
    click: true,
    value: 'Mensaje virtual',
    valueStyles: {
      'font-family': 'SfProBold',
      'font-size': '13px',
      color: '#202020',
    },
    subtexts: [
      {
        text: `Para compartir fotos, videos, canciones desde el qrcode de la tarjeta.`,
        styles: {
          fontFamily: 'SfProRegular',
          fontSize: '1rem',
          color: '#7B7B7B',
        },
      },
    ],
  },
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

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit {
  order: ItemOrderInput;
  items: any[];
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
  openedDialogFlow: boolean = false;
  swiperConfig: SwiperOptions = null;
  status: 'OPEN' | 'CLOSE' = 'CLOSE';
  dialogFlowFunctions: Record<string, any> = {};
  addedPhotosToTheQr: boolean = false;
  addedJokesToTheQr: boolean = false;
  temporalDialogs: Array<EmbeddedComponentWithId> = [];
  temporalDialogs2: Array<EmbeddedComponentWithId> = [];

  dialogs: Array<EmbeddedComponentWithId> = [];
  saleflowId: string;
  playVideoOnFullscreen = playVideoOnFullscreen;

  constructor(
    private _DomSanitizer: DomSanitizer,
    private dialogService: DialogService,
    public headerService: HeaderService,
    private saleflowService: SaleFlowService,
    public postsService: PostsService,
    public orderService: OrderService,
    private appService: AppService,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private dialogFlowService: DialogFlowService,
    private entityTemplateService: EntityTemplateService,
    private gpt3Service: Gpt3Service,
    private toastr: ToastrService,
    private customizerValueService: CustomizerValueService
  ) {}

  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe(async (queryParams) => {
      const { startOnDialogFlow } = queryParams;
      if (
        this.postsService.dialogs?.length ||
        this.postsService.temporalDialogs?.length ||
        this.postsService.temporalDialogs2?.length
      ) {
        this.openedDialogFlow = Boolean(startOnDialogFlow);
      }

      this.dialogs = new Dialogs(
        this.dialogService,
        this.headerService,
        this.customizerValueService,
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

      let storedPrivatePost: string = localStorage.getItem('privatePost');
      let privatePost: boolean;

      if (privatePost) {
        privatePost = Boolean(privatePost);
        this.postsService.privatePost = privatePost;
      }

      if (!this.postsService.post) {
        const storedPost = localStorage.getItem('post');

        if (storedPost) this.postsService.post = JSON.parse(storedPost);
      }

      if (this.openedDialogFlow) {
        this.addedJokesToTheQr = Boolean(this.headerService.selectedJoke);
        this.addedPhotosToTheQr = Boolean(
          this.postsService.post.slides && this.postsService.post.slides.length
        );

        if (this.postsService.dialogs.length !== 0 && startOnDialogFlow) {
          this.dialogs = this.postsService.dialogs;
          this.temporalDialogs = this.postsService.temporalDialogs;
          this.temporalDialogs2 = this.postsService.temporalDialogs2;
        }
      }
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

    for (const item of this.items as Array<Item>) {
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
              this.postsService.post.title
            ) {
              generatedMessage = true;
            }

            return doesTheDialogsIdsMatch;
          });

          if (generatedMessage) lastActiveDialogIndex += 1;

          this.dialogFlowFunctions.moveToDialogByIndex(lastActiveDialogIndex);
        }, 500);
      });

      this.items = this.headerService.getItems();
      if (!this.items?.length) this.editOrder('item');
      this.post = this.headerService.getPost();

      const storedPost = localStorage.getItem('post');

      if (storedPost && !this.post) {
        this.headerService.post = JSON.parse(storedPost);
        this.post = this.headerService.post;
      }

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
      }
      this.headerService.checkoutRoute = null;
      // TODO: potencialmente eliminar la linea de abajo
      // if (!this.customizer) this.updatePayment();
      if (
        this.headerService.saleflow?.module?.paymentMethod?.paymentModule?._id
      )
        this.hasPaymentModule = true;
      this.checkLogged();
      if (!this.headerService.orderInputComplete()) {
        this.missingOrderData = true;
      }
    };
  });


    
  // aquí inicia el merge conflict
    //   });
    // }
    // this.deliveryLocation = this.headerService.getLocation();
    // // Validation for stores with only one address of pickup and no delivery for customers
    // if (!this.deliveryLocation) {
    //   if (
    //     this.headerService.saleflow.module.delivery.pickUpLocations.length ==
    //       1 &&
    //     !this.headerService.saleflow.module.delivery.deliveryLocation
    //   ) {
    //     this.deliveryLocation =
    //       this.headerService.saleflow.module.delivery.pickUpLocations[0];
    //     this.headerService.storeLocation(this.deliveryLocation);
    //     this.headerService.orderProgress.delivery = true;
    //     this.headerService.storeOrderProgress();
    //   }
    // }
    // this.reservation = this.headerService.getReservation().reservation;
    // if (this.reservation) {
    //   const fromDate = new Date(this.reservation.date.from);
    //   if (fromDate < new Date()) {
    //     this.headerService.emptyReservation();
    //     this.editOrder('reservation');
    //   }
    //   const untilDate = new Date(this.reservation.date.until);
    //   this.date = {
    //     day: fromDate.getDate(),
    //     weekday: fromDate.toLocaleString('es-MX', {
    //       weekday: 'short',
    //     }),
    //     month: fromDate.toLocaleString('es-MX', {
    //       month: 'short',
    //     }),
    //     time: `De ${this.formatHour(fromDate)} a ${this.formatHour(
    //       untilDate,
    //       this.reservation.breakTime
    //     )}`,
    //   };
    //   this.headerService.orderProgress.reservation = true;
    // }
    // this.headerService.checkoutRoute = null;
    // this.payment = this.items?.reduce(
    //   (prev, curr) => prev + ('pricing' in curr ? curr.pricing : curr.price),
    //   0
    // );
    // if (this.headerService.saleflow?.module?.paymentMethod?.paymentModule?._id)
    //   this.hasPaymentModule = true;
    // this.checkLogged();
    // if (!this.headerService.orderInputComplete()) {
    //   this.missingOrderData = true;
    // }
    // aquí finaliza el merge conflict
  }

  editOrder(
    mode: 'item' | 'message' | 'address' | 'reservation' | 'customizer'
  ) {
    this.headerService.checkoutRoute = `ecommerce/${this.headerService.saleflow.merchant.slug}/checkout`;
    localStorage.removeItem('privatePost');
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
        // this.headerService.emptyPost();
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

  back = () => {
    localStorage.removeItem('privatePost');
    this.location.back();
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
    if (index >= 0) this.items.splice(index, 1);
    this.headerService.removeOrderProduct(deletedID);
    this.headerService.removeItem(deletedID);
    this.updatePayment();
    if (!this.items.length) this.editOrder('item');
  }

  updatePayment() {
    this.payment = this.items?.reduce(
      (prev, curr, currIndex) =>
        prev +
        ('pricing' in curr ? curr.pricing : curr.price) *
          this.headerService.order.products[currIndex].amount,
      0
    );
  }

  changeAmount(index: number, type: 'add' | 'subtract') {
    const product = this.headerService.order.products[index];
    this.headerService.changeItemAmount(product.item, type);
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
      const postResult = (await this.postsService.createPost(this.post))
        ?.createPost?._id;
      this.headerService.order.products[0].post = postResult;

      let entityTemplate: EntityTemplate;

      let entityTemplateModified;
      try {
        if (!this.logged) {
          entityTemplate =
            await this.entityTemplateService.precreateEntityTemplate();

          entityTemplateModified =
            await this.entityTemplateService.entityTemplateSetData(
              entityTemplate._id,
              {
                reference: postResult,
                entity: 'post',
              }
            );
        } else {
          entityTemplate =
            await this.entityTemplateService.createEntityTemplate();

          entityTemplateModified =
            await this.entityTemplateService.entityTemplateAuthSetData(
              entityTemplate._id,
              {
                reference: postResult,
                entity: 'post',
              }
            );

          const recipientUser = await this.authService.checkUser(
            this.postsService.postReceiverNumber
          );

          if (recipientUser) {
            const recipient = await this.entityTemplateService.createRecipient({
              phone: this.postsService.postReceiverNumber,
            });

            if (this.postsService.privatePost) {
              await this.entityTemplateService.entityTemplateAddRecipient(
                entityTemplate._id,
                {
                  edit: false,
                  recipient: recipient._id,
                }
              );
            }
          }
        }
      } catch (error) {
        console.error('ocurrio un error al crear el simbolo', error);
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
      this.appService.events.emit({ type: 'order-done', data: true });
      if (this.hasPaymentModule) {
        localStorage.removeItem('privatePost');
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

  login() {
    localStorage.removeItem('privatePost');
    this.router.navigate(['auth/login'], {
      queryParams: {
        redirect: `ecommerce/${this.headerService.saleflow.merchant.slug}/checkout`,
      },
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
    if (this.postsService.post) {
      this.router.navigate([
        'ecommerce/' +
          this.headerService.saleflow.merchant.slug +
          '/post-edition',
      ]);
    } else {
      this.executeProcessesBeforeOpening();
      this.openedDialogFlow = !this.openedDialogFlow;
    }
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
    this.postsService.post = null;
    localStorage.removeItem('post');
    localStorage.removeItem('postReceiverNumber');
    this.openedDialogFlow = false;
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
    this.router.navigate([`../article-detail/item/${itemID}`], {
      relativeTo: this.route,
      replaceUrl: true,
    });
  }
}
