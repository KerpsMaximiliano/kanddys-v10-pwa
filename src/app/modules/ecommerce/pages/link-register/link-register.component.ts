import { Component, OnInit, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import Swiper, { SwiperOptions } from 'swiper';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import { ContactService } from 'src/app/core/services/contact.service';
import { fileToBase64 } from 'src/app/core/helpers/files.helpers';
import { ItemImageInput } from 'src/app/core/models/item';
import { ItemsService } from 'src/app/core/services/items.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Contact, ContactInput } from 'src/app/core/models/contact';
import { HeaderService } from 'src/app/core/services/header.service';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { User } from 'src/app/core/models/user';

@Component({
  selector: 'app-link-register',
  templateUrl: './link-register.component.html',
  styleUrls: ['./link-register.component.scss'],
})
export class LinkRegisterComponent implements OnInit {
  env: string = environment.assetsUrl;
  @ViewChild('mediaSwiper') mediaSwiper: SwiperComponent;
  linkName: string;
  link: string;
  isBasicContact: boolean = true;
  isMyContact: boolean = true;
  isOtherContact: boolean = true;
  file;
  base64;
  images;
  contactImage;

  slides = [
    { number: 0 },
    { number: 1 },
    { number: 2 },
    { number: 3 },
    { number: 4 },
    //{ number: 5 },
  ];

  filteredSlides = [
    { number: 0 },
    { number: 1 },
    { number: 2 },
    { number: 3 },
    { number: 4 },
    //{ number: 5 },
  ];

  async onImageInput(file) {
    this.file = file;
    console.log(this.file);
    this.base64 = await fileToBase64(file[0]);
    console.log(this.base64);
    let images: ItemImageInput[] = this.file.map((file) => {
      return {
        file: file,
        index: 0,
        active: true,
      };
    });

    this.images = images;

    this.contactImage = file[0];

    const reader = new FileReader();
    reader.onload = (e) => {
      this._ItemsService.editingImageId = this.images[0]._id;
    };
  }

  nextSlide() {
    this.mediaSwiper.directiveRef.nextSlide();
  }

  goBack() {
    this.router.navigate([`ecommerce/links-view/${this.userId}`]);
  }

  async goBack2(preventRedirection = false) {
    await this.save(preventRedirection);
    this.mediaSwiper.directiveRef.prevSlide();
  }

  linkOptions = [
    {
      name: 'Facebook',
      callback: async () => {
        if (this.isOtherContact) {
          this.isOtherContact = false;
          this.isBasicContact = true;
        }

        this.linkName = 'Facebook';
        this.itemFormLink.get('name').patchValue(this.linkName);
        this.isMyContact = false;
        this.isOtherContact = false;

        this.contactImage = this.contactLogos[0].img;
        this.mediaSwiper.directiveRef.update();

        this.filteredSlides = [this.slides[0], this.slides[1]];

        this.nextSlide();
        console.log(this.linkName);
      },
    },
    {
      name: 'Instagram',
      callback: async () => {
        if (this.isOtherContact) {
          this.isOtherContact = false;
          this.isBasicContact = true;
        }

        this.linkName = 'Instagram';
        this.itemFormLink.get('name').patchValue(this.linkName);
        this.isMyContact = false;
        this.isOtherContact = false;
        this.contactImage = this.contactLogos[1].img;
        this.mediaSwiper.directiveRef.update();
        this.filteredSlides = [this.slides[0], this.slides[1]];
        this.nextSlide();
      },
    },
    {
      name: 'TikTok',
      callback: async () => {
        if (this.isOtherContact) {
          this.isOtherContact = false;
          this.isBasicContact = true;
        }

        this.linkName = 'TikTok';
        this.itemFormLink.get('name').patchValue(this.linkName);
        this.isMyContact = false;
        this.isOtherContact = false;
        this.contactImage = this.contactLogos[2].img;
        this.mediaSwiper.directiveRef.update();
        this.filteredSlides = [this.slides[0], this.slides[1]];
        this.nextSlide();
      },
    },
    {
      name: 'Twitter',
      callback: async () => {
        if (this.isOtherContact) {
          this.isOtherContact = false;
          this.isBasicContact = true;
        }

        this.linkName = 'Twitter';
        this.itemFormLink.get('name').patchValue(this.linkName);
        this.isMyContact = false;
        this.isOtherContact = false;
        this.contactImage = this.contactLogos[3].img;
        this.mediaSwiper.directiveRef.update();
        this.filteredSlides = [this.slides[0], this.slides[1]];
        this.nextSlide();
      },
    },
    {
      name: 'Website',
      callback: async () => {
        if (this.isOtherContact) {
          this.isOtherContact = false;
          this.isBasicContact = true;
        }

        this.linkName = 'Website';
        this.itemFormLink.get('name').patchValue(this.linkName);
        this.isMyContact = false;
        this.isOtherContact = false;
        this.contactImage = this.contactLogos[4].img;
        this.mediaSwiper.directiveRef.update();
        this.filteredSlides = [this.slides[0], this.slides[1]];
        this.nextSlide();
      },
    },
    {
      name: 'Correo Electrónico',
      callback: async () => {
        if (this.isOtherContact) {
          this.isOtherContact = false;
          this.isBasicContact = true;
        }

        this.linkName = 'Correo Electrónico';
        this.itemFormLink.get('name').patchValue(this.linkName);
        this.isMyContact = false;
        this.isOtherContact = false;
        this.contactImage = this.contactLogos[5].img;
        this.mediaSwiper.directiveRef.update();
        this.filteredSlides = [this.slides[0], this.slides[1]];
        this.nextSlide();
      },
    },
    {
      name: 'WhatsApp',
      callback: async () => {
        if (this.isOtherContact) {
          this.isOtherContact = false;
          this.isBasicContact = true;
        }

        this.linkName = 'WhatsApp';
        this.itemFormLink.get('name').patchValue(this.linkName);
        this.isMyContact = false;
        this.isOtherContact = false;
        this.contactImage = this.contactLogos[6].img;
        this.mediaSwiper.directiveRef.update();
        this.filteredSlides = [this.slides[0], this.slides[1]];
        this.nextSlide();
      },
    },
    {
      name: 'Mi contacto (foto, nombre, bio...)',
      callback: async () => {
        this.isBasicContact = false;
        this.isOtherContact = false;
        this.mediaSwiper.directiveRef.update();
        //this.contactImage = this.contactLogos[7].img;
        //this.nextSlide();
        this.router.navigate([`ecommerce/register-my-contact/${this.userId}`]);
      },
    },

    {
      name: 'Link de afiliado de Amazon',
      callback: async () => {
        if (this.isOtherContact) {
          this.isOtherContact = false;
          this.isBasicContact = true;
        }

        this.linkName = 'Amazon';
        this.itemFormLink.get('name').patchValue(this.linkName);
        this.isOtherContact = false;
        this.isMyContact = false;
        this.contactImage = this.contactLogos[8].img;
        this.mediaSwiper.directiveRef.update();
        this.filteredSlides = [this.slides[0], this.slides[1]];
        this.nextSlide();
      },
    },
    {
      name: 'Otro',
      callback: async () => {
        this.isBasicContact = false;
        this.isMyContact = false;
        this.isOtherContact = true;
        this.mediaSwiper.directiveRef.update();
        this.filteredSlides = [
          this.slides[0],
          this.slides[2],
          this.slides[3],
          this.slides[4],
        ];
        this.nextSlide();
      },
    },
  ];

  contactLogos = [
    {
      name: 'facebook',
      img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Logo_de_Facebook.png/899px-Logo_de_Facebook.png',
    },
    {
      name: 'instagram',
      img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/198px-Instagram_logo_2016.svg.png',
    },
    {
      name: 'tiktok',
      img: 'https://cdn.pixabay.com/photo/2021/01/30/06/42/tiktok-5962992_1280.png',
    },
    {
      name: 'twitter',
      img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Twitter-logo.svg/768px-Twitter-logo.svg.png',
    },
    {
      name: 'website',
      img: 'https://seeklogo.com/images/W/web-icon-logo-A6B586D114-seeklogo.com.png',
    },
    {
      name: 'email',
      img: 'https://w7.pngwing.com/pngs/243/358/png-transparent-black-and-white-e-mail-logo-email-computer-icons-icon-design-email-miscellaneous-angle-triangle.png',
    },
    {
      name: 'whatsapp',
      img: 'https://cdn-icons-png.flaticon.com/512/124/124034.png?w=360',
    },
    {
      name: 'contact',
      img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Google_Contacts_icon.svg/2048px-Google_Contacts_icon.svg.png',
    },
    {
      name: 'amazon',
      img: 'https://descuentocodigos.com/wp-content/uploads/2018/02/LOGO-AMAZON-CUADRADO.png',
    },
  ];

  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    resistance: false,
    freeMode: false,
    spaceBetween: 0,
    allowSlideNext: true,
  };

  currentMediaSlide: number;
  userId: number;

  linkNameF;

  itemFormLink = this._formBuilder.group({
    link: [
      null,
      [
        Validators.required,
        // Validators.pattern(
        //   '[-a-zA-Z0-9@:%._+~#=]{1,256}.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)'
        // ),
        Validators.minLength(4),
      ],
    ],
    name: [null, [Validators.required, Validators.minLength(4)]],
  });

  myContact: Contact = null;
  myUser: User = null;

  constructor(
    private contactService: ContactService,
    private _ItemsService: ItemsService,
    private router: Router,
    private route: ActivatedRoute,
    private _formBuilder: FormBuilder,
    private headerService: HeaderService,
    private app: AppService,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    this.currentMediaSlide = 0;

    this.route.params.subscribe(async (params) => {
      this.userId = params.userId;

      const sub = this.app.events
        .pipe(filter((e) => e.type === 'auth'))
        .subscribe(async (e) => {
          this.myUser = e.data.user;

          const myContacts = await this.contactService.contacts({
            findBy: {
              user: this.myUser._id,
            },
          });

          if (myContacts.length) {
            this.myContact = myContacts[0];
          }

          console.log('Mis contactos', myContacts);
          console.log('Usuario', this.headerService.user);
        });
    });
  }

  async updateCurrentSlideData() {
    this.currentMediaSlide = this.mediaSwiper.directiveRef.getIndex();
    console.log(this.currentMediaSlide);
  }

  onLinkInput(input: HTMLInputElement) {
    this.link = input.value;
    console.log(this.link);
    this.itemFormLink.get('link').patchValue(this.link);
  }
  onLinkNameInput(input: HTMLInputElement) {
    this.linkName = input.value;
    console.log(this.linkName);
    this.itemFormLink.get('name').patchValue(this.linkName);
  }

  getIndicators() {
    return 'repeat( ' + this.filteredSlides.length + ',1fr)';
  }

  isSlideVisible(index: number) {
    return this.filteredSlides.find((slide) => slide.number === index);
  }

  async save(preventRedirection = false) {
    if (this.itemFormLink.valid) {
      /*
      const contactInput: ContactInput = {
        name: this.linkName,
        description: this.link,
        image: this.contactImage,
        type: 'user',
      };
      */

      const contactInput: ContactInput = {
        name: 'Mis formas de contacto',
        type: 'user',
      };

      try {
        if (this.myContact) {
          const linkAdded = await this.contactService.contactAddLink(
            {
              name: this.linkName,
              image: this.contactImage,
              value: this.link,
            },
            this.myContact._id
          );

          this.snackBar.open('Ha creado un link de contacto con exito', '', {
            duration: 5000,
          });

          if (!preventRedirection)
            this.router.navigate([`ecommerce/links-view/${this.userId}`]);
        } else {
          const newContact = await this.contactService.createContact(
            contactInput
          );

          const linkAdded = await this.contactService.contactAddLink(
            {
              name: this.linkName,
              image: this.contactImage,
              value: this.link,
            },
            newContact._id
          );

          this.snackBar.open('Ha creado un link de contacto con exito', '', {
            duration: 5000,
          });

          if (!preventRedirection)
            this.router.navigate([`ecommerce/links-view/${this.userId}`]);
        }
      } catch (error) {
        this.snackBar.open('Ocurrió un error', '', {
          duration: 5000,
        });

        console.error(error);
      }
    } else {
      this.snackBar.open('Debe llenar todos los campos', '', {
        duration: 5000,
      });
    }
  }
}
