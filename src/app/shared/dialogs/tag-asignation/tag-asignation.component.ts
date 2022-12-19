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
  @Input('backgroundColor') background: string = '#F6F6F6';
  @Input('textColor') textColor: string = '#272727';
  @Input() iconColor: string = 'brightness(8)';
  @Input() selectedBG: string = '#82F18D';
  @Input() bgColor: string = '#FFFFFF';
  @Input() selectedColor: string = '#FFFFFF';
  @Input() color: string = '#272727';
  @Input() orderId: string = null;
  @Input() public tagAction: (args?: any) => any;
  @Input() entity: 'item' | 'order' = 'order';
  @Input() entityId: string = null;
  @Input('loadingText') loadingText: string = 'ESPERE...';
  @Input('untouchedActionText') untouchedActionText: string = null;
  @Input() outputAllSelectedTags: boolean = false;
  @Input() public ctaAction: (args?: any) => any;
  blockCta: boolean = false;

  constructor(
    private router: Router,
    private ref: DialogRef,
    private headerService: HeaderService
  ) {}

  ngOnInit(): void {}

  goToCreateTag() {
    if (this.headerService.flowRoute)
      localStorage.setItem('flowRoute2', this.headerService.flowRoute);

    this.headerService.flowRoute = this.router.url;

    localStorage.setItem('flowRoute', this.headerService.flowRoute);

    if (this.orderId) {
      this.router.navigate(['admin/create-tag'], {
        queryParams: {
          orderId: this.orderId,
          entity: this.entity,
          entityId: this.entityId,
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

  selectTagHandler(eventData: any) {
    this.untouchedActionText = null;
    this.blockCta = true;
    this.tagAction(eventData);
  }

  submit = async () => {
    this.blockCta = false;
    await this.ctaAction();
    this.blockCta = true;
    this.ref.close();
  };
}
