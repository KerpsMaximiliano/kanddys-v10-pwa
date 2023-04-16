import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Tag, TagInput, TagStatus } from 'src/app/core/models/tags';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { ConfirmationDialogComponent } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { CreateTagComponent } from 'src/app/shared/dialogs/create-tag/create-tag.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tags-view',
  templateUrl: './tags-view.component.html',
  styleUrls: ['./tags-view.component.scss'],
})
export class TagsViewComponent implements OnInit {
  env: string = environment.assetsUrl;
  tags: Tag[] = [];
  options = [
    {
      text: 'Nueva Categoría',
      icon: 'add',
      callback: () => {
        let dialogRef = this.dialog.open(CreateTagComponent, {
          data: [
            'Ingresa el nombre de la categoría',
            'Ingresa el cover de la categoría',
          ],
        });
        dialogRef.afterClosed().subscribe(async (result) => {
          if (!result) return;
          const data: TagInput = {
            name: result.name,
            entity: 'item',
            images: result.images,
            merchant: this.merchantsService.merchantData._id,
          };
          const createdTag = await this.tagsService.createTag(data);
          this.tags.push(createdTag);
        });
      },
    },
  ];

  panelOpenState = false;
  constructor(
    private tagsService: TagsService,
    private dialog: MatDialog,
    private merchantsService: MerchantsService
  ) {}

  async ngOnInit(): Promise<void> {
    this.tags =
      (await this.tagsService.tagsByUser({
        findBy: {
          entity: 'item',
        },
        options: {
          limit: -1,
        },
      })) || [];
  }

  changeTagStatus(tag: Tag, status: TagStatus) {
    tag.status = status;
    this.tagsService.updateTag(
      {
        status,
      },
      tag._id
    );
  }

  deleteTag(tag: Tag) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: `Eliminar categoría`,
        description: `Estás seguro que deseas eliminar ${tag.name}?`,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirm') {
        this.tags = this.tags.filter((tags) => tags._id !== tag._id);
        this.tagsService.deleteTag(tag._id);
      }
    });
  }

  // changeState() {
  //   this.panelOpenState = !this.panelOpenState;
  // }
}
