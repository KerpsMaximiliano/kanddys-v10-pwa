import { Component, OnInit } from '@angular/core';
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
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';
import { SetConfigComponent } from 'src/app/shared/dialogs/set-config/set-config.component';
import { StoreShareList } from '../../../../shared/dialogs/store-share/store-share.component';
import { ItemSettingsComponent } from 'src/app/shared/dialogs/item-settings/item-settings.component';
import { ReloadComponent } from 'src/app/shared/dialogs/reload/reload.component';
import { FormStep, FormField } from 'src/app/core/types/multistep-form';
import { FormControl } from '@angular/forms';
import { SingleActionDialogComponent } from 'src/app/shared/dialogs/single-action-dialog/single-action-dialog.component';
import { SettingsComponent } from 'src/app/shared/dialogs/settings/settings.component';
import { ItemsService } from 'src/app/core/services/items.service';
import { Item } from 'src/app/core/models/item';
import { TagsService } from 'src/app/core/services/tags.service';

interface Button {
  text?: string;
  clickEvent(...params): any;
}

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
})
export class TestComponent implements OnInit {
  textSample: string =
    'Al borrar las reservaciones las fechas involucradas volverán a estar disponible.';
  hourRangeInDays = {
    MONDAY: [
      { from: 9, to: 11 },
      { from: 14, to: 18 },
    ],
    TUESDAY: [
      { from: 9, to: 11 },
      { from: 14, to: 18 },
    ],
    WEDNESDAY: [
      { from: 9, to: 11 },
      { from: 14, to: 18 },
    ],
    THURSDAY: [
      { from: 9, to: 11 },
      { from: 14, to: 18 },
    ],
    FRIDAY: [
      { from: 9, to: 11 },
      { from: 14, to: 18 },
    ],
    SATURDAY: [
      { from: 9, to: 11 },
      { from: 14, to: 15 },
    ],
  };

  formSteps: Array<FormStep> = [
    {
      fieldsList: [
        {
          name: 'referenceImage',
          fieldControl: {
            type: 'single',
            control: new FormControl(['']),
          },
          label: 'Foto de referencia',
          placeholder: 'sube una imagen',
          styles: {
            labelStyles: {
              paddingBottom: '26px',
            },
            subLabelStyles: {
              color: '#7B7B7B',
              fontFamily: 'RobotoRegular',
              fontSize: '16px',
              fontWeight: 500,
              padding: '0px',
              margin: '0px',
              marginBottom: '18px',
            },
            fieldStyles: {
              width: '157px',
              height: '137px',
              padding: '34px',
              textAlign: 'center',
            },
            containerStyles: {
              marginTop: '0px',
              paddingBottom: '60px',
            },
            innerContainerStyles: {
              width: '157px',
              textAlign: 'center',
            },
          },
        },
      ],
      hideHeader: true,
    },
  ];

  item: Item = null;
  item2: Item = null;
  tag: Tag = null;
  tag2: Tag = null;
  tags: Array<Tag> = null;
  tagsByIdsObject: Record<string, Tag> = null;

  topInnerButtons: Array<Button> = [
    {
      text: 'Articulos',
      clickEvent: () => {
        console.log('clickeado pana');
      },
    },
  ];

  topRightButton: Button = {
    clickEvent: () => {
      alert('clicked icon');
    },
  };

  constructor(
    private itemsService: ItemsService,
    private dialog: DialogService,
    private tagsService: TagsService
  ) {}

  async ngOnInit() {
    this.item = await this.itemsService.item('63658003b0f89428c8e6a27f');
    this.item2 = await this.itemsService.item('6364cf158016a926583f90f0');
    let tags: Array<Tag> = await this.tagsService.tagsByUser();
    this.tags = tags;
    const { tag } = await this.tagsService.tag('6356fd635231611a3471cf3e');
    this.tag = tag;
    const { tag: tag2 } = await this.tagsService.tag(
      '636aa2f647674a1090976e3c'
    );
    this.tag2 = tag2;

    this.tagsByIdsObject = {};
    for (const tag of tags) {
      this.tagsByIdsObject[tag._id] = tag;
    }

    console.log(this.tagsByIdsObject);
  }

  openDialog() {
    /*   const list: StoreShareList[] = [
        {
            title: 'ITEM ID',
            label: 'VISIBLE',
            options: [
                {
                    text: 'CREA UN NUEVO ARTICULO',
                    mode: 'func',
                    func() {
                        console.log('Este mueve la maraca');
                        // this.router.navigate([`admin/create-item`]);
                    },
                },
                {
                    text: 'VENDE ONLINE. COMPARTE EL LINK',
                    icon: {
                        src: '/upload.svg',
                        alt: 'icono de de compartir',
                        size:{
                            width: 14,
                            height: 14
                        }
                    },
                    mode: 'clipboard'
                },
                {
                    text: 'CERRAR SESIÓN',
                    mode: 'func',
                    func() {
                        console.log('aqui cierra sesión');
                        //this.authService.signout();
                    }
                }
            ]
        },
    ];

    this.dialog.open(StoreShareComponent, {
        type: 'fullscreen-translucent',
        props: {
          list,
          alternate: false
        },
        customClass: 'app-dialog',
        flags: ['no-header'],
    });*/

    /* this.dialog.open(GeneralFormSubmissionDialogComponent, {
      type: 'centralized-fullscreen',
      props: {
        icon: 'sadFace.svg',
        message: 'Ocurrió un problema',
        showCloseButton: true
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
    
    this.dialog.open(SingleActionDialogComponent, {
      type: 'centralized-fullscreen',
      props:{
         title: 'Borrar Reservaciones?',
         buttonText: 'Borrar Reservación',
         mainText: this.textSample,
         mainButton: this.actionDialog
      },
      customClass: 'app-dialog',
      flags: ['no-header']
    })
    
    */

    this.dialog.open(SettingsComponent, {
      type: 'fullscreen-translucent',
      props: {
        title: 'NameID',
        cancelButton: {
          text: 'cancelar',
          callback: () => {
            console.log('cliqueado el boton de cancelar');
          },
        },
        mainText: this.textSample,
        indexValue: 2,
        qrCode: 'https://www.google.com',
        optionsList: [
          {
            text: 'CTAID',
            callback: () => {
              console.log('CLICKING IT 1');
            },
          },
          {
            text: 'CTAID',
            callback: () => {
              console.log('CLICKING IT 2');
            },
          },
          {
            text: 'CTAID',
            callback: () => {
              console.log('CLICKING IT 3');
            },
          },
          {
            text: 'CTAID',
            callback: () => {
              console.log('CLICKING IT 4');
            },
          },
          {
            text: 'CTAID',
            callback: () => {
              console.log('CLICKING IT 5');
            },
          },
        ],
        statuses: [
          {
            text: 'opcion 1',
            backgroundColor: 'limegreen',
            color: 'blue',
            asyncCallback: () => {
              return new Promise((resolve, reject) => {
                setTimeout(() => {
                  console.log('pasaron 2 seg');
                  resolve(true);
                }, 2000);
              });
            },
          },
          {
            text: 'opcion 2',
            backgroundColor: 'yellow',
            color: 'red',
            asyncCallback: () => {
              return new Promise((resolve, reject) => {
                setTimeout(() => {
                  console.log('pasó 1 seg');
                  resolve(true);
                }, 1000);
              });
            },
          },
          {
            text: 'opcion 3',
            backgroundColor: 'orange',
            color: 'red',
            asyncCallback: () => {
              return new Promise((resolve, reject) => {
                setTimeout(() => {
                  console.log('pasaron 4 segundos');
                  resolve(true);
                }, 4000);
              });
            },
          },
        ],
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  openDeleteDialog() {
    const list: StoreShareList[] = [
      {
        title: `Hay una nueva versión disponible`,
        description:
          'Se ha encontrado una nueva version de la pagina. ¿Desea actualizar?',
        message: 'Recargar Página',
        messageCallback: async () => {
          this.reload();
        },
      },
    ];

    this.dialog.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list,
        alternate: true,
        buttonText: 'Cerrar',
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
      notCancellable: true,
    });
  }

  reloadDialog() {
    this.dialog.open(ReloadComponent, {
      type: 'fullscreen-translucent',
      props: {
        closeEvent: () => {
          this.reload();
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
      notCancellable: true,
    });
  }

  reload() {
    window.location.reload();
  }

  actionDialog(e: string) {
    console.log('Esta funcion esta aparte');
    console.log(e);
  }
}
