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
  dialogs: Array<EmbeddedComponent> = [
    {
      component: GeneralDialogComponent,
      inputs: {
        containerStyles: {
          padding: '10px 20px 10px 12px',
          background: '#fff',
          borderRadius: '8px'
        },
        header: {
          styles: {
            fontSize: '22px',
            fontFamily: 'SfProBold',
          },
          text: 'Quien recibira'
        },
        fields:{
          styles: {
            
          },
          list: [
            {
              name: 'test',
              value:'',
              validators: [
                Validators.required
              ],
              type:'textarea',
              label:{
                styles:{
                  display: 'block',
                  fontSize: '19px',
                  fontFamily: '"SfProRegular"',
                  margin: '10px 0px'
                },
                text:''
              },
              placeholder: 'Escribe para quien es. Este nombre estara escrito en el sobre.',
              styles:{
                display: 'block',
                fontFamily: 'SfProRegular',
                fontSize: '17px',
                padding: '22px 20px',
                minHeight: '130px',
                resize: 'none',
                width: '100%',
                borderRadius: '20px',
                border: 'none',
                boxShadow: '0px 0px 10px 0px #a9a9a9 inset'
              }
            },
            {
              name: 'tester',
              value:'',
              validators: [
                Validators.required
              ],
              type:'textarea',
              label:{
                styles:{
                  display: 'block',
                  fontSize: '19px',
                  fontFamily: '"SfProRegular"',
                  margin: '10px 0px'
                },
                text:''
              },
              placeholder: 'Escribe para quien es. Este nombre estara escrito en el sobre.',
              styles:{
                display: 'block',
                fontFamily: 'SfProRegular',
                fontSize: '17px',
                padding: '22px 20px',
                minHeight: '130px',
                resize: 'none',
                width: '100%',
                borderRadius: '20px',
                border: 'none',
                boxShadow: '0px 0px 10px 0px #a9a9a9 inset'
              }
            }
          ]
        },
        isMultiple: true
      },
      outputs: [
        {
          name: 'data',
          callback: (value) => {
            this.swiperConfig.allowSlideNext = true;
          },
        },
      ],
    },
    {
      component: GeneralDialogComponent,
      inputs: {
        containerStyles: {
          padding: '10px 20px 10px 12px',
          background: '#fff',
          borderRadius: '8px'
        },
        header: {
          styles: {
            fontSize: '22px',
            fontFamily: 'SfProBold',
          },
          text: 'Departe de quien o quienes?'
        },
        fields:{
          styles: {

          },
          list: [
            {
              name: 'test2',
              value:'',
              validators: [
                Validators.required
              ],
              type:'textarea',
              label:{
                styles:{
                  display: 'block',
                  fontSize: '19px',
                  fontFamily: '"SfProRegular"',
                  margin: '10px 0px'
                },
                text:''
              },
              placeholder: 'Este (os) nombres (s) estaran escritos debajo del mensaje.',
              styles:{
                display: 'block',
                fontFamily: 'SfProRegular',
                fontSize: '17px',
                padding: '22px 20px',
                minHeight: '130px',
                resize: 'none',
                width: '100%',
                borderRadius: '20px',
                border: 'none',
                boxShadow: '0px 0px 10px 0px #a9a9a9 inset'
              }
            }
          ]
        },
      },
    },
    {
      component: GeneralDialogComponent,
      inputs: {
        containerStyles: {
          padding: '10px 20px 10px 12px',
          background: '#fff',
          borderRadius: '8px'
        },
        header: {
          styles: {
            fontSize: '22px',
            fontFamily: 'SfProBold',
          },
          text: 'El mensaje'
        },
        fields:{
          styles: {

          },
          list: [
            {
              name: 'test3',
              value:'',
              validators: [
                Validators.required
              ],
              type:'selection',
              selection:{
                styles: {
                  display: 'block',
                  fontFamily: '"SfProRegular"'
                },
                list:[
                  {
                    text:'Quiero ver el draft de opciones de inteligencia artificial',
                    subText: {
                      text: 'TRY IT. FREE.HOT FEATURE',
                      styles: {
                        color: '#91812f',
                        display: 'block',
                        fontFamily: '"SfProBold"'
                      }
                    }
                  },
                  {
                    text:'Lo escribire directo de mi cabeza.'
                  }
                ],
              },
              styles: {
                padding: '12px 10px'
              },
              prop: 'text'
            }
          ]
        },
        isMultiple: true,
      },
    },
    {
      component: GeneralDialogComponent,
      inputs: {
        containerStyles: {
          padding: '10px 20px 10px 12px',
          background: '#fff',
          borderRadius: '8px'
        },
        header: {
          styles: {
            fontSize: '22px',
            fontFamily: 'SfProBold',
          },
          text: 'Que mensaje escribiremos?'
        },
        fields:{
          styles: {

          },
          list: [
            {
              name: 'test4',
              value:'',
              validators: [
                Validators.required
              ],
              type:'textarea',
              label:{
                styles:{
                  display: 'block',
                  fontSize: '19px',
                  fontFamily: '"SfProRegular"',
                  margin: '10px 0px'
                },
                text:''
              },
              placeholder: 'Escribe para quien es. Este nombre estara escrito en el sobre.',
              styles:{
                display: 'block',
                fontFamily: 'SfProRegular',
                fontSize: '17px',
                padding: '22px 20px',
                minHeight: '130px',
                resize: 'none',
                width: '100%',
                borderRadius: '20px',
                border: 'none',
                boxShadow: '0px 0px 10px 0px #a9a9a9 inset'
              }
            },
            {
              name: 'test5',
              value:'',
              validators: [
              ],
              type:'checkbox',
              label:{
                styles:{
                  display: 'block',
                  fontSize: '19px',
                  fontFamily: '"SfProRegular"',
                  margin: '10px 0px'
                },
                text:'Privado'
              },
              placeholder: 'tester',
              disclaimer: {
                text: 'Quien Recibira ID escaneara un qrCode y le llegara el acceso a su Whatsapp',
                styles: {
                  
                }
              },
              stylesGrid:{
                display: 'grid',
                gap: '14px',
                gridTemplateColumns: '1fr 11fr',
                padding: '10px 5px',
                alignItems: 'center'
              },
              styles: {
                height: '17px'
              }
            }
          ]
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
          padding: '10px 20px 10px 12px',
          background: '#fff',
          borderRadius: '8px'
        },
        header: {
          styles: {
            fontSize: '22px',
            fontFamily: 'SfProBold',
          },
          text: 'Que mensaje escribiremos?'
        },
        fields:{
          styles: {

          },
          list: [
            {
              name: 'test6',
              value:'',
              validators: [
                Validators.required
              ],
              type:'text',
              label:{
                styles:{
                  display: 'block',
                  fontSize: '19px',
                  fontFamily: '"SfProRegular"',
                  margin: '10px 0px'
                },
                text:'Cual es el Whatsapp de QuienRecibiraID?'
              },
              placeholder: 'Escribe..',
              styles: {
                width: '100%',
                padding: '20px 20px',
                border: 'none',
                boxShadow: '0px 4px 10px 0px #bfbfbf inset',
                borderRadius: '10px',
                fontFamily: '"SfProRegular"'
              }
            },
            {
              name: 'test7',
              value:'',
              validators: [
              ],
              type:'checkbox',
              label:{
                styles:{
                  display: 'block',
                  fontSize: '19px',
                  fontFamily: '"SfProRegular"',
                  margin: '10px 0px'
                },
                text:'Quiero incluir fotos, videos, musica.'
              },
              placeholder: 'tester',
              disclaimer: {
                text: 'Son como los Stories pero no hay que bajar ningun App.',
                styles: {
                  
                }
              },
              stylesGrid:{
                display: 'grid',
                gap: '14px',
                gridTemplateColumns: '1fr 11fr',
                padding: '10px 5px',
                alignItems: 'center'
              },
              styles: {
                height: '17px'
              }
            }
          ]
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
  ];


  constructor(
    private dialog: DialogService,
    private itemsService: ItemsService,
    private merchantService: MerchantsService,
    private saleflowService: SaleFlowService
  ) {}

  async ngOnInit() {}
}
