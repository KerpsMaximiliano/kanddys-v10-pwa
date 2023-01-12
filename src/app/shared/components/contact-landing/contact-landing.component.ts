import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from 'src/app/core/services/users.service';
import { environment } from 'src/environments/environment';

interface Contact {
  imgURL?: string;
  ID: string;
  bio?: string;
  
}

@Component({
  selector: 'app-contact-landing',
  templateUrl: './contact-landing.component.html',
  styleUrls: ['./contact-landing.component.scss']
})
export class ContactLandingComponent implements OnInit {

  environment: string = environment.assetsUrl;

  @Input() img: string;
  @Input() contactID: string;
  @Input() contactBio: string;
  @Input() phone: string;
  @Input() whatsapp: string;
  @Input() telegram: string;
  @Input() idUser:string = '';
  src:string;

  constructor(
    private _Router: Router
  ) { }

  ngOnInit(): void {}

  navigate():void{
    const contactId = this.idUser;
    const queryParams = {
      contactId
    }
    this._Router.navigate(['admin','bios-edit'],
    {
      queryParams
    });
  }
}
