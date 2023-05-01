import { Component, OnInit, Input } from '@angular/core';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { Contact } from 'src/app/core/models/contact';

@Component({
  selector: 'app-contact-header',
  templateUrl: './contact-header.component.html',
  styleUrls: ['./contact-header.component.scss'],
})
export class ContactHeaderComponent implements OnInit {
  @Input() contact: Contact;
  @Input() bio: string;
  @Input() link: string;
  @Input() chatLink: string;

  constructor(private ngNavigatorShareService: NgNavigatorShareService) {}

  ngOnInit(): void {}

  shareStore() {
    this.ngNavigatorShareService
      .share({
        title: '',
        url: this.link,
      })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  goToChat() {
    window.open(this.chatLink, '_blank');
  }
}
