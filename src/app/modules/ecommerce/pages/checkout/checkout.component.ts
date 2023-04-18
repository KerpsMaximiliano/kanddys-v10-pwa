import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
import { Item } from 'src/app/core/models/item';
import { ItemOrderInput, ItemSubOrderInput } from 'src/app/core/models/order';
import { PostInput } from 'src/app/core/models/post';
import { ReservationInput } from 'src/app/core/models/reservation';
import { DeliveryLocationInput } from 'src/app/core/models/saleflow';
import { User, UserInput } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { CustomizerValueService } from 'src/app/core/services/customizer-value.service';
import { DialogFlowService } from 'src/app/core/services/dialog-flow.service';
import { EntityTemplateService } from 'src/app/core/services/entity-template.service';
import { Gpt3Service } from 'src/app/core/services/gpt3.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { OrderService } from 'src/app/core/services/order.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { EmbeddedComponentWithId } from 'src/app/core/types/multistep-form';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ConfirmationDialogComponent } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { ImageViewComponent } from 'src/app/shared/dialogs/image-view/image-view.component';
import { MediaDialogComponent } from 'src/app/shared/dialogs/media-dialog/media-dialog.component';
import { environment } from 'src/environments/environment';
import { SwiperOptions } from 'swiper';
import { Dialogs } from './dialogs';

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
  selectedPostOption: number;
  missingOrderData: boolean;
  postSlideImages: (string | ArrayBuffer)[] = [];
  postSlideVideos: (string | ArrayBuffer)[] = [];
  postSlideAudio: SafeUrl[] = [];
  saleflowId: string;
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
    public dialog: MatDialog
  ) {}

  async ngOnInit(): Promise<void> {
    this.saleflowId = this.headerService.saleflow.merchant._id;
    this.route.queryParams.subscribe(async (queryParams) => {
      const { startOnDialogFlow, addedQr, addedPhotos, addedAIJoke } =
        queryParams;
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
        else this.headerService.removeOrderProduct(product.item);
      });
      this.updatePayment();
      if (
        this.headerService.saleflow?.module?.paymentMethod?.paymentModule?._id
      )
        this.hasPaymentModule = true;
      this.checkLogged();
      if (!this.headerService.orderInputComplete()) {
        this.missingOrderData = true;
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
      else this.headerService.removeOrderProduct(product.item);
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

      if (this.logged) {
        try {
          const entityTemplate =
            await this.entityTemplateService.createEntityTemplate();

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
        } catch (error) {
          console.error('ocurrio un error al crear el simbolo', error);
        }
      }
    }
    // ++++++++++++++++++++++ Managing Post ++++++++++++++++++++++++++++
    try {
      let createdOrder: string;
      const anonymous = this.headerService.getOrderAnonymous();
      this.headerService.order.orderStatusDelivery = 'in progress';
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
        if (this.postsService.privatePost && !this.logged) {
          this.router.navigate([`/auth/login`], {
            queryParams: {
              orderId: createdOrder,
              auth: 'virtual-message',
            },
          });
          return;
        }
        localStorage.removeItem('privatePost');
        this.postsService.privatePost = false;
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
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
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
}
