import { Component, OnDestroy, OnInit } from '@angular/core';
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
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from 'ngx-intl-tel-input';
import { AuthService } from 'src/app/core/services/auth.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { EntityTemplateService } from 'src/app/core/services/entity-template.service';
import { ToastrService } from 'ngx-toastr';
import { SingleActionDialogComponent } from '../../dialogs/single-action-dialog/single-action-dialog.component';

@Component({
  selector: 'app-article-privacy',
  templateUrl: './article-privacy.component.html',
  styleUrls: ['./article-privacy.component.scss'],
})
export class ArticlePrivacyComponent implements OnInit, OnDestroy {
  status: string = 'controller';
  options: string[] = ['A ver', 'A editar'];
  selected: string[] = ['A ver'];
  selectedTab: string[] = ['A ver'];
  icons: string[] = ['up', 'up'];
  text: string = 'Acceso';
  paddingRight: string = '100px';
  textAlign: string = 'center';
  list = [
    {
      text: 'Solo yo',
      // img: 'closed-eye.svg',
      img: {img:'padlock%20%281%29.png',width:''},
      callback: (text: string) => {
        this.text = 'Acceso';
        this.icons = ['up', 'up'];
        this.paddingRight = '90px';
        this.textAlign = 'center';
        this.handleSelection(text);
        (async () => {
          const content: any = {
            access: this.access==='private'?'public':'private',
          };
          const { access } = await this._EntityTemplateService.entityTemplateAuthSetData(
            this.id,
            content
          );
          this.access = access;
        })();
      },
    },
    {
      text: 'Yo y mis invitados',
      img: {img:'padlock%20%281%29.png',width:'16'},
      invites: true,
      callback: (text: string) => {
        this.text = 'Lista de Invitados';
        this.icons = ['left'];
        this.textAlign = 'left';
        this.paddingRight = '0';
        this.listadoSelection = ['Nueva'];
        this.handleSelection(text);
        this.setCheck();
      },
    },
    {
      text: 'Todos con el link. Tienes la opción de adicionar una clave.. Adicionar',
      img: {img:'open-padlock.png',width:'21'},
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
      name: 'currentPhone',
      label: '',
      style: {
        marginLeft: '36px',
      },
      value: '',
      validators: [],
      type: 'tel',
    },
    {
      name: 'phone',
      label: '',
      style: {
        marginLeft: '36px',
      },
      value: '',
      validators: [],
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
    {
      name: 'checked',
      label: '',
      style: {
        marginLeft: '36px',
      },
      value: false,
      validators: [],
      type: '',
    },
    {
      name: 'edit',
      label: '',
      style: {
        marginLeft: '36px',
      },
      value: false,
      validators: [],
      type: '',
    },
    {
      name: 'hasEntity',
      label: '',
      style: {
        marginLeft: '36px',
      },
      value: false,
      validators: [],
      type: '',
    },
    {
      name: 'check',
      label: '',
      style: {
        marginLeft: '36px',
      },
      value: 0,
      validators: [],
      type: '',
    },
    {
      name: 'entityRecipientId',
      label: '',
      style: {
        marginLeft: '36px',
      },
      value: '',
      validators: [],
      type: '',
    },
  ];
  password: FormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
  ]);
  toDelete: number[] = [];
  toEntityTemplate: number[] = [];
  filter: SafeStyle;
  _Recipients: Recipient[];
  tempRecipients: Recipient[];
  _AbstractControl: AbstractControl = new FormControl();
  idMerchant: string;
  preferredCountries: CountryISO[] = [
    CountryISO.DominicanRepublic,
    CountryISO.UnitedStates,
  ];
  CountryISO = CountryISO.DominicanRepublic;
  PhoneNumberFormat = PhoneNumberFormat;
  passwordSubscribe: Subscription;
  id: string;
  entityTemplateRecipients: any;
  access:string = '';
  hasPassword:boolean;
  constructor(
    private _DomSanitizer: DomSanitizer,
    private _DialogService: DialogService,
    private _RecipientsService: RecipientsService,
    private _TagsService: TagsService,
    private _MerchantsService: MerchantsService,
    private _AuthService: AuthService,
    private _ItemsService: ItemsService,
    private _ActivatedRoute: ActivatedRoute,
    private _Router: Router,
    private _EntityTemplateService: EntityTemplateService,
    private _ToastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this._ActivatedRoute.params.subscribe(({ templateId }) => {
      this.id = templateId;
      this.filter = this._DomSanitizer.bypassSecurityTrustStyle('opacity(0.5)');
      const recipients = async () => {
        const entityTemplateRecipients =
          (await this._EntityTemplateService.entityTemplate(templateId)) ||
          ({} as any);
        this.access = entityTemplateRecipients.access;
        this.hasPassword = entityTemplateRecipients.hasPassword
        this.entityTemplateRecipients =
          entityTemplateRecipients.recipients || [];
        const { _id } = await this._MerchantsService.merchantDefault();
        this.idMerchant = _id;
        const { recipients }: any = await this._RecipientsService.recipients();
        const pagination = {
          options: {
            sortBy: 'createdAt:desc',
            limit: 20,
          },
          findBy: {
            entity: 'recipient',
          },
        };
        this.tags = (await this._TagsService.tagsByUser(pagination)) || [];
        this._Recipients = recipients.filter((recipient: Recipient) =>
          this.tags.some(
            (tag: any) =>
              tag.entity === 'recipient' && recipient.tags.includes(tag._id)
          )
        );
        this.tempRecipients = this._Recipients;
        this.initControllers(this._Recipients);
        this.initControllers();
        this.initPassword();
      };
      recipients();
    });
  }

  ngOnDestroy(): void {
    this.passwordSubscribe.unsubscribe();
  }

  initPassword(): void {
    this.password.setValue(this._ItemsService.itemPassword);
    this.passwordSubscribe = this.password.valueChanges.subscribe((value) => {
      this._ItemsService.itemPassword = value;
    });
  }

  initControllers(_Recipients: Recipient[] = [{} as Recipient]): void {
    _Recipients.forEach((item, i) => {
      this.multimedia.unshift([]);
      this.types.unshift([]);
      const controller: FormGroup = new FormGroup({});
      this.fields.forEach(
        ({ name, value, validators, type }: any, j: number) => {
          let _value = item[name];
          switch (name) {            
            case 'currentPhone':
              _value = item['phone'];
              break;
            case 'phone':
              if (_value) {
                try {
                  const { countryIso, nationalNumber, countryCode } =
                    this._AuthService.getPhoneInformation(`${_value}`);
                  this.CountryISO = countryIso;
                  _value = `${nationalNumber}`;
                } catch (error) {
                  _value = ``;
                }
              }
              break;
              case 'checked':
                const checked = this.entityTemplateRecipients.find(({recipient}) => recipient === item['_id']);
                item['check'] = checked? 1 : 0;
                if(checked)
                  item['entityRecipientId'] = checked['_id']
                _value = checked;
                break;
              case 'edit':
                const recipient = this.entityTemplateRecipients.find(({recipient}) => recipient===item['_id']) || {};
                _value = recipient.edit;
                break;
              case 'hasEntity':
                const flag = this.entityTemplateRecipients.map(({recipient}) => recipient).includes(item['_id']);
                _value = flag;
                break;
          }
          controller.addControl(
            name,
            new FormControl(
              name === 'image' ? [_value] : _value || value,
              validators
            )
          );
          if (name === 'image' && _value) {
            this.multimedia[0].push(
              this._DomSanitizer.bypassSecurityTrustStyle(`url(
            ${_value})
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

  handleOptionTab(option: string): void {
    this.selectedTab = [option];
    this.setCheck();
  }

  setCheck():void{
    this.controllers.controls.forEach((control:FormGroup) => {
      const result = (control.get('edit').value&&this.selectedTab.includes('A editar')?1:(!control.get('edit').value&&!this.selectedTab.includes('A editar')?1:0));
      control.get('check').setValue(!control.get('hasEntity').value?0:result);
    });
    // .setValue(this.controllers.value.map((value) => {
    //   const result = (value.edit&&this.selectedTab.includes('A editar')?1:(!value.edit&&!this.selectedTab.includes('A editar')?1:0));
    //   value.check = result;
    //   return value;
    // }))
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
      const controller = this.controllers.at(index);
      if (controller.get('check').value < 2)
        controller.get('check').setValue(controller.get('check').value + 1);
      else controller.get('check').setValue(0);
      switch (controller.get('check').value) {
        case 1:
          if (!this.toEntityTemplate.includes(index)){
            const value = [...this.toEntityTemplate, index];
            this.toEntityTemplate = value;
            this.addRecipients();
          }
          this.toDelete = this.toDelete.filter((tg) => tg !== index);
          break;
        case 2:
          if (this.toDelete.includes(index))
            this.toDelete = this.toDelete.filter((tg) => tg !== index);
          else {
            const value = [...this.toDelete, index];
            this.toDelete = value;
          }
          this.toEntityTemplate = this.toEntityTemplate.filter(
            (tg) => tg !== index
          );
          break;
        default:
            this.removeRecipients(index);
            this.toDelete = this.toDelete.filter((tg) => tg !== index);
            this.toEntityTemplate = this.toEntityTemplate.filter((tg) => tg !== index);
          break;
      }
    }
    this.text = 'Invitado con acceso';
    this.icons = ['up', 'up'];
    this.paddingRight = '0';
    this.textAlign = 'left';
  }

  accessContact(index: number): void {
    this.controlIndex = index;
    if (index === 0) this.CountryISO = CountryISO.DominicanRepublic;
    this.selected = ['invites'];
  }

  getFormGroupAt(i: number) {
    return this.controllers.at(i) as FormGroup;
  }

  loadFile(event: any, i: number, j: number) {
    const [file] = event.target.files;
    if(!file) return;
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
    let [_emailR, _phoneR] = [false,false];
    const flag = this.controllers.value.filter((control,index:number) => index!==this.controlIndex).find((item,index:number) => {
      _phoneR = (item.phone?.number?.replace('-','') || item.phone)===controller.get('phone').value?.number.replace('-','');
      _emailR = item.email&&(item.email===controller.get('email').value);
      const result = _phoneR || _emailR;
      return result;
    });
    if(flag){
      if(_emailR)
        this._ToastrService.error(
          `El email ya ha sido registrado.`,
          null,
          {
            timeOut: 1500,
          }
        );
      if(_phoneR)
      this._ToastrService.error(
        `El telefono ya ha sido registrado.`,
        null,
        {
          timeOut: 1500,
        }
      );
    }
    if (controller.invalid || flag){
      this.status = 'controller';
      return;
    }
    const { name, lastName, _id, phone, email, nickname, image } =
      controller.value;
    const [_image] = image;
    const _phone = phone ? phone.e164Number.replace('+','').replace('-','') : '';
    controller.get('currentPhone').setValue(_phone);
    const createRecipient = async () => {
      const body = {
        name,
        lastName,
        phone: _phone,
        email,
        nickname,
        image: _image,
      };
      try {
        const { createRecipient } =
          await this._RecipientsService.createRecipient(body);
        const { _id } = createRecipient;
        controller.get('_id').setValue(_id);
        this._Recipients = this.controllers.value;
        this.initControllers();
        if (this.listadoSelection.includes('Nueva')) await this.addTag();
        for (const tag of this.listadoSelection) {
          const { recipientAddTag } =
            await this._RecipientsService.recipientAddTag(tag, _id);
          controller.get('tags').setValue(this.listadoSelection);
        }
        this.status = 'controller';
        this.selected = ['Yo y mis invitados'];
      } catch (error) {
        this.status = 'controller';
      }
    };
    const updateRecipient = async () => {
      let body: any = {
        name,
        lastName,
        phone: _phone,
        email,
        nickname,
      };
      if (typeof _image !== 'string') body.image = _image;
      try {
        const { updateRecipient } =
          await this._RecipientsService.updateRecipient(body, _id);
      } catch (error) {
        this.status = 'controller';
      }
      this._Recipients = this.controllers.value;
      this.status = 'controller';
      this.selected = ['Yo y mis invitados'];
    };
    if (!_id) createRecipient();
    else updateRecipient();
  }

  submitPassword(): void {
    if (this.password.invalid) return;
    (async () => {
      this.status = 'loading';
      const password: string = this.password.value;
      const access = 'private';
      const content: any = {
        password,
        access,
      };
      const result =
        await this._EntityTemplateService.entityTemplateAuthSetData(
          this.id,
          content
        );
      this._ToastrService.success(`La contraseña se ${this.hasPassword?'guardó':'actualizó'} exitosamente.`);
      this.status = 'controller';
    })();
  }

  deleteSelected(): void {
    const id = '';
    const [index] = this.toDelete;
    const control = this.controllers.at(index);
    this._DialogService.open(SingleActionDialogComponent, {
      type: 'fullscreen-translucent',
      props: {
        title: this.toDelete.length > 1
        ? 'Borrar todos los recipientes de la lista?'
        : `Borrar a ${
            control.get('name').value ||
            control.get('nickname').value ||
            control.get('email').value ||
            control.get('phone').value.e164Number ||
            control.get('currentPhone').value
          } de la lista?`,
        buttonText: 'Si, borrar',
        mainButton: ()=>{
          this.status = 'loading';
          (async () => {
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
            this.status = 'controller';
          })();
        },
        btnBackgroundColor: '#272727',
        btnMaxWidth: '133px',
        btnPadding: '7px 2px'
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  addRecipients(): void {
    const addToEntity = async () => {
      for (const index of this.toEntityTemplate) {
        const edit: boolean = this.selectedTab.includes('A editar');
        this.controllers.at(index).get('checked').setValue(true);
        try {
          let result;
          if(this.controllers.at(index).get('hasEntity').value){
            const input:any = {
              edit,
              recipient: this.controllers.at(index).get('_id').value,
            };
            const { entityTemplateUpdateRecipient } =
              await this._EntityTemplateService.entityTemplateUpdateRecipient(
                this.id,
                this.controllers.at(index).get('entityRecipientId').value,
                input
              );
              result = entityTemplateUpdateRecipient.recipients.find(({ recipient }) => recipient === this.controllers.at(index).get('_id').value);
          }else{
            const input:any = {
              edit,
              recipient: this.controllers.at(index).get('_id').value,
            };
            const {entityTemplateAddRecipient} =
            await this._RecipientsService.entityTemplateAddRecipient(
              input,
              this.id
            );
            result = entityTemplateAddRecipient.recipients.find(({ recipient }) => recipient === this.controllers.at(index).get('_id').value);
          }
          this.controllers.at(index).get('entityRecipientId').setValue(result._id);
          const _access = 'private';
          const content: any = {
            access: _access,
          };
          const { access } =
            (await this._EntityTemplateService.entityTemplate(this.id)) ||
            ({} as any);
          if (access === 'public') {
            const result2 =
              await this._EntityTemplateService.entityTemplateAuthSetData(
                this.id,
                content
              );
          }
          this.controllers.at(index).get('edit').setValue(edit);
          this.controllers.at(index).get('hasEntity').setValue(true);
        } catch (error) {}
      }
      this.toEntityTemplate = [];
    };
    addToEntity();
  }

  removeRecipients(index:number):void{
    const removeToEntity = async () => {
      this.controllers.at(index).get('checked').setValue(true);
      const recipient = this.controllers.at(index).get('entityRecipientId').value;
      if(recipient){
        try {
          const result = await this._EntityTemplateService.entityTemplateRemoveRecipient(recipient, this.id);
        } catch (error) {
        }
      }
      this.toEntityTemplate = [];
    }
    removeToEntity();
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
      default:
        const list = [`admin`, `create-article`];
        if (this.id) list.push(this.id);
        this._Router.navigate(list);
        break;
    }
  }

  filterRecipients(_id: string): void {
    this.listadoSelection = this.listadoSelection.includes(_id)
      ? ['Nueva', ...this.listadoSelection.filter((id) => id !== _id)]
      : [_id];
    this.tempRecipients = this._Recipients.filter((recipient: Recipient) =>
      recipient.tags.includes(_id)
    );
  }

  checkList(control: AbstractControl): boolean {
    return control
      .get('tags')
      .value.some((r) => this.listadoSelection.includes(r));
  }

  async addTag(): Promise<void> {
    const max = Math.max(
      ...(this.tags.length
        ? this.tags.map(({ name }) => +name.split('#').find((str) => +str) || 1)
        : [0])
    );
    const index = max + 1;
    const name = `Listado #${index}`;
    const _TagInput: any = {
      name,
      entity: 'recipient',
      merchant: this.idMerchant,
    };
    const result = await this._TagsService.createTag(_TagInput);
    const { _id } = result;
    this.tags.unshift({
      _id,
      name,
    } as Tag);
    this.listadoSelection = [_id];
  }

  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
}
