import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validator,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { base64ToFile } from 'src/app/core/helpers/files.helpers';
import { Merchant } from 'src/app/core/models/merchant';
import {
  NotificationInput,
  OffsetTimeInput,
} from 'src/app/core/models/notification';
import { TagInput } from 'src/app/core/models/tags';
import { User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { NotificationsService } from 'src/app/core/services/notifications.service';
import { TagsService } from 'src/app/core/services/tags.service';
import {
  WebformAnswerLayoutOption,
  webformAnswerLayoutOptionDefaultStyles,
} from 'src/app/core/types/answer-selector';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import {
  StoreShareComponent,
  StoreShareList,
} from 'src/app/shared/dialogs/store-share/store-share.component';
import { ItemsService } from 'src/app/core/services/items.service';
import { Subscription } from 'rxjs';

export function imagesValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    console.log(control.value);
    return !control.value ? { images: { value: control.value } } : null;
  };
}

@Component({
  selector: 'app-create-tag',
  templateUrl: './create-tag.component.html',
  styleUrls: ['./create-tag.component.scss'],
})
export class CreateTagComponent implements OnInit, OnDestroy {
  env: string = environment.assetsUrl;
  user: User;
  logged: boolean;
  merchantDefault: Merchant;
  createTagForm: FormGroup = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.pattern(/[\S]/),
      Validators.maxLength(40),
    ]),
    visibility: new FormControl('active', [Validators.required]),
    images: new FormControl(null),
    notes: new FormControl(''),
  });
  convertedDefaultImageToBase64: boolean = false;
  optionalFunctionalityList: WebformAnswerLayoutOption[] = [];
  tagID: string = null;
  orderID: string = null;
  visibilityImage: string = this.env + '/open-eye.svg';
  notificationToAdd: NotificationInput = null;
  finishedMutation: boolean = true;
  hasTemporalTag: boolean = false;
  options: string[] = ['Perfil', 'Acciones', 'Notificaciones'];
  mouseDown: boolean;
  startX: number;
  scrollLeft: number;
  active: number = 0;
  entity: 'item' | 'order' = 'order';
  entityId: string = null;
  redirectTo: string;
  routeParamsSubscription: Subscription;
  routeQueryParamsSubscription: Subscription;
  changedSomeValue: boolean = false;
  initialState: string = null;

  constructor(
    private tagsService: TagsService,
    private authService: AuthService,
    private merchantsService: MerchantsService,
    private router: Router,
    private headerService: HeaderService,
    private dialog: DialogService,
    private notificationService: NotificationsService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private itemsService: ItemsService,
    private location: Location
  ) {}

  async ngOnInit() {
    this.routeParamsSubscription = this.route.params.subscribe(
      async (routeParams) => {
        this.routeQueryParamsSubscription = this.route.queryParams.subscribe(
          async (queryParams) => {
            const { tagId } = routeParams;
            const { orderId, entity, entityId, redirectTo } = queryParams;

            this.tagID = tagId;
            this.orderID = orderId;
            this.entity = entity;
            this.entityId = entityId;
            this.redirectTo = redirectTo;

            this.setOptionalFunctionalityList();
            await this.verifyIfUserIsLogged();

            this.createTagForm.controls.name.valueChanges.subscribe(
              (change) => {
                if (change.length > 40) {
                  this.createTagForm.controls.name.setValue(
                    this.createTagForm.controls.name.value.slice(0, 40),
                    {
                      emitEvent: false,
                    }
                  );
                }
              }
            );

            this.hasTemporalTag = Boolean(
              localStorage.getItem('preloadTemporalNotificationAndTemporalTag')
            );
            if (this.tagID || this.hasTemporalTag || this.logged)
              await this.inicializeExistingTagData();

            this.initialState = JSON.stringify(this.createTagForm.value);
            this.createTagForm.valueChanges.subscribe((change) => {
              if (JSON.stringify(change) !== this.initialState) {
                this.changedSomeValue = true;
              } else {
                this.changedSomeValue = false;
              }
            });
          }
        );
      }
    );
  }

  async inicializeExistingTagData() {
    const { name, visibility, images, notes } = this.createTagForm.controls;
    if (this.tagID) {
      const { tag } = await this.tagsService.tag(this.tagID);

      if (!this.notificationService.temporalNotification)
        this.notificationService.temporalNotification = JSON.parse(
          localStorage.getItem('temporalNotification')
        );

      if (!this.tagsService.temporalTag)
        this.tagsService.temporalTag = JSON.parse(
          localStorage.getItem('temporalTag')
        );

      if (
        tag.notifications &&
        tag.notifications.length > 0 &&
        !this.notificationService.temporalNotification
      ) {
        const { _id, message, phoneNumbers, trigger, offsetTime, entity } =
          await this.notificationService.notification(
            this.merchantDefault._id,
            tag.notifications[0]
          );

        const notificationInput: any = {
          merchant: this.merchantDefault._id,
          message,
          phoneNumbers,
          trigger,
          offsetTime: offsetTime.map((offset) => {
            return {
              quantity: offset.quantity,
              unit: offset.unit,
              hour: offset.hour ? offset.hour : null,
            };
          }),
          entity,
          _id,
        };

        this.notificationService.temporalNotification = notificationInput;
        this.optionalFunctionalityList[0].texts.middleTexts[0].text =
          notificationInput.message;
        this.optionalFunctionalityList[0].texts.middleTexts.push({
          text: '',
          callback: () =>
            this.saveTemporalTagAndRedirectToForm('/admin/automated-message'),
        });
        this.optionalFunctionalityList[0].texts.middleTexts[1].text =
          'Receptores: ';
        this.optionalFunctionalityList[0].texts.middleTexts[1].text +=
          notificationInput.phoneNumbers
            .map((phoneObject) => phoneObject.phoneNumber)
            .join(', ');
      } else if (this.notificationService.temporalNotification) {
        const notificationInput: NotificationInput =
          this.notificationService.temporalNotification;

        this.notificationService.temporalNotification = notificationInput;
        this.optionalFunctionalityList[0].texts.middleTexts[0].text =
          notificationInput.message;
        this.optionalFunctionalityList[0].texts.middleTexts.push({
          text: '',
          callback: () =>
            this.saveTemporalTagAndRedirectToForm('/admin/automated-message'),
        });
        this.optionalFunctionalityList[0].texts.middleTexts[1].text =
          'Receptores: ';
        this.optionalFunctionalityList[0].texts.middleTexts[1].text +=
          notificationInput.phoneNumbers
            .map((phoneObject) => phoneObject.phoneNumber)
            .join(', ');
      }

      if (!this.hasTemporalTag) {
        name.setValue(tag.name);

        notes.setValue(tag.notes);

        tag.status === 'active'
          ? this.setTagAsVisible()
          : this.setTagAsInvisible();

        if (tag.images && tag.images.length) {
          images.setValue(tag.images[0]);
        }
      } else {
        /*
        let temporalTag = this.tagsService.temporalTag;
        console.log(temporalTag.images);

        name.setValue(temporalTag.name);

        temporalTag.status === 'active'
          ? this.setTagAsVisible()
          : this.setTagAsInvisible();

        if (temporalTag.images) {
          const reader = new FileReader();
          reader.readAsDataURL(temporalTag.images as unknown as File); //Im so sorry xd
          reader.onload = () => {
            images.setValue(reader.result);
            this.convertedDefaultImageToBase64 = true;
          };
          reader.onerror = (error) => {
            this.convertedDefaultImageToBase64 = false;
            console.log('Error: ', error);
          };
        }
        */
      }
    } else if (this.hasTemporalTag) {
      /*
      let temporalTag = this.tagsService.temporalTag;
      let temporalNotification = this.notificationService.temporalNotification;

      if (!temporalTag)
        temporalTag = JSON.parse(localStorage.getItem('temporalTag'));
      if (!temporalNotification)
        temporalNotification = JSON.parse(
          localStorage.getItem('temporalNotification')
        );

      name.setValue(temporalTag.name);

      temporalTag.status === 'active'
        ? this.setTagAsVisible()
        : this.setTagAsInvisible();

      if (temporalTag.images) {
        const reader = new FileReader();
        reader.readAsDataURL(temporalTag.images as unknown as File); //Im so sorry xd
        reader.onload = () => {
          images.setValue(reader.result);
          this.convertedDefaultImageToBase64 = true;
        };
        reader.onerror = (error) => {
          console.log('Error: ', error);
          this.convertedDefaultImageToBase64 = false;
        };
      }

      this.notificationToAdd = temporalNotification;

      this.optionalFunctionalityList[0].texts.middleTexts[0].text =
        temporalNotification.message;
      this.optionalFunctionalityList[0].texts.middleTexts.push({
        text: '',
        callback: () =>
          this.saveTemporalTagAndRedirectToForm('/admin/automated-message'),
      });
      this.optionalFunctionalityList[0].texts.middleTexts[1].text =
        'Receptores: ';
      this.optionalFunctionalityList[0].texts.middleTexts[1].text +=
        temporalNotification.phoneNumbers
          .map((phoneObject) => phoneObject.phoneNumber)
          .join(', ');
      */
    } else if (this.logged) {
      /*
      let temporalTag = this.tagsService.temporalTag;

      if (!temporalTag) {
        temporalTag = JSON.parse(localStorage.getItem('temporalTag'));
      }

      name.setValue(temporalTag?.name);

      temporalTag.status === 'active'
        ? this.setTagAsVisible()
        : this.setTagAsInvisible();

      if (temporalTag.images) {
        const reader = new FileReader();
        reader.readAsDataURL(temporalTag.images as unknown as File); //Im so sorry xd
        reader.onload = () => {
          images.setValue(reader.result);
          this.convertedDefaultImageToBase64 = true;
        };
        reader.onerror = (error) => {
          console.log('Error: ', error);
          this.convertedDefaultImageToBase64 = false;
        };
      }
      */
    }
  }

  async verifyIfUserIsLogged() {
    this.user = await this.authService.me();
    if (!this.user) {
      this.logged = false;
      return;
    }
    this.logged = true;
    const merchantDefault = await this.merchantsService.merchantDefault();
    if (merchantDefault) this.merchantDefault = merchantDefault;
    else return;
  }

  changeVisibility() {
    const visibilityFormControl = this.createTagForm.controls
      .visibility as FormControl;

    if (visibilityFormControl.value === 'active') {
      this.setTagAsInvisible();
    } else if (visibilityFormControl.value === 'disabled') {
      this.setTagAsVisible();
    }
  }

  setTagAsInvisible() {
    const visibilityFormControl = this.createTagForm.controls
      .visibility as FormControl;

    visibilityFormControl.setValue('disabled');
    this.visibilityImage = this.env + '/closed-eye.svg';
  }

  setTagAsVisible() {
    const visibilityFormControl = this.createTagForm.controls
      .visibility as FormControl;

    visibilityFormControl.setValue('active');
    this.visibilityImage = this.env + '/open-eye.svg';
  }

  handleImageInput(value: any, operation: 'ADD' | 'DELETE') {
    if (operation === 'ADD' && value instanceof FileList) {
      this.createTagForm.controls.images.setValue(value[0], {
        emitEvent: false,
      });
    } else {
      this.createTagForm.controls.images.setValue([''], {
        emitEvent: false,
      });
    }
  }

  async save() {
    const { name, visibility, images, notes } = this.createTagForm.controls;
    this.finishedMutation = false;

    if (this.logged === false) {
      this.saveTemporalTagSimple();
      localStorage.setItem('logged', 'true');
      this.router.navigate(['auth/login'], {
        queryParams: {
          redirect: 'admin/create-tag',
        },
      });
      return;
    }

    const data: TagInput = {
      name: name.value,
      notes: notes.value,
      status: visibility.value,
      merchant: this.merchantDefault._id,
    };

    let isImageAFile = images.value instanceof File;

    if ((images.value && !this.tagID) || (this.tagID && isImageAFile)) {
      data.images = images.value;
    }

    if (images.value && this.tagID && this.convertedDefaultImageToBase64) {
      data.images = base64ToFile(images.value) as any;

      isImageAFile = true;
    }

    if (!isImageAFile && this.tagID && !images.value) {
      data.images = null;
    }

    let result = null;
    if (!this.tagID || this.tagID.length < 1) {
      try {
        if (this.entity) {
          data.entity = this.entity;
        } else {
          data.entity = 'item';
        }

        const createdTag = await this.tagsService.createTag(data);

        this.finishedMutation = true;

        if (this.orderID) {
          await this.tagsService.addTagsInOrder(
            this.merchantDefault._id,
            createdTag._id,
            this.orderID
          );

          this.goBack();
        } else {
          if (this.entity === 'item') {
            if (this.entityId) {
              const item = await this.itemsService.item(this.entityId);
              const tagsUpdated = [...item.tags];
              tagsUpdated.push(createdTag._id);

              await this.itemsService.updateItem(
                {
                  tags: tagsUpdated,
                },
                this.entityId
              );

              return this.goBack();
            }
          }

          if (
            (this.entity === 'order' || this.entity === 'item') &&
            !this.entityId &&
            !this.orderID &&
            this.redirectTo
          ) {
            return this.router.navigate([this.redirectTo]);
          }

          if (!this.entity) this.router.navigate(['admin/items-dashboard']);
        }

        this.toastr.info('Tag creado exitosamente', null, {
          timeOut: 1500,
        });
        /*
          localStorage.removeItem('temporalTag');
          localStorage.removeItem('logged');
          localStorage.removeItem('temporalNotification');
          localStorage.removeItem('preloadTemporalNotificationAndTemporalTag');
        */
      } catch (error) {
        console.error(error);
        this.toastr.info('Ocurrió un error al crear el tag', null, {
          timeOut: 1500,
        });
        this.finishedMutation = true;
      }
    } else {
      delete data.merchant;

      /*
      if (this.notificationService.temporalNotification) {
        const notificationId =
          this.notificationService.temporalNotification._id;
        delete this.notificationService.temporalNotification._id;
        await this.notificationService.updateNotification(
          this.notificationService.temporalNotification,
          notificationId
        );
      }*/

      result = await this.tagsService.updateTag(data, this.tagID);

      this.finishedMutation = true;

      if (result) {
        /*
        this.notificationService.temporalNotification = null;
        */

        if (this.redirectTo && !this.entity) {
          this.router.navigate([this.redirectTo]);
        } else if (this.orderID) {
          this.router.navigate(['ecommerce/order-info/' + this.orderID]);
        } else {
          if (this.entity === 'item') {
            this.headerService.flowRoute = null;
            localStorage.removeItem('flowRoute');
            this.router.navigate(['admin/article-editor/' + this.entityId]);
          }
          if (!this.entity) this.router.navigate(['admin/items-dashboard']);
        }

        this.toastr.info('Tag actualizado', null, {
          timeOut: 1500,
        });
      }

      localStorage.removeItem('temporalTag');
      localStorage.removeItem('temporalNotification');
      localStorage.removeItem('preloadTemporalNotificationAndTemporalTag');
    }
  }

  setOptionalFunctionalityList() {
    /*
    this.optionalFunctionalityList.push({
      type: 'WEBFORM-ANSWER',
      optionStyles: webformAnswerLayoutOptionDefaultStyles,
      selected: false,
      texts: {
        topRight: {
          text: 'TriggerID',
          styles: {
            color: '#7B7B7B',
          },
          callback: () => {},
        },
        topLeft: {
          text: 'Sin mensaje',
          styles: {
            paddingBottom: '8px',
          },
          callback: () => {},
        },
        middleTexts: [
          {
            text: 'ID',
            callback: () => {},
          },
          {
            text: 'ID',
            callback: () => {},
          },
        ],
        bottomLeft: {
          text: 'ID',
          styles: {
            paddingTop: '10px',
          },
          callback: () => {},
        },
      },
    });*/

    this.optionalFunctionalityList.push({
      type: 'WEBFORM-ANSWER',
      optionStyles: webformAnswerLayoutOptionDefaultStyles,
      selected: false,
      texts: {
        topRight: {
          text: 'TriggerID',
          styles: {
            color: '#7B7B7B',
            display: 'none',
          },
          callback: () =>
            this.saveTemporalTagAndRedirectToForm('/admin/automated-message'),
        },
        topLeft: {
          text: 'Con mensaje',
          styles: {
            paddingBottom: '8px',
            width: '100%',
          },
          callback: () =>
            this.saveTemporalTagAndRedirectToForm('/admin/automated-message'),
        },
        middleTexts: [
          {
            text: 'Te notificaremos por WhatsApp con el link de la plantilla, al TAP el link de tu plantilla mandarás el texto que configuraste a la persona que indicaste.',
            callback: () =>
              this.saveTemporalTagAndRedirectToForm('/admin/automated-message'),
          },
        ],
        bottomLeft: {
          text: 'ID',
          styles: {
            paddingTop: '10px',
            display: 'none',
          },
          callback: () =>
            this.saveTemporalTagAndRedirectToForm('/admin/automated-message'),
        },
      },
    });
  }

  openDialog = () => {
    const list: StoreShareList[] = [
      {
        title: 'Menu de opciones',
        options: [
          {
            text: 'Cerrar sesión',
            mode: 'func',
            func: async () => {
              await this.authService.signout();
            },
          },
        ],
      },
    ];

    if (!this.user) {
      list[0].options.pop();
      list[0].options.push({
        text: 'Iniciar sesión',
        mode: 'func',
        func: async () => {
          this.router.navigate(['auth/login'], {
            queryParams: {
              redirect: 'admin/entity-detail-metrics',
            },
          });
        },
      });
    }

    this.dialog.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list,
        alternate: true,
        hideCancelButtton: true,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  };

  saveTemporalTagSimple() {
    const { name, visibility, images } = this.createTagForm.controls;

    this.tagsService.temporalTag = {
      name: name.value,
      status: visibility.value,
    };

    localStorage.setItem(
      'temporalTag',
      JSON.stringify(this.tagsService.temporalTag)
    );

    if (
      (images.value && !this.tagID) ||
      !(
        this.tagID &&
        Array.isArray(images.value) &&
        typeof images.value[0] === 'string'
      )
    ) {
      this.tagsService.temporalTag.images = images.value;
    }
  }

  saveTemporalTagAndRedirectToForm(redirectionRoute?: string) {
    const { name, visibility, images } = this.createTagForm.controls;

    this.tagsService.temporalTag = {
      name: name.value,
      status: visibility.value,
    };

    if (this.orderID) {
      this.tagsService.temporalTag.orderId = this.orderID;
    }

    localStorage.setItem(
      'temporalTag',
      JSON.stringify(this.tagsService.temporalTag)
    );

    if (this.tagID) {
      localStorage.setItem('existingTagId', this.tagID);
    } else {
      localStorage.removeItem('existingTagId');
    }

    if (
      (images.value && !this.tagID) ||
      !(
        this.tagID &&
        Array.isArray(images.value) &&
        typeof images.value[0] === 'string'
      )
    ) {
      this.tagsService.temporalTag.images = images.value;
    }

    if (this.headerService.flowRoute)
      localStorage.setItem('flowRoute2', this.headerService.flowRoute);

    this.headerService.flowRoute = this.router.url;
    localStorage.setItem('flowRoute', this.router.url);

    if (this.tagID && this.tagsService.temporalTag) {
      const temporalTag = { ...this.tagsService.temporalTag };
      delete temporalTag.images;
      localStorage.setItem('temporalTag', JSON.stringify(temporalTag));
    }

    /*
    if (this.tagID && this.notificationService.temporalNotification) {
      localStorage.setItem(
        'temporalNotification',
        JSON.stringify(this.notificationService.temporalNotification)
      );
    }*/

    redirectionRoute ? this.router.navigate([redirectionRoute]) : null;
  }

  goBack() {
    const redirectURL: { url: string; queryParams: Record<string, string> } = {
      url: null,
      queryParams: {},
    };

    let flowRoute = this.headerService.flowRoute;

    if (!flowRoute) {
      flowRoute = localStorage.getItem('flowRoute');
    }

    if (flowRoute && flowRoute.length > 1) {
      const [baseRoute, paramsString] = flowRoute.split('?');
      const paramsArray = paramsString ? paramsString.split('&') : [];
      const queryParams = {};

      paramsArray.forEach((param) => {
        const [key, value] = param.split('=');

        queryParams[key] = decodeURIComponent(value);
      });

      localStorage.removeItem('flowRoute');
      this.router.navigate([baseRoute], {
        queryParams,
      });
    }

    if (flowRoute && flowRoute.includes('items-dashboard')) {
      localStorage.removeItem('flowRoute');
      localStorage.removeItem('flowRoute2');
      localStorage.removeItem('temporalTag');
      localStorage.removeItem('existingTagId');
      localStorage.removeItem('temporalNotification');
      localStorage.removeItem('preloadTemporalNotificationAndTemporalTag');
    }

    if (flowRoute && flowRoute.includes('order-info')) {
      localStorage.removeItem('temporalTag');
      localStorage.removeItem('existingTagId');
      localStorage.removeItem('temporalNotification');
      localStorage.removeItem('preloadTemporalNotificationAndTemporalTag');
    }

    this.headerService.flowRoute = null;
    this.tagsService.temporalTag = null;
    //this.notificationService.temporalNotification = null;
  }

  stopDragging() {
    this.mouseDown = false;
  }

  startDragging(e: MouseEvent, el: HTMLDivElement) {
    this.mouseDown = true;
    this.startX = e.pageX - el.offsetLeft;
    this.scrollLeft = el.scrollLeft;
  }

  changeStep(index: number) {
    this.active = index;
    console.log(index);
  }

  goBack2 = () => {
    if (this.createTagForm.status === 'VALID' && this.changedSomeValue) {
      this.save();
    } else {
      if (this.entity === 'item') {
        this.headerService.flowRoute = null;
        localStorage.removeItem('flowRoute');
        this.router.navigate(['admin/article-editor/' + this.entityId]);
      } else if (this.entity === 'order') {
        this.router.navigate(['ecommerce/order-detail/' + this.orderID]);
      } else {
        this.router.navigate(['admin/entity-detail-metrics']);
      }
    }

    if (this.redirectTo) {
      this.router.navigate([this.redirectTo]);
    }
  };

  moveEvent(e: MouseEvent, el: HTMLDivElement) {
    e.preventDefault();
    if (!this.mouseDown) {
      return;
    }
    const x = e.pageX - el.offsetLeft;
    const scroll = x - this.startX;
    el.scrollLeft = this.scrollLeft - scroll;
  }

  ngOnDestroy(): void {
    this.routeParamsSubscription.unsubscribe();
    this.routeQueryParamsSubscription.unsubscribe();
  }
}
