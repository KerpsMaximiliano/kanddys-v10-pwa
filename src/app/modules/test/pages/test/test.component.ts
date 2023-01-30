import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { CustomFieldsComponent } from 'src/app/shared/dialogs/custom-fields/custom-fields.component';
import { MagicLinkDialogComponent } from 'src/app/shared/components/magic-link-dialog/magic-link-dialog.component';
import { CollaborationsComponent } from 'src/app/shared/dialogs/collaborations/collaborations.component';
import { StoreShareComponent } from 'src/app/shared/dialogs/store-share/store-share.component';
import {
  ItemDashboardOptionsComponent,
  DashboardOption,
} from 'src/app/shared/dialogs/item-dashboard-options/item-dashboard-options.component';
import { GeneralFormSubmissionDialogComponent } from 'src/app/shared/dialogs/general-form-submission-dialog/general-form-submission-dialog.component';
import { Questions } from '../../../../shared/components/form-questions/form-questions.component';
import { Tag } from '../../../../core/models/tags';
import { StoreShareList } from '../../../../shared/dialogs/store-share/store-share.component';
import { ReloadComponent } from 'src/app/shared/dialogs/reload/reload.component';
import { FormStep, FormField } from 'src/app/core/types/multistep-form';
import { FormControl, Validators } from '@angular/forms';
import { SettingsComponent } from 'src/app/shared/dialogs/settings/settings.component';
import { InputTransparentComponent } from 'src/app/shared/dialogs/input-transparent/input-transparent.component';
import { MediaDialogComponent } from 'src/app/shared/dialogs/media-dialog/media-dialog.component';
import { ItemsService } from 'src/app/core/services/items.service';
import { ItemInput } from 'src/app/core/models/item';
import { base64ToFile } from 'src/app/core/helpers/files.helpers';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { Merchant } from 'src/app/core/models/merchant';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import { EmbeddedComponentWithId } from 'src/app/core/types/multistep-form';
import { BlankComponent } from 'src/app/shared/dialogs/blank/blank.component';
import { SwiperOptions } from 'swiper';
import { GeneralDialogComponent } from 'src/app/shared/components/general-dialog/general-dialog.component';
import { PostInput } from 'src/app/core/models/post';
import { EntityTemplateInput } from 'src/app/core/models/entity-template';
import { DialogFlowService } from 'src/app/core/services/dialog-flow.service';
import { Router } from '@angular/router';
import { PostsService } from 'src/app/core/services/posts.service';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { HeaderService } from 'src/app/core/services/header.service';
import { AnexoLandingComponent } from 'src/app/shared/components/anexo-landing/anexo-landing.component';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
})
export class TestComponent implements OnInit {
  @ViewChild('dialogSwiper') dialogSwiper: SwiperComponent;

  openedDialogFlow: boolean = false;
  swiperConfig: SwiperOptions = null;
  @Input() status: 'OPEN' | 'CLOSE' = 'CLOSE';
  dialogFlowFunctions: Record<string, any> = {};
  temporalPost: PostInput = null;
  temporalEntityTemplate: EntityTemplateInput = null;

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

  dialogs: Array<EmbeddedComponentWithId> = [
    {
      component: GeneralDialogComponent,
      componentId: 'componentSelector',
      inputs: {
        containerStyles: {
          background: 'rgb(255, 255, 255)',
          borderRadius: '8px',
          opacity: '1',
          padding: '37px 36.6px 58.9px 31px',
        },
        header: {
          styles: {
            fontSize: '21px',
            fontFamily: 'SfProBold',
            marginBottom: '21.2px',
            marginTop: '0',
            color: '#4F4F4F',
          },
          text: 'Component',
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
              name: 'componentData',
              value: '',
              validators: [Validators.required],
              type: 'component',
              component: AnexoLandingComponent,
              shouldRerender: true,
              inputs: [],
              outputs: [],
              // styles: {},
              prop: 'src',
            },
          ],
        },
        isMultipleImages: true,
      },
      outputs: [
        {
          name: 'data',
          callback: (params) => {
            this.swiperConfig.allowSlideNext = true;
          },
        },
      ],
    },
    {
      component: GeneralDialogComponent,
      componentId: 'imagesSelector',
      inputs: {
        containerStyles: {
          background: 'rgb(255, 255, 255)',
          borderRadius: '8px',
          opacity: '1',
          padding: '37px 36.6px 58.9px 31px',
        },
        header: {
          styles: {
            fontSize: '21px',
            fontFamily: 'SfProBold',
            marginBottom: '21.2px',
            marginTop: '0',
            color: '#4F4F4F',
          },
          text: 'Id?',
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
              name: 'imagesData',
              value: '',
              validators: [Validators.required],
              type: 'images',
              selection: {
                styles: {
                  display: 'block',
                  fontFamily: '"SfProBold"',
                  fontSize: '17px',
                  color: '#272727',
                  marginLeft: '19.5px',
                },
                list: [
                  {src: 'https://m.media-amazon.com/images/M/MV5BZGUzYTI3M2EtZmM0Yy00NGUyLWI4ODEtN2Q3ZGJlYzhhZjU3XkEyXkFqcGdeQXVyNTM0OTY1OQ@@._V1_.jpg'},
                  {src: 'https://i0.wp.com/codigoespagueti.com/wp-content/uploads/2022/10/The-Last-of-Us-Part-II-prepara-multijugador-free-to-play-segun-rumores.jpg?fit=1280%2C720&quality=80&ssl=1'},
                  {src: 'https://i.insider.com/63c08e6933ffb700180f8ce8?width=700'},
                ],
              },
              // styles: {},
              prop: 'src',
            },
          ],
        },
        isMultipleImages: true,
      },
      outputs: [
        {
          name: 'data',
          callback: (params) => {
            const { fields, value, valid } = params;
            const { imagesData } = value;
            if (valid) {
              this.swiperConfig.allowSlideNext = true;
            } else {
              this.swiperConfig.allowSlideNext = false;
            }

            this.dialogFlowService.saveGeneralDialogData(
              imagesData,
              'flow1',
              'imagesSelector',
              'imagesData',
              fields
            );
          },
        },
      ],
    },
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

              if (this.dialogs.length === 4) {
                this.dialogs = this.dialogs.concat(this.temporalDialogs);
              }

              this.dialogFlowFunctions.moveToDialogByIndex(4);
            } else {
              typeOfMessageValue = 'Manual';
              this.dialogFlowFunctions.moveToDialogByIndex(3);

              this.temporalDialogs = this.dialogs.splice(4);

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
            width: '50%',
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
            const { message } = value;
            let messageValue = message;

            console.log(params);

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
            {
              name: 'privatePost',
              value: '',
              validators: [],
              type: 'checkbox',
              label: {
                styles: {
                  display: 'block',
                  fontSize: '20px',
                  fontFamily: '"RobotoMedium"',
                  margin: '9px 0px',
                },
                text: 'Privado',
              },
              placeholder: 'tester',
              disclaimer: {
                text: 'Quien Recibira ID escaneara un qrCode y le llegara el acceso a su Whatsapp',
                styles: {
                  fontFamily: '"SfProLight"',
                  paddingLeft: '43px',
                  marginTop: '0px',
                  color: '#7b7b7b',
                  fontStyle: 'italic',
                },
              },
              stylesGrid: {
                alignItems: 'center',
                display: 'grid',
                gap: '8px',
                gridTemplateColumns: '1fr 11fr',
                padding: '30.9px 5px 0px',
              },
              styles: {
                height: '17px',
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
            const { message, privatePost } = value;
            let messageValue = message;

            if (messageValue && messageValue.length > 0) {
              this.swiperConfig.allowSlideNext = true;
            } else {
              this.swiperConfig.allowSlideNext = false;
            }

            this.dialogFlowService.saveGeneralDialogData(
              privatePost,
              'flow1',
              'messageDialog',
              'privatePost',
              fields
            );

            this.dialogFlowService.saveGeneralDialogData(
              messageValue,
              'flow1',
              'messageDialog',
              'message',
              fields
            );
          },
        },
      ],
    },
    /*
    {
      component: GeneralDialogComponent,
      inputs: {
        containerStyles: {
          background: 'rgb(255, 255, 255)',
          borderRadius: '8px',
          opacity: '1',
          padding: '37px 36.6px 25px 31px',
        },
        header: {
          styles: {
            fontSize: '21px',
            fontFamily: 'SfProBold',
            marginBottom: '12.5px',
            marginTop: '0',
            color: '#FC2727',
          },
          text: '¿Quieres  agregar algo más?',
        },
        fields: {
          list: [
            {
              name: 'test9',
              value: '',
              validators: [Validators.required],
              type: 'text',
              label: {
                styles: {
                  display: 'block',
                  fontSize: '15px',
                  fontFamily: '"SFProLight"',
                  margin: '0',
                  color: '#7B7B7B',
                },
                text: 'Es privado. Opcional: te notifican al escanearlo.',
              },
            },

            {
              name: 'test8',
              value: '',
              validators: [Validators.required],
              type: 'selection',
              selection: {
                styles: {
                  display: 'block',
                  fontFamily: '"SfProBold"',
                  fontSize: '17px',
                  color: '#272727',
                },
                list: [
                  {
                    text: 'Si',
                    subText: {
                      text: 'Incluyes fotos, memes, videos, música o chistes de la Inteligencia Artificial.',
                      text2: 'No hay que bajar ningún app',
                      styles: {
                        color: '#7B7B7B',
                        display: 'block',
                        fontFamily: '"SfProRegular"',
                        fontStyle: 'italic',
                        fontSize: '15px',
                        marginBottom: '15px',
                        marginTop: '5px',
                        paddingRight: '15px',
                      },
                    },
                  },
                  {
                    text: 'Si, el Giftcard de los Spas',
                    subText: {
                      text: 'Válido en mas de 40 Spas de Santo Domingo.',
                      styles: {
                        color: '#7B7B7B',
                        display: 'block',
                        fontFamily: '"SfProRegular"',
                        fontStyle: 'italic',
                        fontSize: '15px',
                        marginBottom: '15px',
                        marginTop: '5px',
                        paddingRight: '50px',
                      },
                    },
                  },
                ],
              },
              styles: {},
              prop: 'text',
            },
          ],
        },
        isMultiple: true,
      },
      outputs: [
        {
          name: 'threeClicksDetected',
          callback: (timeOfDay) => {
            this.swiperConfig.allowSlideNext = true;
          },
        },
      ],
    },*/
    {
      component: GeneralDialogComponent,
      componentId: 'wantToAddQr',
      inputs: {
        containerStyles: {
          background: 'rgb(255, 255, 255)',
          borderRadius: '8px',
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
              name: 'test8',
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
        isMultiple: true,
      },
      outputs: [
        {
          name: 'threeClicksDetected',
          callback: (timeOfDay) => {
            this.swiperConfig.allowSlideNext = true;
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
          borderRadius: '8px',
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
              name: 'test8',
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
                    text: 'Un chiste de la IA',
                  },
                  {
                    text: 'Fotos, videos de mi device',
                  },
                  {
                    text: 'Imagen de la IA',
                  },
                  {
                    text: 'Una canción o voice',
                  },
                  {
                    text: 'Si, el Giftcard de los Spas',
                    barStyle: {
                      display: 'inline-block',
                      background: '#FC2727',
                      width: ' 100%',
                      height: ' 100%',
                      borderRadius: '4px',
                    },
                    subText: {
                      text: 'Válido en más de 40 Spas de Santo Domingo.',
                      styles: {
                        color: '#FC2727',
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
          name: 'threeClicksDetected',
          callback: (timeOfDay) => {
            this.swiperConfig.allowSlideNext = true;
          },
        },
      ],
    },
  ];

  joke: string = '';

  constructor(
    private dialogFlowService: DialogFlowService,
    private postsService: PostsService,
    private headerService: HeaderService,
    private router: Router
  ) {}

  async ngOnInit() {}
}
