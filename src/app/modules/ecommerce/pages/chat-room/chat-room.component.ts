import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Socket, io } from 'socket.io-client';
import { Gpt3Service } from 'src/app/core/services/gpt3.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { environment } from 'src/environments/environment';
import { Chat, Message } from 'src/app/core/models/chat';
import { Merchant } from 'src/app/core/models/merchant';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { UsersService } from 'src/app/core/services/users.service';
import { User } from 'src/app/core/models/user';
import { Subscription } from 'rxjs';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { AudioRecorderComponent } from 'src/app/shared/components/audio-recorder/audio-recorder.component';
import { filter } from 'rxjs/operators';
import { StatusAudioRecorderComponent } from 'src/app/shared/dialogs/status-audio-recorder/status-audio-recorder.component';
import { TranslateService } from '@ngx-translate/core';
import { RecordRTCService } from 'src/app/core/services/recordrtc.service';

const SERVER_URL = environment.chatAPI.url; // Replace with your server URL

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss'],
})
export class ChatRoomComponent implements OnInit, OnDestroy {
  private socket: Socket;
  chat: Chat;
  chatFormGroup: FormGroup = new FormGroup({
    input: new FormControl('', Validators.required),
  });
  isTheUserTheMerchant: boolean = false;
  loggedAsAMerchant: boolean = false;
  assetsFolder: string = environment.assetsUrl;
  aiId: string = environment.ai.id;
  aiSlug: string = environment.ai.slug;
  typeOfReceiver: 'MERCHANT' | 'REGULAR_USER' = 'MERCHANT';
  receiverId: string;
  embeddingsMetadata: {
    vectorsCount: number;
    automaticModeActivated?: boolean;
    merchant: Merchant;
  } = null;
  usersWithAssistantActivated: Record<string, boolean> = {};
  fromStore: boolean = false;
  chatUsers: Record<string, User> = {};
  queryParamsSubscription: Subscription;
  routeParamsSubscription: Subscription;
  inputValueChangesSubscription: Subscription;
  typingTimeout: any;
  typing: {
    sender: string;
  } = null;
  online: boolean = true;
  socketConnected: boolean = true;
  inputOpen: boolean = false;
  ipAddress: number;
  textareaAudio: boolean = false;
  convertAudioText: string = 'Conviertiéndo el audio a texto';
  audio: {
    blob: Blob;
    title: string;
  };
  isMobile: boolean = false;
  calculateMargin = '0px';
  activeAssistantStatus: boolean = true;
  adminChat: boolean = false;
  chatIpAddress: boolean = false;

  constructor(
    public headerService: HeaderService,
    private route: ActivatedRoute,
    private gpt3Service: Gpt3Service,
    private sanitizer: DomSanitizer,
    private usersService: UsersService,
    private router: Router,
    private dialogService: DialogService,
    private translate: TranslateService,
    private recordRTCService: RecordRTCService,
    private merchantService: MerchantsService,
  ) {
    let language = navigator?.language ? navigator?.language?.substring(0, 2) : 'es';
    translate.setDefaultLang(language?.length === 2 ? language  : 'es');
    translate.use(language?.length === 2 ? language  : 'es');
  }

  async ngOnInit() {
    const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    this.isMobile = regex.test(navigator.userAgent);
    this.calculateMargin = `calc(${window.innerHeight}px - 745px)`;
    if (this.route.snapshot.params.merchantSlug === this.aiSlug) {
      let message = this.route.snapshot.queryParams['message']
      if (message) {
        setTimeout(() => {
          this.sendMessage(true, message)
        }, 5000);
      }
    }
    this.routeParamsSubscription = this.route.params.subscribe(({ chatId }) => {
      this.queryParamsSubscription = this.route.queryParams.subscribe(
        async ({ fromStore, chatIpAddress }) => {
          this.fromStore = fromStore ? JSON.parse(fromStore) : false;
          this.chatIpAddress = chatIpAddress ? JSON.parse(chatIpAddress) : false;
          console.log('notLogged', chatIpAddress)

          if (!this.headerService.user) {
            this.typeOfReceiver = 'MERCHANT';
          } else if (
            this.headerService.saleflow.merchant.owner?._id ===
            this.headerService.user?._id
          ) {
            this.isTheUserTheMerchant = true;
            this.typeOfReceiver = 'REGULAR_USER';
          } else {
            this.typeOfReceiver = 'MERCHANT';
          }

          this.headerService
            .checkIfUserIsAMerchantAndFetchItsData()
            .then((isAMerchant) => (this.loggedAsAMerchant = isAMerchant));

          this.fireUpPageEventListeners();
          await this.initSocketClientEventListeners(chatId);
        }
      );
    });
    if (!this.headerService.user) {
      this.getIp()
    }
    this.translate.get("modal.convertAudioText").subscribe(translate => this.convertAudioText = translate);
  }

  async getIp() {
    let ip = await fetch('https://api.ipify.org/?format=json')
      .then((res) => {
        return res.json()
      })
    this.ipAddress = ip.ip;
  }

  async initSocketClientEventListeners(chatId: string) {
    let ip = await fetch('httpss://api.ipify.org/?format=json')
    .then((res) => {
      return res.json()
    });
    if (!this.headerService.user) {
      console.log('no user socket')
      this.socket = io(SERVER_URL, {
        extraHeaders: {
          "App-key": "k2ejNpopkk9Txga6kmQZwAQXUCLNZxs9BI8dDfVgmdMXvjcVcI",
          "x-forwarded-for": ip.ip,
        },
      });
      console.log(this.socket)
    } else {
      this.socket = io(SERVER_URL, {
        extraHeaders: {
          token: localStorage.getItem('session-token'),
          "App-key": "k2ejNpopkk9Txga6kmQZwAQXUCLNZxs9BI8dDfVgmdMXvjcVcI",
          "x-forwarded-for": ip.ip,
        },
      });
      console.log(this.socket)
    }

    // client-side
    this.socket.on('connect', () => {
      this.socket.emit('ME', this.socket.id);
      this.socket.on('ME', (me) => {
        this.receiverId = me.socketUserId;
      })

      this.socketConnected = true;
      // Send a message to the server
      if (this.chatIpAddress) {
        this.socket.emit('GET_OR_CREATE_CHAT', {
          owners: [this.socket.id],
          chatId: chatId,
        })
      } else if (!this.headerService.user) {
        this.socket.emit('GET_OR_CREATE_CHAT', {
          owners: [this.socket.id],
          userId: this.headerService.saleflow.merchant.owner?._id,
          type: 'not_logged',
        })
      } else if (!chatId) {
        this.socket.emit('GET_OR_CREATE_CHAT', {
          owners: [this.socket.id],
          userId: this.headerService.saleflow.merchant.owner?._id,
          type: 'logged',
        });
      } else {
        this.socket.emit('GET_OR_CREATE_CHAT', {
          owners: [this.socket.id],
          userId: this.headerService.saleflow.merchant.owner?._id
        });
      }
      this.socket.on('GET_OR_CREATE_CHAT', (chat) => {
        console.log(chat)
        this.adminChat = chat?.admins?.find((id) => id === this.receiverId);
        this.chat = chat;
        this.activeAssistantStatus = chat?.activeAssistant;

        /*chat.owners.forEach((owner) => {
          console.log(owner)
          if(!this.headerService.user) {
            if(owner === chat.messages[0].sender) {
              this.receiverId = owner
            }
          } else {
            if(owner.userId === this.headerService.user._id) {
              console.log(owner._id, 'receiver')
              this.receiverId = owner._id
            }
          }
        })*/
        this.chat.messages.forEach(
          (message) =>
          (message.message = this.transformChatResponse(
            message.message as any
          ))
        );

        if(!chat?.activeAssistant && this.adminChat) {
          this.filterMessagesAndGenerateResponse();
        }

        if (!chatId)
          this.router.navigate(
            [
              'ecommerce/' +
              this.headerService.saleflow.merchant.slug +
              '/chat-merchant/' +
              this.chat._id,
            ],
            {
              queryParams: {
                fromStore: this.fromStore,
              },
            }
          );
        // else if (this.chat.drafts.length) {
        //   const myDraft = this.chat.drafts.find(
        //     (draft) => draft.userId === this.headerService.user._id
        //   );
        //   this.chatFormGroup.get('input').setValue(myDraft.content);
        // }

        setTimeout(() => {
          this.scrollToBottom();
        }, 300);

        this.getAssistantActivationStatusForChatUsers();

        this.usersService
          .paginateUsers({
            findBy: {
              id: this.chat.owners.map((owner) => owner.userId),
            },
          })
          .then((users: Array<User>) => {
            users.forEach((user) => {
              if (user._id === this.headerService.user._id)
                this.chatUsers['SENDER'] = user;
              else this.chatUsers['RECEIVER'] = user;
            });
          });

        this.inputValueChangesSubscription = this.chatFormGroup
          .get('input')
          .valueChanges.subscribe((change) => {
            this.socket.emit('TYPING', this.chat._id);
            clearTimeout(this.typingTimeout);
            this.typingTimeout = setTimeout(() => {
              this.socket.emit('STOPPED_TYPING', this.chat._id);
            }, 2000);
          });
      });

      this.socket.on('MESSAGE_SEND', (messageReceived: Message) => {
        this.chat.messages.push(messageReceived);
        this.typing = null;

        setTimeout(() => {
          this.scrollToBottom();
        }, 300);
      });

      this.socket.on(
        'DRAFT',
        (draftReceived: { content: string; userId: string }) => {
          if (draftReceived.userId === this.headerService.user?._id) {
            this.chatFormGroup.get('input').setValue(draftReceived.content);
          }
        }
      );

      this.socket.on(
        'TYPING',
        (typingData: { chatId: string; sender: string }) => {
          if (typingData.sender !== this.headerService.user?._id) {
            this.typing = {
              sender: typingData.sender,
            };
          } else this.typing = null;
        }
      );

      this.socket.on(
        'STOPPED_TYPING',
        (typingData: { chatId: string; sender: string }) => {
          if (typingData.sender !== this.headerService.user?._id)
            this.typing = null;
        }
      );

      this.socket.on('ERROR', (data) => {
        console.error('ERROR', data);
      });
    });

    this.socket.on('disconnect', (reason, description) => {
      this.socketConnected = false;
    });
  }

  async getMerchantDefault() {
    try {
      const merchantDefault: Merchant = await this.merchantService.merchantDefault();
      return merchantDefault;
    } catch (error) {
      console.log(error);
    }
  }

  async filterMessagesAndGenerateResponse() {
    if(this.chat?.messages && this.chat?.messages?.length > 0) {
      const lastIndex = this.chat?.messages?.map(item => item.sender).lastIndexOf(this.receiverId);
      const lastMessageSent = lastIndex === (this.chat?.messages?.length - 1);
      this.chat.messages = lastMessageSent ? this.chat?.messages : this.chat?.messages.slice(lastIndex + 1);
      const merchant: Merchant = await this.getMerchantDefault();

      if (!lastMessageSent && this.chat?.messages?.length > 1) {
        const messageValues = this.chat?.messages?.map(item => item.message['changingThisBreaksApplicationSecurity'] ?? '');

        const result = await this.gpt3Service.requestResponseFromKnowledgeBase({
          prompt: '',
          multiPrompt: messageValues,
          merchantId: merchant._id,
          chatRoomId: this.chat._id,
          socketId: this.socket.id,
          userId: merchant?.owner?._id ? merchant?.owner?._id : null,
          isAuthorization: this.headerService.user ? true : false
        });

        const textarea = document.getElementById('autoExpandTextarea');
        this.chatFormGroup.get('input').setValue(result?.response ?? '');
        this.resizeTextarea(textarea);
        const inputEvent = new Event('input', { bubbles: true });
        textarea.dispatchEvent(inputEvent);
      }

      if (!lastMessageSent && this.chat?.messages?.length === 1) {
        const messageValue = this.chat?.messages?.map(item => item.message['changingThisBreaksApplicationSecurity'] ?? '');
        const result = await this.gpt3Service.requestResponseFromKnowledgeBase({
          prompt: messageValue[0],
          merchantId: merchant._id,
          chatRoomId: this.chat._id,
          socketId: this.socket.id,
          userId: merchant?.owner?._id ? merchant?.owner?._id : null,
          isAuthorization: this.headerService.user ? true : false
        });

        const textarea = document.getElementById('autoExpandTextarea');
        this.chatFormGroup.get('input').setValue(result?.response ?? '');
        this.resizeTextarea(textarea);
        const inputEvent = new Event('input', { bubbles: true });
        textarea.dispatchEvent(inputEvent);
      }
    }
  }

  async fireUpPageEventListeners() {
    window.addEventListener('online', () => {
      // Code to execute when the browser goes online
      this.online = true;
    });

    window.addEventListener('offline', () => {
      this.online = false;
    });
  }

  async sendMessage(talkToAI: boolean = false, message?: string) {
    if (talkToAI) {
      this.socket.emit('MESSAGE_SEND', {
        chatId: this.chat._id,
        message: message
      });
      await this.gpt3Service.requestResponseFromKnowledgeBase({
        prompt: message,
        merchantId: this.aiId,
        chatRoomId: this.chat._id,
        socketId: this.socket.id,
        isAuthorization: this.headerService.user ? true : false,
        isGeneral: true
      });
      return;
    }

    this.socket.emit('MESSAGE_SEND', {
      chatId: this.chat._id,
      message: this.chatFormGroup.get('input').value,
    });

    console.log(this.socket)

    setTimeout(() => {
      this.chatFormGroup.get('input').setValue('');
      this.textareaAudio = false;
    }, 200);
    await this.gpt3Service.requestResponseFromKnowledgeBase({
      prompt: this.chatFormGroup.get('input').value,
      merchantId: this.headerService.saleflow.merchant._id,
      chatRoomId: this.chat._id,
      socketId: this.socket.id,
      userId: this.headerService.saleflow.merchant ? this.headerService.saleflow.merchant.owner?._id : null,
      isAuthorization: this.headerService.user ? true : false
    });
    console.log(this.chat)
  }

  async activatedAssistant() {
    this.socket.emit('ACTIVATE_ASSISTANT', {
      chatId: this.chat._id,
    });
    this.socket.on('ACTIVATE_ASSISTANT', (activateAssistant) => {
      this.activeAssistantStatus = activateAssistant?.activeAssistant;
    });
  }

  scrollToBottom() {
    const scrollableDiv = document.getElementById('messages');
    // // Scroll to the bottom
    scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
  }

  goBack() {
    if (this.fromStore)
      this.router.navigate([
        'ecommerce/' + this.headerService.saleflow.merchant?.slug + '/store',
      ]);
    else this.router.navigate(['ecommerce/laiachat-landing']);
  }

  async changeAssistantResponseMode() {
    try {
      await this.gpt3Service.changeAssistantResponseMode();
      await this.getAssistantActivationStatusForChatUsers();
    } catch (error) {
      console.error(error);
      this.headerService.showErrorToast();
    }
  }

  async getAssistantActivationStatusForChatUsers() {
    const embeddingsMetadataByUser =
      await this.gpt3Service.doUsersHaveAssistantActivated(
        [this.headerService.saleflow.merchant.owner._id]
      );

    console.log('usersWithAssistantActivated', embeddingsMetadataByUser);

    this.usersWithAssistantActivated = embeddingsMetadataByUser;
  }

  transformChatResponse(response: string) {
    const linkPattern = /\[([^[]+)\]\(([^)]+)\)/g;

    // Replace [Link](URL) with <a href="URL">Link</a> tags
    let transformedValue = response.replace(linkPattern, '<a href="$2">$1</a>');

    transformedValue = transformedValue.replace(/\n/g, '<br />');

    return this.sanitizer.bypassSecurityTrustHtml(transformedValue);
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
          this.saveAudio();
        }
        this.audio = null;
        this.recordRTCService.abortRecording();
        dialogSub.unsubscribe();
      });
  }

  async saveAudio() {
    let dialogRef;
    try {
      dialogRef = this.dialogService.open(StatusAudioRecorderComponent, {
        type: 'flat-action-sheet',
        props: {
          message: this.convertAudioText,
          backgroundColor: '#181D17',
        },
        customClass: 'app-dialog',
        flags: ['no-header'],
      });

      if (!this.audio) return;
      const result = await this.gpt3Service.openAiWhisper((this.audio && new File([this.audio.blob], this.audio.title || 'audio.mp3', {type: (<Blob>this.audio.blob)?.type})),);
      const textarea = document.getElementById('autoExpandTextarea');

      this.chatFormGroup.get('input').setValue(result);
      this.resizeTextarea(textarea);
      const inputEvent = new Event('input', { bubbles: true });
      textarea.dispatchEvent(inputEvent);

      dialogRef.close();
    } catch (error) {
      dialogRef.close();

      console.error(error);
      this.headerService.showErrorToast();
    }
  }

  resizeTextarea(textarea) {
    if (textarea.scrollHeight > 146) {
      textarea.style.height = 146 + "px";
      textarea.style.overflowY = "scroll";
      return;
    }
    if (textarea.scrollHeight > textarea.clientHeight) {
      textarea.style.height = textarea.scrollHeight > 39 ? textarea.scrollHeight + "px" : 39 + "px";
    } else {
      textarea.style.height = 0 + "px";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }

  onTextareaClick() {
    if(!this.chatFormGroup.get('input').value) {
      this.textareaAudio = true;
    }
  }

  onTextareaBlur() {
    if(!this.chatFormGroup.get('input').value) {
      this.textareaAudio = false;
    }
  }

  ngOnDestroy(): void {
    this.routeParamsSubscription?.unsubscribe();
    this.queryParamsSubscription?.unsubscribe();
    this.inputValueChangesSubscription.unsubscribe();
    clearTimeout(this.typingTimeout);
  }
}
