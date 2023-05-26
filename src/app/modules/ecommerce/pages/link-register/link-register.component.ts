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
import { ContactInput } from 'src/app/core/models/contact';

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

  async goBack2() {
    await this.save();
    this.mediaSwiper.directiveRef.prevSlide();
    this.mediaSwiper.directiveRef.prevSlide();
  }

  linkOptions = [
    {
      name: 'Facebook',
      callback: async () => {
        this.linkName = 'Facebook';
        this.itemFormLink.get('name').patchValue(this.linkName);
        this.isMyContact = false;
        this.isOtherContact = false;
        this.contactImage = this.contactLogos[0].img;
        this.nextSlide();
        console.log(this.linkName);
      },
    },
    {
      name: 'Instagram',
      callback: async () => {
        this.linkName = 'Instagram';
        this.itemFormLink.get('name').patchValue(this.linkName);
        this.isMyContact = false;
        this.isOtherContact = false;
        this.contactImage = this.contactLogos[1].img;
        this.nextSlide();
      },
    },
    {
      name: 'TikTok',
      callback: async () => {
        this.linkName = 'TikTok';
        this.itemFormLink.get('name').patchValue(this.linkName);
        this.isMyContact = false;
        this.isOtherContact = false;
        this.contactImage = this.contactLogos[2].img;
        this.nextSlide();
      },
    },
    {
      name: 'Twitter',
      callback: async () => {
        this.linkName = 'Twitter';
        this.itemFormLink.get('name').patchValue(this.linkName);
        this.isMyContact = false;
        this.isOtherContact = false;
        this.contactImage = this.contactLogos[3].img;
        this.nextSlide();
      },
    },
    {
      name: 'Website',
      callback: async () => {
        this.linkName = 'Website';
        this.itemFormLink.get('name').patchValue(this.linkName);
        this.isMyContact = false;
        this.isOtherContact = false;
        this.contactImage = this.contactLogos[4].img;
        this.nextSlide();
      },
    },
    {
      name: 'Correo Electrónico',
      callback: async () => {
        this.linkName = 'Correo Electrónico';
        this.itemFormLink.get('name').patchValue(this.linkName);
        this.isMyContact = false;
        this.isOtherContact = false;
        this.contactImage = this.contactLogos[5].img;
        this.nextSlide();
      },
    },
    {
      name: 'WhatsApp',
      callback: async () => {
        this.linkName = 'WhatsApp';
        this.itemFormLink.get('name').patchValue(this.linkName);
        this.isMyContact = false;
        this.isOtherContact = false;
        this.contactImage = this.contactLogos[6].img;
        this.nextSlide();
      },
    },
    {
      name: 'Mi contacto (foto, nombre, bio...)',
      callback: async () => {
        this.isBasicContact = false;
        this.isOtherContact = false;
        //this.contactImage = this.contactLogos[7].img;
        //this.nextSlide();
        this.router.navigate([`ecommerce/register-my-contact/${this.userId}`]);
      },
    },

    {
      name: 'Link de afiliado de Amazon',
      callback: async () => {
        this.linkName = 'Amazon';
        this.itemFormLink.get('name').patchValue(this.linkName);
        this.isOtherContact = false;
        this.isMyContact = false;
        this.contactImage = this.contactLogos[8].img;
        this.nextSlide();
      },
    },
    {
      name: 'Otro',
      callback: async () => {
        this.isBasicContact = false;
        this.isMyContact = false;
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

  constructor(
    private contactService: ContactService,
    private _ItemsService: ItemsService,
    private router: Router,
    private route: ActivatedRoute,
    private _formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    this.currentMediaSlide = 0;

    this.route.params.subscribe(async (params) => {
      this.userId = params.userId;
      console.log(this.userId);
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

  async save() {
    if (this.itemFormLink.valid) {
      const contactInput: ContactInput = {
        name: this.linkName,
        description: this.link,
        image: this.contactImage,
        type: 'user',
      };

      const newContact = await this.contactService.createContact(contactInput);

      console.log(newContact);
      this.snackBar.open('Ha creado un link de contacto con exito', '', {
        duration: 5000,
      });

      this.router.navigate([`ecommerce/links-view/${this.userId}`]);
    } else {
      this.snackBar.open('Debe llenar todos los campos', '', {
        duration: 5000,
      });
    }
  }
}
