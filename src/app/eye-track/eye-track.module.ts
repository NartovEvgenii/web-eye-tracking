import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';
import {MatButtonModule} from '@angular/material/button';
import { TrainAppComponent } from './train/trainApp.component';
import { CameraComponent } from './component/camera/camera.component';
import { EyeTargeComponent } from './component/eye-target/eye-target.component';
import { HeatMapComponent } from './component/heatmap/heatmap.component';
import { DatasetService } from './features.service/dataset';
import { EyeTrackModel } from './features.service/eyeTrackModel';
import { CurrentTrainData } from './features.service/currentTrainData';


@NgModule({
  declarations: [
    TrainAppComponent,
    CameraComponent,
    EyeTargeComponent,
    HeatMapComponent
  ],
  imports: [
    BrowserModule,
    MatButtonModule,
    HttpClientModule
  ],
  providers: [
    DatasetService,
    EyeTrackModel,
    CurrentTrainData
  ],
  exports: [
    TrainAppComponent,
    CameraComponent,
    EyeTargeComponent,
    HeatMapComponent
  ]
})
export class EyeTrackModule { }
