import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { environment } from 'src/environments/environment';
import Swiper, { SwiperOptions } from 'swiper';
import { StoreShareComponent } from '../../dialogs/store-share/store-share.component';

@Component({
  selector: 'app-article-privacy',
  templateUrl: './article-privacy.component.html',
  styleUrls: ['./article-privacy.component.scss'],
})
export class ArticlePrivacyComponent implements OnInit {
  options: string[] = ['A ver', 'A editar'];
  selected: string[] = ['A ver'];
  icons: string[] = ['up', 'up'];
  text: string = 'Acceso';
  paddingRight: string = '100px';
  textAlign: string = 'center';
  list = [
    {
      text: 'Solo yo',
      img: 'closed-eye.svg',
      callback: (text: string) => {
        this.text = 'Acceso';
        this.icons = ['up', 'up'];
        this.paddingRight = '90px';
        this.textAlign = 'center';
        this.handleSelection(text);
      },
    },
    {
      text: 'Yo y mis invitados',
      img: 'padlock%20%281%29.png',
      invites: true,
      callback: (text: string) => {
        this.text = 'Lista de Invitados';
        this.icons = ['left'];
        this.textAlign = 'left';
        this.paddingRight = '0';
        this.handleSelection(text);
      },
    },
    {
      text: 'Todos con el link. Tienes la opción de adicionar una clave.. Adicionar',
      img: 'open-padlock.png',
      callback: (text: string) => {
        this.text = 'Clave del Símbolo';
        this.icons = ['left'];
        this.textAlign = 'left';
        this.paddingRight = '0';
        this.handleSelection(text);
      },
    },
  ];
  listado: string[] = ['Nueva', 'Listado #4', 'ListadoID'];
  listadoSelection: string = 'Nueva';
  env: string = environment.assetsUrl;
  medias = [];
  controlIndex: number;
  controllers: FormArray = new FormArray([]);
  swiperConfig: SwiperOptions = {
    slidesPerView: 3,
    freeMode: false,
    spaceBetween: 8,
  };
  multimedia: any = [];
  types: any = [];
  imageFiles: string[] = ['image/png', 'image/jpg', 'image/jpeg'];
  videoFiles: string[] = [];
  audioFiles: string[] = [];
  invites: any = [];
  fields: any[] = [
    {
      name: 'name',
      label: '',
      style: {
        marginLeft: '36px',
      },
      value: '',
      validators: [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)],
      type: 'text',
    },
    {
      name: 'lastName',
      label: '',
      style: {
        marginLeft: '36px',
      },
      value: '',
      validators: [Validators.required, Validators.pattern(/^[a-zA-Z\s]*$/)],
      type: 'text',
    },
    {
      name: 'oracion',
      label: '',
      style: {
        marginLeft: '36px',
      },
      value: '',
      validators: [],
      type: 'text',
    },
    {
      name: 'whatsapp',
      label: '',
      style: {
        marginLeft: '36px',
      },
      value: '',
      validators: [Validators.required],
      type: 'tel',
    },
    {
      name: 'email',
      label: '',
      style: {
        marginLeft: '36px',
      },
      value: '',
      validators: [
        Validators.required,
        Validators.pattern(
          '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'
        ),
      ],
      type: 'email',
    },
    {
      name: 'multimedia',
      label: '',
      style: {
        marginLeft: '36px',
      },
      value: this.fillList(1),
      validators: [Validators.required, this.multimediaValid],
      type: 'file',
    },
  ];
  password: FormControl = new FormControl('', [Validators.required]);
  toDelete: number[] = [];
  filter: SafeStyle;
  constructor(
    private _DomSanitizer: DomSanitizer,
    private _DialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.filter = this._DomSanitizer.bypassSecurityTrustStyle('opacity(0.5)');
    this.initControllers();
  }

  initControllers(): void {
    const list = this.fillList(1);
    list.forEach((item, i) => {
      this.multimedia.unshift([]);
      this.types.unshift([]);
      const controller: FormGroup = new FormGroup({});
      this.fields.forEach(
        ({ name, value, validators, type }: any, j: number) => {
          controller.addControl(name, new FormControl(value, validators));
        }
      );
      this.controllers = new FormArray([
        controller,
        ...this.controllers.controls,
      ]);
    });
    this.updateInvites();
  }

  fillList(n: number): any[] {
    const result = [...Array(n).keys()].map(() => '');
    return result;
  }

  multimediaValid(g: FormControl) {
    return g.value.some((image) => !image) ? { invalid: true } : null;
  }

  updateInvites(): void {
    this.invites = this.controllers.controls.filter(
      (controller: FormControl) => {
        console.log('controller.valid: ', controller.valid);
        return controller.valid;
      }
    );
  }

  handleOption(option: string): void {
    this.selected = [option];
  }

  handleSelection(choice: string): void {
    if (this.selected.includes(choice))
      this.selected = this.selected.filter((tg) => tg !== choice);
    else {
      const value = [choice];
      this.selected = value;
    }
  }

  handleController(index: number): void {
    if (index === 0) {
      this.controlIndex = index;
      this.selected = ['invites'];
    } else {
      if (this.toDelete.includes(index))
        this.toDelete = this.toDelete.filter((tg) => tg !== index);
      else {
        const value = [...this.toDelete, index];
        this.toDelete = value;
      }
    }
    this.text = 'Invitado con acceso';
    this.icons = ['up', 'up'];
    this.paddingRight = '0';
    this.textAlign = 'left';
  }

  accessContact(index: number): void {
    this.controlIndex = index;
    this.selected = ['invites'];
  }

  getFormGroupAt(i: number) {
    return this.controllers.at(i) as FormGroup;
  }

  loadFile(event: any, i: number, j: number) {
    const [file] = event.target.files;
    const { type } = file;
    if (
      !file ||
      ![...this.imageFiles, ...this.videoFiles, ...this.audioFiles].includes(
        file.type
      )
    )
      return;
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (e) => {
      const result = reader.result;
      if (this.videoFiles.includes(type))
        this.multimedia[i][j] = (<FileReader>e.target).result;
      else if (this.imageFiles.includes(type))
        this.multimedia[i][j] = this._DomSanitizer
          .bypassSecurityTrustStyle(`url(
        ${result})
        no-repeat center center / cover #e9e371`);
      else if (this.audioFiles.includes(type))
        this.multimedia[i][j] = this._DomSanitizer.bypassSecurityTrustUrl(
          URL.createObjectURL(file)
        );
      else this.multimedia[i][j] = result;
      this.types[i][j] = type;
      const multimedia = this.controllers
        .at(i)
        .get('multimedia')
        .value.map((image, index: number) => {
          var formData = new FormData();
          const { name } = file;
          var blob = new Blob([JSON.stringify(file)], { type });
          formData.append(name, blob);
          return index === j ? file : image;
        });
      this.controllers.at(i).get('multimedia').setValue(multimedia);
    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
    };
  }

  submit(): void {
    if (this.controllers.at(this.controlIndex).invalid) return;
    this.initControllers();
    this.medias = [];
    this.multimedia
      .filter((list) => list.length)
      .forEach(
        (media) => (this.medias = [...this.medias, ...media.map((src) => src)])
      );
    this.medias.unshift('');
    this.invites = this.controllers.controls.map(() => '');
    this.selected = ['Yo y mis invitados'];
  }

  deleteSelected(): void {
    const list = [
      {
        title: 'Borrar a NameID de la lista?',
        titleStyles: {
          fontFamily: 'SfProBold',
          color: '#4f4f4f',
          textAlign: 'center',
          fontSize: '23px',
        },
        options: [
          {
            text: 'Si, borrar',
            mode: 'func',
            dynamicStyles: {
              description: {
                fontFamily: 'SfProDisplay',
                border: 'none',
                background: '#000',
                textAlign: 'center',
                color: '#fff!important',
                width: '133px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '30px',
                margin: 'auto',
              },
            },
            func: () => {
              this.controllers = new FormArray(
                this.controllers.controls.filter(
                  (control: FormGroup, index) => !this.toDelete.includes(index)
                )
              );
              this.medias = this.medias.filter(
                (item, j: number) => !this.toDelete.includes(j)
              );
              this.multimedia = this.multimedia.filter(
                (item, j: number) => !this.toDelete.includes(j)
              );
              this.types = this.types.filter(
                (item, j: number) => !this.toDelete.includes(j)
              );
              this.invites = this.invites.filter(
                (item, j: number) => !this.toDelete.includes(j)
              );
              this.toDelete = [];
            },
          },
        ],
      },
    ];
    this._DialogService.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list,
        hideCancelButtton: true,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  goBack(): void {
    const [value] = this.selected;
    switch (value) {
      case 'Yo y mis invitados':
        this.text = 'Acceso';
        this.icons = ['up', 'up'];
        this.paddingRight = '90px';
        this.textAlign = 'center';
        this.selected = ['A ver'];
        break;
      case 'invites':
        this.text = 'Lista de Invitados';
        this.icons = ['left'];
        this.textAlign = 'left';
        this.paddingRight = '0';
        this.selected = ['Yo y mis invitados'];
        break;
      case 'Todos con el link. Tienes la opción de adicionar una clave.. Adicionar':
        this.text = 'Acceso';
        this.icons = ['up', 'up'];
        this.paddingRight = '90px';
        this.textAlign = 'center';
        this.selected = ['A ver'];
        break;
    }
  }
}
