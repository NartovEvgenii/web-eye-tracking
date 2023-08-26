import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CameraComponent } from './component/camera/camera.component';
import { TrainTargeComponent } from './component/train-target/train-target.component';
import { HomePage } from './page/home/home.page';
import {MatButtonModule} from '@angular/material/button';
import { DatasetService } from './features.service/dataset';
import { EyeTargeComponent } from './component/eye-target/eye-target.component';

@NgModule({
  declarations: [
    AppComponent,
    HomePage,
    CameraComponent,
    TrainTargeComponent,
    EyeTargeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
