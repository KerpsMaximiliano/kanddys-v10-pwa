import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Socket, io } from 'socket.io-client';
import { Gpt3Service } from 'src/app/core/services/gpt3.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { environment } from 'src/environments/environment';
import { Chat, Message } from 'src/app/core/models/chat';

const SERVER_URL = environment.chatAPI.url; // Replace with your server URL

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss'],
})
export class ChatRoomComponent implements OnInit {
  private socket: Socket;
  chat: Chat;
  chatFormGroup: FormGroup = new FormGroup({
    input: new FormControl('', Validators.required),
  });
  conversationId: null = null;
  isTheUserTheMerchant: boolean = false;
  assetsFolder: string = environment.assetsUrl;

  constructor(
    public headerService: HeaderService,
    private merchantsService: MerchantsService,
    private route: ActivatedRoute,
    private gpt3Service: Gpt3Service,
    private router: Router
  ) {}

  async ngOnInit() {
    this.route.params.subscribe(({ chatId }) => {
      if (
        this.headerService.saleflow.merchant.owner._id ===
        this.headerService.user?._id
      )
        this.isTheUserTheMerchant = true;

      this.socket = io(SERVER_URL, {
        extraHeaders: {
          token: localStorage.getItem('session-token'),
        },
      });

      // client-side
      this.socket.on('connect', () => {
        // Send a message to the server
        if (!chatId) {
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
          this.chat = chat;

          if (!chatId)
            this.router.navigate([
              'ecommerce/' +
                this.headerService.saleflow.merchant.slug +
                '/chat-merchant/' +
                this.chat._id,
            ]);

          setTimeout(() => {
            this.scrollToBottom();
          }, 300);
        });

        this.socket.on('MESSAGE_SEND', (messageReceived: Message) => {
          this.chat.messages.push(messageReceived);

          this.scrollToBottom();
        });

        this.socket.on('ERROR', (data) => {
          console.error('ERROR', data);
        });
      });

      this.socket.on('disconnect', () => {
        console.log('desconectado'); // undefined
      });
    });
  }

  async sendMessage() {
    this.socket.emit('MESSAGE_SEND', {
      chatId: this.chat._id,
      message: this.chatFormGroup.get('input').value,
    });

    setTimeout(() => {
      this.chatFormGroup.get('input').setValue('');
    }, 200);

    if (!this.isTheUserTheMerchant) {
      await this.gpt3Service.requestResponseFromKnowledgeBase(
        this.chatFormGroup.get('input').value,
        this.headerService.saleflow._id,
        this.conversationId ? this.conversationId : null,
        this.chat._id,
        this.socket.id
      );
    }
  }

  scrollToBottom() {
    const scrollableDiv = document.getElementById('messages');
    // Scroll to the bottom
    scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
  }

  goBackToMyChats() {
    this.router.navigate(['admin/laia-chats']);
  }
}
