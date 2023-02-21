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
import { Item, ItemInput } from 'src/app/core/models/item';
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
import { DescriptionDialogComponent } from 'src/app/shared/dialogs/description-dialog/description-dialog.component';
import { environment } from 'src/environments/environment';
import { WebformQuestionDialogComponent } from 'src/app/shared/components/webform-question-dialog/webform-question-dialog.component';

const generalDialogContainerStyles = {
  background: 'rgb(255, 255, 255)',
  borderRadius: '12px',
  opacity: '1',
  padding: '37px 29.6px 13.2px 22px',
};

const generalDialogHeaderStyles = {
  fontSize: '21px',
  fontFamily: 'SfProBold',
  color: '#4F4F4F',
  marginBottom: '25px',
  marginTop: '0',
};

const selectionStyles = {
  display: 'block',
  fontFamily: '"SfProRegular"',
  marginLeft: '10px',
};

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
})
export class TestComponent implements OnInit {
  @ViewChild('dialogSwiper') dialogSwiper: SwiperComponent;
  env: string = environment.assetsUrl;
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
      component: DescriptionDialogComponent,
      componentId: 'welcome',
      inputs: {},
      outputs: []
    },
    {
      component: WebformQuestionDialogComponent,
      componentId: 'question',
      inputs: {},
      outputs: []
    },
    {
      component: GeneralDialogComponent,
      componentId: 'answerType',
      inputs: {
        dialogId: 'messageTypeDialog',
        containerStyles: generalDialogContainerStyles,
        header: {
          styles: generalDialogHeaderStyles,
          text: '¿Como responderán?',
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
                styles: selectionStyles,
                list: [
                  {
                    text: 'Escribiendo libremente',
                  },
                  {
                    text: 'Seleccionando entre opciones',
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
          },
        },
      ],
    },
    {
      component: GeneralDialogComponent,
      componentId: 'answerType',
      inputs: {
        dialogId: 'messageTypeDialog',
        containerStyles: generalDialogContainerStyles,
        header: {
          styles: generalDialogHeaderStyles,
          text: '¿Añadirás otra pregunta?',
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
                styles: selectionStyles,
                list: [
                  {
                    text: 'Si',
                  },
                  {
                    text: 'No',
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
    private router: Router,
    private dialog: DialogService
  ) {}

  async ngOnInit() {}

  openDescriptionDialog() {
    this.dialog.open(DescriptionDialogComponent, {
      type: 'centralized-fullscreen',
      flags: ['no-header'],
      customClass: 'app-dialog',
    });
  }
}
