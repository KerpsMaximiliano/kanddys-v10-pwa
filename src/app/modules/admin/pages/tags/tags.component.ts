import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import {
  StoreShareComponent,
  StoreShareList,
} from 'src/app/shared/dialogs/store-share/store-share.component';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { TagTypeDialogComponent } from 'src/app/shared/dialogs/tag-type-dialog/tag-type-dialog.component';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemListSelectorComponent } from 'src/app/shared/dialogs/item-list-selector/item-list-selector.component';

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
  selectedTags: Array<Tag> = [];
  dependantGridOfTagsToShow: Array<Tag> = null;
  tagsDisplayMode: 'GRID' | 'PER-SECTION' = 'PER-SECTION';
  entityToFilterTagsBy: 'item' | 'order' = null;
  tagsSortCriteria: string = null;
  typeOfTagsGrid: TypeOfTagsGrid = null;
  isTagSelectionModeEnabled: boolean = false;
  isTagReorderingModeEnabled: boolean = false;
  URI: string = environment.uri;
  tagSelectionMode: 'HIGHLIGHT' | 'HIDE' | 'DELETE' | 'UNARCHIVE' = null;
  enforceTagsStatus: string = null;
  justShowArchivedTags: boolean = false;
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
    private ngNavigatorShareService: NgNavigatorShareService,
    private router: Router,
    private route: ActivatedRoute,
    private headerService: HeaderService
  ) {}

  async ngOnInit() {
    this.route.queryParams.subscribe(async (queryParams) => {
      const { selectedTagsFilter, enforceTagsStatus, justShowArchivedTags } =
        queryParams;
      this.justShowArchivedTags = Boolean(justShowArchivedTags);

      const allTagsPagination: PaginationInput = {
        options: {
          sortBy: `createdAt:desc`,
          limit: -1,
        },
      };

      if (enforceTagsStatus) {
        this.enforceTagsStatus = enforceTagsStatus;
        allTagsPagination.findBy = {};

        if (enforceTagsStatus === 'active')
          allTagsPagination.findBy['$or'] = [
            {
              status: 'active',
            },
            {
              status: 'featured',
            },
          ];
        else allTagsPagination.findBy.status = enforceTagsStatus;
      }

      const allTags = !this.justShowArchivedTags
        ? await this.tagsService.tagsByUser(allTagsPagination)
        : await this.tagsService.tagsArchived(allTagsPagination);

      for (const tag of allTags) {
        this.tagsByIdsObject[tag._id] = tag;
      }

      if (!this.justShowArchivedTags) {
        await this.getMostRecentPlusHighlightedPlusMostAssignedTags();

        this.selectedTagsFilter = selectedTagsFilter;

        switch (selectedTagsFilter) {
          case 'Artículos':
            await this.changeStep(1);
            break;
          case 'Facturas':
            await this.changeStep(2);
            break;
          default:
            this.selectedTagsFilter = null;
        }

        if (enforceTagsStatus) {
          await this.showTagsOfType();
        }
      } else {
        await this.showTagsOfType();
      }
    });
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

    pagination.findBy = {};
    if (entity) {
      pagination.findBy.entity = entity;
    } else {
      pagination.findBy['$or'] = [
        {
          entity: 'item',
        },
        {
          entity: 'order',
        },
      ];
    }

    if (this.enforceTagsStatus) {
      if (!pagination.findBy) pagination.findBy = {};

      if (this.enforceTagsStatus === 'active') {
        pagination.findBy['$or'] = [
          {
            status: 'active',
          },
          {
            status: 'featured',
          },
        ];

        if (!entity) {
          pagination.findBy['$or'][0].entity = 'item';
          pagination.findBy['$or'][1].entity = 'item';

          pagination.findBy['$or'][2] = {
            status: 'active',
            entity: 'order',
          };
          pagination.findBy['$or'][3] = {
            status: 'featured',
            entity: 'order',
          };
        }
      } else pagination.findBy.status = this.enforceTagsStatus;
    }

    if (sortCriteria) {
      pagination.options.sortBy = sortCriteria;
    }

    const tagsByUserResult = !this.justShowArchivedTags
      ? await this.tagsService.tagsByUser(pagination)
      : await this.tagsService.tagsArchived(pagination);

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

      this.dependantGridOfTagsToShow.sort((a, b) => {
        if (a.index === null && b.index === null) return 0;
        else if (a.index === null || b.index === null) {
          if (a.index === null) return 1;
          else return -1;
        } else {
          return a.index - b.index;
        }
      });

      this.dependantGridOfTagsToShow.forEach((tag, index) => {
        tag.index = index;
      });

      if (this.tagSelectionMode === 'HIDE') {
        this.dependantGridOfTagsToShow = this.dependantGridOfTagsToShow.filter(
          (tag) => tag.status !== 'disabled'
        );
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
    if (!this.justShowArchivedTags) {
      const list: Array<SettingsDialogButton> = [
        {
          text: 'Renombrar',
          callback: async () => {
            try {
              this.router.navigate(['admin/create-tag/' + tag._id], {
                queryParams: {
                  redirectTo: window.location.href
                    .split('/')
                    .slice(3)
                    .join('/'),
                },
              });
            } catch (error) {
              console.log(error);
            }
          },
        },
        {
          text: 'Archivar (Sin eliminar la data)',
          callback: async () => {
            try {
              const { updateTag: updatedTag } =
                await this.tagsService.updateTag(
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
              await this.openDeleteSingleTagDialog(tag);
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
    } else {
      const list: Array<SettingsDialogButton> = [
        {
          text: 'Dejar de archivar',
          asyncCallback: async (...params) => {
            await this.unarchiveTag(tag);
          },
        },
      ];

      this.dialogService.open(SettingsComponent, {
        type: 'fullscreen-translucent',
        props: {
          optionsList: list,
          title: tag.name ? tag.name : 'Tag sin nombre',
          cancelButton: {
            text: 'Cerrar',
          },
        },
        customClass: 'app-dialog',
        flags: ['no-header'],
      });
    }
  }

  async openGeneralTagsManagementDialog() {
    if (!this.justShowArchivedTags) {
      const list: Array<SettingsDialogButton> = [
        {
          text: 'Destacar',
          asyncCallback: async (params) => {
            this.isTagSelectionModeEnabled = true;
            this.tagSelectionMode = 'HIGHLIGHT';

            await this.showTagsOfType();
          },
        },
        {
          text: 'Esconder',
          asyncCallback: async (params) => {
            this.isTagSelectionModeEnabled = true;
            this.tagSelectionMode = 'HIDE';

            await this.showTagsOfType();
          },
        },
        {
          text: 'Borrar',
          asyncCallback: async (params) => {
            this.isTagSelectionModeEnabled = true;
            this.tagSelectionMode = 'DELETE';

            await this.showTagsOfType();
          },
        },
        {
          text: 'Cambiar el orden de los tags',
          asyncCallback: async (params) => {
            this.isTagReorderingModeEnabled = true;
            await this.showTagsOfType();
          },
        },
      ];

      if (this.entityToFilterTagsBy) {
        list.unshift({
          text: 'Adicionar',
          callback: (...params) => {
            this.router.navigate(['admin/create-tag'], {
              queryParams: {
                entity: this.entityToFilterTagsBy,
                redirectTo: window.location.href.split('/').slice(3).join('/'),
              },
            });
          },
        });
      }

      this.dialogService.open(SettingsComponent, {
        type: 'fullscreen-translucent',
        props: {
          optionsList: list,
          title: 'Gestión de Tags',
          cancelButton: {
            text: 'Cerrar',
          },
        },
        customClass: 'app-dialog',
        flags: ['no-header'],
      });
    } else {
      const list: Array<SettingsDialogButton> = [
        {
          text: 'Dejar de archivar varios tags',
          asyncCallback: async (params) => {
            this.isTagSelectionModeEnabled = true;
            this.tagSelectionMode = 'UNARCHIVE';
          },
        },
      ];

      this.dialogService.open(SettingsComponent, {
        type: 'fullscreen-translucent',
        props: {
          optionsList: list,
          title: 'Gestión de Tags',
          cancelButton: {
            text: 'Cerrar',
          },
        },
        customClass: 'app-dialog',
        flags: ['no-header'],
      });
    }
  }

  async ctaEventHandler() {
    switch (this.tagSelectionMode) {
      case 'HIGHLIGHT':
        await this.highlightMultipleTags();
        break;
      case 'HIDE':
        await this.hideMultipleTags();
        break;
      case 'UNARCHIVE':
        await this.unarchiveMultipleTags();
        break;
      case 'DELETE':
        this.openDeleteMultipleTagsDialog();
        break;
      default:
        // this.dialogService.open(TagTypeDialogComponent, {
        //   type: 'fullscreen-translucent',
        //   props: {},
        // });
        // break;

        this.dialogService.open(ItemListSelectorComponent, {
          props: {
            title: 'Tipo de Tag',
            subTitle: 'Que tipo de grupo necesitas',
            webformOptions: [
              {
                type: 'WEBFORM-ANSWER',
                optionStyles: 'webformAnswerLayoutOptionDefaultStyles',
                selected: false,
                optionIcon:
                  'https://upload.wikimedia.org/wikipedia/en/c/c6/The_Legend_of_Zelda_Breath_of_the_Wild.jpg',
                optionIconStyles: {
                  width: '43px',
                  height: '63px',
                },
                callback: () => null,
                texts: {
                  topRight: {
                    text: '',
                  },
                  topLeft: {
                    text: 'De compradores',
                    styles: {
                      paddingBottom: '8px',
                      width: '100%',
                      'font-family': 'SfProBold',
                      'font-size': '1.063rem',
                      color: '#272727',
                    }, //Estilos a cambiar para que quede como en la imagen
                  },
                  middleTexts: [
                    {
                      text: 'Los agrupa según tus parámetros',
                      styles: {
                        fontFamily: 'SfProRegular',
                        fontSize: '1rem',
                        color: '#4F4F4F',
                      },
                    },
                  ],
                  bottomLeft: {
                    text: '',
                  },
                },
              },
              {
                type: 'WEBFORM-ANSWER',
                optionStyles: 'webformAnswerLayoutOptionDefaultStyles',
                selected: false,
                optionIcon:
                  'https://upload.wikimedia.org/wikipedia/en/c/c6/The_Legend_of_Zelda_Breath_of_the_Wild.jpg',
                optionIconStyles: {
                  width: '43px',
                  height: '63px',
                },
                callback: () => null,
                texts: {
                  topRight: {
                    text: '',
                  },
                  topLeft: {
                    text: 'De Artículos',
                    styles: {
                      paddingBottom: '8px',
                      width: '100%',
                      'font-family': 'SfProBold',
                      'font-size': '1.063rem',
                      color: '#272727',
                    },
                  },
                  middleTexts: [
                    {
                      text: 'Los agrupa según tus parámetros',
                      styles: {
                        fontFamily: 'SfProRegular',
                        fontSize: '1rem',
                        color: '#4F4F4F',
                      },
                    }, //Estilos a cambiar para que quede como en la imagen
                  ],
                  bottomLeft: {
                    text: '',
                  }, //Para que esten vacios
                },
              },
              {
                type: 'WEBFORM-ANSWER',
                optionStyles: 'webformAnswerLayoutOptionDefaultStyles',
                selected: false,
                optionIcon:
                  'https://upload.wikimedia.org/wikipedia/en/c/c6/The_Legend_of_Zelda_Breath_of_the_Wild.jpg',
                optionIconStyles: {
                  width: '43px',
                  height: '63px',
                },
                callback: () => null,
                texts: {
                  topRight: {
                    text: '',
                  },
                  topLeft: {
                    text: 'De Facturas',
                    styles: {
                      paddingBottom: '8px',
                      width: '100%',
                      'font-family': 'SfProBold',
                      'font-size': '1.063rem',
                      color: '#272727',
                    },
                  },
                  middleTexts: [
                    {
                      text: 'Los agrupa según tus parámetros',
                      styles: {
                        fontFamily: 'SfProRegular',
                        fontSize: '1rem',
                        color: '#4F4F4F',
                      },
                    },
                  ],
                  bottomLeft: {
                    text: '',
                  },
                },
              },
            ],
            footer: '',
          },
          type: 'fullscreen-translucent',
          customClass: 'app-dialog',
          flags: ['no-header'],
          notCancellable: true,
        });
        break;
    }
  }

  async openDeleteSingleTagDialog(tag: Tag) {
    const list: StoreShareList[] = [
      {
        title: `¿Eliminar tag ${tag.name}?`,
        description:
          'Esta acción es irreversible, ¿estás seguro que deseas eliminar este tag?',
        message: 'Eliminar',
        messageCallback: async () => {
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
        },
      },
    ];

    this.dialogService.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list,
        alternate: true,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  openDeleteMultipleTagsDialog() {
    const list: StoreShareList[] = [
      {
        title: `¿Eliminar tags?`,
        description:
          'Esta acción es irreversible, ¿estás seguro que deseas eliminar los tags seleccionados?',
        message: 'Eliminar',
        messageCallback: async () => {
          await this.deleteMultipleTags();
        },
      },
    ];

    this.dialogService.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list,
        alternate: true,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  deleteMultipleTags = async () => {
    if (this.selectedTags.length > 0) {
      const arrayOfMutationsForTagsDeletionPromises = [];

      this.selectedTags.forEach((tag, index) => {
        arrayOfMutationsForTagsDeletionPromises.push(this.deleteTag(tag));
      });

      Promise.all(arrayOfMutationsForTagsDeletionPromises)
        .then(async (arrayOfResults) => {
          await this.getMostRecentPlusHighlightedPlusMostAssignedTags();
          this.tagsDisplayMode = 'PER-SECTION';
          this.tagSelectionMode = null;
          this.selectedTags = [];
        })
        .catch((arrayOfErrors) => {
          console.log(arrayOfErrors);
        });
    }
  };

  deleteTag = (tag: Tag): Promise<any> => {
    return new Promise(async (resolve, reject) => {
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
          }

          const recentTagsIndex = this.mostRecentTags.findIndex(
            (tagInList) => tagInList._id === tag._id
          );

          if (recentTagsIndex >= 0) {
            this.mostRecentTags.splice(recentTagsIndex, 1);
          }

          console.log({
            success: true,
            id: tag._id,
          });

          resolve({
            success: true,
            id: tag._id,
          });
        }
      } catch (error) {
        reject({
          success: false,
          id: null,
        });
      }
    });
  };

  highlightMultipleTags = async () => {
    if (this.selectedTags.length > 0) {
      const arrayOfMutationsForHightlightTagsPromises = [];

      this.selectedTags.forEach((tag, index) => {
        arrayOfMutationsForHightlightTagsPromises.push(this.hightlightTag(tag));
      });

      Promise.all(arrayOfMutationsForHightlightTagsPromises)
        .then(async (arrayOfResults) => {
          await this.getMostRecentPlusHighlightedPlusMostAssignedTags();
          this.tagsDisplayMode = 'PER-SECTION';
          this.tagSelectionMode = null;
          this.selectedTags = [];
        })
        .catch((arrayOfErrors) => {
          console.log(arrayOfErrors);
        });
    }
  };

  hightlightTag = (tag: Tag): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        const { updateTag: updatedTag } = await this.tagsService.updateTag(
          {
            status: 'featured',
          },
          tag._id
        );

        if (updatedTag && updatedTag._id)
          resolve({
            success: true,
            id: tag._id,
          });
      } catch (error) {
        reject({
          success: false,
          id: null,
        });
      }
    });
  };

  unarchiveMultipleTags = async () => {
    if (this.selectedTags.length > 0) {
      const arrayOfMutationsForHightlightTagsPromises = [];

      this.selectedTags.forEach((tag, index) => {
        arrayOfMutationsForHightlightTagsPromises.push(
          this.unarchiveTag(tag, true)
        );
      });

      Promise.all(arrayOfMutationsForHightlightTagsPromises)
        .then(async (arrayOfResults) => {
          this.toastr.info('Tags desarchivados', null, {
            timeOut: 1500,
          });
          await this.showTagsOfType();
          this.tagSelectionMode = null;
          this.selectedTags = [];
        })
        .catch((arrayOfErrors) => {
          this.toastr.error('No se pudo desarchivar los tags', null, {
            timeOut: 1500,
          });
          console.log(arrayOfErrors);
        });
    }
  };

  hideMultipleTags = async () => {
    if (this.selectedTags.length > 0) {
      const arrayOfMutationsForHightlightTagsPromises = [];

      this.selectedTags.forEach((tag, index) => {
        arrayOfMutationsForHightlightTagsPromises.push(this.hideTag(tag));
      });

      Promise.all(arrayOfMutationsForHightlightTagsPromises)
        .then(async (arrayOfResults) => {
          await this.getMostRecentPlusHighlightedPlusMostAssignedTags();
          this.tagsDisplayMode = 'PER-SECTION';
          this.tagSelectionMode = null;
          this.selectedTags = [];
        })
        .catch((arrayOfErrors) => {
          console.log(arrayOfErrors);
        });
    }
  };

  hideTag = (tag: Tag): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        const { updateTag: updatedTag } = await this.tagsService.updateTag(
          {
            status: 'disabled',
          },
          tag._id
        );

        if (updatedTag && updatedTag._id)
          resolve({
            success: true,
            id: tag._id,
          });
      } catch (error) {
        reject({
          success: false,
          id: null,
        });
      }
    });
  };

  async getMostRecentPlusHighlightedPlusMostAssignedTags() {
    let pagination: PaginationInput = {
      options: {
        sortBy: `createdAt:desc`,
        limit: 10,
      },
      findBy: {
        $or: [
          {
            entity: 'item',
          },
          {
            entity: 'order',
          },
        ],
      },
    };

    if (this.entityToFilterTagsBy) {
      pagination.findBy = {};
      delete pagination.findBy['$or'];
      pagination.findBy.entity = this.entityToFilterTagsBy;

      if (this.enforceTagsStatus) {
        if (this.enforceTagsStatus === 'active')
          pagination.findBy['$or'] = [
            {
              status: 'active',
            },
            {
              status: 'featured',
            },
          ];
        else pagination.findBy.status = this.enforceTagsStatus;
      }
    } else {
      if (this.enforceTagsStatus === 'active')
        pagination.findBy['$or'] = [
          {
            entity: 'item',
            status: 'active',
          },
          {
            entity: 'order',
            status: 'active',
          },
          {
            entity: 'item',
            status: 'featured',
          },
          {
            entity: 'order',
            status: 'featured',
          },
        ];
      else pagination.findBy.status = this.enforceTagsStatus;
    }

    const mostRecentTags = await this.tagsService.tagsByUser(pagination);
    if (mostRecentTags) this.mostRecentTags = mostRecentTags;

    if (!pagination.findBy) pagination.findBy = {};

    if (!this.enforceTagsStatus || this.enforceTagsStatus !== 'disabled') {
      pagination.findBy.status = 'featured';

      const highlightedTags = await this.tagsService.tagsByUser(pagination);
      if (highlightedTags) this.highlightedTags = highlightedTags;

      delete pagination.findBy.status;
    }

    pagination.options = {
      sortBy: `counter:desc`,
      limit: -1,
    };

    pagination.findBy.counter = {
      $gt: 0,
    };

    if (this.entityToFilterTagsBy) {
      pagination.findBy = {};
      delete pagination.findBy['$or'];
      pagination.findBy.entity = this.entityToFilterTagsBy;

      if (this.enforceTagsStatus) {
        if (this.enforceTagsStatus === 'active')
          pagination.findBy['$or'] = [
            {
              status: 'active',
            },
            {
              status: 'featured',
            },
          ];
        else pagination.findBy.status = this.enforceTagsStatus;
      }
    } else {
      if (this.enforceTagsStatus === 'active')
        pagination.findBy['$or'] = [
          {
            entity: 'item',
            status: 'active',
          },
          {
            entity: 'order',
            status: 'active',
          },
          {
            entity: 'item',
            status: 'featured',
          },
          {
            entity: 'order',
            status: 'featured',
          },
        ];
      else pagination.findBy.status = this.enforceTagsStatus;
    }

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
        sortCriteria = 'index:desc';
        this.headerText = 'Tags recientes';
        break;
      case 'MOST_ASSIGNED':
        sortCriteria = 'index:desc';
        this.headerText = 'Tags más asignados';
        break;
    }

    if (this.justShowArchivedTags) {
      this.headerText = 'Tags archivados';
    }

    switch (this.enforceTagsStatus) {
      case 'disabled':
        this.headerText = 'Tags invisibles';
        break;
      case 'active':
        this.headerText = 'Tags visibles';
        break;
      case 'featured':
        this.headerText = 'Tags destacados';
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

  selectTag(insertTag: boolean, tag: Tag) {
    if (insertTag) {
      this.selectedTags.push(tag);
    } else {
      this.selectedTags = this.selectedTags.filter(
        (tagInList) => tagInList._id !== tag._id
      );
    }
  }

  async dropTagDraggable(event: CdkDragDrop<{ tag: Tag; index: number }>) {
    this.dependantGridOfTagsToShow[event.previousContainer.data.index] =
      event.container.data.tag;
    this.dependantGridOfTagsToShow[event.container.data.index] =
      event.previousContainer.data.tag;

    const currentIndex = event.container.data.index;
    const previousIndex = event.previousContainer.data.index;

    this.dependantGridOfTagsToShow[event.previousContainer.data.index].index =
      event.previousContainer.data.index;
    this.dependantGridOfTagsToShow[event.container.data.index].index =
      event.container.data.index;

    await this.tagsService.updateTag(
      {
        index: currentIndex,
      },
      event.previousContainer.data.tag._id
    );

    await this.tagsService.updateTag(
      {
        index: previousIndex,
      },
      event.container.data.tag._id
    );
  }

  async backButtonAction() {
    if (this.enforceTagsStatus) {
      this.enforceTagsStatus = null;
      await this.getMostRecentPlusHighlightedPlusMostAssignedTags();
    }

    if (
      (this.tagsDisplayMode === 'PER-SECTION' &&
        this.tagSelectionMode === null) ||
      this.justShowArchivedTags
    ) {
      let flowRoute = this.headerService.flowRoute;

      if (!flowRoute) {
        flowRoute = localStorage.getItem('flowRoute');
      }

      if (flowRoute && flowRoute.length > 1) {
        const [baseRoute, paramsString] = flowRoute.split('?');
        const paramsArray = paramsString ? paramsString.split('&') : [];
        const queryParams = {};

        paramsArray.forEach((param) => {
          const [key, value] = param.split('=');

          queryParams[key] = value;
        });

        this.headerService.flowRoute = null;
        localStorage.removeItem('flowRoute');
        this.router.navigate([baseRoute], {
          queryParams,
        });

        return;
      }
    }

    this.headerText = 'Tags';
    this.tagsDisplayMode = 'PER-SECTION';
    this.tagSelectionMode = null;
    this.selectedTags = [];
    this.dependantGridOfTagsToShow = null;
  }

  tagsOptionsButton: Button = {
    clickEvent: (params: Tag) => {
      this.openSingleTagOptionsDialog(params);
    },
  };

  unarchiveTag = async (tag: Tag, multiple: boolean = false): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      const updated = await this.tagsService.updateTag(
        {
          status: 'active',
        },
        tag._id
      );

      if (updated?.updateTag) {
        if (!multiple) {
          this.toastr.info('Tag desarchivado exitosamente', null, {
            timeOut: 1500,
          });
        }

        delete this.tagsByIdsObject[tag._id];

        this.dependantGridOfTagsToShow = this.dependantGridOfTagsToShow.filter(
          (tagInList) => tagInList._id !== tag._id
        );

        resolve({
          success: true,
          id: tag._id,
        });
      } else {
        reject({
          success: false,
          id: tag._id,
        });
      }
    });
  };

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

    if (!this.justShowArchivedTags)
      await this.getMostRecentPlusHighlightedPlusMostAssignedTags();
    else await this.showTagsOfType();
  }

  startDragging(e: MouseEvent, el: HTMLDivElement) {
    this.mouseDown = true;
    this.startX = e.pageX - el.offsetLeft;
    this.scrollLeft = el.scrollLeft;
  }

  stopDragging() {
    this.mouseDown = false;
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

  async share() {
    const link = window.location.href;

    await this.ngNavigatorShareService
      .share({
        title: '',
        url: link,
      })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
