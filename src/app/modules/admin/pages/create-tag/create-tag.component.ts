import { Component, OnInit } from '@angular/core';
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
export class CreateTagComponent implements OnInit {
  env: string = environment.assetsUrl;
  user: User;
  merchantDefault: Merchant;
  createTagForm: FormGroup = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.pattern(/[\S]/),
    ]),
    visibility: new FormControl('active', [Validators.required]),
    images: new FormControl(null),
  });
  convertedDefaultImageToBase64: boolean = false;
  optionalFunctionalityList: WebformAnswerLayoutOption[] = [];
  tagID: string = null;
  orderID: string = null;
  visibilityImage: string = this.env + '/open-eye.svg';
  notificationToAdd: NotificationInput = null;
  finishedMutation: boolean = true;
  hasTemporalTag: boolean = false;
  options: string[] = ['Parametros', 'Notificaciones', 'Facturas'];
  mouseDown: boolean;
  startX: number;
  scrollLeft: number;
  active: number = 0;

  constructor(
    private tagsService: TagsService,
    private authService: AuthService,
    private merchantsService: MerchantsService,
    private router: Router,
    private headerService: HeaderService,
    private notificationService: NotificationsService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  async ngOnInit() {
    this.route.params.subscribe(async (routeParams) => {
      this.route.queryParams.subscribe(async (queryParams) => {
        console.log(this.location.getState());

        const { tagId } = routeParams;
        const { orderId } = queryParams;

        this.tagID = tagId;
        this.orderID = orderId;

        this.setOptionalFunctionalityList();
        await this.verifyIfUserIsLogged();

        this.hasTemporalTag = Boolean(
          localStorage.getItem('preloadTemporalNotificationAndTemporalTag')
        );
        if (this.tagID || this.hasTemporalTag) this.inicializeExistingTagData();
      });
    });
  }

  async inicializeExistingTagData() {
    const { name, visibility, images } = this.createTagForm.controls;
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

        tag.status === 'active'
          ? this.setTagAsVisible()
          : this.setTagAsInvisible();

        if (tag.images && tag.images.length) {
          images.setValue(tag.images[0]);
        }
      } else {
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
      }
    } else if (this.hasTemporalTag) {
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
    }
  }

  async verifyIfUserIsLogged() {
    this.user = await this.authService.me();

    if (this.user) {
      const merchantDefault = await this.merchantsService.merchantDefault();

      if (merchantDefault) this.merchantDefault = merchantDefault;
      else {
        this.router.navigate(['others/error-screen']);
      }
    }
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
    if (operation === 'ADD' && value instanceof FileList)
      this.createTagForm.controls.images.setValue(value[0], {
        emitEvent: false,
      });
    else {
      this.createTagForm.controls.images.setValue([''], {
        emitEvent: false,
      });
    }
  }

  async save() {
    const { name, visibility, images } = this.createTagForm.controls;
    this.finishedMutation = false;

    const data: TagInput = {
      name: name.value,
      status: visibility.value,
      merchant: this.merchantDefault._id,
    };

    let isImageAFile = images.value instanceof File;

    if ((images.value && !this.tagID) || (this.tagID && isImageAFile)) {
      data.images = images.value;
    }

    if (images.value && this.tagID && this.convertedDefaultImageToBase64) {
      data.images = base64ToFile(images.value) as any;

      console.log(data.images);
      isImageAFile = true;
    }

    if (!isImageAFile && this.tagID) {
      data.images = null;
    }

    let result = null;
    if (!this.tagID || this.tagID.length < 1) {
      const { _id: createdTagId } = await this.tagsService.createTag(data);

      if (this.hasTemporalTag) {
        const { _id: createdNotificationId } =
          await this.notificationService.createNotification(
            this.notificationToAdd
          );

        await this.notificationService.addNotificationInTag(
          this.merchantDefault._id,
          createdNotificationId,
          createdTagId
        );
      }

      localStorage.removeItem('temporalTag');
      localStorage.removeItem('temporalNotification');
      localStorage.removeItem('preloadTemporalNotificationAndTemporalTag');

      this.finishedMutation = true;

      if (this.orderID) {
        this.router.navigate(['ecommerce/order-info/' + this.orderID]);
      } else {
        this.router.navigate(['admin/items-dashboard']);
      }

      this.toastr.info('Tag creado exitosamente', null, {
        timeOut: 1500,
      });
    } else {
      data.merchant = this.merchantDefault._id;

      if (this.notificationService.temporalNotification) {
        const notificationId =
          this.notificationService.temporalNotification._id;
        delete this.notificationService.temporalNotification._id;
        await this.notificationService.updateNotification(
          this.notificationService.temporalNotification,
          notificationId
        );
      }

      result = await this.tagsService.updateTag(data, this.tagID);

      this.finishedMutation = true;

      if (result) {
        this.notificationService.temporalNotification = null;

        let redirectionRoute = this.orderID
          ? 'ecommerce/order-info/' + this.orderID
          : 'admin/items-dashboard';

        this.toastr.info('Tag actualizado', null, {
          timeOut: 1500,
        });

        this.router.navigate([redirectionRoute]);
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

  saveTemporalTagAndRedirectToForm(redirectionRoute: string) {
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

    if (this.tagID && this.notificationService.temporalNotification) {
      localStorage.setItem(
        'temporalNotification',
        JSON.stringify(this.notificationService.temporalNotification)
      );
    }

    this.router.navigate([redirectionRoute]);
  }

  goBack() {
    const redirectURL: { url: string; queryParams: Record<string, string> } = {
      url: null,
      queryParams: {},
    };

    const flowRoute2 = localStorage.getItem('flowRoute2');
    let flowRoute = this.headerService.flowRoute;

    if (!flowRoute) {
      flowRoute = localStorage.getItem('flowRoute');
    }

    if (!flowRoute) {
      if (flowRoute2) {
        this.headerService.flowRoute = flowRoute2;
      } else {
        let flowRoute = localStorage.getItem('flowRoute');

        if (!flowRoute) this.headerService.flowRoute = 'admin/items-dashboard';
        else this.headerService.flowRoute = flowRoute;
      }
    } else {
      if (!flowRoute.includes('create-tag'))
        this.headerService.flowRoute = flowRoute;
      else this.headerService.flowRoute = 'admin/items-dashboard';
    }

    const redirectionRoute = this.headerService.flowRoute;

    if (redirectionRoute.includes('?')) {
      const routeParts = redirectionRoute.split('?');
      const redirectionURL = routeParts[0];
      const routeQueryStrings = routeParts[1].split('&').map((queryString) => {
        const queryStringElements = queryString.split('=');

        return { [queryStringElements[0]]: queryStringElements[1] };
      });

      redirectURL.url = redirectionURL;
      redirectURL.queryParams = {};

      routeQueryStrings.forEach((queryString) => {
        const key = Object.keys(queryString)[0];
        redirectURL.queryParams[key] = queryString[key];
      });

      this.router.navigate([redirectURL.url], {
        queryParams: redirectURL.queryParams,
      });
    } else {
      this.router.navigate([redirectionRoute]);
    }

    this.headerService.flowRoute = null;
    this.tagsService.temporalTag = null;
    this.notificationService.temporalNotification = null;

    if (redirectionRoute.includes('items-dashboard')) {
      localStorage.removeItem('flowRoute');
      localStorage.removeItem('flowRoute2');
      localStorage.removeItem('temporalTag');
      localStorage.removeItem('existingTagId');
      localStorage.removeItem('temporalNotification');
      localStorage.removeItem('preloadTemporalNotificationAndTemporalTag');
    }

    if (redirectionRoute.includes('order-info')) {
      localStorage.removeItem('temporalTag');
      localStorage.removeItem('existingTagId');
      localStorage.removeItem('temporalNotification');
      localStorage.removeItem('preloadTemporalNotificationAndTemporalTag');
    }
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

  moveEvent(e: MouseEvent, el: HTMLDivElement) {
    e.preventDefault();
    if (!this.mouseDown) {
      return;
    }
    const x = e.pageX - el.offsetLeft;
    const scroll = x - this.startX;
    el.scrollLeft = this.scrollLeft - scroll;
  }
}
