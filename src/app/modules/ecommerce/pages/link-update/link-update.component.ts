import { Component, OnInit, ViewChild } from '@angular/core';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ContactService } from 'src/app/core/services/contact.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContactInput } from 'src/app/core/models/contact';

@Component({
  selector: 'app-link-update',
  templateUrl: './link-update.component.html',
  styleUrls: ['./link-update.component.scss'],
})
export class LinkUpdateComponent implements OnInit {
  env: string = environment.assetsUrl;

  @ViewChild('mediaSwiper') mediaSwiper: SwiperComponent;
  slides = [{ number: 0 }, { number: 1 }];
  link: string;

  currentMediaSlide: number = 0;

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

  linkName: string;
  contactImage;

  userId: string;
  contacts;

  constructor(
    private _formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private contactService: ContactService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

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

  contactIndex: number;

  async updateCurrentSlideData() {
    this.currentMediaSlide = this.mediaSwiper.directiveRef.getIndex();
    console.log(this.currentMediaSlide);
  }
  onLinkInput(input: HTMLInputElement) {
    this.link = input.value;
    console.log(this.link);
    this.itemFormLink.get('link').patchValue(this.link);
  }

  async ngOnInit() {
    this.route.params.subscribe(async (params) => {
      this.userId = params.userId;
      console.log(this.userId);
    });

    const pagination = {
      options: { sortBy: 'createdAt:asc', limit: 10, page: 1, range: {} },
      findBy: { user: this.userId },
    };

    const contacts = await this.contactService.contacts(pagination);
    this.contacts = contacts;

    console.log(this.contacts);

    const index = this.route.snapshot.queryParamMap.get('index');
    console.log(index);
    this.contactIndex = +index;
    console.log(this.contactIndex);
  }

  async save() {
    const contact = this.contacts[this.contactIndex];
    console.log(contact);

    this.linkName = contact.name;

    const linkInput: ContactInput = {
      image: contact.image,
      name: this.linkName,
      description: this.link,
      type: 'user',
    };

    const linkId = contact._id;

    // Aqui se esta utilizando updateContact para actualizar un link?
    // El EP para actualizar el link de un contacto es "contactUpdateLink"
    const updatedContact = await this.contactService.updateContact(
      linkId,
      linkInput
    );

    console.log(updatedContact);
    this.snackBar.open('Ha actualizado su link de contacto con exito', '', {
      duration: 5000,
    });
    this.router.navigate([`ecommerce/links-view/${this.userId}`]);
  }

  nextSlide() {
    this.mediaSwiper.directiveRef.nextSlide();
  }

  goBack() {
    this.router.navigate([`ecommerce/link-register/${this.userId}`]);
  }
}
