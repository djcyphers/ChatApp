import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../chat.service';
import * as io from 'socket.io-client';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewChecked {

  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  chats: any;
  joined = false;
  newUser = { nickname: '', room: '' };
  msgData = { room: '', nickname: '', message: '' };
  socket = io('http://localhost:4000');

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user !== null) {
      this.getChatByRoom(user.room);
      this.msgData = { room: user.room, nickname: user.nickname, message: '' };
      this.joined = true;
      this.scrollToBottom();
    }
    this.socket.on('new-message', function (data) {
      if (data.message.room === JSON.parse(localStorage.getItem('user')).room) {
        console.log(data.message.nickname);
        this.room = data.message.room;
        this.nickname = data.message.nickname;
        this.message = data.message.message;
        this.chats.push(data.message);
        this.msgData = { room: user.room, nickname: user.nickname, message: '' };
        this.scrollToBottom();
      }
    }.bind(this));
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  getChatByRoom(room) {
    this.chatService.getChatByRoom(room).then((res) => {
      this.chats = res;
    }, (err) => {
      console.log(err);
    });
  }

  joinRoom() {
    const date = new Date();
    localStorage.setItem('user', JSON.stringify(this.newUser));
    this.getChatByRoom(this.newUser.room);
    this.msgData = { room: this.newUser.room, nickname: this.newUser.nickname, message: '' };
    this.joined = true;
    // tslint:disable-next-line:max-line-length
    this.socket.emit('save-message', { room: this.newUser.room, nickname: this.newUser.nickname, message: 'Join this room', updated_at: date });
  }

  sendMessage() {
    this.chatService.saveChat(this.msgData).then((result) => {
      this.socket.emit('save-message', result);
      this.chatService.updateChat(this.msgData);
      console.log('ObjectData: ' + Object.values(result));
    }, (err) => {
      console.log(err);
    });
  }

  logout() {
    const date = new Date();
    const user = JSON.parse(localStorage.getItem('user'));
    this.socket.emit('save-message', { room: user.room, nickname: user.nickname, message: 'Left this room', updated_at: date });
    localStorage.removeItem('user');
    this.joined = false;
  }

}
