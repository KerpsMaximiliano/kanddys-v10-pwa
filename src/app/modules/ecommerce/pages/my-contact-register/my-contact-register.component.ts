import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { fileToBase64 } from 'src/app/core/helpers/files.helpers';
import { ItemImageInput } from 'src/app/core/models/item';
import { ItemsService } from 'src/app/core/services/items.service';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContactService } from 'src/app/core/services/contact.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Contact, ContactInput } from 'src/app/core/models/contact';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';

@Component({
  selector: 'app-my-contact-register',
  templateUrl: './my-contact-register.component.html',
  styleUrls: ['./my-contact-register.component.scss'],
})
export class MyContactRegisterComponent implements OnInit {
  env: string = environment.assetsUrl;
  file;
  base64;
  images;
  contactImage;
  showButton: boolean = false;
  name: string;
  lastname: string;
  title: string;
  bio: string;
  userId: string;
  myContact: Contact = null;

  constructor(
    private _ItemsService: ItemsService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private contactService: ContactService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    this.route.params.subscribe(async (params) => {
      this.userId = params.userId;
      console.log(this.userId);
    });

    if (
      this.itemFormLastName &&
      this.itemFormName &&
      this.itemFormTitle &&
      this.file
    ) {
      this.showButton = true;
    }

    const myContacts = await this.contactService.contacts({
      findBy: {
        user: this.userId,
      },
    });

    if (myContacts.length) {
      this.myContact = myContacts[0];
    }
  }

  itemFormName = this.formBuilder.group({
    name: [Validators.required, Validators.minLength(3)],
  });
  itemFormLastName = this.formBuilder.group({
    lastname: [Validators.required, Validators.minLength(3)],
  });

  itemFormTitle = this.formBuilder.group({
    title: [Validators.required, Validators.minLength(3)],
  });

  itemFormBio = this.formBuilder.group({
    bio: [Validators.required, Validators.minLength(3)],
  });

  onNameInput(input: HTMLInputElement) {
    this.name = input.value;
    console.log(this.name);
    this.itemFormName.get('name').patchValue(this.name);
  }

  onLastInput(input: HTMLInputElement) {
    this.lastname = input.value;
    this.itemFormLastName.get('lastname').patchValue(this.lastname);
  }

  onTitleInput(input: HTMLInputElement) {
    this.title = input.value;
    this.itemFormTitle.get('title').patchValue(this.title);
  }

  onBioInput(input: HTMLInputElement) {
    this.bio = input.value;
    this.itemFormBio.get('bio').patchValue(this.bio);
  }

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

  goBack() {
    this.router.navigate([`ecommerce/link-register/${this.userId}`]);
  }

  async save() {
    lockUI();

    try {
      if (
        this.itemFormName.valid &&
        this.itemFormBio.valid &&
        this.itemFormLastName.valid &&
        this.itemFormTitle.valid
      ) {
        const fullName = this.name + ' ' + this.lastname;

        const contactInput: ContactInput = {
          name: fullName,
          description: this.title,
          image: this.contactImage,
          type: 'user',
        };

        if (this.myContact) {
          await this.contactService.updateContact(
            this.myContact._id,
            contactInput
          );

          this.snackBar.open('Se ha actualizado su contacto con exito', '', {
            duration: 5000,
          });
        } else {
          await this.contactService.createContact(contactInput);

          this.snackBar.open('Ha creado un link de contacto con exito', '', {
            duration: 5000,
          });
        }
      } else if (
        (!this.itemFormName.valid || !this.itemFormLastName.valid) &&
        this.itemFormBio.valid &&
        this.itemFormTitle.valid
      ) {
        const contactInput: ContactInput = {
          name: this.bio,
          description: this.title,
          image: this.contactImage,
          type: 'user',
        };

        if (this.myContact) {
          await this.contactService.updateContact(
            this.myContact._id,
            contactInput
          );

          this.snackBar.open(
            'Se ha actualizado un link de contacto con exito',
            '',
            {
              duration: 5000,
            }
          );
        } else {
          const newContact = await this.contactService.createContact(
            contactInput
          );

          this.snackBar.open('Ha creado un link de contacto con exito', '', {
            duration: 5000,
          });
        }
      } else {
        this.snackBar.open(
          'Los campos: Titulo, Bio e Imagen son obligatorios',
          '',
          {
            duration: 5000,
          }
        );
      }

      unlockUI();
    } catch (error) {
      unlockUI();
    }
  }
}
