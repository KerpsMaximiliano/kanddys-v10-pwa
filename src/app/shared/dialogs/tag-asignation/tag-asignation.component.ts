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
  @Input() colorTheme: 'client' | 'admin' = 'client';
  @Input('backgroundColor') background: string;
  @Input('textColor') textColor: string;
  @Input() iconColor: string;
  @Input() selectedBG: string;
  @Input() selectedColor: string;
  @Input() bgColor: string;
  @Input() color: string;
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

  ngOnInit(): void {
    if (this.colorTheme === 'client') {
      this.iconColor = 'brightness(8)';
      this.selectedBG = '#82F18D';
      this.selectedColor = '#272727';
      this.bgColor = 'rgba(123, 123, 123, 0.37)';
      this.color = '#FFFFFF';
      this.background = '#272727';
      this.textColor = '#FFFFFF';
    } else {
      this.background = '#F6F6F6';
      this.textColor = '#272727';
      this.iconColor = 'brightness(0)';
      this.selectedBG = '#82F18D';
      this.selectedColor = '#272727';
      this.bgColor = '#cecece';
      this.color = '#272727';
    }
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

    console.log('data de evento', eventData);

    this.tagAction(eventData);
  }

  submit = async () => {
    this.blockCta = false;
    await this.ctaAction();
    this.blockCta = true;
    this.ref.close();
  };
}