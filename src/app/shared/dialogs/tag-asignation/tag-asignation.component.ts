import { Component, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderService } from 'src/app/core/services/header.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';
import { environment } from 'src/environments/environment';

interface Tag {
  id: string;
  name: string;
}

@Component({
  selector: 'app-tag-asignation',
  templateUrl: './tag-asignation.component.html',
  styleUrls: ['./tag-asignation.component.scss'],
})
export class TagAsignationComponent implements OnInit {
  env: string = environment.assetsUrl;
  @Input() tags: Tag[] = [];
  @Input() activeTags: Tag[];
  @Input() entity: 'item' | 'order' = 'order';
  @Input() entityId: string = null;
  background: string = '#2874ad';
  @Input('text') text: string = '';
  @Input() orderId: string = null;
  @Input() public tagAction: (args?: any) => any;
  @Input() public ctaAction: (args?: any) => any;

  constructor(
    private router: Router,
    private ref: DialogRef,
    private headerService: HeaderService
  ) {}

  ngOnInit(): void {
    console.log(this.tags);
  }

  goToCreateTag() {
    if (this.headerService.flowRoute)
      localStorage.setItem('flowRoute2', this.headerService.flowRoute);

    this.headerService.flowRoute = this.router.url;

    localStorage.setItem('flowRoute', this.headerService.flowRoute);

    if (this.orderId) {
      this.router.navigate(['admin/create-tag'], {
        queryParams: {
          orderId: this.orderId,
        },
      });
    } else {
      const queryParams: any = {
        entity: this.entity,
      };

      if (this.entityId) queryParams.entityId = this.entityId;

      this.router.navigate(['admin/create-tag'], {
        queryParams,
      });
    }
    this.close();
  }

  close() {
    this.ref.close();
  }

  submit = () => {
    this.ctaAction();
    this.ref.close();
  };
}
