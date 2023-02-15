import { Location } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Link } from 'src/app/core/models/contact';
import { HeaderService } from 'src/app/core/services/header.service';
import { UsersService } from 'src/app/core/services/users.service';
import { environment } from 'src/environments/environment';
import { ConfirmationDialogComponent } from '../../dialogs/confirmation-dialog/confirmation-dialog.component';
import { isEmail } from 'src/app/core/helpers/strings.helpers';

interface Contact {
  imgURL?: string;
  ID: string;
  bio?: string;
}

@Component({
  selector: 'app-contact-landing',
  templateUrl: './contact-landing.component.html',
  styleUrls: ['./contact-landing.component.scss'],
})
export class ContactLandingComponent implements OnInit {
  environment: string = environment.assetsUrl;

  @Input() img: string;
  @Input() contactID: string;
  @Input() contactBio: string;
  @Input() phone: string;
  @Input() whatsapp: string;
  @Input() telegram: string;
  @Input() idUser: string = '';
  @Input() links: Link[] = [];
  @Input() contactDirection: string;
  @Input() locationString: string;
  isOwner: boolean;
  src: string;
  isEmail = isEmail;

  constructor(
    private _Router: Router,
    private location: Location,
    public headerService: HeaderService,
    private usersService: UsersService,
    private toastrService: ToastrService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.isOwner = this.idUser === this.headerService.user?._id;
  }

  navigate(): void {
    const contactId = this.idUser;
    const queryParams = {
      contactId,
    };
    this._Router.navigate(['admin', 'bios-edit'], {
      queryParams,
    });
  }

  async deleteMe() {
    const deleted = await this.usersService.deleteMe();

    if (deleted) {
      this.toastrService.info('Usuario borrado exitosamente', null, {
        timeOut: 1500,
      });

      localStorage.removeItem('session-token');

      this._Router.navigate(['auth/login']);
    } else {
      this.toastrService.error('Ocurrió un error, intentalo de nuevo', null, {
        timeOut: 1500,
      });
    }
  }

  openConfirmationDialog() {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: `Borrar perfil`,
        description: `¿Estás seguro que deseas borrar tu perfil?`,
      },
    });
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result === 'confirm') {
        await this.deleteMe();
      }
    });
  }

  goBack() {
    this.location.back();
  }
}
