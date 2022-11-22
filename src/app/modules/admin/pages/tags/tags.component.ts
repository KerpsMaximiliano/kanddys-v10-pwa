import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { Tag } from 'src/app/core/models/tags';
import { TagsService } from 'src/app/core/services/tags.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { Button } from 'src/app/shared/components/general-item/general-item.component';
import {
  SettingsComponent,
  SettingsDialogButton,
} from 'src/app/shared/dialogs/settings/settings.component';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { SwiperOptions } from 'swiper';

type TypeOfTagsGrid = 'MOST_ASSIGNED' | 'MOST_RECENT' | 'ALL';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss'],
})
export class TagsComponent implements OnInit {
  env: string = environment.assetsUrl;
  optionsToFilterTagsBy: {
    text: string;
    selected?: boolean;
  }[] = [
    { text: 'Todos', selected: true },
    { text: 'Artículos', selected: false },
    { text: 'Facturas', selected: false },
  ];
  selectedTagsFilter: string = 'Todos';
  mouseDown: boolean;
  startX: number;
  scrollLeft: number;
  headerText: string = 'Tags';
  tagsSwiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: true,
    spaceBetween: 0,
  };
  tagsByIdsObject: Record<string, Tag> = {};
  mostRecentTags: Array<Tag> = [];
  mostAssignedTags: Array<Tag> = [];
  highlightedTags: Array<Tag> = [];
  tagsDisplayMode: 'GRID' | 'PER-SECTION' = 'PER-SECTION';
  dependantGridOfTagsToShow: Array<Tag> = null;
  entityToFilterTagsBy: 'item' | 'order' = null;
  tagsSortCriteria: string = null;
  typeOfTagsGrid: TypeOfTagsGrid = null;
  paginationState: {
    pageSize: number;
    page: number;
    status: 'loading' | 'complete';
  } = {
    page: 1,
    pageSize: 5,
    status: 'complete',
  };

  async infinitePagination() {
    const page = document.querySelector('.tags-page');
    const pageScrollHeight = page.scrollHeight;
    const verticalScroll = window.innerHeight + page.scrollTop;

    if (verticalScroll >= pageScrollHeight) {
      if (this.paginationState.status === 'complete') {
        await this.getTags({
          restartPagination: false,
          triggeredFromScroll: true,
          entity: this.entityToFilterTagsBy,
          sortCriteria: this.tagsSortCriteria,
        });
      }
    }
  }

  @ViewChild('recentTagsSwiper') recentTagsSwiper: SwiperComponent;
  @ViewChild('mostAssignedTagsSwiper') mostAssignedTagsSwiper: SwiperComponent;
  @ViewChild('highlightedTagsSwiper') highlightedTagsSwiper: SwiperComponent;

  constructor(
    private tagsService: TagsService,
    private dialogService: DialogService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  async ngOnInit() {
    const allTags = await this.tagsService.tagsByUser({
      options: {
        sortBy: `createdAt:desc`,
        limit: -1,
      },
    });

    for (const tag of allTags) {
      this.tagsByIdsObject[tag._id] = tag;
    }

    await this.getMostRecentPlusHighlightedPlusMostAssignedTags();
  }

  async getTags(params: {
    restartPagination: boolean;
    triggeredFromScroll: boolean;
    entity?: string;
    sortCriteria?: string;
  }) {
    const { restartPagination, triggeredFromScroll, entity, sortCriteria } =
      params;

    this.paginationState.status = 'loading';

    if (restartPagination) {
      this.paginationState.page = 1;
    } else {
      this.paginationState.page++;
    }

    const pagination: PaginationInput = {
      options: {
        limit: this.paginationState.pageSize,
        page: this.paginationState.page,
      },
    };

    if (entity) {
      pagination.findBy = {};
      pagination.findBy.entity = entity;
    }

    if (sortCriteria) {
      pagination.options.sortBy = sortCriteria;
    }

    const tagsByUserResult = await this.tagsService.tagsByUser(pagination);

    if (tagsByUserResult.length === 0 && this.paginationState.page === 1) {
      this.dependantGridOfTagsToShow = [];
    }

    if (tagsByUserResult.length === 0 && this.paginationState.page !== 1)
      this.paginationState.page--;

    if (tagsByUserResult && tagsByUserResult.length > 0) {
      if (this.paginationState.page === 1) {
        this.dependantGridOfTagsToShow = tagsByUserResult;
      } else {
        this.dependantGridOfTagsToShow =
          this.dependantGridOfTagsToShow.concat(tagsByUserResult);
      }

      this.paginationState.status = 'complete';
    }
  }

  toggleActivateTag = async (tag: Tag): Promise<string> => {
    try {
      await this.tagsService.updateTag(
        {
          status:
            tag.status === 'disabled'
              ? 'active'
              : tag.status === 'active'
              ? 'featured'
              : 'disabled',
        },
        tag._id
      );

      tag.status =
        tag.status === 'disabled'
          ? 'active'
          : tag.status === 'active'
          ? 'featured'
          : 'disabled';

      this.mostAssignedTags.forEach((tagInList) => {
        if (tagInList._id === tag._id) {
          tagInList.status = tag.status;
          this.tagsByIdsObject[tag._id].status = tag.status;
        }
      });

      this.mostRecentTags.forEach((tagInList) => {
        if (tagInList._id === tag._id) {
          tagInList.status = tag.status;
          this.tagsByIdsObject[tag._id].status = tag.status;
        }
      });

      return tag.status;
    } catch (error) {
      console.log(error);
    }
  };

  async openSingleTagOptionsDialog(tag: Tag) {
    console.log(tag._id);
    const list: Array<SettingsDialogButton> = [
      {
        text: 'Renombrar',
        callback: async () => {
          try {
            this.router.navigate(['admin/create-tag/' + tag._id], {
              queryParams: {
                redirectTo: window.location.href.split('/').slice(3).join('/'),
              },
            });
          } catch (error) {
            console.log(error);
          }
        },
      },
      {
        text: 'Archivar',
        callback: async () => {
          try {
            const { updateTag: updatedTag } = await this.tagsService.updateTag(
              {
                status: 'archived',
              },
              tag._id
            );

            if (updatedTag && updatedTag._id) {
              delete this.tagsByIdsObject[tag._id];

              const mostAssignedTagsIndex = this.mostAssignedTags.findIndex(
                (tagInList) => tagInList._id === tag._id
              );

              if (mostAssignedTagsIndex >= 0) {
                this.mostAssignedTags.splice(mostAssignedTagsIndex, 1);
                this.mostAssignedTagsSwiper.directiveRef.update();
              }

              const recentTagsIndex = this.mostRecentTags.findIndex(
                (tagInList) => tagInList._id === tag._id
              );

              if (recentTagsIndex >= 0) {
                this.mostRecentTags.splice(recentTagsIndex, 1);
                this.recentTagsSwiper.directiveRef.update();
              }

              this.toastr.info('Tag archivado exitosamente', null, {
                timeOut: 1500,
              });
            }
          } catch (error) {
            console.log('ocurrio un error', error);
          }
        },
      },
      {
        text: 'Eliminar',
        callback: async () => {
          try {
            const { deleteTag: success } = await this.tagsService.deleteTag(
              tag._id
            );

            if (success) {
              delete this.tagsByIdsObject[tag._id];

              const mostAssignedTagsIndex = this.mostAssignedTags.findIndex(
                (tagInList) => tagInList._id === tag._id
              );

              if (mostAssignedTagsIndex >= 0) {
                this.mostAssignedTags.splice(mostAssignedTagsIndex, 1);
                this.mostAssignedTagsSwiper.directiveRef.update();
              }

              const recentTagsIndex = this.mostRecentTags.findIndex(
                (tagInList) => tagInList._id === tag._id
              );

              if (recentTagsIndex >= 0) {
                this.mostRecentTags.splice(recentTagsIndex, 1);
                this.recentTagsSwiper.directiveRef.update();
              }

              this.toastr.info('Tag eliminado exitosamente', null, {
                timeOut: 1500,
              });
            }
          } catch (error) {}
        },
      },
    ];

    const toggleStatus = () => {
      return new Promise((resolve, reject) => {
        let previousStatus = tag.status;

        this.toggleActivateTag(tag).then((newStatus) => {
          newStatus === 'disabled'
            ? (number = 2)
            : newStatus === 'active'
            ? (number = 0)
            : (number = 1);

          if (newStatus === 'featured' && previousStatus !== 'featured') {
            this.highlightedTags.push(tag);

            setTimeout(() => {
              if (
                this.highlightedTagsSwiper &&
                this.highlightedTagsSwiper.directiveRef
              )
                this.highlightedTagsSwiper.directiveRef.update();
            }, 300);
          } else if (
            newStatus !== 'featured' &&
            previousStatus === 'featured'
          ) {
            const highlightedTagsIndex = this.highlightedTags.findIndex(
              (tagInList) => tagInList._id === tag._id
            );

            if (highlightedTagsIndex >= 0) {
              this.highlightedTags.splice(highlightedTagsIndex, 1);
              this.highlightedTagsSwiper.directiveRef.update();
            }

            if (this.highlightedTags.length > 0) {
              setTimeout(() => {
                if (
                  this.highlightedTagsSwiper &&
                  this.highlightedTagsSwiper.directiveRef
                )
                  this.highlightedTagsSwiper.directiveRef.update();
              }, 300);
            }
          }

          resolve(true);
        });
      });
    };

    let number: number =
      tag.status === 'disabled' ? 2 : tag.status === 'active' ? 0 : 1;
    const statuses = [
      {
        text: 'VISIBLE (NO DESTACADO)',
        backgroundColor: '#82F18D',
        color: '#174B72',
        asyncCallback: toggleStatus,
      },
      {
        text: 'VISIBLE (Y DESTACADO)',
        backgroundColor: '#82F18D',
        color: '#174B72',
        asyncCallback: toggleStatus,
      },
      {
        text: 'INVISIBLE',
        backgroundColor: '#B17608',
        color: 'white',
        asyncCallback: toggleStatus,
      },
    ];

    this.dialogService.open(SettingsComponent, {
      type: 'fullscreen-translucent',
      props: {
        optionsList: list,
        statuses,
        //qr code in the xd's too small to scanning to work
        indexValue: number,
        title: tag.name ? tag.name : 'Tag sin nombre',
        cancelButton: {
          text: 'Cerrar',
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  async getMostRecentPlusHighlightedPlusMostAssignedTags() {
    let pagination: PaginationInput = {
      options: {
        sortBy: `createdAt:desc`,
        limit: 10,
      },
    };

    if (this.entityToFilterTagsBy) {
      pagination.findBy = {};
      pagination.findBy.entity = this.entityToFilterTagsBy;
    }

    const mostRecentTags = await this.tagsService.tagsByUser(pagination);
    if (mostRecentTags) this.mostRecentTags = mostRecentTags;

    if (!pagination.findBy) pagination.findBy = {};
    pagination.findBy.status = 'featured';
    const highlightedTags = await this.tagsService.tagsByUser(pagination);
    if (highlightedTags) this.highlightedTags = highlightedTags;

    delete pagination.findBy.status;

    pagination.options = {
      sortBy: `counter:desc`,
      limit: 10,
    };

    const mostAssignedTags = await this.tagsService.tagsByUser(pagination);

    if (mostAssignedTags) this.mostAssignedTags = mostAssignedTags;
  }

  scrollToTheTopOfThePage() {
    const scrollElem = document.querySelector('#top-of-the-page');
    scrollElem.scrollIntoView();
  }

  async showTagsOfType(type: TypeOfTagsGrid = 'ALL') {
    this.scrollToTheTopOfThePage();

    this.typeOfTagsGrid = type;
    let tagsEntity = null;
    let sortCriteria = null;

    switch (this.selectedTagsFilter) {
      case 'Artículos':
        tagsEntity = 'item';
        break;
      case 'Facturas':
        tagsEntity = 'order';
        break;
    }

    this.entityToFilterTagsBy = tagsEntity;

    switch (type) {
      case 'MOST_RECENT':
        sortCriteria = 'createdAt:desc';
        this.headerText = 'Tags recientes';
        break;
      case 'MOST_ASSIGNED':
        sortCriteria = 'counter:desc';
        this.headerText = 'Tags más asignados';
        break;
    }

    this.tagsSortCriteria = sortCriteria;

    await this.getTags({
      restartPagination: true,
      triggeredFromScroll: false,
      entity: this.entityToFilterTagsBy,
      sortCriteria,
    });

    this.tagsDisplayMode = 'GRID';
  }

  backButtonAction() {
    this.headerText = 'Tags';
    this.tagsDisplayMode = 'PER-SECTION';
    this.dependantGridOfTagsToShow = null;
  }

  stopDragging() {
    this.mouseDown = false;
  }

  tagsOptionsButton: Button = {
    clickEvent: (params: Tag) => {
      this.openSingleTagOptionsDialog(params);
    },
  };

  startDragging(e: MouseEvent, el: HTMLDivElement) {
    this.mouseDown = true;
    this.startX = e.pageX - el.offsetLeft;
    this.scrollLeft = el.scrollLeft;
  }

  async changeStep(indexToSelect: number) {
    this.optionsToFilterTagsBy.forEach((option, index) => {
      if (index === indexToSelect) {
        option.selected = true;
        this.selectedTagsFilter = option.text;
      } else {
        option.selected = false;
      }
    });

    switch (this.selectedTagsFilter) {
      case 'Artículos':
        this.entityToFilterTagsBy = 'item';
        break;
      case 'Facturas':
        this.entityToFilterTagsBy = 'order';
        break;
      default:
        this.entityToFilterTagsBy = null;
    }

    await this.getMostRecentPlusHighlightedPlusMostAssignedTags();
  }

  moveEvent(e: MouseEvent, el: HTMLDivElement) {
    e.preventDefault();
    if (!this.mouseDown) {
      return;
    }
    const x = e.pageX - el.offsetLeft;
    const scroll = x - this.startX;
    el.scrollLeft = this.scrollLeft - scroll;
  }
}
