import { EmbeddedComponentWithId } from 'src/app/core/types/multistep-form';
import { GeneralDialogComponent } from 'src/app/shared/components/general-dialog/general-dialog.component';
import { OptionsGridComponent } from 'src/app/shared/dialogs/options-grid/options-grid.component';
import { Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/app.service';
import { Location } from '@angular/common';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { AuthService } from 'src/app/core/services/auth.service';
import { CustomizerValueService } from 'src/app/core/services/customizer-value.service';
import { DialogFlowService } from 'src/app/core/services/dialog-flow.service';
import { EntityTemplateService } from 'src/app/core/services/entity-template.service';
import { Gpt3Service } from 'src/app/core/services/gpt3.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { OrderService } from 'src/app/core/services/order.service';
import { PostsService } from 'src/app/core/services/posts.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { SwiperOptions } from 'swiper';

export class Dialogs {
  dialogs: Array<EmbeddedComponentWithId> = [];
  title = '¿Cuál(es) seria el motivo?';
  title2 = '¿Que emoción(es) quieres transmitir con el mensaje?';
  title3 = '¿El tiempo del motivo?';

  // words = [
  //   { keyword: 'wedding', text: 'Bodas' },
  //   { keyword: 'baptism', text: 'Bautizos' },
  //   { keyword: 'christmas', text: 'Navidad' },
  //   { keyword: 'mothersDay', text: 'Madres' },
  //   { keyword: 'fathersDay', text: 'Padres' },
  //   { keyword: 'newborn', text: 'New Born' },
  //   { keyword: 'birthday', text: 'Cumpleaños' },
  //   { keyword: 'anniversary', text: 'Aniversarios' },
  //   { keyword: 'condolences', text: 'Condolencias' },
  //   { keyword: 'goldenWedding', text: 'Boda de Oro' },
  //   { keyword: 'valentinesDay', text: 'San Valentín' },
  //   { keyword: 'silverWedding', text: 'Boda de Plata' },
  //   { keyword: 'communion', text: 'Comuniones' },
  //   { keyword: 'teachersDay', text: 'Día del Maestro' },
  //   { keyword: 'prommotion', text: 'Promoción' },
  //   { keyword: 'mothersDay', text: 'Día de la Madre' },
  //   { keyword: 'workersDay', text: 'Dia del Trabajador' },
  //   { keyword: 'graduation', text: 'Graduación' },
  //   { keyword: 'singleMothersDay', text: 'Día de la madre Soltera' },
  //   { keyword: 'stepmotherDay', text: 'Día de la Madrina' },
  //   { keyword: 'showAffection', text: 'Mostrar Afecto' },
  // ];

  // words2 = [
  //   { keyword: 'happiness', text: 'Alegría' },
  //   { keyword: 'sadness', text: 'Tristeza' },
  //   { keyword: 'euphoria', text: 'Euforia' },
  //   { keyword: 'surprise', text: 'Sorpresa' },
  //   { keyword: 'love', text: 'Amor' },
  //   { keyword: 'subtle', text: 'Sutil' },
  //   { keyword: 'melancholia', text: 'Melancolía' },
  //   { keyword: 'concern', text: 'Preocupación' },
  //   { keyword: 'gratitude', text: 'Gratitud' },
  //   { keyword: 'passion', text: 'Pasión' },
  //   { keyword: 'support', text: 'Apoyo' },
  //   { keyword: 'hope', text: 'Esperanza' },
  //   { keyword: 'satisfaction', text: 'Satisfacción' },
  //   { keyword: 'acceptance', text: 'Aceptación' },
  //   { keyword: 'curiosity', text: 'Curiosidad' },
  //   { keyword: 'devotion', text: 'Devoción' },
  //   { keyword: 'pride', text: 'Orgullo' },
  //   { keyword: 'peace', text: 'Paz' },
  //   { keyword: 'compassion', text: 'Compasión' },
  //   { keyword: 'embarrassment', text: 'Vergüenza' },
  //   { keyword: 'optimism', text: 'Optimismo' },
  //   { keyword: 'resentment', text: 'Resentimiento' },
  // ];

  // words3 = [
  //   { keyword: 'past', text: 'Ya pasó' },
  //   { keyword: 'future', text: 'Pasará' },
  //   { keyword: 'instant', text: 'En cuando reciba el mensaje' },
  // ];

  // words4 = [
  //   { text: 'Mi Hijo', keyword: 'son' },
  //   { text: 'Mi Amigo', keyword: 'male_friend' },
  //   { text: 'Mi Papá', keyword: 'dad' },
  //   { text: 'Mi Primo', keyword: 'male_cousin' },
  //   { text: 'Mi Vecino', keyword: 'male_neighbor' },
  //   { text: 'Mi Cuñado', keyword: 'brotherinlaw' },
  //   { text: 'Mi Hermano', keyword: 'brother' },
  //   { text: 'Mi Abuelo', keyword: 'grandfather' },
  //   { text: 'Mi Compañero de Trabajo', keyword: 'male_coworker' },
  //   { text: 'Mi Jefe', keyword: 'male_boss' },
  //   { text: 'Mi Suegro', keyword: 'fatherinlaw' },
  //   { text: 'Mi Nuero', keyword: 'soninlaw' },
  //   { text: 'Mi compadre', keyword: 'buddy' },
  // ];

  // words5 = [
  //   { text: 'Mi Hija', keyword: 'daughter' },
  //   { text: 'Mi Amiga', keyword: 'female_friend' },
  //   { text: 'Mi Mamá', keyword: 'mom' },
  //   { text: 'Mi Prima', keyword: 'female_cousin' },
  //   { text: 'Mi Vecina', keyword: 'female_neighbor' },
  //   { text: 'Mi Cuñada', keyword: 'sisterinlaw' },
  //   { text: 'Mi Hermana', keyword: 'sister' },
  //   { text: 'Mi Abuela', keyword: 'grandmother' },
  //   { text: 'Mi Compañera de Trabajo', keyword: 'female_coworker' },
  //   { text: 'Mi Jefa', keyword: 'female_boss' },
  //   { text: 'Mi Suegra', keyword: 'motherinlaw' },
  //   { text: 'Mi Nuera', keyword: 'daughterinlaw' },
  //   { text: 'Mi Comadre', keyword: 'midwife' },
  // ];

  // motiveWordsObjects: Array<{ text: string; active: boolean }> = [];
  // sentimentWordsObjects: Array<{ text: string; active: boolean }> = [];
  // timingWordsObjects: Array<{ text: string; active: boolean }> = [];
  // receiverGenderWordsObjects: Array<{ text: string; active: boolean }> = [];
  // receiverRelationshipWordsObjects: Array<{ text: string; active: boolean }> = [];

  insertedRecipientDialog: boolean;

  recipientPhoneDialog: EmbeddedComponentWithId = {
    component: GeneralDialogComponent,
    componentId: 'whatsappNumberDialog',
    inputs: {
      dialogId: 'whatsappNumberDialog',
      containerStyles: {
        background: 'rgb(255, 255, 255)',
        borderRadius: '12px',
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
            localStorage.setItem(
              'postReceiverNumber',
              JSON.stringify(receiverPhone)
            );
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

  constructor(
    private dialogService: DialogService,
    private headerService: HeaderService,
    private postsService: PostsService,
    private orderService: OrderService,
    private appService: AppService,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private dialogFlowService: DialogFlowService,
    private entityTemplateService: EntityTemplateService,
    private gpt3Service: Gpt3Service,
    private toastr: ToastrService,
    private dialogFlowFunctions: Record<string, any>,
    private temporalDialogs: Array<EmbeddedComponentWithId>,
    private temporalDialogs2: Array<EmbeddedComponentWithId>,
    private addedPhotosToTheQr: boolean,
    private addedJokesToTheQr: boolean
  ) {}

  inject() {
    this.dialogs = [
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
          onActiveSlideCallback: (params) => {
            this.checkIfDialogIsNotEmpty('whoReceives', 'receiverName');
          },
          header: {
            styles: {
              fontSize: '23px',
              fontFamily: 'SfProBold',
              color: '#4F4F4F',
              marginTop: '0px',
              marginBottom: '18.5px',
            },
            text: '¿Quién recibirá el mensaje?',
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
                  'Escribe el nombre del receptor. Este nombre estara escrito en el sobre.',
                styles: {
                  border: 'none',
                  borderRadius: '9px',
                  boxShadow: 'rgb(210 210 210) 0px 4px 7px 0px inset',
                  display: 'block',
                  fontFamily: 'RobotoMedium',
                  fontSize: '17px',
                  minHeight: '188.58px',
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

              if (receiverName && receiverName.length > 0) {
                this.postsService.swiperConfig.allowSlideNext = true;
              } else {
                this.postsService.swiperConfig.allowSlideNext = false;
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
          onActiveSlideCallback: (params) => {
            this.checkIfDialogIsNotEmpty('whoSends', 'senderName');
          },
          header: {
            styles: {
              fontSize: '23px',
              fontFamily: 'SfProBold',
              color: '#4F4F4F',
              marginBottom: '12.5px',
              width: '75.60%',
              minWidth: '220px',
            },
            text: 'Departe de quién o quienes?',
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
                  'Este (os) nombres(s) estarán escritos debajo del mensaje.',
                styles: {
                  border: 'none',
                  borderRadius: '9px',
                  boxShadow: 'rgb(210 210 210) 0px 4px 7px 0px inset',
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
              const { fields, value, valid } = params;
              const { senderName } = value;

              console.log("valido", senderName && senderName.length > 0);

              if (senderName && senderName.length > 0) {
                this.postsService.swiperConfig.allowSlideNext = true;
              } else {
                this.postsService.swiperConfig.allowSlideNext = false;
              }

              console.log("Permite pasar", this.postsService.swiperConfig.allowSlideNext);

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
      // {
      //   component: GeneralDialogComponent,
      //   componentId: 'messageTypeDialog',
      //   inputs: {
      //     dialogId: 'messageTypeDialog',
      //     containerStyles: {
      //       background: 'rgb(255, 255, 255)',
      //       borderRadius: '12px',
      //       opacity: '1',
      //       padding: '37px 29.6px 13.2px 22px',
      //     },
      //     header: {
      //       styles: {
      //         fontSize: '21px',
      //         fontFamily: 'SfProBold',
      //         color: '#4F4F4F',
      //         marginBottom: '25px',
      //         marginTop: '0',
      //       },
      //       text: 'El mensaje',
      //     },
      //     fields: {
      //       styles: {
      //         // paddingTop: '20px',
      //       },
      //       list: [
      //         {
      //           name: 'messageType',
      //           value: '',
      //           validators: [Validators.required],
      //           type: 'selection',
      //           selection: {
      //             styles: {
      //               display: 'block',
      //               fontFamily: '"SfProRegular"',
      //               marginLeft: '10px',
      //             },
      //             list: [
      //               {
      //                 text: 'Quiero ver el draft de opciones de inteligencia artificial',
      //                 subText: {
      //                   text: 'EXPERIMENTAL, PUEDE TARDAR EN RESPONDER',
      //                   styles: {
      //                     color: '#91812f',
      //                     display: 'block',
      //                     fontFamily: '"SfProBold"',
      //                     fontSize: '13px',
      //                     marginLeft: '10px',
      //                   },
      //                 },
      //               },
      //               {
      //                 text: 'Lo escribire directo de mi cabeza.',
      //               },
      //             ],
      //           },

      //           prop: 'text',
      //         },
      //       ],
      //     },
      //     isMultiple: false,
      //   },
      //   outputs: [
      //     {
      //       name: 'data',
      //       callback: (params) => {
      //         const { value, fields, valid } = params;
      //         const { messageType } = value;
      //         let typeOfMessageValue = messageType[0];

      //         if (
      //           typeOfMessageValue
      //             .toLowerCase()
      //             .includes('inteligencia artificial')
      //         ) {
      //           typeOfMessageValue = 'AI';

      //           if (this.temporalDialogs2.length) {
      //             this.dialogs.splice(3, 0, ...this.temporalDialogs2);
      //             this.temporalDialogs2 = [];
      //           }

      //           if (this.dialogs.length === 7) {
      //             this.temporalDialogs2 = this.dialogs.splice(3, 2);
      //             this.dialogs.splice(3, 0, ...this.temporalDialogs);

      //             this.dialogFlowFunctions.moveToDialogByIndex(3);
      //           } else {
      //             this.temporalDialogs2 = this.dialogs.splice(3, 2);
      //             this.dialogFlowFunctions.moveToDialogByIndex(3);
      //           }

      //           this.dialogs[6].inputs.title =
      //             '¿Que es ' +
      //             this.dialogFlowService.dialogsFlows['flow1']['whoReceives']
      //               .fields.receiverName +
      //             '?';

      //           this.dialogs[7].inputs.title =
      //             'Más de ' +
      //             this.dialogFlowService.dialogsFlows['flow1']['whoReceives']
      //               .fields.receiverName;
      //         } else {
      //           typeOfMessageValue = 'Manual';

      //           if (this.temporalDialogs2.length) {
      //             this.dialogs.splice(3, 0, ...this.temporalDialogs2);
      //             this.temporalDialogs2 = [];
      //           }

      //           this.dialogFlowFunctions.moveToDialogByIndex(3);

      //           if (this.temporalDialogs.length !== 5)
      //             this.temporalDialogs = this.dialogs.splice(5, 5);

      //           setTimeout(() => {
      //             this.dialogFlowService.swiperConfig.allowSlideNext = false;
      //           }, 500);
      //         }

      //         this.dialogFlowService.saveGeneralDialogData(
      //           typeOfMessageValue,
      //           'flow1',
      //           'messageTypeDialog',
      //           'messageType',
      //           fields
      //         );
      //       },
      //     },
      //   ],
      // },
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
          onActiveSlideCallback: (params) => {
            this.checkIfDialogIsNotEmpty('messageDialog', 'messageTitle');
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
                  text: '',
                },
                placeholder: '¡Feliz cumpleaños!',
                styles: {
                  border: 'none',
                  borderRadius: '9px',
                  boxShadow: 'rgb(210 210 210) 0px 4px 7px 0px inset',
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
                this.postsService.swiperConfig.allowSlideNext = true;
              } else {
                this.postsService.swiperConfig.allowSlideNext = false;
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
          onActiveSlideCallback: (params) => {
            this.checkIfDialogIsNotEmpty('messageDialog', 'message');
          },
          header: {
            styles: {
              fontSize: '23px',
              fontFamily: 'SfProBold',
              marginBottom: '12.5px',
              marginTop: '0',
              color: '#4F4F4F',
              width: '50%',
              minWidth: '149px',
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
                  text: '',
                },
                placeholder: 'Te deseo un maravilloso día...',
                styles: {
                  border: 'none',
                  borderRadius: '9px',
                  boxShadow: 'rgb(210 210 210) 0px 4px 7px 0px inset',
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
                this.postsService.swiperConfig.allowSlideNext = true;
              } else {
                this.postsService.swiperConfig.allowSlideNext = false;
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
      // {
      //   component: OptionsGridComponent,
      //   componentId: 'motiveDialog',
      //   inputs: {
      //     dialogId: 'motiveDialog',
      //     flowId: 'flow1',
      //     mode: 'default',
      //     words: this.words,
      //     wordsObjects: this.motiveWordsObjects,
      //     title: this.title,
      //     containerStyles: {
      //       background: 'rgb(255, 255, 255)',
      //       borderRadius: '12px',
      //       opacity: '1',
      //       // padding: '37px 36.6px 70.4px 31px',
      //     },
      //   },
      //   outputs: [
      //     {
      //       name: 'optionClick',
      //       callback: (data: {
      //         text: string;
      //         keyword: string;
      //         wordsObjects: Array<{
      //           text: string;
      //           keyword: string;
      //           active: boolean;
      //         }>;
      //       }) => {
      //         const { text, keyword, wordsObjects } = data;

      //         this.motiveWordsObjects = wordsObjects;

      //         this.dialogFlowService.saveData(
      //           keyword,
      //           'flow1',
      //           'motiveDialog',
      //           'motive'
      //         );

      //         if (this.checkIfTheAIOptionsAreSelected() && keyword) {
      //           this.dialogs[
      //             this.dialogs.length - 3
      //           ].inputs.submitButton.styles.display = 'flex';
      //         } else if (!keyword) {
      //           this.dialogs[
      //             this.dialogs.length - 3
      //           ].inputs.submitButton.styles.display = 'none';
      //         }

      //         if (!keyword)
      //           this.dialogFlowService.swiperConfig.allowSlideNext = false;
      //         else this.dialogFlowService.swiperConfig.allowSlideNext = true;
      //       },
      //     },
      //   ],
      // },
      // {
      //   component: OptionsGridComponent,
      //   componentId: 'sentimentDialog',
      //   inputs: {
      //     dialogId: 'sentimentDialog',
      //     flowId: 'flow1',
      //     mode: 'default',
      //     words: this.words2,
      //     wordsObjects: this.sentimentWordsObjects,
      //     title: this.title2,
      //     containerStyles: {},
      //   },
      //   outputs: [
      //     {
      //       name: 'optionClick',
      //       callback: (data: {
      //         text: string;
      //         keyword: string;
      //         wordsObjects: Array<{
      //           text: string;
      //           keyword: string;
      //           active: boolean;
      //         }>;
      //       }) => {
      //         const { text, keyword, wordsObjects } = data;

      //         this.sentimentWordsObjects = wordsObjects;
      //         this.dialogFlowService.saveData(
      //           keyword,
      //           'flow1',
      //           'sentimentDialog',
      //           'sentiment'
      //         );

      //         if (this.checkIfTheAIOptionsAreSelected() && keyword) {
      //           this.dialogs[
      //             this.dialogs.length - 3
      //           ].inputs.submitButton.styles.display = 'flex';
      //         } else if (!keyword) {
      //           this.dialogs[
      //             this.dialogs.length - 3
      //           ].inputs.submitButton.styles.display = 'none';
      //         }

      //         if (!keyword)
      //           this.dialogFlowService.swiperConfig.allowSlideNext = false;
      //         else this.dialogFlowService.swiperConfig.allowSlideNext = true;
      //       },
      //     },
      //   ],
      // },
      // {
      //   component: OptionsGridComponent,
      //   componentId: 'timingDialog',
      //   inputs: {
      //     dialogId: 'timingDialog',
      //     flowId: 'flow1',
      //     mode: 'time',
      //     words: this.words3,
      //     wordsObjects: this.timingWordsObjects,
      //     title: this.title3,
      //     containerStyles: {
      //       opacity: '1',
      //     },
      //   },
      //   outputs: [
      //     {
      //       name: 'optionClick',
      //       callback: (data: {
      //         text: string;
      //         keyword: string;
      //         wordsObjects: Array<{
      //           text: string;
      //           keyword: string;
      //           active: boolean;
      //         }>;
      //       }) => {
      //         const { text, keyword, wordsObjects } = data;

      //         this.timingWordsObjects = wordsObjects;
      //         this.dialogFlowService.saveData(
      //           keyword,
      //           'flow1',
      //           'timingDialog',
      //           'timing'
      //         );

      //         if (this.checkIfTheAIOptionsAreSelected() && keyword) {
      //           this.dialogs[
      //             this.dialogs.length - 3
      //           ].inputs.submitButton.styles.display = 'flex';
      //         } else if (!keyword) {
      //           this.dialogs[
      //             this.dialogs.length - 3
      //           ].inputs.submitButton.styles.display = 'none';
      //         }

      //         if (!keyword)
      //           this.dialogFlowService.swiperConfig.allowSlideNext = false;
      //         else this.dialogFlowService.swiperConfig.allowSlideNext = true;
      //       },
      //     },
      //   ],
      // },
      // {
      //   component: OptionsGridComponent,
      //   componentId: 'recipientGenderDialog',
      //   inputs: {
      //     dialogId: 'recipientGenderDialog',
      //     flowId: 'flow1',
      //     mode: 'time',
      //     words: [
      //       { keyword: 'male', text: 'Hombre' },
      //       { keyword: 'female', text: 'Mujer' },
      //     ],
      //     wordsObjects: this.receiverGenderWordsObjects,
      //     title: '¿Que es RecipienteID?',
      //     titleCenter: false,
      //     containerStyles: {},
      //   },
      //   outputs: [
      //     {
      //       name: 'optionClick',
      //       callback: (data: {
      //         text: string;
      //         keyword: string;
      //         wordsObjects: Array<{
      //           text: string;
      //           keyword: string;
      //           active: boolean;
      //         }>;
      //       }) => {
      //         const { text, keyword, wordsObjects } = data;

      //         this.receiverGenderWordsObjects = wordsObjects;
      //         this.dialogFlowService.saveData(
      //           keyword,
      //           'flow1',
      //           'recipientGenderDialog',
      //           'recipientGender'
      //         );

      //         const targetDetailsIndex = this.dialogs.findIndex(
      //           (dialog) => dialog.componentId === 'receiverRelationshipDialog'
      //         );

      //         if (keyword === 'male') {
      //           this.dialogs[targetDetailsIndex].inputs.words = this.words4;
      //         } else if (keyword === 'female') {
      //           this.dialogs[targetDetailsIndex].inputs.words = this.words5;
      //         }

      //         this.dialogs[targetDetailsIndex].inputs.wordsObjects = [];
      //         for (const word of this.dialogs[targetDetailsIndex].inputs
      //           .words) {
      //           this.dialogs[targetDetailsIndex].inputs.wordsObjects.push({
      //             ...word,
      //             active: false,
      //           });
      //         }

      //         this.dialogs[targetDetailsIndex].shouldRerender = true;

      //         setTimeout(() => {
      //           this.dialogs[targetDetailsIndex].shouldRerender = false;
      //         }, 300);

      //         if (this.checkIfTheAIOptionsAreSelected() && keyword) {
      //           this.dialogs[
      //             this.dialogs.length - 3
      //           ].inputs.submitButton.styles.display = 'flex';
      //         } else if (!keyword) {
      //           this.dialogs[
      //             this.dialogs.length - 3
      //           ].inputs.submitButton.styles.display = 'none';
      //         }

      //         if (!keyword)
      //           this.dialogFlowService.swiperConfig.allowSlideNext = false;
      //         else this.dialogFlowService.swiperConfig.allowSlideNext = true;
      //       },
      //     },
      //   ],
      // },
      // {
      //   component: OptionsGridComponent,
      //   componentId: 'receiverRelationshipDialog',
      //   inputs: {
      //     dialogId: 'receiverRelationshipDialog',
      //     flowId: 'flow1',
      //     mode: 'default',
      //     words: this.words4,
      //     wordsObjects: this.receiverRelationshipWordsObjects,
      //     title: 'Más de RecipienteID',
      //     titleCenter: false,
      //     submitButton: {
      //       text: 'Generar mensajes',
      //       styles: {
      //         display: 'none',
      //         border: 'none',
      //         padding: '5px 20px',
      //         cursor: 'pointer',
      //         margin: 'auto',
      //         fontFamily: 'SfProBold',
      //         borderRadius: '6px',
      //         fontSize: '18px',
      //         marginTop: '1rem',
      //         backgroundColor: 'lightgreen',
      //       },
      //     },
      //     containerStyles: {
      //       background: 'rgb(255, 255, 255)',
      //     },
      //     onActiveSlideCallback: (params) => {
      //       this.dialogFlowService.swiperConfig.allowSlideNext = false;
      //     },
      //   },
      //   outputs: [
      //     {
      //       name: 'optionClick',
      //       callback: (data: {
      //         text: string;
      //         keyword: string;
      //         wordsObjects: Array<{
      //           text: string;
      //           keyword: string;
      //           active: boolean;
      //         }>;
      //       }) => {
      //         const { text, keyword, wordsObjects } = data;

      //         this.receiverRelationshipWordsObjects = wordsObjects;
      //         this.dialogFlowService.saveData(
      //           keyword,
      //           'flow1',
      //           'receiverRelationshipDialog',
      //           'receiverRelationship'
      //         );

      //         if (this.checkIfTheAIOptionsAreSelected() && keyword) {
      //           this.dialogs[
      //             this.dialogs.length - 3
      //           ].inputs.submitButton.styles.display = 'flex';
      //         } else if (!keyword) {
      //           this.dialogs[
      //             this.dialogs.length - 3
      //           ].inputs.submitButton.styles.display = 'none';
      //         }

      //         this.dialogFlowService.swiperConfig.allowSlideNext = false;
      //       },
      //     },
      //     {
      //       name: 'buttonClicked',
      //       callback: async (
      //         data: Array<{ text: string; keyword: string; active: boolean }>
      //       ) => {
      //         const motive =
      //           this.dialogFlowService.dialogsFlows['flow1'].motiveDialog.fields
      //             .motive;
      //         const sentiment =
      //           this.dialogFlowService.dialogsFlows['flow1'].sentimentDialog
      //             .fields.sentiment;
      //         const timing =
      //           this.dialogFlowService.dialogsFlows['flow1'].timingDialog.fields
      //             .timing;
      //         const recipientGender =
      //           this.dialogFlowService.dialogsFlows['flow1']
      //             .recipientGenderDialog.fields.recipientGender;
      //         const receiverRelationship =
      //           this.dialogFlowService.dialogsFlows['flow1']
      //             .receiverRelationshipDialog.fields.receiverRelationship;

      //         lockUI();

      //         try {
      //           const response =
      //             await this.gpt3Service.generateResponseForTemplate(
      //               {
      //                 motive,
      //                 target: receiverRelationship,
      //                 sentiment,
      //                 timing,
      //               },
      //               '63e0306165c8752d0c5f0345'
      //             );

      //           const options = JSON.parse(response).map((option) => ({
      //             title: option.titulo,
      //             message: option.mensaje,
      //           }));

      //           this.postsService.postMessageOptions = options;

      //           localStorage.setItem(
      //             'temporal-post-options',
      //             JSON.stringify(options)
      //           );

      //           this.postsService.temporalDialogs = this.temporalDialogs;
      //           this.postsService.temporalDialogs2 = this.temporalDialogs2;
      //           this.postsService.dialogs = this.dialogs;

      //           this.router.navigate(
      //             [
      //               'ecommerce/' +
      //                 this.headerService.saleflow.merchant.slug +
      //                 '/text-edition-and-preview',
      //             ],
      //             {
      //               queryParams: {
      //                 type: 'post',
      //               },
      //             }
      //           );

      //           this.postsService.temporalDialogs = this.temporalDialogs;
      //           this.postsService.temporalDialogs2 = this.temporalDialogs2;
      //           this.postsService.dialogs = this.dialogs;
      //           this.headerService.flowRoute =
      //             this.router.url + '?startOnDialogFlow=true';
      //           localStorage.setItem('flowRoute', this.headerService.flowRoute);

      //           unlockUI();
      //         } catch (error) {
      //           this.dialogFlowService.swiperConfig.allowSlideNext = false;
      //           unlockUI();

      //           console.error(error);

      //           this.toastr.error(
      //             'Ocurrió un error, vuelva a intentar',
      //             'error',
      //             {
      //               timeOut: 1500,
      //             }
      //           );
      //         }
      //       },
      //     },
      //   ],
      // },
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
          onActiveSlideCallback: (params) => {
            this.checkIfDialogIsNotEmpty('wantToAddQrDialog', 'wantToAddQr');
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
                        text: 'Incluyes fotos, memes, videos o música.',
                        // text: 'Incluyes fotos, memes, videos, música o chistes de la Inteligencia Artificial.',
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
                this.postsService.swiperConfig.allowSlideNext = true;
                if (
                  this.dialogs[this.dialogs.length - 2].componentId !==
                  'whatsappNumberDialog'
                ) {
                  this.dialogFlowService.dialogsFlows['flow1'][
                    'whatsappNumberDialog'
                  ] = {
                    dialogId: 'whatsappNumberDialog',
                    fields: {},
                    swiperConfig: this.dialogFlowService.swiperConfig,
                  };
                  this.insertedRecipientDialog = true;

                  this.dialogs.splice(
                    this.dialogs.length - 1,
                    0,
                    this.recipientPhoneDialog
                  );
                }

                setTimeout(() => {
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
                    // {
                    //   text: 'Un chiste de la IA',
                    // },
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

              if (qrContentSelection.includes('No')) {
                return this.router.navigate([
                  'ecommerce/' +
                    this.headerService.saleflow.merchant.slug +
                    '/post-edition',
                ]);
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

                this.postsService.temporalDialogs = this.temporalDialogs;
                this.postsService.temporalDialogs2 = this.temporalDialogs2;
                this.postsService.dialogs = this.dialogs;

                this.router.navigate(
                  [
                    'ecommerce/' +
                      this.headerService.saleflow.merchant.slug +
                      '/qr-edit',
                  ]
                  // {
                  //   queryParams: {
                  //     returnTo: 'checkout',
                  //   },
                  // }
                );
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

                try {
                  const response =
                    await this.gpt3Service.generateResponseForTemplate(
                      {},
                      '63ec85e366995b47742d2891',
                      null
                    );

                  unlockUI();

                  if (response) {
                    const jokes = JSON.parse(response);
                    this.headerService.aiJokes = jokes;
                    localStorage.setItem('aiJokes', response);
                  }

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
                        returnTo: 'checkout',
                      },
                    }
                  );
                } catch (error) {
                  unlockUI();

                  console.error(error);

                  this.toastr.error(
                    'Ocurrió un error, vuelva a intentar',
                    'error',
                    {
                      timeOut: 1500,
                    }
                  );
                }
              }
            },
          },
        ],
      },
    ];

    return this.dialogs;
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

  checkIfDialogIsNotEmpty = (dialogId: string, fieldName: string) => {
    const questionDialog =
      this.dialogFlowService.dialogsFlows['flow1'][dialogId];

    if (
      questionDialog?.fields &&
      questionDialog?.fields[fieldName] &&
      questionDialog?.fields[fieldName].length
    ) {
      this.postsService.swiperConfig.allowSlideNext = true;
    } else {
      setTimeout(() => {
        this.postsService.swiperConfig.allowSlideNext = false;
      });
    }
  };
}
