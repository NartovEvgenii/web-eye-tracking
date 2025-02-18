import {Component, HostListener, OnInit} from '@angular/core';
import { CurrentTrainData } from 'src/app/eye-track/features.service/currentTrainData';
import { DatasetService } from 'src/app/eye-track/features.service/dataset';
import { EyeTrackModel } from 'src/app/eye-track/features.service/eyeTrackModel';
import { EyeTrack } from '../features.service/eyeTrack';

export enum KeyCodes {
  LEFT = 37,
  RIGHT = 39,
  SPACE = 32,
  O = 79,
  P = 80
}

@Component({
    selector: 'trainApp',
    templateUrl: './trainApp.component.html',
    styleUrls: ['./trainApp.component.scss']
  })
export class TrainAppComponent implements OnInit {

  showInterface: boolean=true;
  startEyeTracking: boolean=false;
  showHeatMap: boolean=false;
  addDataIntervalId: any;
  startTrainData: boolean=false;

  
  clientX: number=0;  
  clientY: number=0;

  btn1Count: number=0;
  btn2Count: number=0;

  constructor(
    private readonly datasetservice: DatasetService,
    private currentTrainData: CurrentTrainData,
    private eyeTrackModel:EyeTrackModel
  ) {
  }

  @HostListener('mousemove', ['$event']) onMouseMove(event: { clientX: any; clientY: any; }) {
      this.currentTrainData.targetX = event.clientX / window.innerWidth;
      this.currentTrainData.targetY = event.clientY / window.innerHeight;     
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: any) {
    if (event.keyCode == KeyCodes.RIGHT) {
      this.currentTrainData.targetX = this.clientX;
      this.currentTrainData.targetY = this.clientY;      
      this.addDataToDataset();
    }
    if (event.keyCode == KeyCodes.LEFT) {
      this.showInterface = !this.showInterface;
    }
    if (event.keyCode == KeyCodes.O) {
      this.saveModel();
    }
    if (event.keyCode == KeyCodes.P) {
      this.fitModel();
    }
  }

  ngOnInit(): void {
    this.currentTrainData.startTraining = true;
  }

  createDataset() {
    this.currentTrainData.startTraining = true;
  }

  private addDataToDataset() {
    this.datasetservice.addDataToDataset(this.currentTrainData);
  }

  fitModel() {
    this.eyeTrackModel.fitModel();
  }

  showTarget() {
    this.startEyeTracking = !this.startEyeTracking;
  }

  showHeatMapevent() {
    this.showHeatMap = !this.showHeatMap;
  }

  saveDataset() {
    const data = this.datasetservice.toJSON();
    const json = JSON.stringify(data);
    this.download(json, 'dataset.json', 'text/plain');
  }

  loadDataset(event:any) {

    const file:File = event.target.files[0];

    if (file) {

      const reader = new FileReader();
      const datasetservice = this.datasetservice;

      reader.onload = function() {
        const data = reader.result as string;
        const json = JSON.parse(data);
        console.log(data)
        datasetservice.fromJSON(json);
      };
  
      reader.readAsBinaryString(file);
    }
}

saveModel() {
  this.eyeTrackModel.currentModel?.save('downloads://model');
}

printText() {
  console.log("click");
}

increaseBtn1() {
  this.btn1Count += 1;
}

increaseBtn2() {
  this.btn2Count += 1;
}

loadModel(event:any) {
  const file1:File = event.target.files[0];
  const file2:File = event.target.files[1];
  console.log(file1);
  console.log(file2);
  if (file1 && file2) {
    this.eyeTrackModel.loadModel(file1, file2);
  }
}

saveImage() {
  const image = this.currentTrainData.fullimage;
  document.write('<img src="'+image+'"/>');
}

  private download(content:any, fileName:any, contentType:any) {
    const a = document.createElement('a');
    const file = new Blob([content], {
      type: contentType,
    });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }

}