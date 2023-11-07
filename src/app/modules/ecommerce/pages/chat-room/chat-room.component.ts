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
  typeOfReceiver: 'MERCHANT' | 'REGULAR_USER' = 'MERCHANT';
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
  inputOpen : boolean = false;

  ipAddress: number;

  constructor(
    public headerService: HeaderService,
    private route: ActivatedRoute,
    private gpt3Service: Gpt3Service,
    private sanitizer: DomSanitizer,
    private usersService: UsersService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.routeParamsSubscription = this.route.params.subscribe(({ chatId }) => {
      this.queryParamsSubscription = this.route.queryParams.subscribe(
        async ({ fromStore }) => {
          this.fromStore = fromStore ? JSON.parse(fromStore) : false;

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
    if(!this.headerService.user) {
      this.getIp()
    }
  }

  async getIp() {
    let ip = await fetch('http://api.ipify.org/?format=json')
      .then((res) => {
        return res.json()
      })
    this.ipAddress = ip.ip;
  }

  async initSocketClientEventListeners(chatId: string) {
    if(!this.headerService.user) {
      console.log('no user socket')
      this.socket = io(SERVER_URL, {
        extraHeaders: {
          "App-key": "k2ejNpopkk9Txga6kmQZwAQXUCLNZxs9BI8dDfVgmdMXvjcVcI"
        },
      });
      console.log(this.socket)
    } else {
      this.socket = io(SERVER_URL, {
        extraHeaders: {
          token: localStorage.getItem('session-token'),
          "App-key": "k2ejNpopkk9Txga6kmQZwAQXUCLNZxs9BI8dDfVgmdMXvjcVcI"
        },
      });
      console.log(this.socket)
    }

    // client-side
    this.socket.on('connect', () => {
      console.log(this.headerService.user)
      this.socketConnected = true;
      // Send a message to the server
      if(!this.headerService.user) {
        console.log('no user connect')
        console.log(this.headerService.saleflow.merchant)
        this.socket.emit('GET_OR_CREATE_CHAT', {
          owners: [this.socket.id],
          userId: this.headerService.saleflow.merchant.owner._id,
        })
        console.log(this.socket)
      } else if (!chatId) {
        this.socket.emit('GET_OR_CREATE_CHAT', {
          owners: [this.socket.id],
          userId: this.headerService.saleflow.merchant.owner._id,
        });
      } else {
        this.socket.emit('GET_OR_CREATE_CHAT', {
          owners: [this.socket.id],
          chatId: chatId,
        });
      }
      this.socket.on('GET_OR_CREATE_CHAT', (chat) => {
        console.log(chat)
        this.chat = chat;

        this.chat.messages.forEach(
          (message) =>
            (message.message = this.transformChatResponse(
              message.message as any
            ))
        );

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
        else if (this.chat.drafts.length) {
          const myDraft = this.chat.drafts.find(
            (draft) => draft.userId === this.headerService.user._id
          );
          this.chatFormGroup.get('input').setValue(myDraft.content);
        }

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

  async fireUpPageEventListeners() {
    window.addEventListener('online', () => {
      // Code to execute when the browser goes online
      this.online = true;
    });

    window.addEventListener('offline', () => {
      this.online = false;
    });
  }

  async sendMessage() {
    this.socket.emit('MESSAGE_SEND', {
      chatId: this.chat._id,
      message: this.chatFormGroup.get('input').value,
    });
    console.log(this.socket)
    setTimeout(() => {
      this.chatFormGroup.get('input').setValue('');
    }, 200);

    await this.gpt3Service.requestResponseFromKnowledgeBase({
        prompt: this.chatFormGroup.get('input').value,
        merchantId : this.headerService.saleflow.merchant._id,
        chatRoomId : this.chat._id,
        socketId: this.socket.id,
        isAuthorization: false
      });
    console.log(this.chat)
  }

  scrollToBottom() {
    const scrollableDiv = document.getElementById('messages');
    // Scroll to the bottom
    scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
  }

  goBack() {
    if (this.fromStore)
      this.router.navigate([
        'ecommerce/' + this.headerService.saleflow.merchant?.slug + '/store',
      ]);
    else this.router.navigate(['admin/laia-chats']);
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
        this.chat.owners.map((owner) => owner.userId)
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

  resizeTextarea(textarea) {
    if(textarea.scrollHeight > 253) {
      textarea.style.height = 253 + "px";
      textarea.style.overflowY = "scroll";
      return;
    }
    if(textarea.scrollHeight > textarea.clientHeight) {
      textarea.style.height = textarea.scrollHeight > 39 ? textarea.scrollHeight + "px" : 39 + "px";
    } else {
      textarea.style.height = 0 + "px";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }

  ngOnDestroy(): void {
    this.routeParamsSubscription?.unsubscribe();
    this.queryParamsSubscription?.unsubscribe();
    this.inputValueChangesSubscription.unsubscribe();
    clearTimeout(this.typingTimeout);
  }
}
