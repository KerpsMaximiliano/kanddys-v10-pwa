import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { LinkInput } from 'src/app/core/models/LinkInput';
import { ContactService } from 'src/app/core/services/contact.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';

@Component({
  selector: 'app-bios-edit',
  templateUrl: './bios-edit.component.html',
  styleUrls: ['./bios-edit.component.scss'],
})
export class BiosEditComponent implements OnInit {
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

  constructor(
    private router: Router,
    private _ContactService: ContactService,
    private _MerchantService: MerchantsService,
    private _DomSanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    (async () => {
      this.initController();
      const { _id } = await this._MerchantService.merchantDefault();
      this.controller.get('merchant').setValue(_id);

    })();
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
        validators: [Validators.required]
      },
      {
        name: 'contact',
        validators: [Validators.required]
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
      this.src = this._DomSanitizer
        .bypassSecurityTrustStyle(`url(
      ${result})
      no-repeat center center / cover #fff`);
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
    this.enlace = false;
    this.direcciones = false;
    this.publicName = false;
    this.bioDescription = false;
    this.main = true;
  }
  add() {
    this.enlace = true;
    this.main = false;
  }

  submit():void {
    if(this.controller.invalid || !this.fileLogo || !this.file) return;
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
      }
      const _link:LinkInput = {
        image: this.file,
        name: this.controller.get('tag').value,
        value: this.controller.get('contact').value
      };
      const { link } = await this._ContactService.contactAddLink(_link, this.contactId);
      const [result] = link;
      this.links = link;
      for(const name of ['tag','contact'])
        this.controller.get(name).setValue('');
      this.file = '';
      this.src = '';
    })();
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
  }

  resetSrc():void {
    this.file = '';
    this.src = '';
  }
}
