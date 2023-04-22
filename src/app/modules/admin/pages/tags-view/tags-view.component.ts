import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Tag, TagInput, TagStatus } from 'src/app/core/models/tags';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { ConfirmationDialogComponent } from 'src/app/shared/dialogs/confirmation-dialog/confirmation-dialog.component';
import { CreateTagComponent } from 'src/app/shared/dialogs/create-tag/create-tag.component';
import { environment } from 'src/environments/environment';

type ViewTypes = 'visible' | 'hidden' | 'featured' | 'all';

@Component({
  selector: 'app-tags-view',
  templateUrl: './tags-view.component.html',
  styleUrls: ['./tags-view.component.scss'],
})
export class TagsViewComponent implements OnInit {
  env: string = environment.assetsUrl;
  tags: Tag[] = [];
  hiddenTags: Tag[] = [];
  featuredTags: Tag[] = [];
  visibleTags: Tag[] = [];

  selectedTags: Tag[] = [];
  view: ViewTypes = 'all';
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
          this.organizeTags();
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
    this.organizeTags();
  }

  changeTagStatus(tag: Tag, status: TagStatus) {
    tag.status = status;
    this.tagsService.updateTag(
      {
        status,
      },
      tag._id
    );
    this.organizeTags();
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
        this.organizeTags();
      }
    });
  }

  deleteSelected() {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: `Eliminar categoría`,
        description: `Estás seguro que deseas eliminar ${
          this.selectedTags.length
        } categoría${this.selectedTags.length > 1 ? 's' : ''}?`,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirm') {
        this.selectedTags.forEach((selectedTag) => {
          this.tags = this.tags.filter((tags) => tags._id !== selectedTag._id);
          this.tagsService.deleteTag(selectedTag._id);
        });
        this.organizeTags();
      }
    });
  }

  chnageStatusSelected() {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: `${
          this.view === 'visible' || this.view === 'featured'
            ? 'Ocultar'
            : 'Mostrar'
        } categorías`,
        description: `Estás seguro que deseas ${
          this.view === 'visible' || this.view === 'featured'
            ? 'ocultar'
            : 'mostrar'
        } las categorías seleccionadas?`,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'confirm') {
        this.selectedTags.forEach((tag) => {
          const newStatus =
            this.view === 'visible' || this.view === 'featured'
              ? 'disabled'
              : 'active';
          tag.status = newStatus;
          this.tagsService.updateTag(
            {
              status: newStatus,
            },
            tag._id
          );
        });
        this.organizeTags();
      }
    });
  }

  organizeTags() {
    this.visibleTags = this.tags.filter(
      (tag) => tag.status === 'active' || tag.status === 'featured'
    );
    this.featuredTags = this.tags.filter((tag) => tag.status === 'featured');
    this.hiddenTags = this.tags.filter((tag) => tag.status === 'disabled');
  }

  addTag(tag: Tag) {
    if (this.selectedTags.includes(tag))
      this.selectedTags = this.selectedTags.filter(
        (selectedTag) => selectedTag._id !== tag._id
      );
    else this.selectedTags.push(tag);
  }

  changeView(view: ViewTypes) {
    this.view = view;
    this.selectedTags = [];
  }
}
