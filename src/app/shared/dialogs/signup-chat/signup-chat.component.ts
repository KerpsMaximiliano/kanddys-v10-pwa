import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
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
    this.chat.messages = [
      {
        sender: 'IA',
        message: "Hola, soy Laia, y te estaba esperando!!",
      },
      {
        sender: 'IA',
        message: "Necesito que agregues detalles en mi memoria para que la magia de la Inteligencia Artificial te ahorre tiempo en tus compras, ventas y pedidos."
      },
      {
        sender: 'IA',
        message: "También te ayudaré a cotizar, recompensar y premiar a quienes te refieran. Y lo mejor, ¡adiós a responder las mismas preguntas una y otra vez!"
      },
      {
        sender: 'IA',
        message: "¿Y tú, me estabas esperando?"
      },
    ]
  }

  /**
   * Envia la respuesta del usuario por input
   *
   */
  sendMessage() {
    const message: string = this.chatFormGroup.get('input').value
    if (message && isEmail(message) && !this.isEdit) {
      // this.authService.checkUser(message).then(data => {
      //   if (data) {
      const newMessage = { sender: 'user', message, chatId: '' }
      this.addMessage(newMessage)
      // const input = { email: message }
      // this.authService.signup(input, "none")
      // }
      this.hideInput = true
      // }).catch(() => {
      //   console.log("El correo no es valido")
      // })
    }

    if (message && isEmail(message) && this.isEdit) {
      const index = this.chat.messages.findIndex(message => message.sender === 'user')
      this.chat.messages[index].message = message
      this.isEdit = false
      this.hideInput = true
    }
  }

  /**
   * Añade el mensaje al listado de mensajes
   *
   * @param message
   */
  addMessage(message: Message) {
    const iaResponse = [
      {
        sender: 'IA',
        message: "Gracias por reservar con Laia."
      },
      {
        sender: 'IA',
        message: "Te mantendremos informad@ de su entrenamiento."
      },
    ]
    this.chat.messages = [...this.chat.messages, message, ...iaResponse]
    this.scrollToBottom()
  }

  editMessage(message: Message) {
    this.hideInput = false
    this.isEdit = true
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
