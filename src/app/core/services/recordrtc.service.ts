import { Injectable } from '@angular/core';
import * as RecordRTC from 'recordrtc';
import * as moment from 'moment';
import { Observable, Subject } from 'rxjs';

interface RecordedVideoOutput {
  blob: Blob;
  url: string;
  title: string;
}
interface RecordedAudioOutput {
  blob: Blob;
  title: string;
}
@Injectable({
  providedIn: 'root'
})
export class RecordRTCService {
  private stream: MediaStream;
  private recorder: RecordRTC | RecordRTC.StereoAudioRecorder;
  private interval: any;
  private startTime: any;
  private _stream = new Subject<MediaStream>();
  private _recordedVideo = new Subject<RecordedVideoOutput>();
  private _recordedAudio = new Subject<RecordedAudioOutput>();
  private _recordedUrl = new Subject<string>();
  private _recordingTime = new Subject<string>();
  private _recordingFailed = new Subject<string>();

  getRecordedUrl(): Observable<string> {
    return this._recordedUrl.asObservable();
  }

  getRecordedVideoBlob(): Observable<RecordedVideoOutput> {
    return this._recordedVideo.asObservable();
  }

  getRecordedAudioBlob(): Observable<RecordedAudioOutput> {
    return this._recordedAudio.asObservable();
  }

  getRecordedTime(): Observable<string> {
    return this._recordingTime.asObservable();
  }

  recordingFailed(): Observable<string> {
    return this._recordingFailed.asObservable();
  }

  getStream(): Observable<MediaStream> {
    return this._stream.asObservable();
  }

  startVideoRecording() {
    var browser = <any>navigator; 
    if (this.recorder) {
      return;
    }

    this._recordingTime.next('00:00');

    return new Promise((resolve, reject) => {
      browser.mediaDevices
        .getDisplayMedia({
          video: {
            displaySurface: 'monitor', // monitor, window, application, browser
            logicalSurface: true,
            cursor: 'always', // never, always, motion
          },
        })
        .then((screenStream: any) => {
          navigator.mediaDevices.getUserMedia({ audio: true }).then((mic) => {
            screenStream.addTrack(mic.getTracks()[0]);
            this.stream = screenStream;
            this.recordVideo();
            resolve(this.stream);
          });
        })
        .catch((error: any) => {
          this._recordingFailed.next();
          reject;
        });
    });
  }

  startAudioRecording() {
    if (this.recorder) {
      return;
    }

    this._recordingTime.next('00:00');
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(s => {
        this.stream = s;
        this.recordAudio();
      }).catch(error => {
        this._recordingFailed.next();
      });

  }

  abortRecording() {
    this.stopMedia();
  }

  private recordVideo() {
    this.recorder = new RecordRTC(this.stream, {
      type: 'video',
      mimeType: 'video/webm',
      bitsPerSecond: 562000,
      canvas: {
        width: 1080,
        height: 1920,
      },
    });
    (<RecordRTC>this.recorder).startRecording();
    this.startTimer();
  }

  private recordAudio() {
    this.recorder = new RecordRTC.StereoAudioRecorder(this.stream, {
      type: 'audio',
      mimeType: 'audio/mp3'
    });

    (<any>this.recorder).record();
    this.startTimer();
  }

  private startTimer() {
    this.startTime = moment();
    this.interval = setInterval(
      () => {
        const currentTime = moment();
        const diffTime = moment.duration(currentTime.diff(this.startTime));
        const time = this.toString(diffTime.minutes()) + ':' + this.toString(diffTime.seconds());
        this._recordingTime.next(time);
      },
      500
    );
  }

  private toString(value: any) {
    let val = value;
    if (!value) {
      val = '00';
    }
    if (value < 10) {
      val = '0' + value;
    }
    return val;
  }

  stopVideoRecording() {
    if (this.recorder) {
      (<RecordRTC>this.recorder).stopRecording(this.processVideo.bind(this));
      //this.processVideo.bind(this.recorder)
      //this.processVideo(this.recorder);
      //this.stopMedia();
    }
  }

  stopAudioRecording() {
    if (this.recorder) {
      (<any>this.recorder).stop((blob) => {
        if (this.startTime) {
          const mp3Name = encodeURIComponent('audio_' + new Date().getTime() + '.mp3');
          this.stopMedia();
          this._recordedAudio.next({ blob: blob, title: mp3Name });
        }
      }, () => {
        this.stopMedia();
        this._recordingFailed.next();
      });
    }
  }

  private processVideo(audioVideoWebMURL: any) {
    // console.log(audioVideoWebMURL);
    const recordedBlob = (<RecordRTC>this.recorder).getBlob();
    (<any>this.recorder).getDataURL(function (dataURL: any) {});
    const recordedName = encodeURIComponent(
      'video_' + new Date().getTime() + '.webm'
    );
    this._recordedVideo.next({
      blob: recordedBlob,
      url: audioVideoWebMURL,
      title: recordedName,
    });
    this.stopMedia();
    //this.recorder.save(recordedName);
  }

  private stopMedia() {
    if (this.recorder) {
      this.recorder = null;
      clearInterval(this.interval);
      this.startTime = null;
      if (this.stream) {
        this.stream.getAudioTracks().forEach((track) => track.stop());
        this.stream.getVideoTracks().forEach((track) => track.stop());
        this.stream = null;
      }
    }
  }
}