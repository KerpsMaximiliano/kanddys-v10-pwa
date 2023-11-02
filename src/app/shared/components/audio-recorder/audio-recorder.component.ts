import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { RecordRTCService } from 'src/app/core/services/recordrtc.service';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';

@Component({
  selector: 'app-audio-recorder',
  templateUrl: './audio-recorder.component.html',
  styleUrls: ['./audio-recorder.component.scss']
})
export class AudioRecorderComponent implements OnInit {
  @Input() isDialog: boolean;
  @Input() canRecord: boolean;
  @Input() audioBlob: Blob;
  audioBlobUrl: SafeUrl;
  audioName: string;
  isAudioRecording: boolean;
  recordedTime: string;

  constructor(
    private RecordRTCService: RecordRTCService,
    private sanitizer: DomSanitizer,
    private ref: DialogRef,
  ) {
    this.RecordRTCService.getRecordedTime().subscribe((time) => {
      this.recordedTime = time;
    });
    this.RecordRTCService.getRecordedAudioBlob().subscribe((data) => {
      this.audioBlob = data.blob;
      this.audioName = data.title;
      this.prepareUrl(data.blob);
    });
  }

  ngOnInit(): void {
    if(!this.audioBlob && !this.canRecord) throw new Error('Envia un archivo de audio, o envia el prop canRecord como true');
    if(this.audioBlob) this.prepareUrl(this.audioBlob);
  }

  prepareUrl(audioBlob: Blob) {
    this.audioBlobUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(audioBlob));
  }

  startRecordingAudio() {
    if (this.canRecord && !this.isAudioRecording) {
      this.audioBlobUrl = null;
      this.isAudioRecording = true;
      this.RecordRTCService.startAudioRecording();
    }
  }

  stopRecordingAudio() {
    if (this.canRecord && this.isAudioRecording) {
      this.isAudioRecording = false;
      this.RecordRTCService.stopAudioRecording();
    }
    setTimeout(() => this.save(), 500);
  }
  
  clearAudioRecordedData() {
    this.audioBlobUrl = null;
  }

  downloadAudioRecordedData() {
    this._downloadFile(this.audioBlob, 'audio/mp3', this.audioName);
  }

  _downloadFile(data: Blob, type: string, filename: string) {
    const blob = new Blob([data], { type: type });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.download = filename;
    anchor.href = url;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }

  close() {
    this.ref.close();
  }

  save() {
    this.ref.close({ blob: this.audioBlob, title: this.audioName });
  }
}
