import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LinkInput } from 'src/app/core/models/LinkInput';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { ContactService } from 'src/app/core/services/contact.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';

@Component({
  selector: 'app-bios-edit',
  templateUrl: './bios-edit.component.html',
  styleUrls: ['./bios-edit.component.scss'],
})
export class BiosEditComponent implements OnInit, OnDestroy {
  status:string;
  name: string = 'Merchant ID';
  bio: string =
    'Servicios de Asesoría Fiscal • 15 años de experiencia como Gerente Local y Proceso Fiscales en DGII •';
  direc1: string = 'Direccion ID';
  direc2: string = 'Direccion ID';
  main: boolean = true;
  enlace: boolean = false;
  direcciones: boolean = false;
  clicked: boolean = false;
  clicked2: boolean = false;
  clicked3: boolean = false;
  clicked4: boolean = true;
  publicName:boolean = false;
  bioDescription:boolean = false;
  controller:FormGroup = new FormGroup({});
  merchantDefault:string;
  src:any;
  logo:any;
  file:any;
  fileLogo:any;
  links:any = [];
  contactId:string;
  sub:Subscription;
  linkIndex:number;
  imageFiles: string[] = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
  accept:string;

  constructor(
    private router: Router,
    private _ContactService: ContactService,
    private _MerchantService: MerchantsService,
    private _DomSanitizer: DomSanitizer,
    private _ActivatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.sub = this._ActivatedRoute.queryParams.subscribe(({ contactId }) => {
      (async () => {
        this.accept = this.imageFiles.join(', ');
        if(contactId)
          this.contactId = contactId;
        this.initController();
        const _merchantDefault = await this._MerchantService.merchantDefault();
        if(contactId) {
          const { _id } = _merchantDefault;
          const paginate:PaginationInput = {
            findBy:{
              _id: contactId
            }
          }
          const [{ name, description, link, image }] = await this._ContactService.contacts(paginate);
          this.controller.get('merchant').setValue(_id);
          this.controller.get('name').setValue(name);
          this.controller.get('description').setValue(description);
          this.links = link;
          this.logo = this.formatImage(image);
        }else {
          const { _id, image, name, bio, social } = _merchantDefault;
          this.logo = this.formatImage(image);
          this.controller.get('merchant').setValue(_id);
          this.controller.get('name').setValue(name);
          this.controller.get('description').setValue(bio);
          this.links = social;
        }
      })();
    })
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  initController():void {
    const fields = [
      {
        name:'name',
        validators: [Validators.required]
      },
      {
        name: 'description',
        validators: [Validators.required]
      },
      {
        name: 'merchant',
        validators: [Validators.required]
      },
      {
        name: 'tag',
        validators: []
      },
      {
        name: 'contact',
        validators: []
      }
    ];
    for(const { name, validators } of fields)
      this.controller.addControl(name,new FormControl('',validators));
  }

  loadFile(event: any) {
    ['','','',''].forEach((item,i:number) => this[`clicked${i===0?'':(i+1)}`] = false);
    const [file] = event.target.files;
    this.file = file;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async (e) => {
      const { type } = file;
      let result = reader.result;
      this.src = result;
    };
  }

  loadFileLogo(event: any) {
    const [file] = event.target.files;
    this.fileLogo = file;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async (e) => {
      const { type } = file;
      let result = reader.result;
      this.logo = this._DomSanitizer
        .bypassSecurityTrustStyle(`url(
      ${result})
      no-repeat center center / cover #fff`);
    };
  }

  AbstractControl(name:string){
    return this.controller.get(name) as FormControl;
  }
  goBack() {
    this.router.navigate(['admin/bios-main']);
  }
  backToMain() {
    if(this.linkIndex===null&&this.enlace&&this.controller.get('tag').value&&this.controller.get('contact').value&&this.src){
      const _link:any = {
        image: this.src,
        _image: this.file,
        name: this.controller.get('tag').value,
        value: this.controller.get('contact').value
      };
      this.links = [...this.links, _link];
      for(const name of ['tag','contact'])
        this.controller.get(name).setValue('');
      this.file = '';
      this.src = '';
    }else if(this.linkIndex!==null&&this.enlace&&this.controller.get('tag').valid&&this.controller.get('contact').valid&&this.src){
      const _link:any = {
        _id: this.links[this.linkIndex]._id,
        image: this.src,
        _image: this.file,
        name: this.controller.get('tag').value,
        value: this.controller.get('contact').value
      };
      this.links[this.linkIndex] = _link;
      for(const name of ['tag','contact'])
        this.controller.get(name).setValue('');
      this.file = '';
      this.src = '';
    }
    this.enlace = false;
    this.direcciones = false;
    this.publicName = false;
    this.bioDescription = false;
    this.main = true;
    this.linkIndex==null
  }
  add() {
    this.enlace = true;
    this.main = false;
    this.linkIndex = null;
  }

  submit():void {
    console.log('this.controller.touched: ', this.controller.touched);
    if(!this.controller.touched)  return;
    if(this.controller.invalid || this.status) return;
    this.status = 'Cargando...';
    (async () => {
      const {
        name,
        description,
        merchant
      } = this.controller.value;
      const value = {
        name,
        description,
        merchant,
        image: this.fileLogo
      };
      if(!this.contactId){
        const { _id } = await this._ContactService.createContact(value);
        this.contactId = _id;
        await this.setLinks();
        this.router.navigate(['admin','bios-edit'],{
          queryParams: {
            contactId: this.contactId
          }
        });
      }else{
        const result = await this._ContactService.updateContact(this.contactId, value);
        await this.setLinks();
      }
    })();
  }

  async setLinks():Promise<void>{
    for(let link of this.links){
      if(!link._id){
        const _link:LinkInput = {
          image: link._image,
          name: link.name,
          value: link.value
        };
        const result = await this._ContactService.contactAddLink(_link, this.contactId);
      }else {
        let _link:any = {
          name: link.name,
          value: link.value
        };
        if(link._image)
          _link.image = link._image;
        const result = await this._ContactService.contactUpdateLink(_link, link._id, this.contactId);
      }
      // this.links = [...this.links, result];
    }
    for(const name of ['tag','contact'])
      this.controller.get(name).setValue('');
    this.file = '';
    this.src = '';
    this.status = '';
  }

  formatImage(image:string):SafeStyle {
    return this._DomSanitizer.bypassSecurityTrustStyle(`url(
      ${image})
      no-repeat center center / cover #fff`);
  }

  edit() {
    this.direcciones = true;
    this.main = false;
    this.enlace = false;
    this.publicName = false;
    this.bioDescription = false;
  }

  edit2() {
    this.direcciones = false;
    this.main = false;
    this.enlace = false;
    this.publicName = true;
    this.bioDescription = false;
  }

  edit3() {
    this.direcciones = false;
    this.main = false;
    this.enlace = false;
    this.publicName = false;
    this.bioDescription = true;
  }

  isClicked() {
    this.resetSrc();
    this.clicked = !this.clicked;
    if (this.clicked2 === true) {
      this.clicked2 = false;
    } else if (this.clicked3 === true) {
      this.clicked3 = false;
    } else if (this.clicked4 === true) {
      this.clicked4 = false;
    }
    this.file = 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/whatsapp.svg';
    this.src = 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/whatsapp.svg';
  }
  isClicked2() {
    this.resetSrc();
    this.clicked2 = !this.clicked2;
    if (this.clicked === true) {
      this.clicked = false;
    } else if (this.clicked3 === true) {
      this.clicked3 = false;
    } else if (this.clicked4 === true) {
      this.clicked4 = false;
    }
    this.file = 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/telegram.svg';
    this.src = 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/telegram.svg';
  }

  isClicked3() {
    this.resetSrc();
    this.clicked3 = !this.clicked3;
    if (this.clicked === true) {
      this.clicked = false;
    } else if (this.clicked2 === true) {
      this.clicked2 = false;
    } else if (this.clicked4 === true) {
      this.clicked4 = false;
    }
    this.file = 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/telegram.svg';
    this.src = 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/telegram.svg';
  }

  isClicked4() {
    this.resetSrc();
    this.clicked4 = !this.clicked4;
    if (this.clicked === true) {
      this.clicked = false;
    } else if (this.clicked2 === true) {
      this.clicked2 = false;
    } else if (this.clicked3 === true) {
      this.clicked3 = false;
    }
    this.file = 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/whatsapp.svg';
    this.src = 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/whatsapp.svg';
  }

  resetSrc():void {
    this.file = '';
    this.src = '';
  }

  navigateToLink(index:number):void {
    this.enlace = true;
    this.direcciones = false;
    this.publicName = false;
    this.bioDescription = false;
    this.main = false;
    const link = this.links[index];
    this.controller.get('tag').setValue(link.name);
    this.controller.get('contact').setValue(link.value);
    const image = link.image;
    this.src = image;
    this.linkIndex = index;
  }
}
