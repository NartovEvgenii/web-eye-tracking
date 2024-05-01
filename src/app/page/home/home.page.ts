import {Component, HostListener, OnInit} from '@angular/core';
import { CurrentTrainData } from 'src/app/features.service/currentTrainData';
import { DatasetService } from 'src/app/features.service/dataset';
import { EyeTrackModel } from 'src/app/features.service/eyeTrackModel';

@Component({
    selector: 'home',
    templateUrl: './home.page.html',
    styleUrls: ['./home.page.scss']
  })
export class HomePage implements OnInit {

  startTraining: boolean=false;
  startEyeTracking: boolean=false;
  showHeatMap: boolean=false;
  addDataIntervalId: any;

  
  clientX: number=0;  
  clientY: number=0;

  constructor(
    private readonly datasetservice: DatasetService,
    private currentTrainData: CurrentTrainData,
    private eyeTrackModel:EyeTrackModel
  ) {
  }

  @HostListener('mousemove', ['$event']) onMouseMove(event: { clientX: any; clientY: any; }) {
      this.clientX = event.clientX / window.innerWidth;
      this.clientY = event.clientY / window.innerHeight; 
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: any) {
      this.currentTrainData.targetX = this.clientX;
      this.currentTrainData.targetY = this.clientY;
      
      this.addDataToDataset();    
  }

  ngOnInit(): void {
    this.currentTrainData.startTraining = true;
  }

  createDataset() {
    this.startTraining = true;
    this.currentTrainData.startTraining = true;
    this.addDataIntervalId = setInterval(() => this.addDataToDataset(), 500);
    this.currentTrainData.startTraining$
                .subscribe((val) => {
                  if(!val){
                    this.startTraining = false;
                    clearInterval(this.addDataIntervalId);
                  }
                });
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

loadModel(event:any) {
  const file1:File = event.target.files[0];
  const file2:File = event.target.files[1];
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