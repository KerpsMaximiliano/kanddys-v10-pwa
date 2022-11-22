import { Component, OnInit } from '@angular/core';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { Tag } from 'src/app/core/models/tags';
import { TagsService } from 'src/app/core/services/tags.service';
import { Button } from 'src/app/shared/components/general-item/general-item.component';
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

  constructor(private tagsService: TagsService) {}

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

    await this.getMostRecentAndMostAssignedTags();
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

  async getMostRecentAndMostAssignedTags() {
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
    clickEvent: () => {
      alert('clicked icon');
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

    await this.getMostRecentAndMostAssignedTags();
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
