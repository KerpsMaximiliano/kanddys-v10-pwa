import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { isEmail } from 'src/app/core/helpers/strings.helpers';
import { Chat, Message } from 'src/app/core/models/chat';
import { AuthService } from 'src/app/core/services/auth.service';

interface DialogTemplate {
  title?: string;
  description: string;
  options: Array<{
    value: string;
    callback: () => void;
  }>;
  styles?: Record<string, Record<string, string>>;
  bottomLabel?: string;
}

@Component({
  selector: 'app-signup-chat',
  templateUrl: './signup-chat.component.html',
  styleUrls: ['./signup-chat.component.scss']
})
export class SignupChatComponent implements OnInit {
  @ViewChild('chatContainer') private chatContainer: ElementRef;
  chat: Chat = {
    _id: '',
    owners: [],
    messages: [],
    admins: [],
    isGroup: false,
  };
  chatFormGroup: FormGroup = new FormGroup({
    input: new FormControl('', Validators.required),
  });
  showEditButton = false;
  hideInput: boolean = false;
  isEdit: boolean = false

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: DialogTemplate,
    private authService: AuthService
  ) { }

  ngAfterViewInit(): void {
    this.scrollToBottom()
  }

  ngOnInit(): void {
    this.welcomeMessage()
  }

  welcomeMessage() {
    this.chat.messages = [
      {
        sender: 'IA',
        message: "Hola, soy Laia, y te estaba esperando!!",
        chatId: ""
      },
      {
        sender: 'IA',
        message: "Necesito que agregues detalles en mi memoria para que la magia de la Inteligencia Artificial te ahorre tiempo en tus compras, ventas y pedidos.",
        chatId: ""
      },
      {
        sender: 'IA',
        message: "También te ayudaré a cotizar, recompensar y premiar a quienes te refieran. Y lo mejor, ¡adiós a responder las mismas preguntas una y otra vez!",
        chatId: ""
      },
      {
        sender: 'IA',
        message: "¿Y tú, me estabas esperando?",
        chatId: ""
      },
    ]
  }

  /**
   * Envia la respuesta del usuario por input
   *
   */
  async sendMessage() {
    const message: string = this.chatFormGroup.get('input').value
    const isEmailValid = message && isEmail(message)

    if (isEmailValid) {
      const newMessage = { sender: 'user', message, chatId: '' }
      await this.addMessage(newMessage)

      try {
        const userRegistered = await this.authService.checkUser(message)
        if (userRegistered) {
          await this.addMessage({
            sender: 'IA',
            message: "Este correo está registrado. Por favor, intente otro",
            chatId: ""
          })
          return
        }

        if (!userRegistered) {
          await this.registerUser(message);
          await this.addMessage({
            sender: 'IA',
            message: "Gracias por reservar con Laia.",
            chatId: ""
          })
          await this.addMessage({
            sender: 'IA',
            message: "Te mantendremos informad@ de su entrenamiento.",
            chatId: ""
          })
          this.hideInput = true
          this.showEditButton = true
          return
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  async registerUser(email: string) {
    const input = { email }
    await this.authService.signup(input, "none")
  }

  async sendEditMessage() {
    const message: string = this.chatFormGroup.get('input').value
    const isEmailValid = message && isEmail(message)

    if (isEmailValid) {
      const index = this.chat.messages.findIndex(message => message.sender === 'user')
      this.chat.messages[index].message = message
      this.isEdit = false
      this.hideInput = true
      await this.registerUser(message);
    }
  }

  /**
   * Añade el mensaje al listado de mensajes
   *
   * @param message
   */
  async addMessage(message: Message) {
    this.chat.messages.push(message)
    this.scrollToBottom()
  }

  editMessage() {
    this.hideInput = false
    this.isEdit = true
    this.showEditButton = false
  }

  scrollToBottom(): void {
    try {
      const container = this.chatContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
      container.scrollIntoView({ behavior: 'smooth', alignToTop: false });
    } catch (error) {
      console.error('Error al hacer scroll:', error);
    }
  }
}
