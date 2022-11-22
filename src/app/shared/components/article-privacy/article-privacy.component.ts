import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Recipient } from 'src/app/core/models/recipients';
import { Tag, TagInput } from 'src/app/core/models/tags';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { RecipientsService } from 'src/app/core/services/recipients.service';
import { TagsService } from 'src/app/core/services/tags.service';
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
  status: string = 'controller';
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
  tags: Tag[] = [];
  listadoSelection: string[] = [];
  env: string = environment.assetsUrl;
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
  fields: any[] = [
    {
      name: '_id',
      label: '',
      style: {
        marginLeft: '36px',
      },
      value: '',
      validators: [],
      type: 'text',
    },
    {
      name: 'name',
      label: '',
      style: {
        marginLeft: '36px',
      },
      value: '',
      validators: [],
      type: 'text',
    },
    {
      name: 'lastName',
      label: '',
      style: {
        marginLeft: '36px',
      },
      value: '',
      validators: [],
      type: 'text',
    },
    {
      name: 'nickname',
      label: '',
      style: {
        marginLeft: '36px',
      },
      value: '',
      validators: [],
      type: 'text',
    },
    {
      name: 'phone',
      label: '',
      style: {
        marginLeft: '36px',
      },
      value: '',
      validators: [Validators.pattern('^[0-9]*$')],
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
        Validators.pattern(
          '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'
        ),
      ],
      type: 'email',
    },
    {
      name: 'image',
      label: '',
      style: {
        marginLeft: '36px',
      },
      value: this.fillList(1),
      validators: [],
      type: 'file',
    },
    {
      name: 'tags',
      label: '',
      style: {
        marginLeft: '36px',
      },
      value: [],
      validators: [],
      type: '',
    },
  ];
  password: FormControl = new FormControl('', [Validators.required]);
  toDelete: number[] = [];
  filter: SafeStyle;
  _Recipients: Recipient[];
  tempRecipients: Recipient[];
  _AbstractControl: AbstractControl = new FormControl();
  idMerchant: string;
  constructor(
    private _DomSanitizer: DomSanitizer,
    private _DialogService: DialogService,
    private _RecipientsService: RecipientsService,
    private _TagsService: TagsService,
    private _MerchantsService: MerchantsService
  ) {}

  ngOnInit(): void {
    this.filter = this._DomSanitizer.bypassSecurityTrustStyle('opacity(0.5)');
    const recipients = async () => {
      const { _id } = await this._MerchantsService.merchantDefault();
      this.idMerchant = _id;
      const { recipients }: any = await this._RecipientsService.recipients();
      this._Recipients = recipients;
      this.tempRecipients = this._Recipients;
      this.initControllers(this._Recipients);
      const pagination = {
        paginate: {
          options: {
            sortBy: 'createdAt:desc',
            limit: 20,
          },
          findBy: {
            entity: 'recipient',
          },
        },
      };
      this.tags = (await this._TagsService.tagsByUser(pagination)) || [];
      this.initControllers();
    };
    recipients();
  }

  initControllers(_Recipients: Recipient[] = [{} as Recipient]): void {
    _Recipients.forEach((item, i) => {
      this.multimedia.unshift([]);
      this.types.unshift([]);
      const controller: FormGroup = new FormGroup({});
      this.fields.forEach(
        ({ name, value, validators, type }: any, j: number) => {
          controller.addControl(
            name,
            new FormControl(
              name === 'image' ? [item[name]] : item[name] || value,
              validators
            )
          );
          if (name === 'image' && item[name]) {
            this.multimedia[0].push(
              this._DomSanitizer.bypassSecurityTrustStyle(`url(
            ${item[name]})
            no-repeat center center / cover #e9e371`)
            );
          }
        }
      );
      this.controllers = new FormArray([
        controller,
        ...this.controllers.controls,
      ]);
    });
  }

  fillList(n: number): any[] {
    const result = [...Array(n).keys()].map(() => '');
    return result;
  }

  multimediaValid(g: FormControl) {
    return g.value.some((image) => !image) ? { invalid: true } : null;
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
        .get('image')
        .value.map((image, index: number) => {
          return index === j ? file : image;
        });
      this.controllers.at(i).get('image').setValue(multimedia);
    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
    };
  }

  submit(): void {
    this.status = 'loading';
    const controller: AbstractControl = this.controllers.at(this.controlIndex);
    if (controller.invalid) return;
    const { name, lastName, _id, phone, email, nickname, image } =
      controller.value;
    const [_image] = image;
    const createRecipient = async () => {
      const body = {
        name,
        lastName,
        phone: `${phone}`,
        email,
        nickname,
        image: _image,
      };
      const { createRecipient } = await this._RecipientsService.createRecipient(
        body
      );
      const { _id } = createRecipient;
      controller.get('_id').setValue(_id);
      this._Recipients = this.controllers.value;
      this.initControllers();
      for (const tag of this.listadoSelection) {
        const { recipientAddTag } =
          await this._RecipientsService.recipientAddTag(tag, _id);
        controller.get('tags').setValue(this.listadoSelection);
      }
      this.status = 'controller';
      this.selected = ['Yo y mis invitados'];
    };
    if (!_id) createRecipient();
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
              const deleteRecipient = async () => {
                for (const index of this.toDelete) {
                  const result = await this._RecipientsService.deleteRecipient(
                    this.controllers.at(index).get('_id').value
                  );
                }
                this.controllers = new FormArray(
                  this.controllers.controls.filter(
                    (control: FormGroup, index) =>
                      !this.toDelete.includes(index)
                  )
                );
                this.multimedia = this.multimedia.filter(
                  (item, j: number) => !this.toDelete.includes(j)
                );
                this.types = this.types.filter(
                  (item, j: number) => !this.toDelete.includes(j)
                );
                this.toDelete = [];
              };
              deleteRecipient();
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

  filterRecipients(_id: string): void {
    this.listadoSelection = this.listadoSelection.includes(_id)
      ? this.listadoSelection.filter((id) => id !== _id)
      : [...this.listadoSelection, _id];
    this.tempRecipients = this._Recipients.filter((recipient: Recipient) =>
      recipient.tags.includes(_id)
    );
    if (this.listadoSelection.includes('Nueva')) {
      this.addTag();
    }
  }

  checkList(control: AbstractControl): boolean {
    return control.get('tags').value.some((r) => this.listadoSelection.includes(r));
  }

  addTag(): void {
    const createTag = async () => {
      const index =
        Math.max(
          ...this.tags.map(
            ({ name }) => +name.split('#').find((str) => +str) || 1
          )
        ) + 1;
      const name = `Listado #${index}`;
      const _TagInput: any = {
        name,
        entity: 'recipient',
        merchant: this.idMerchant,
      };
      const { createTag } = await this._TagsService.createTag(_TagInput);
      const { _id } = createTag;
      this.tags.unshift({
        _id,
        name,
      } as Tag);
    };
    createTag();
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
}