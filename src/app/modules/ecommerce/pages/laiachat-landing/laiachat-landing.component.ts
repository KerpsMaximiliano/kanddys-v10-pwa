import { ChangeDetectorRef, Component, OnInit, Renderer2 } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';

import { ToastrService } from 'ngx-toastr';
import { truncateString } from 'src/app/core/helpers/strings.helpers';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Chat } from 'src/app/core/models/chat';
import { Merchant } from 'src/app/core/models/merchant';
import { User } from 'src/app/core/models/user';
import { ChatService } from 'src/app/core/services/chat.service';
import { Gpt3Service } from 'src/app/core/services/gpt3.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { UsersService } from 'src/app/core/services/users.service';
import { WhatsappService } from 'src/app/core/services/whatsapp.service';
import { MessageDialogComponent } from 'src/app/shared/dialogs/message-dialog/message-dialog.component';
import { OptionsMenuComponent } from 'src/app/shared/dialogs/options-menu/options-menu.component';
import { SelectRoleDialogComponent } from 'src/app/shared/dialogs/select-role-dialog/select-role-dialog.component';
import { environment } from 'src/environments/environment';
import { AudioRecorderComponent } from 'src/app/shared/components/audio-recorder/audio-recorder.component';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { filter } from 'rxjs/operators';
import { RecordRTCService } from 'src/app/core/services/recordrtc.service';
import { GeneralFormSubmissionDialogComponent } from 'src/app/shared/dialogs/general-form-submission-dialog/general-form-submission-dialog.component';
import { StatusAudioRecorderComponent } from 'src/app/shared/dialogs/status-audio-recorder/status-audio-recorder.component';
import { FilesService } from 'src/app/core/services/files.service';
import { fileToBase64 } from 'src/app/core/helpers/files.helpers';
import { ShareLinkInfoComponent } from 'src/app/shared/dialogs/share-link-info/share-link-info.component';
import { FormControl } from '@angular/forms';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';

interface ExtendedChat extends Chat {
  receiver?: User;
  receiverId?: string;
}

interface ChatsByMonth {
  id: string;
  month: {
    number: number;
    label: string;
  };
  year: number;
  chats: Array<ExtendedChat>;
}

@Component({
  selector: 'app-laiachat-landing',
  templateUrl: './laiachat-landing.component.html',
  styleUrls: ['./laiachat-landing.component.scss']
})
export class LaiachatLandingComponent implements OnInit {
  loginflow: boolean = false;
  assetsFolder: string = environment.assetsUrl;

  loginEmail: string = null;
  magicLink: boolean = false;
  redirectionRoute: string = '/ecommerce/club-landing';
  redirectionRouteId: string | null = null;
  entity: string = 'MerchantAccess';
  jsondata: string = JSON.stringify({
    openNavigation: true,
  });
  clientConnectionStatus = false;
  merchantSlug: string;
  merchantName: string;
  merchantEmail: string;

  usersById: Record<string, User> = {};
  chats: Array<ExtendedChat> = [];
  chatsByMonth: Array<ChatsByMonth> = [];
  chatsByMonthCopy: Array<ChatsByMonth> = [];
  monthsByNumber = {
    1: 'Enero',
    2: 'Febrero',
    3: 'Marzo',
    4: 'Abril',
    5: 'Mayo',
    6: 'Junio',
    7: 'Julio',
    8: 'Agosto',
    9: 'Septiembre',
    10: 'Octubre',
    11: 'Noviembre',
    12: 'Diciembre',
  };
  audio: {
    blob: Blob;
    title: string;
  };
  typeFile: string;
  filter = new FormControl(null);
  audioText = new FormControl(null);
  isMobile: boolean = false;
  vectorsFromVectorDatabase: Array<{
    id: string;
    name?: string;
    text: string;
  }> = [];

  constructor(
    public headerService: HeaderService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private bottomSheet: MatBottomSheet,
    private gptService: Gpt3Service,
    private toastrService: ToastrService,
    private whatsappService: WhatsappService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private merchantsService: MerchantsService,
    private chatsService: ChatService,
    private usersService: UsersService,
    private translate: TranslateService,
    private recordRTCService: RecordRTCService,
    private filesService: FilesService,
    private renderer: Renderer2,
    private saleflowsService: SaleFlowService,
  ) { }

  async ngOnInit() {
    const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    this.isMobile = regex.test(navigator.userAgent);
    await this.getMerchantDefault();
    if (this.headerService.user) {
      this.clientConnectionStatus = await this.whatsappService.clientConnectionStatus();
      console.log(this.clientConnectionStatus);
      this.getChats();
      this.filterChats();
      this.fetchAllMemories();
    }
  }

  async fetchAllMemories() {
    try {
      lockUI();

      await this.headerService.checkIfUserIsAMerchantAndFetchItsData();
      const merchantSaleflow = await this.saleflowsService.saleflowDefault(
        this.merchantsService.merchantData?._id
      );

      const embeddingQueryResponse =
        await this.gptService.fetchAllDataInVectorDatabaseNamespace(
          merchantSaleflow?._id
        );

      if (
        embeddingQueryResponse?.data &&
        embeddingQueryResponse?.data?.length
      ) {
        this.vectorsFromVectorDatabase = embeddingQueryResponse?.data;
      }

      unlockUI();
    } catch (error) {
      console.error(error);
    }
  }

  async getChats() {
    const chats = await this.chatsService.listMyChats();
    let usersToFetch = [];

    if (chats) {
      this.chats = chats;

      this.chats.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      this.chats.forEach((chat, index) => {
        usersToFetch = usersToFetch.concat(
          chat.owners.map((user) => user.userId)
        );
      });

      const users: Array<User> = await this.usersService.paginateUsers({
        findBy: {
          id: usersToFetch,
        },
      });

      if (users && users.length) {
        users.forEach((user) => {
          this.usersById[user._id] = user;
        });
      }

      this.chats.forEach((chat, index) => {
        const userId = chat.owners.find(
          (owner) => owner.userId !== this.headerService.user._id
        ).userId;

        if (userId) {
          chat.receiver = this.usersById[userId];
        }

        this.chatsByMonth = this.groupChatsByMonth(chat, this.chatsByMonth);

        this.chatsByMonthCopy = JSON.parse(JSON.stringify(this.chatsByMonth));
      });
    }
  }

  filterChats() {
    this.filter.valueChanges.subscribe(text => {
      this.chatsByMonthCopy = this.chatsByMonth.map(value => {
        const chatsFiltrados = value.chats.filter(chat => {
          return chat?.receiver?.name?.toLocaleLowerCase()?.includes(text?.toLocaleLowerCase()) || chat?.receiver?.email?.toLocaleLowerCase()?.includes(text?.toLocaleLowerCase()) || chat?.receiver?.phone?.toLocaleLowerCase()?.includes(text?.toLocaleLowerCase());
        });

        return {
          ...value,
          chats: chatsFiltrados,
        }
      });
    });
  }

  groupChatsByMonth(chat: Chat, object: Array<ChatsByMonth>) {
    const creationDate = new Date(chat.createdAt);
    const month = creationDate.getMonth() + 1;
    const year = creationDate.getFullYear();

    if (object.length === 0)
      object.push({
        id: month + '-' + year,
        month: {
          number: month,
          label: this.monthsByNumber[month],
        },
        year,
        chats: [],
      });

    if (
      object.length > 0 &&
      object[this.chatsByMonth.length - 1].month.number === month
    ) {
      object[this.chatsByMonth.length - 1].chats.push(chat);
    } else {
      object.push({
        id: month + '-' + year,
        month: {
          number: month,
          label: this.monthsByNumber[month],
        },
        year,
        chats: [],
      });

      object[this.chatsByMonth.length - 1].chats.push(chat);
    }

    return object;
  }

  getCreationDateDifferenceAsItsSaid(dateISOString) {
    const dateObj = new Date(dateISOString);
    const year = dateObj.getFullYear();
    const day = dateObj.getDate();
    const month = dateObj.getMonth();
    const hour = dateObj.getHours();
    const minutes = dateObj.getMinutes();

    moment.locale('es');
    return moment([year, month, day, hour, minutes]).fromNow();
  }

  async goToChatDetail(chat: ExtendedChat) {
    let slug;
    await this.merchantsService.merchantDefault(chat.receiver._id).then((res)=> {
      slug = res.slug;
    })
    this.router.navigate([
      'ecommerce/' +
        slug +
        '/chat-merchant/' +
        chat._id,
    ]);
  }

  openMsgDialog() {
    const dialogRef = this.dialog.open(MessageDialogComponent, {});

    dialogRef.afterClosed().subscribe((role) => {
      if (!role) {
        // this.setRole(parseInt(role))
        return;
      }
    });
  }

  showRoleDialog() {
    let options: [
      {
        value: string,
        callback: () => void,
        active?: boolean,
        noSettings?: boolean
      }
    ] = [
        {
          value: `${this.merchantName ? this.merchantName : this.merchantSlug ? this.merchantSlug : this.headerService.user.name}`,
          callback: () => { },
          active: true,
        },
      ];
    if (this.headerService.user.roles.length > 0) {
      this.headerService.user.roles.forEach((role) => {
        if (role.code === 'ADMIN') {
          options.push({
            value: 'De Super Admin',
            callback: () => { }
          })
        }
      })
    }
    this.translate.get("modal.create-new-ecommerce")
      .subscribe(translate => {
        options.push({
          value: translate,
          callback: () => {
            this.loginEmail = null;
            this.dialog.closeAll();
            setTimeout(() => {
              this.loginflow = true;
            }, 1000)
          },
          noSettings: true,
        })
      })
    let logins: any[] = JSON.parse(window.localStorage.getItem('logins'));
    if (logins) {
      logins.forEach((login) => {
        if (login.email !== this.headerService.user.email) {
          options.push({
            value: `${login.name}`,
            callback: () => {
              this.userSwitchDialog(login.email)
            }
          })
        }
      })
    }
    this.translate.get("modal.profile-of").subscribe(translate => {
      const dialogRef = this.dialog.open(SelectRoleDialogComponent, {
        data: {
          title: translate,
          options,
          bottomLeft: {
            text: '',
            callback: () => { }
          }
        }
      });
      dialogRef.afterClosed().subscribe();
    })

  }

  userSwitchDialog(email: string) {
    this.translate.get([
      "modal.welcome-go-back",
      "modal.provisional-key",
      "modal.access-email"
    ])
      .subscribe(translations => {
        this.bottomSheet.open(OptionsMenuComponent, {
          data: {
            title: `${translations["modal.welcome-go-back"]}:`,
            options: [
              {
                value: translations["modal.provisional-key"],
                callback: () => {
                  this.loginEmail = email;
                  this.loginflow = true;
                }
              },
              {
                value: `${translations["modal.access-email"]} ${email})`,
                callback: () => {
                  this.loginEmail = email;
                  this.magicLink = true;
                  this.loginflow = true;
                }
              }
            ]
          }
        })
      })
  }

  async getMerchantDefault() {
    try {
      const merchantDefault: Merchant = await this.merchantsService.merchantDefault();
      this.merchantSlug = merchantDefault.slug;
      this.merchantName = merchantDefault.name;
      this.merchantEmail = merchantDefault.email;
    } catch (error) {
      console.error('error');
    }
  }

  truncateString(word) {
    return truncateString(word, 12);
  }

  resetLoginDialog(event) {
    this.loginflow = false;
    this.changeDetectorRef.detectChanges();
    // if (this.tabarIndex === 3 && this.headerService.user) {
    //   this.openLinkDialog();
    // }
  }

  goClubLandingShowGanas() {
    this.router.navigate(['/ecommerce/club-landing'], {
      queryParams: {
        showGanas: true,
      },
    });
  }

  goLaiaTraining() {
    this.router.navigate(['/ecommerce/laia-training']);
  }

  goClubLanding() {
    this.router.navigate(['/ecommerce/club-landing']);
  }

  openUploadFile() {
    this.translate
      .get(["modal.add", "modal.functions-ecommerce"])
      .subscribe(translations => {
        let data = {
          data: {
            description: `${translations["modal.add"]}:`,
            options: [
              {
                value: 'URL',
                callback: () => {

                },
              },
              {
                value: 'PDF',
                callback: () => {
                  const fileInput = document.getElementById('file') as HTMLInputElement;
                  fileInput.accept = '.pdf';
                  fileInput.click();
                },
              },
              {
                value: 'CSV',
                callback: () => {

                },
              },
              {
                value: 'XLS',
                callback: () => {
                  const fileInput = document.getElementById('file') as HTMLInputElement;
                  fileInput.accept = '.xls';
                  fileInput.click();
                },
              },
              {
                value: 'TXT',
                callback: () => {
                  const fileInput = document.getElementById('file') as HTMLInputElement;
                  fileInput.accept = '.txt';
                  fileInput.click();
                },
              },
            ],
          },
        };

        if (window.location.hostname === 'laiachat.com') {
          data.data.options.push(
            {
              value: translations["modal.functions-ecommerce"],
              callback: () => {
                this.router.navigate(['/ecommerce/club-landing']);
              },
            },
          );
        }

        this.bottomSheet.open(OptionsMenuComponent, data)
      })

  }

  async loadFile(event: Event) {
    const fileList = (event.target as HTMLInputElement).files;

    try {
      lockUI();

      if (!fileList.length) return;
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList.item(i);

        await this.gptService.feedFileToKnowledgeBase(file);
      }

      unlockUI();

      this.translate
        .get("toast.completed-training-ia")
        .subscribe(translate => this.toastrService.success(translate))
    } catch (error) {
      unlockUI();

      console.error(error);
      this.headerService.showErrorToast();
    }
  }

  async loadFileOption(event: Event) {
    const fileList = (event.target as HTMLInputElement).files;

    try {
      if (!fileList.length) return;
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList.item(i);
      
        const base64 = await fileToBase64(file);

        this.filesService.setFile(base64);
        this.router.navigate(['/ecommerce/laia-training'], {
          queryParams: {
            typeFile: this.typeFile,
          },
        });
      }
    } catch (error) {
      unlockUI();

      console.error(error);
      this.headerService.showErrorToast();
    }
  }

  shareLink() {
    this.dialogService.open(ShareLinkInfoComponent, {
      type: 'flat-action-sheet',
      props: {
        link: 'www.laichat.com/userID',
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  openDialogOptions() {
    let data = {
      data: {
        description: 'Selecciona como adicionar el contenido:',
        options: [
          {
            value: 'Escribe o pega un texto',
            complete: true,
            callback: () => {
              this.router.navigate(['/ecommerce/laia-training']);
            },
            settings: {
              value: 'fal fa-keyboard',
              color: '#87CD9B',
              callback: () => {
              },
            }
          },
          {
            value: 'Adiciona una página web',
            complete: true,
            callback: () => {
              this.router.navigate(['/ecommerce/laiachat-webscraping']);
            },
            settings: {
              value: 'fal fa-keyboard',
              color: '#87CD9B',
              callback: () => {
              },
            }
          },
          {
            value: 'Texto desde tu micrófono',
            complete: true,
            callback: () => {
              const dialogref = this.dialogService.open(AudioRecorderComponent,{
                type: 'flat-action-sheet',
                props: { canRecord: true, isDialog: true },
                customClass: 'app-dialog',
                flags: ['no-header'],
              });
              const dialogSub = dialogref.events
                .pipe(filter((e) => e.type === 'result'))
                .subscribe((e) => {
                  if(e.data) {
                    this.audio = e.data;
                    this.saveAudio();
                  }
                  this.audio = null;
                  this.recordRTCService.abortRecording();
                  dialogSub.unsubscribe();
                });
            },
            settings: {
              value: 'fal fa-waveform-path',
              color: '#87CD9B',
              callback: () => {
              },
            }
          },
          {
            value: 'Carga un PDF',
            complete: true,
            callback: () => {
              const fileInput = document.getElementById('file') as HTMLInputElement;
              fileInput.accept = '.pdf';
              fileInput.click();
              this.typeFile = 'pdf';
            },
            settings: {
              value: 'fal fa-file-pdf',
              color: '#87CD9B',
              callback: () => {
              },
            }
          },
          {
            value: 'Carga un archivo de Excel',
            complete: true,
            callback: () => {
              const fileInput = document.getElementById('file') as HTMLInputElement;
              fileInput.accept = '.xls';
              fileInput.click();
              this.typeFile = 'xls';
            },
            settings: {
              value: 'fal fa-file-excel',
              color: '#87CD9B',
              callback: () => {
              },
            }
          },
        ],
      },
    };

    this.bottomSheet.open(OptionsMenuComponent, data)
  }

  async saveAudio(goMerchant: boolean = false) {
    let dialogRef;
    try {
      dialogRef = this.dialogService.open(StatusAudioRecorderComponent, {
        type: 'flat-action-sheet',
        props: {
          message: 'Conviertiéndo el audio a texto..',
          backgroundColor: '#181D17',
        },
        customClass: 'app-dialog',
        flags: ['no-header'],
      });

      if (!this.audio) return;
      const result = await this.gptService.openAiWhisper((this.audio && new File([this.audio.blob], this.audio.title || 'audio.mp3', {type: (<Blob>this.audio.blob)?.type})),);

      if(goMerchant) {
        
      } else {
        this.router.navigate(['/ecommerce/laia-training'], {
          queryParams: {
            audioResult: result,
          },
        });
      }

      dialogRef.close();
    } catch (error) {
      dialogRef.close();

      console.error(error);
      this.headerService.showErrorToast();
    }
  }

  goToWhatsapp() {
    window.location.href = `https://api.whatsapp.com/send?phone=${
      '19188156444'
    }`;
  }

  goLaiaMemories() {
    this.router.navigate(['/ecommerce/laia-memories-management']);
  }

  async goLaiaWhatsapp() {
    if (this.clientConnectionStatus) {
      lockUI();
      try {
        await this.whatsappService.destroyClient();
        this.clientConnectionStatus = false;
      } catch (error) {
        console.error(error);
      }
      unlockUI();
    } else {
      this.router.navigate(['/admin/wizard-training'], {
        queryParams: {
          triggerWhatsappClient: true
        }
      });
    }
  }

  resizeTextarea(textarea) {
    const alturaActual = textarea.scrollHeight;
    const alturaMaxima = 146;
    const relacionAltura = alturaActual / alturaMaxima;
    const borderRadius = 146 - 146 * relacionAltura;
    const borderRadiusPx = getComputedStyle(textarea).borderRadius;

    if(borderRadiusPx === '22px') {
      this.renderer.setStyle(textarea, 'border-radius', '22px');
    } else {
      this.renderer.setStyle(textarea, 'border-radius', `${borderRadius}px`);
    };

    if(textarea.scrollHeight > 146) {
      textarea.style.height = 146 + "px";
      textarea.style.overflowY = "scroll";
      return;
    }
    console.log(textarea.scrollHeight > textarea.clientHeight)
    if(textarea.scrollHeight > textarea.clientHeight) {
      textarea.style.height = textarea.scrollHeight > 46 ? textarea.scrollHeight + "px" : 46 + "px";
    } else {
      textarea.style.height = 46 + "px";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }

  openRecorder() {
    const dialogref = this.dialogService.open(AudioRecorderComponent,{
      type: 'flat-action-sheet',
      props: { canRecord: true, isDialog: true },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
    const dialogSub = dialogref.events
      .pipe(filter((e) => e.type === 'result'))
      .subscribe((e) => {
        if(e.data) {
          this.audio = e.data;
          this.saveAudio(true);
        }
        this.audio = null;
        this.recordRTCService.abortRecording();
        dialogSub.unsubscribe();
      });
  }
}
