import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { formatID } from 'src/app/core/helpers/strings.helpers';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { CustomizerValueInput } from 'src/app/core/models/customizer-value';
import { ItemOrderInput } from 'src/app/core/models/order';
import { PostInput } from 'src/app/core/models/post';
import { ReservationInput } from 'src/app/core/models/reservation';
import { DeliveryLocationInput } from 'src/app/core/models/saleflow';
import { User, UserInput } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { CustomizerValueService } from 'src/app/core/services/customizer-value.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { OrderService } from 'src/app/core/services/order.service';
import { PostsService } from 'src/app/core/services/posts.service';
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
  customizerDetails: { name: string; value: string }[] = [];
  customizer: CustomizerValueInput;
  customizerPreview: {
    base64: string;
    filename: string;
    type: string;
  };
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

  title = '¿Cuál(es) seria el motivo?';
  title2 = '¿Que emoción(es) quieres transmitir con el mensaje?';
  title3 = '¿El tiempo del motivo?';

  words = [
    { keyword: 'wedding', text: 'Bodas' },
    { keyword: 'baptism', text: 'Bautizos' },
    { keyword: 'christmas', text: 'Navidad' },
    { keyword: 'mothersDay', text: 'Madres' },
    { keyword: 'fathersDay', text: 'Padres' },
    { keyword: 'newborn', text: 'New Born' },
    { keyword: 'birthday', text: 'Cumpleaños' },
    { keyword: 'anniversary', text: 'Aniversarios' },
    { keyword: 'condolences', text: 'Condolencias' },
    { keyword: 'goldenWedding', text: 'Boda de Oro' },
    { keyword: 'valentinesDay', text: 'San Valentín' },
    { keyword: 'silverWedding', text: 'Boda de Plata' },
    { keyword: 'communion', text: 'Comuniones' },
    { keyword: 'teachersDay', text: 'Día del Maestro' },
    { keyword: 'prommotion', text: 'Promoción' },
    { keyword: 'mothersDay', text: 'Día de la Madre' },
    { keyword: 'workersDay', text: 'Dia del Trabajador' },
    { keyword: 'graduation', text: 'Graduación' },
    { keyword: 'singleMothersDay', text: 'Día de la madre Soltera' },
    { keyword: 'stepmotherDay', text: 'Día de la Madrina' },
    { keyword: 'showAffection', text: 'Mostrar Afecto' },
  ];

  words2 = [
    { keyword: 'happiness', text: 'Alegría' },
    { keyword: 'sadness', text: 'Tristeza' },
    { keyword: 'euphoria', text: 'Euforia' },
    { keyword: 'surprise', text: 'Sorpresa' },
    { keyword: 'love', text: 'Amor' },
    { keyword: 'subtle', text: 'Sutil' },
    { keyword: 'melancholia', text: 'Melancolía' },
    { keyword: 'concern', text: 'Preocupación' },
    { keyword: 'gratitude', text: 'Gratitud' },
    { keyword: 'passion', text: 'Pasión' },
    { keyword: 'support', text: 'Apoyo' },
    { keyword: 'hope', text: 'Esperanza' },
    { keyword: 'satisfaction', text: 'Satisfacción' },
    { keyword: 'acceptance', text: 'Aceptación' },
    { keyword: 'curiosity', text: 'Curiosidad' },
    { keyword: 'devotion', text: 'Devoción' },
    { keyword: 'pride', text: 'Orgullo' },
    { keyword: 'peace', text: 'Paz' },
    { keyword: 'compassion', text: 'Compasión' },
    { keyword: 'embarrassment', text: 'Vergüenza' },
    { keyword: 'optimism', text: 'Optimismo' },
    { keyword: 'resentment', text: 'Resentimiento' },
  ];

  words3 = [
    { keyword: 'past', text: 'Ya pasó' },
    { keyword: 'future', text: 'Pasará' },
    { keyword: 'instant', text: 'En cuando reciba el mensaje' },
  ];

  words4 = [
    { text: 'Mi Hijo', keyword: 'son' },
    { text: 'Mi Amigo', keyword: 'friend' },
    { text: 'Mi Papá', keyword: 'dad' },
    { text: 'Mi Primo', keyword: 'cousin' },
    { text: 'Vecino', keyword: 'neighbor' },
    { text: 'Cuñado', keyword: 'brotherinlaw' },
    { text: 'Mi Hermano', keyword: 'brother' },
    { text: 'Mi Abuelo', keyword: 'grandfather' },
    { text: 'Compañero de Trabajo', keyword: 'coworker' },
    { text: 'Mi Jefe', keyword: 'boss' },
    { text: 'Suegra', keyword: 'motherinlaw' },
    { text: 'Nuero', keyword: 'soninlaw' },
    { text: 'Mi compadre', keyword: 'buddy' },
    { text: 'Mi Comadre', keyword: 'midwife' },
  ];

  motiveWordsObjects: Array<{ text: string; active: boolean }> = [];
  sentimentWordsObjects: Array<{ text: string; active: boolean }> = [];
  timingWordsObjects: Array<{ text: string; active: boolean }> = [];
  receiverGenderWordsObjects: Array<{ text: string; active: boolean }> = [];
  receiverRelationshipWordsObjects: Array<{ text: string; active: boolean }> =
    [];
  temporalDialogs: Array<EmbeddedComponentWithId> = [];
  temporalDialogs2: Array<EmbeddedComponentWithId> = [];

  recipientPhoneDialog: EmbeddedComponentWithId = {
    component: GeneralDialogComponent,
    componentId: 'whatsappNumberDialog',
    inputs: {
      containerStyles: {
        background: 'rgb(255, 255, 255)',
        borderRadius: '12px',
        opacity: '0.5',
        padding: '37.1px 23.6px 52.6px 31px',
        overflow: 'auto',
      },
      header: {
        styles: {
          fontSize: '22px',
          fontFamily: 'SfProBold',
          marginBottom: '12.5px',
          marginTop: '0',
        },
        text: 'Cual es el Whatsapp de quien Recibirá',
      },
      fields: {
        styles: {},
        list: [
          {
            name: 'receiverPhone',
            value: '',
            validators: [Validators.required],
            type: 'phone',
            label: {
              styles: {
                display: 'block',
                fontSize: '17px',
                fontFamily: '"RobotoMedium"',
                margin: '10px 0px',
              },
              text: '',
            },
            placeholder: 'Escribe...',
            styles: {
              width: '100%',
              padding: '26px 16px 16px',
              border: 'none',
              boxShadow: 'rgb(228 228 228) 0px 3px 7px 0px inset',
              borderRadius: '9px',
              fontFamily: '"RobotoMedium"',
            },
          },
        ],
      },
    },
    outputs: [
      {
        name: 'data',
        callback: (params) => {
          const { fields, value, valid } = params;
          let { receiverPhone } = value;
          let receiverPhoneCopy = JSON.parse(JSON.stringify(receiverPhone));

          if (receiverPhone) {
            receiverPhoneCopy = receiverPhone.e164Number.split('+')[1];
          }

          if (valid) {
            this.swiperConfig.allowSlideNext = true;
          } else {
            this.swiperConfig.allowSlideNext = false;
          }

          this.postsService.privatePost = true;
          localStorage.setItem('privatePost', 'true');

          this.postsService.postReceiverNumber = receiverPhoneCopy;

          this.dialogFlowService.saveGeneralDialogData(
            receiverPhone,
            'flow1',
            'whatsappNumberDialog',
            'receiverPhone',
            fields
          );
        },
      },
    ],
  };

  insertedRecipientDialog: boolean;

  dialogs: Array<EmbeddedComponentWithId> = [
    {
      component: GeneralDialogComponent,
      componentId: 'whoReceives',
      inputs: {
        dialogId: 'whoReceives',
        omitTabFocus: false,
        containerStyles: {
          background: 'rgb(255, 255, 255)',
          borderRadius: '12px',
          opacity: '1',
          padding: '37.1px 23.6px 38.6px 31px',
        },
        header: {
          styles: {
            fontSize: '23px',
            fontFamily: 'SfProBold',
            color: '#4F4F4F',
            marginTop: '0px',
            marginBottom: '18.5px',
          },
          text: '¿Quién recibirá?',
        },
        fields: {
          styles: {},
          list: [
            {
              name: 'receiverName',
              value: '',
              validators: [Validators.required],
              type: 'textarea',
              label: {
                styles: {
                  display: 'block',
                  fontSize: '17px',
                  fontFamily: '"SFProRegular"',
                  color: '#A1A1A1',
                  margin: '10px 0px',
                },
                text: '',
              },
              placeholder:
                'Escribe para quien es. Este nombre estara escrito en el sobre.',
              styles: {
                border: 'none',
                borderRadius: '9px',
                boxShadow: 'rgb(228 228 228) 0px 3px 7px 0px inset',
                display: 'block',
                fontFamily: 'RobotoMedium',
                fontSize: '17px',
                minHeight: '130px',
                resize: 'none',
                width: '100%',
                padding: '22px 26.3px 105.6px 16px',
                color: '#A1A1A1',
              },
            },
          ],
        },
        isMultiple: true,
      },
      outputs: [
        {
          name: 'data',
          callback: (params) => {
            const { fields, value, valid } = params;
            const { receiverName } = value;

            if (valid) {
              this.swiperConfig.allowSlideNext = true;
            } else {
              this.swiperConfig.allowSlideNext = false;
            }

            this.dialogFlowService.saveGeneralDialogData(
              receiverName,
              'flow1',
              'whoReceives',
              'receiverName',
              fields
            );

            if (!this.postsService.post) this.postsService.post = {};
            this.postsService.post.to = receiverName;
          },
        },
      ],
      postLabel: 'El mensaje incluirá un qrCode para ver el Story.',
    },
    {
      component: GeneralDialogComponent,
      componentId: 'whoSends',
      inputs: {
        dialogId: 'whoSends',
        containerStyles: {
          background: 'rgb(255, 255, 255)',
          borderRadius: '12px',
          opacity: '1',
          padding: '37.1px 23.6px 30.6px 31px',
        },
        header: {
          styles: {
            fontSize: '23px',
            fontFamily: 'SfProBold',
            color: '#4F4F4F',
            marginBottom: '12.5px',
          },
          text: 'Departe de quien o quienes?',
        },
        fields: {
          styles: {},
          list: [
            {
              name: 'senderName',
              value: '',
              validators: [Validators.required],
              type: 'textarea',
              label: {
                styles: {
                  display: 'block',
                  fontSize: '17px',
                  fontFamily: '"RobotoMedium"',
                  paddingTop: '26px',
                  paddingLeft: '16px',
                },
                text: '',
              },
              placeholder:
                'Este (os) nombres (s) estaran escritos debajo del mensaje.',
              styles: {
                border: 'none',
                borderRadius: '9px',
                boxShadow: 'rgba(228 228 228) 0px 3px 7px inset',
                display: 'block',
                fontFamily: 'RobotoMedium',
                fontSize: '17px',
                minHeight: '130px',
                resize: 'none',
                width: '100%',
                padding: '26px 26.3px 56.6px 16px',
                color: '#A1A1A1',
              },
            },
          ],
        },
      },
      postLabel:
        'Mensajito de prueba que se ve despues de pasar el 2do dialog.',
      outputs: [
        {
          name: 'data',
          callback: (params) => {
            const { fields, value, valid } = params;
            const { senderName } = value;

            if (valid) {
              this.swiperConfig.allowSlideNext = true;
            } else {
              this.swiperConfig.allowSlideNext = false;
            }

            this.dialogFlowService.saveGeneralDialogData(
              senderName,
              'flow1',
              'whoSends',
              'senderName',
              fields
            );

            this.postsService.post.from = senderName;
          },
        },
      ],
    },
    {
      component: GeneralDialogComponent,
      componentId: 'messageTypeDialog',
      inputs: {
        dialogId: 'messageTypeDialog',
        containerStyles: {
          background: 'rgb(255, 255, 255)',
          borderRadius: '12px',
          opacity: '1',
          padding: '37px 29.6px 13.2px 22px',
        },
        header: {
          styles: {
            fontSize: '21px',
            fontFamily: 'SfProBold',
            color: '#4F4F4F',
            marginBottom: '25px',
            marginTop: '0',
          },
          text: 'El mensaje',
        },
        fields: {
          styles: {
            // paddingTop: '20px',
          },
          list: [
            {
              name: 'messageType',
              value: '',
              validators: [Validators.required],
              type: 'selection',
              selection: {
                styles: {
                  display: 'block',
                  fontFamily: '"SfProRegular"',
                  marginLeft: '10px',
                },
                list: [
                  {
                    text: 'Quiero ver el draft de opciones de inteligencia artificial',
                    subText: {
                      text: 'TRY IT. FREE.HOT FEATURE',
                      styles: {
                        color: '#91812f',
                        display: 'block',
                        fontFamily: '"SfProBold"',
                        fontSize: '13px',
                        marginLeft: '10px',
                      },
                    },
                  },
                  {
                    text: 'Lo escribire directo de mi cabeza.',
                  },
                ],
              },

              prop: 'text',
            },
          ],
        },
        isMultiple: false,
      },
      outputs: [
        {
          name: 'data',
          callback: (params) => {
            const { value, fields, valid } = params;
            const { messageType } = value;
            let typeOfMessageValue = messageType[0];

            if (valid) {
              this.swiperConfig.allowSlideNext = true;
            } else {
              this.swiperConfig.allowSlideNext = false;
            }

            if (
              typeOfMessageValue
                .toLowerCase()
                .includes('inteligencia artificial')
            ) {
              typeOfMessageValue = 'AI';

              if (this.temporalDialogs2.length) {
                this.dialogs.splice(3, 0, ...this.temporalDialogs2);
                this.temporalDialogs2 = [];
              }

              if (this.dialogs.length === 7) {
                this.temporalDialogs2 = this.dialogs.splice(3, 2);
                this.dialogs.splice(3, 0, ...this.temporalDialogs);
                this.dialogFlowFunctions.moveToDialogByIndex(3);
              } else {
                this.temporalDialogs2 = this.dialogs.splice(3, 2);
                this.dialogFlowFunctions.moveToDialogByIndex(3);
              }
            } else {
              typeOfMessageValue = 'Manual';

              if (this.temporalDialogs2.length) {
                this.dialogs.splice(3, 0, ...this.temporalDialogs2);
                this.temporalDialogs2 = [];
              }

              this.dialogFlowFunctions.moveToDialogByIndex(3);

              if (this.temporalDialogs.length !== 5)
                this.temporalDialogs = this.dialogs.splice(5, 5);

              setTimeout(() => {
                this.swiperConfig.allowSlideNext = false;
              }, 500);
            }

            this.dialogFlowService.saveGeneralDialogData(
              typeOfMessageValue,
              'flow1',
              'messageTypeDialog',
              'messageType',
              fields
            );
          },
        },
      ],
    },
    {
      component: GeneralDialogComponent,
      componentId: 'messageTitleDialog',
      inputs: {
        dialogId: 'messageTitleDialog',
        containerStyles: {
          background: 'rgb(255, 255, 255)',
          borderRadius: '12px',
          opacity: '1',
          padding: '37.1px 23.6px 29.6px 31px',
        },
        header: {
          styles: {
            fontSize: '23px',
            fontFamily: 'SfProBold',
            marginBottom: '12.5px',
            marginTop: '0',
            color: '#4F4F4F',
          },
          text: 'Titulo del sobre',
        },
        fields: {
          styles: {},
          list: [
            {
              name: 'messageTitle',
              value: '',
              validators: [Validators.required],
              type: 'textarea',
              label: {
                styles: {
                  border: 'none',
                  borderRadius: '9px',
                  boxShadow: 'rgb(228 228 228) 0px 3px 7px 0px inset',
                  display: 'block',
                  fontFamily: 'RobotoMedium',
                  fontSize: '17px',
                  minHeight: '130px',
                  resize: 'none',
                  width: '100%',
                  padding: '26px 26.3px 56.6px 16px',
                  color: '#A1A1A1',
                },
                text: '',
              },
              placeholder: 'Escribe...',
              styles: {
                border: 'none',
                borderRadius: '9px',
                boxShadow: 'rgb(228 228 228) 0px 3px 7px inset',
                display: 'block',
                fontFamily: 'RobotoMedium',
                fontSize: '17px',
                minHeight: '130px',
                resize: 'none',
                width: '100%',
                padding: '26px 26.3px 56.6px 16px',
                color: '#A1A1A1',
              },
            },
          ],
        },
      },
      outputs: [
        {
          name: 'data',
          callback: (params) => {
            const { value, fields } = params;
            const { messageTitle } = value;

            if (messageTitle && messageTitle.length > 0) {
              this.swiperConfig.allowSlideNext = true;
            } else {
              this.swiperConfig.allowSlideNext = false;
            }

            this.dialogFlowService.saveGeneralDialogData(
              messageTitle,
              'flow1',
              'messageDialog',
              'messageTitle',
              fields
            );

            this.postsService.post.title = messageTitle;
          },
        },
      ],
    },
    {
      component: GeneralDialogComponent,
      componentId: 'messageDialog',
      inputs: {
        dialogId: 'messageDialog',
        containerStyles: {
          background: 'rgb(255, 255, 255)',
          borderRadius: '12px',
          opacity: '1',
          padding: '37.1px 23.6px 29.6px 31px',
        },
        header: {
          styles: {
            fontSize: '23px',
            fontFamily: 'SfProBold',
            marginBottom: '12.5px',
            marginTop: '0',
            color: '#4F4F4F',
            width: '50%',
          },
          text: '¿Que mensaje escribiremos?',
        },
        fields: {
          styles: {},
          list: [
            {
              name: 'message',
              value: '',
              validators: [Validators.required],
              type: 'textarea',
              label: {
                styles: {
                  border: 'none',
                  borderRadius: '9px',
                  boxShadow: 'rgb(228 228 228) 0px 3px 7px 0px inset',
                  display: 'block',
                  fontFamily: 'RobotoMedium',
                  fontSize: '17px',
                  minHeight: '130px',
                  resize: 'none',
                  width: '100%',
                  padding: '26px 26.3px 56.6px 16px',
                  color: '#A1A1A1',
                },
                text: '',
              },
              placeholder: 'Escribe...',
              styles: {
                border: 'none',
                borderRadius: '9px',
                boxShadow: 'rgb(228 228 228) 0px 3px 7px inset',
                display: 'block',
                fontFamily: 'RobotoMedium',
                fontSize: '17px',
                minHeight: '130px',
                resize: 'none',
                width: '100%',
                padding: '26px 26.3px 56.6px 16px',
                color: '#A1A1A1',
              },
            },
          ],
        },
      },
      outputs: [
        {
          name: 'data',
          callback: (params) => {
            const { value, fields } = params;
            const { message } = value;
            let messageValue = message;

            if (messageValue && messageValue.length > 0) {
              this.swiperConfig.allowSlideNext = true;
            } else {
              this.swiperConfig.allowSlideNext = false;
            }

            this.dialogFlowService.saveGeneralDialogData(
              messageValue,
              'flow1',
              'messageDialog',
              'message',
              fields
            );

            this.postsService.post.message = messageValue;
          },
        },
      ],
    },
    {
      component: OptionsGridComponent,
      componentId: 'motiveDialog',
      inputs: {
        dialogId: 'motiveDialog',
        mode: 'default',
        words: this.words,
        wordsObjects: this.motiveWordsObjects,
        title: this.title,
        containerStyles: {
          background: 'rgb(255, 255, 255)',
          borderRadius: '8px',
          opacity: '1',
          // padding: '37px 36.6px 70.4px 31px',
        },
      },
      outputs: [
        {
          name: 'optionClick',
          callback: (data: {
            text: string;
            keyword: string;
            wordsObjects: Array<{
              text: string;
              keyword: string;
              active: boolean;
            }>;
          }) => {
            const { text, keyword, wordsObjects } = data;

            this.motiveWordsObjects = wordsObjects;

            this.dialogFlowService.saveData(
              keyword,
              'flow1',
              'motiveDialog',
              'motive'
            );

            if (this.checkIfTheAIOptionsAreSelected() && keyword) {
              this.dialogs[
                this.dialogs.length - 3
              ].inputs.submitButton.styles.display = 'flex';
            } else if (!keyword) {
              this.dialogs[
                this.dialogs.length - 3
              ].inputs.submitButton.styles.display = 'none';
            }

            if (!keyword) this.swiperConfig.allowSlideNext = false;
            else this.swiperConfig.allowSlideNext = true;
          },
        },
      ],
    },
    {
      component: OptionsGridComponent,
      componentId: 'sentimentDialog',
      inputs: {
        dialogId: 'sentimentDialog',

        mode: 'default',
        words: this.words2,
        wordsObjects: this.sentimentWordsObjects,
        title: this.title2,
        containerStyles: {},
      },
      outputs: [
        {
          name: 'optionClick',
          callback: (data: {
            text: string;
            keyword: string;
            wordsObjects: Array<{
              text: string;
              keyword: string;
              active: boolean;
            }>;
          }) => {
            const { text, keyword, wordsObjects } = data;

            this.sentimentWordsObjects = wordsObjects;
            this.dialogFlowService.saveData(
              keyword,
              'flow1',
              'sentimentDialog',
              'sentiment'
            );

            if (this.checkIfTheAIOptionsAreSelected() && keyword) {
              this.dialogs[
                this.dialogs.length - 3
              ].inputs.submitButton.styles.display = 'flex';
            } else if (!keyword) {
              this.dialogs[
                this.dialogs.length - 3
              ].inputs.submitButton.styles.display = 'none';
            }

            if (!keyword) this.swiperConfig.allowSlideNext = false;
            else this.swiperConfig.allowSlideNext = true;
          },
        },
      ],
    },
    {
      component: OptionsGridComponent,
      componentId: 'timingDialog',
      inputs: {
        dialogId: 'timingDialog',

        mode: 'time',
        words: this.words3,
        wordsObjects: this.timingWordsObjects,
        title: this.title3,
        containerStyles: {
          opacity: '1',
        },
      },
      outputs: [
        {
          name: 'optionClick',
          callback: (data: {
            text: string;
            keyword: string;
            wordsObjects: Array<{
              text: string;
              keyword: string;
              active: boolean;
            }>;
          }) => {
            const { text, keyword, wordsObjects } = data;

            this.timingWordsObjects = wordsObjects;
            this.dialogFlowService.saveData(
              keyword,
              'flow1',
              'timingDialog',
              'timing'
            );

            if (this.checkIfTheAIOptionsAreSelected() && keyword) {
              this.dialogs[
                this.dialogs.length - 3
              ].inputs.submitButton.styles.display = 'flex';
            } else if (!keyword) {
              this.dialogs[
                this.dialogs.length - 3
              ].inputs.submitButton.styles.display = 'none';
            }

            if (!keyword) this.swiperConfig.allowSlideNext = false;
            else this.swiperConfig.allowSlideNext = true;
          },
        },
      ],
    },
    {
      component: OptionsGridComponent,
      componentId: 'recipientGenderDialog',
      inputs: {
        dialogId: 'timingDialog',

        mode: 'time',
        words: [
          { keyword: 'male', text: 'Hombre' },
          { keyword: 'female', text: 'Mujer' },
        ],
        wordsObjects: this.receiverGenderWordsObjects,
        title: '¿Que es RecipienteID?',
        titleCenter: false,
        containerStyles: {},
      },
      outputs: [
        {
          name: 'optionClick',
          callback: (data: {
            text: string;
            keyword: string;
            wordsObjects: Array<{
              text: string;
              keyword: string;
              active: boolean;
            }>;
          }) => {
            const { text, keyword, wordsObjects } = data;

            this.receiverGenderWordsObjects = wordsObjects;
            this.dialogFlowService.saveData(
              keyword,
              'flow1',
              'recipientGenderDialog',
              'recipientGender'
            );

            if (this.checkIfTheAIOptionsAreSelected() && keyword) {
              this.dialogs[
                this.dialogs.length - 3
              ].inputs.submitButton.styles.display = 'flex';
            } else if (!keyword) {
              this.dialogs[
                this.dialogs.length - 3
              ].inputs.submitButton.styles.display = 'none';
            }

            if (!keyword) this.swiperConfig.allowSlideNext = false;
            else this.swiperConfig.allowSlideNext = true;
          },
        },
      ],
    },
    {
      component: OptionsGridComponent,
      componentId: 'receiverRelationshipDialog',
      inputs: {
        dialogId: 'timingDialog',
        mode: 'default',
        words: this.words4,
        wordsObjects: this.receiverRelationshipWordsObjects,
        title: 'Más de RecipienteID',
        titleCenter: false,
        submitButton: {
          text: 'Generar mensajes',
          styles: {
            display: 'none',
            border: 'none',
            padding: '5px 20px',
            cursor: 'pointer',
            margin: 'auto',
            fontFamily: 'SfProBold',
            borderRadius: '3px',
            fontSize: '18px',
            marginTop: '1rem',
            backgroundColor: 'yellowgreen',
          },
        },
        containerStyles: {
          background: 'rgb(255, 255, 255)',
        },
      },
      outputs: [
        {
          name: 'optionClick',
          callback: (data: {
            text: string;
            keyword: string;
            wordsObjects: Array<{
              text: string;
              keyword: string;
              active: boolean;
            }>;
          }) => {
            const { text, keyword, wordsObjects } = data;

            this.receiverRelationshipWordsObjects = wordsObjects;
            this.dialogFlowService.saveData(
              keyword,
              'flow1',
              'receiverRelationshipDialog',
              'receiverRelationship'
            );

            if (this.checkIfTheAIOptionsAreSelected() && keyword) {
              this.dialogs[
                this.dialogs.length - 3
              ].inputs.submitButton.styles.display = 'flex';
            } else if (!keyword) {
              this.dialogs[
                this.dialogs.length - 3
              ].inputs.submitButton.styles.display = 'none';
            }

            this.swiperConfig.allowSlideNext = false;
          },
        },
        {
          name: 'buttonClicked',
          callback: async (
            data: Array<{ text: string; keyword: string; active: boolean }>
          ) => {
            const motive =
              this.dialogFlowService.dialogsFlows['flow1'].motiveDialog.fields
                .motive;
            const sentiment =
              this.dialogFlowService.dialogsFlows['flow1'].sentimentDialog
                .fields.sentiment;
            const timing =
              this.dialogFlowService.dialogsFlows['flow1'].timingDialog.fields
                .timing;
            const recipientGender =
              this.dialogFlowService.dialogsFlows['flow1'].recipientGenderDialog
                .fields.recipientGender;
            const receiverRelationship =
              this.dialogFlowService.dialogsFlows['flow1']
                .receiverRelationshipDialog.fields.receiverRelationship;

            lockUI();

            const response = await this.gpt3Service.generateResponseForTemplate(
              {
                motive,
                target: receiverRelationship,
                sentiment,
                timing,
              },
              '63bd15b25169e824f0b11266'
            );

            let message;
            let title;
            let scannedTitle = false;
            const parts = response.split('\n');

            const options: Array<{
              message: string;
              title: string;
            }> = [];
            let optionNumber = 1;

            parts.forEach((line) => {
              if (optionNumber < 5) {
                if (
                  !line.includes('Opción') &&
                  line.includes(':') &&
                  !scannedTitle
                ) {
                  const [, realTitle] = line.split(':');
                  title = realTitle;
                  scannedTitle = true;
                } else if (
                  !line.includes('Opción') &&
                  line.includes(':') &&
                  scannedTitle
                ) {
                  const [, realMessage] = line.split(':');
                  options.push({
                    message: realMessage,
                    title,
                  });
                  title = null;
                  optionNumber += 1;
                  scannedTitle = false;
                }
              }
            });

            this.postsService.postMessageOptions = options;

            localStorage.setItem(
              'temporal-post-options',
              JSON.stringify(options)
            );

            this.router.navigate(
              [
                'ecommerce/' +
                  this.headerService.saleflow.merchant.slug +
                  '/text-edition-and-preview',
              ],
              {
                queryParams: {
                  type: 'post',
                },
              }
            );

            this.postsService.temporalDialogs = this.temporalDialogs;
            this.postsService.temporalDialogs2 = this.temporalDialogs2;
            this.postsService.dialogs = this.dialogs;
            this.headerService.flowRoute =
              this.router.url + '?startOnDialogFlow=true';
            localStorage.setItem('flowRoute', this.headerService.flowRoute);

            unlockUI();
          },
        },
      ],
    },
    {
      component: GeneralDialogComponent,
      componentId: 'wantToAddQrDialog',
      inputs: {
        containerStyles: {
          background: 'rgb(255, 255, 255)',
          borderRadius: '12px',
          opacity: '1',
          padding: '37px 36.6px 50.4px 31px',
        },
        header: {
          styles: {
            fontSize: '21px',
            fontFamily: 'SfProBold',
            marginBottom: '6px',
            marginTop: '0',
            color: '#4F4F4F',
          },
          text: '¿Quieres  agregar un QR?',
        },
        title: {
          styles: {
            fontSize: '15px',
            color: '#7B7B7B',
            fontStyle: 'italic',
            margin: '0',
            marginBottom: '37.5px',
          },
          text: 'Es privado. Opcional: te notifican al escanearlo.',
        },
        fields: {
          list: [
            {
              name: 'wantToAddQr',
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
                list: [
                  {
                    text: 'Si',
                    // barStyle: {
                    //   display: 'inline-block',
                    //   background: '#FC2727',
                    //   width: ' 100%',
                    //   height: ' 100%',
                    //   borderRadius: '4px',
                    // },
                    subText: {
                      text: 'Incluyes fotos, memes, videos, música o chistes de la Inteligencia Artificial.',
                      styles: {
                        color: '#7B7B7B',
                        display: 'block',
                        fontFamily: '"SfProRegular"',
                        fontStyle: 'italic',
                        fontSize: '15px',
                        marginBottom: '15px',
                        marginTop: '5px',
                        paddingRight: '15px',
                        marginLeft: '19.5px',
                      },
                    },
                  },
                  {
                    text: 'No',
                  },
                ],
              },
              // styles: {},
              prop: 'text',
            },
          ],
        },
        isMultiple: false,
      },
      outputs: [
        {
          name: 'data',
          callback: (params) => {
            const { fields, value, valid } = params;
            const { wantToAddQr } = value;

            if (valid) {
              this.swiperConfig.allowSlideNext = true;
            } else {
              this.swiperConfig.allowSlideNext = false;
            }

            this.dialogFlowService.saveGeneralDialogData(
              wantToAddQr,
              'flow1',
              'wantToAddQrDialog',
              'wantToAddQr',
              fields
            );

            if (wantToAddQr[0] === 'No') {
              localStorage.setItem(
                'post',
                JSON.stringify({
                  message: this.postsService.post.message,
                  title: this.postsService.post.title,
                  to: this.postsService.post.to,
                  from: this.postsService.post.from,
                })
              );

              if (
                this.dialogs[this.dialogs.length - 2].componentId ===
                'whatsappNumberDialog'
              ) {
                this.dialogs.splice(this.dialogs.length - 2, 1);
              }

              this.router.navigate([
                'ecommerce/' +
                  this.headerService.saleflow.merchant.slug +
                  '/post-edition',
              ]);
            } else {
              if (
                this.dialogs[this.dialogs.length - 2].componentId !==
                'whatsappNumberDialog'
              ) {
                this.dialogFlowService.dialogsFlows['flow1'][
                  'whatsappNumberDialog'
                ] = {
                  dialogId: 'whatsappNumberDialog',
                  fields: {},
                  swiperConfig: this.swiperConfig,
                };
                this.insertedRecipientDialog = true;

                this.dialogs.splice(
                  this.dialogs.length - 1,
                  0,
                  this.recipientPhoneDialog
                );
              }

              setTimeout(() => {
                this.swiperConfig.allowSlideNext = true;

                this.dialogFlowFunctions.moveToDialogByIndex(
                  this.dialogs.length - 2
                );
              }, 100);
            }
          },
        },
      ],
    },
    {
      component: GeneralDialogComponent,
      componentId: 'includedDialog',
      inputs: {
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
          text: '¿Que deseas incluir?',
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
              name: 'qrContentSelection',
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
                list: [
                  {
                    text: 'Fotos, videos de mi device',
                  },
                  {
                    text: 'Un chiste de la IA',
                  },
                ],
              },
              // styles: {},
              prop: 'text',
            },
          ],
        },
        isMultiple: true,
      },
      outputs: [
        {
          name: 'data',
          callback: async (params) => {
            const { fields, value, valid } = params;
            const { qrContentSelection } = value;

            if (valid) {
              this.swiperConfig.allowSlideNext = true;
            } else {
              this.swiperConfig.allowSlideNext = false;
            }

            if (
              qrContentSelection.includes('Fotos, videos de mi device') &&
              !this.addedPhotosToTheQr
            ) {
              localStorage.setItem(
                'post',
                JSON.stringify({
                  message: this.postsService.post.message,
                  title: this.postsService.post.title,
                  to: this.postsService.post.to,
                  from: this.postsService.post.from,
                  joke: this.postsService.post.joke,
                })
              );

              this.router.navigate([
                'ecommerce/' +
                  this.headerService.saleflow.merchant.slug +
                  '/qr-edit',
              ]);
            } else if (
              qrContentSelection.includes('Un chiste de la IA') &&
              !this.addedJokesToTheQr
            ) {
              localStorage.setItem(
                'post',
                JSON.stringify({
                  message: this.postsService.post.message,
                  title: this.postsService.post.title,
                  to: this.postsService.post.to,
                  from: this.postsService.post.from,
                })
              );

              lockUI();

              const response =
                await this.gpt3Service.generateResponseForTemplate(
                  {},
                  '63c0ff83e752c40ca8eefcfb'
                );

              unlockUI();

              if (response) {
                const jokes = JSON.parse(response);
                this.headerService.aiJokes = jokes;
                localStorage.setItem('aiJokes', response);
              }

              this.headerService.flowRoute = this.router.url.replace(
                '?startOnDialogFlow=true',
                ''
              );
              localStorage.setItem('flowRoute', this.headerService.flowRoute);
              this.postsService.temporalDialogs = this.temporalDialogs;
              this.postsService.temporalDialogs2 = this.temporalDialogs2;
              this.postsService.dialogs = this.dialogs;
              this.router.navigate(
                [
                  'ecommerce/' +
                    this.headerService.saleflow.merchant.slug +
                    '/text-edition-and-preview',
                ],
                {
                  queryParams: {
                    type: 'ai-joke',
                  },
                }
              );
            }
          },
        },
      ],
    },
  ];

  constructor(
    private _DomSanitizer: DomSanitizer,
    private dialogService: DialogService,
    public headerService: HeaderService,
    private customizerValueService: CustomizerValueService,
    public postsService: PostsService,
    public orderService: OrderService,
    private appService: AppService,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private dialogFlowService: DialogFlowService,
    private entityTemplateService: EntityTemplateService,
    private gpt3Service: Gpt3Service
  ) {}

  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe((queryParams) => {
      const { startOnDialogFlow } = queryParams;
      if (
        this.postsService.dialogs?.length ||
        this.postsService.temporalDialogs?.length ||
        this.postsService.temporalDialogs2?.length
      ) {
        this.openedDialogFlow = Boolean(startOnDialogFlow);
      }

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
      }

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
      if (!this.customizer) this.updatePayment();
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
    // ---------------------- Managing Customizer ----------------------
    if (this.customizer) {
      localStorage.removeItem('customizerFile');
      if (!this.customizer.preview) {
        const res: Response = await fetch(this.customizerPreview.base64);
        const blob: Blob = await res.blob();

        this.customizer.preview = new File(
          [blob],
          this.customizerPreview.filename,
          {
            type: this.customizerPreview.type,
          }
        );
      }
      const customizerId =
        await this.customizerValueService.createCustomizerValue(
          this.customizer
        );
      this.headerService.order.products[0].customizer = customizerId;
      this.headerService.customizer = null;
      this.headerService.customizerData = null;
    }
    // ++++++++++++++++++++++ Managing Customizer ++++++++++++++++++++++
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

      console.log('abierto', this.openedDialogFlow);
    }
  }

  checkIfTheAIOptionsAreSelected() {
    return (
      Boolean(
        this.dialogFlowService.dialogsFlows['flow1'][
          'receiverRelationshipDialog'
        ].fields.receiverRelationship?.length
      ) &&
      Boolean(
        this.dialogFlowService.dialogsFlows['flow1']['recipientGenderDialog']
          .fields.recipientGender?.length
      ) &&
      Boolean(
        this.dialogFlowService.dialogsFlows['flow1']['timingDialog'].fields
          .timing?.length
      ) &&
      Boolean(
        this.dialogFlowService.dialogsFlows['flow1']['sentimentDialog'].fields
          .sentiment?.length
      ) &&
      Boolean(
        this.dialogFlowService.dialogsFlows['flow1']['motiveDialog'].fields
          .motive?.length
      )
    );
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
}
