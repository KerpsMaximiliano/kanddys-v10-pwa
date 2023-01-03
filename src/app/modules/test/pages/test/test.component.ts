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
import { EmbeddedComponent } from 'src/app/core/types/multistep-form';
import { BlankComponent } from 'src/app/shared/dialogs/blank/blank.component';
import { SwiperOptions } from 'swiper';
import { GeneralDialogComponent } from 'src/app/shared/components/general-dialog/general-dialog.component';

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

  title = '¿Cuál(es) seria el motivo?';
  title2 = '¿Que emoción(es) quieres transmitir con el mensaje?';
  title3 = '¿El tiempo del motivo?';

  words = [
    'Bodas',
    'Bautizos',
    'Navidad',
    'Madres',
    'Padres',
    'New Born',
    'Cumpleaños',
    'Aniversarios',
    'Condolencias',
    'Boda de Oro',
    'San Valentín',
    'Boda de Plata',
    'Comuniones',
    'Día del Maestro',
    'Promoción',
    'Día de la Madre',
    'Dia del Trabajador',
    'Graduación',
    'Dia de Santo',
    'Día de la madre Soltera',
    'Día de la Madrina',
    'Mostrar Afecto',
  ];

  words2 = [
    'Alegría',
    'Tristeza',
    'Euforia',
    'Sorpresa',
    'Amor',
    'Sutil',
    'Melancolía',
    'Preocupación',
    'Gratitud',
    'Pasión',
    'Apoyo',
    'Esperanza',
    'Satisfacción',
    'Aceptación',
    'Curiosidad',
    'Devoción',
    'Orgullo',
    'Paz',
    'Compasión',
    'Vergüenza',
    'Optimismo',
    'Resentimiento',
  ];

  words3 = ['Ya pasó', 'Pasará', 'Es cuando reciba el mensaje'];

  dialogs: Array<EmbeddedComponent> = [
    {
      component: GeneralDialogComponent,
      inputs: {
        containerStyles: {
          background: 'rgb(255, 255, 255)',
          borderRadius: '12px',
          opacity: '1',
          padding: '37px 20px 38.5px 12px',
          paddingLeft: '31px',
          paddingRight: '30.3px',
          paddingBottom: '34.6px',
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
              name: 'test',
              value: '',
              validators: [Validators.required],
              type: 'textarea',
              label: {
                styles: {
                  display: 'block',
                  fontSize: '17px',
                  fontFamily: '"SFProRegular"',
                  // color: '#A1A1A1',
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
          callback: (value) => {
            this.swiperConfig.allowSlideNext = true;
          },
        },
      ],
      postLabel: 'El mensaje incluirá un qrCode para ver el Story.'
    },
    {
      component: GeneralDialogComponent,
      inputs: {
        containerStyles: {
          background: 'rgb(255, 255, 255)',
          borderRadius: '12px',
          opacity: '1',
          padding: '37px 20px 38.5px 12px',
          paddingLeft: '31px',
          paddingRight: '30.3px',
          paddingBottom: '34.6px',
        },
        header: {
          styles: {
            fontSize: '22px',
            fontFamily: 'SfProBold',
          },
          text: 'Departe de quien o quienes?',
        },
        fields: {
          styles: {},
          list: [
            {
              name: 'test2',
              value: '',
              validators: [Validators.required],
              type: 'textarea',
              label: {
                styles: {
                  display: 'block',
                  fontSize: '19px',
                  fontFamily: '"SfProRegular"',
                  margin: '10px 0px',
                },
                text: '',
              },
              placeholder:
                'Este (os) nombres (s) estaran escritos debajo del mensaje.',
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
            },
          ],
        },
      },
      postLabel: 'Mensajito de prueba que se ve despues de pasar el 2do dialog.'
    },
    {
      component: GeneralDialogComponent,
      inputs: {
        containerStyles: {
          background: 'rgb(255, 255, 255)',
          borderRadius: '8px',
          opacity: '1',
          padding: '37px 55.6px 23.6px 22px',
        },
        header: {
          styles: {
            fontSize: '21px',
            fontFamily: 'SfProBold',
            color: '#4F4F4F',
            margin: '0',
          },
          text: 'El mensaje',
        },
        fields: {
          styles: {
            paddingTop: '20px',
          },
          list: [
            {
              name: 'test3',
              value: '',
              validators: [Validators.required],
              type: 'selection',
              selection: {
                styles: {
                  display: 'block',
                  fontFamily: '"SfProRegular"',
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
                      },
                    },
                  },
                  {
                    text: 'Lo escribire directo de mi cabeza.',
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
    },
    {
      component: GeneralDialogComponent,
      inputs: {
        containerStyles: {
          background: 'rgb(255, 255, 255)',
          borderRadius: '8px',
          opacity: '1',
          padding: '37.1px 31px 30px 31px',
        },
        header: {
          styles: {
            fontSize: '23px',
            fontFamily: 'SfProBold',
            marginBottom: '12.5px',
            marginTop: '0',
          },
          text: 'Que mensaje escribiremos?',
        },
        fields: {
          styles: {},
          list: [
            {
              name: 'test4',
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
            },
            {
              name: 'test5',
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
                padding: '30px 5px 0px',
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
          name: 'threeClicksDetected',
          callback: (timeOfDay) => {
            this.swiperConfig.allowSlideNext = true;
          },
        },
      ],
    },
    {
      component: GeneralDialogComponent,
      inputs: {
        containerStyles: {
          background: 'rgb(255, 255, 255)',
          borderRadius: '8px',
          opacity: '1',
          padding: '37.1px 23.6px 56.6px 31px',
        },
        header: {
          styles: {
            fontSize: '22px',
            fontFamily: 'SfProBold',
            marginBottom: '12.5px',
            marginTop: '0',
          },
          text: 'Cual es el Whatsapp de QuienRecibiraID?',
        },
        fields: {
          styles: {},
          list: [
            {
              name: 'test6',
              value: '',
              validators: [Validators.required],
              type: 'text',
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
                borderRadius: '10px',
                fontFamily: '"RobotoMedium"',
              },
            },
            // {
            //   name: 'test7',
            //   value: '',
            //   validators: [],
            //   type: 'checkbox',
            //   label: {
            //     styles: {
            //       display: 'block',
            //       fontSize: '19px',
            //       fontFamily: '"SfProRegular"',
            //       margin: '10px 0px',
            //     },
            //     text: 'Quiero incluir fotos, videos, musica.',
            //   },
            //   placeholder: 'tester',
            //   disclaimer: {
            //     text: 'Son como los Stories pero no hay que bajar ningun App.',
            //     styles: {
            //       fontFamily: '"SfProLight"',
            //       paddingLeft: '43px',
            //       marginTop: '0px',
            //       color: '#7b7b7b',
            //     },
            //   },
            //   stylesGrid: {
            //     alignItems: 'center',
            //     display: 'grid',
            //     gap: '8px',
            //     gridTemplateColumns: '1fr 11fr',
            //     padding: '10px 5px 0px',
            //     paddingTop: '30.9px',
            //   },
            //   styles: {
            //     height: '17px',
            //   },
            // },
          ],
        },
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
            // {
            //   name: 'test9',
            //   value: '',
            //   validators: [Validators.required],
            //   type: 'text',
            //   label: {
            //     styles: {
            //       display: 'block',
            //       fontSize: '15px',
            //       fontFamily: '"SFProLight"',
            //       margin: '0',
            //       color: '#7B7B7B',
            //     },
            //     text: 'Es privado. Opcional: te notifican al escanearlo.',
            //   },
            // },

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
      inputs: {
        containerStyles: {
          background: 'rgb(255, 255, 255)',
          borderRadius: '8px',
          opacity: '1',
          padding: '37px 36.6px 70.4px 31px',
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
                },
                list: [
                  {
                    text: 'Si',
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
  ];

  constructor(
    private dialog: DialogService,
    private itemsService: ItemsService,
    private merchantService: MerchantsService,
    private saleflowService: SaleFlowService
  ) {}

  async ngOnInit() {}
}
