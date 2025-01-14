import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LinkInput } from 'src/app/core/models/LinkInput';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { AuthService } from 'src/app/core/services/auth.service';
import { BannersService } from 'src/app/core/services/banners.service';
import { ContactService } from 'src/app/core/services/contact.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';

@Component({
  selector: 'app-bios-edit',
  templateUrl: './bios-edit.component.html',
  styleUrls: ['./bios-edit.component.scss'],
})
export class BiosEditComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput: any;
  status: string;
  name: string = 'Merchant ID';
  bio: string =
    'Servicios de Asesoría Fiscal • 15 años de experiencia como Gerente Local y Proceso Fiscales en DGII •';
  main: boolean = true;
  enlace: boolean = false;
  direcciones: boolean = false;
  clicked: boolean = false;
  clicked2: boolean = false;
  clicked3: boolean = false;
  clicked4: boolean = true;
  publicName: boolean = false;
  bioDescription: boolean = false;
  controller: FormGroup = new FormGroup({});
  merchantDefault: string;
  src: any;
  logo: any;
  changedLogo: boolean = false;
  file: any;
  fileLogo: any;
  links: any = [];
  contactId: string;
  sub: Subscription;
  linkIndex: number;
  imageFiles: string[] = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
  accept: string;
  slug:string;

  constructor(
    private router: Router,
    private _ContactService: ContactService,
    private _MerchantService: MerchantsService,
    private _DomSanitizer: DomSanitizer,
    private _ActivatedRoute: ActivatedRoute,
    private _BannersService: BannersService,
    private _SaleFlowService: SaleFlowService,
    public _HeaderService: HeaderService,
    private _AuthService: AuthService
  ) {}

  ngOnInit(): void {
    this.sub = this._ActivatedRoute.queryParams.subscribe(({ contactId }) => {
      (async () => {
        this.accept = this.imageFiles.join(', ');
        if (contactId) this.contactId = contactId;
        this.initController();
        const _merchantDefault = await this._MerchantService.merchantDefault();
        const { _id } = _merchantDefault;
        const { merchant } = await this._SaleFlowService.saleflowDefault(_id);
        const { slug } = merchant;
        this.slug = slug;
        if (contactId) {
          const paginate: PaginationInput = {
            findBy: {
              _id: contactId,
            },
          };
          const contacts = await this._ContactService.contacts(paginate);
          if(contactId&&!contacts.length){
            this.contactId = null;
            this.router.navigate(['admin','bios-edit']);
          }
          const [{ name, description, link, image }] = contacts.length
            ? contacts
            : [{} as any];
          this.controller.get('merchant').setValue(_id);
          this.controller.get('name').setValue(name);
          this.controller.get('description').setValue(description);
          this.links = link || [];

          if (this.links && this.links.length) {
            const location = (
              this.links as Array<{
                image?: string;
                name?: string;
                _id: string;
                value?: string;
              }>
            ).find((link) => link.name === 'location');

            if (location) {
              this.controller.get('location').setValue(location.value);
            }
          }

          this.logo = this.formatImage(image);
        } else {
          const { _id, image, name, bio, social } = _merchantDefault;
          this.logo = this.formatImage(image);
          this.controller.get('merchant').setValue(_id);
          this.controller.get('name').setValue(name);
          this.controller.get('description').setValue(bio);
          this.links = social || [];
        }
      })();
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  initController(): void {
    const fields = [
      {
        name: 'name',
        validators: [Validators.required],
      },
      {
        name: 'description',
        validators: [Validators.required],
      },
      {
        name: 'merchant',
        validators: [Validators.required],
      },
      {
        name: 'tag',
        validators: [],
      },
      {
        name: 'contact',
        validators: [],
      },
      {
        name: 'location',
        validators: [Validators.required],
      },
    ];
    for (const { name, validators } of fields)
      this.controller.addControl(name, new FormControl('', validators));
  }

  loadFile(event: any) {
    ['', '', '', ''].forEach(
      (item, i: number) => (this[`clicked${i === 0 ? '' : i + 1}`] = false)
    );
    const [file] = event.target.files;
    this.file = file;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async (e) => {
      const { type } = file;
      let result = reader.result;
      this.src = result;
      this.fileInput.nativeElement.value = '';
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
      this.logo = this._DomSanitizer.bypassSecurityTrustStyle(`url(
      ${result})
      no-repeat center center / cover #fff`);
      this.changedLogo = true;
    };
  }

  AbstractControl(name: string) {
    return this.controller.get(name) as FormControl;
  }
  goBack() {
    (async () => {
      const { _id } = await this._AuthService.me();
      this.router.navigate([
        'ecommerce',
        this.slug,
        'contact-landing',
        _id
      ]);
    })();
  }
  backToMain() {
    if (
      this.linkIndex === null &&
      this.enlace &&
      this.controller.get('tag').value &&
      this.controller.get('contact').value &&
      this.src
    ) {
      const _link: any = {
        image: this.src,
        _image: this.file,
        name: this.controller.get('tag').value,
        value: this.controller.get('contact').value,
      };
      this.links = [...this.links, _link];
      for (const name of ['tag', 'contact'])
        this.controller.get(name).setValue('');
      this.file = '';
      this.src = '';
    } else if (
      this.linkIndex !== null &&
      this.enlace &&
      this.controller.get('tag').valid &&
      this.controller.get('contact').valid &&
      this.src
    ) {
      const _link: any = {
        _id: this.links[this.linkIndex]._id,
        image: this.src,
        _image: this.file,
        name: this.controller.get('tag').value,
        value: this.controller.get('contact').value,
      };
      this.links[this.linkIndex] = _link;
      for (const name of ['tag', 'contact'])
        this.controller.get(name).setValue('');
      this.file = '';
      this.src = '';
    }
    const flag = this.links.find(({ name }) => name === 'location');
    const value = this.controller.get('location').value;
    if (flag) {
      this.links = this.links.filter(({ name }) => name !== 'location');
      const location = {
        _id: flag._id,
        name: 'location',
        value,
      };
      this.links.push(location);
    } else {
      const location = {
        name: 'location',
        value,
      };
      this.links.push(location);
    }
    this.enlace = false;
    this.direcciones = false;
    this.publicName = false;
    this.bioDescription = false;
    this.main = true;
    this.linkIndex == null;
  }
  add() {
    this.enlace = true;
    this.main = false;
    this.linkIndex = null;
  }

  submit(): void {
    if (!this.controller.touched) return;
    if (this.controller.invalid || this.status) return;
    this.status = 'Cargando...';
    (async () => {
      const { name, description, merchant } = this.controller.value;
      const value = {
        name,
        description,
        // merchant,
        image: this.fileLogo,
      };
      if (!this.contactId) {
        const { _id: contact } = await this._ContactService.createContact(
          value
        );
        this.contactId = contact;
        const banner = {
          image: this.fileLogo,
          name,
          description,
          type: 'standard',
          contact,
        };
        const createBanner = await this._BannersService.createBanner(banner);
        await this.setLinks();
        this.router.navigate(['admin', 'bios-edit'], {
          queryParams: {
            contactId: this.contactId,
          },
        });
      } else {
        const result = await this._ContactService.updateContact(
          this.contactId,
          value
        );
        await this.setLinks();
      }
    })();
  }

  async setLinks(): Promise<void> {
    for (let link of this.links) {
      if (!link._id) {
        const _link: LinkInput = {
          image: link._image,
          name: link.name,
          value: link.value,
        };
        const result = await this._ContactService.contactAddLink(
          _link,
          this.contactId
        );
      } else {
        let _link: any = {
          name: link.name,
          value: link.value,
        };
        if (link._image) _link.image = link._image;
        const result = await this._ContactService.contactUpdateLink(
          _link,
          link._id,
          this.contactId
        );
      }
      // this.links = [...this.links, result];
    }
    for (const name of ['tag', 'contact'])
      this.controller.get(name).setValue('');
    this.file = '';
    this.src = '';
    this.status = '';
  }

  formatImage(image: string): SafeStyle {
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
    this.file =
      'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/whatsapp_black.svg';
    this.src =
      'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/whatsapp_black.svg';
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
    this.file =
      'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/telegram.svg';
    this.src =
      'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/telegram.svg';
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
    this.file =
      'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/telegram.svg';
    this.src =
      'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/telegram.svg';
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
    this.file =
      'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/whatsapp.svg';
    this.src =
      'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/whatsapp.svg';
  }

  resetSrc(): void {
    this.file = '';
    this.src = '';
  }

  navigateToLink(index: number): void {
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
