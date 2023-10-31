import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as moment from 'moment';
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

  constructor(
    public headerService: HeaderService,
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,
    private bottomSheet: MatBottomSheet,
    private gptService: Gpt3Service,
    private toastrService: ToastrService,
    private whatsappService: WhatsappService,
    private dialog: MatDialog,
    private merchantsService: MerchantsService,
    private chatsService: ChatService,
    private usersService: UsersService,
  ) { }

  async ngOnInit() {
    await this.getMerchantDefault();
    if(this.headerService.user) {
      this.clientConnectionStatus = await this.whatsappService.clientConnectionStatus();
      console.log(this.clientConnectionStatus);
      this.getChats();
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
    this.router.navigate([
      'ecommerce/' +
        this.merchantsService.merchantData?.slug +
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
      console.log(role);
    });
  }

  showRoleDialog() {
    let options : [
      {
        value:string, 
        callback: () => void,
         active?: boolean, 
         noSettings?: boolean
      }
    ] = [
      {
        value: `${this.merchantName? this.merchantName : this.merchantSlug? this.merchantSlug : this.headerService.user.name}`,
        callback: () => {},
        active: true,
      },
    ];
    if(this.headerService.user.roles.length > 0) {
      this.headerService.user.roles.forEach((role) => {
        if(role.code === 'ADMIN') {
          options.push({
            value: 'De Super Admin',
            callback: ()=> {}
          })
        }
      })
    }
    options.push({
      value: 'Crear un nuevo comercio',
      callback: () => {
        this.loginEmail = null;
        this.dialog.closeAll();
        console.log(this.loginflow)
        setTimeout(() => {
          this.loginflow = true;
        }, 1000)
      },
      noSettings: true,
    })
    let logins : any[] = JSON.parse(window.localStorage.getItem('logins'));
    if(logins) {
      logins.forEach((login) => {
        if(login.email !== this.headerService.user.email) {
          options.push({
            value: `${login.name}`,
            callback: () => {
              this.userSwitchDialog(login.email)
            }
          })
        }
      })
    }

    const dialogRef = this.dialog.open(SelectRoleDialogComponent, {
      data: {
        title: "Perfil de:",
        options,
        bottomLeft: {
          text: '',
          callback: () => {
          }
        }
      }
    });
    dialogRef.afterClosed().subscribe((role) => {
      
    });
  }

  userSwitchDialog(email: string) {
    this.bottomSheet.open(OptionsMenuComponent, {
      data: {
        title: 'Bienvenido de vuelta, prefieres acceder:',
        options: [
          {
            value: 'Con mi clave provisional que es "123"',
            callback: () => {
              this.loginEmail = email;
              this.loginflow = true;
            }
          },
          {
            value: `Desde mi correo electronico (recibirás el acceso en ${email})`,
            callback: () => {
              this.loginEmail = email;
              this.magicLink = true;
              this.loginflow = true;
            }
          }
        ]
      }
    })
  }

  async getMerchantDefault() {
    try {
      const merchantDefault: Merchant = await this.merchantsService.merchantDefault();
      console.log(merchantDefault)
      this.merchantSlug = merchantDefault.slug;
      this.merchantName = merchantDefault.name;
      this.merchantEmail = merchantDefault.email;
    } catch (error) {
      console.log('error');
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
    let data = {
      data: {
        description: 'Agrega:',
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

    if(window.location.hostname === 'laiachat.com') {
      data.data.options.push(
        {
          value: 'Funcionalidades del Ecommerce',
          callback: () => {
            this.router.navigate(['/ecommerce/club-landing']);
          },
        },
      );
    }

    const dialog = this.bottomSheet.open(
      OptionsMenuComponent,
      data
    )
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

      this.toastrService.success(
        'Se ha entrenado al mago exitosamente con la data proporcionada'
      );
    } catch (error) {
      unlockUI();

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
}
