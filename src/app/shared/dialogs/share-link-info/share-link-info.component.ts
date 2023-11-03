import { Component, Input, OnInit } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-share-link-info',
  templateUrl: './share-link-info.component.html',
  styleUrls: ['./share-link-info.component.scss']
})
export class ShareLinkInfoComponent implements OnInit {
  @Input() link: string = 'www.laichat.com/userID';

  constructor(
    private clipboard: Clipboard,
    private toastrService: ToastrService,
  ) { }

  ngOnInit(): void {
  }

  copyLink() {
    this.clipboard.copy(this.link);
    this.toastrService.success(
      'Enlace copiado satisfactoriamente'
    );
  }

}
