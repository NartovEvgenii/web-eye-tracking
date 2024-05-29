import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TrainAppPage } from './eye-track/train/trainApp.page';
import {MatButtonModule} from '@angular/material/button';
import { CameraComponent } from './eye-track/component/camera/camera.component';
import { EyeTargeComponent } from './eye-track/component/eye-target/eye-target.component';
import { HeatMapComponent } from './eye-track/component/heatmap/heatmap.component';
import { EyeTrackButtonDirective } from './decorators/directive/button-decorator';
import { EyeTrackSelectDirective } from './decorators/directive/select-decorator';
import { EyeScrollComponent } from './decorators/component/eye-scroll.component';

@NgModule({
  declarations: [
    AppComponent,
    TrainAppPage,
    CameraComponent,
    EyeTargeComponent,
    HeatMapComponent,
    EyeScrollComponent,
    EyeTrackButtonDirective,
    EyeTrackSelectDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatButtonModule
  ],
  providers: [
    EyeTrackButtonDirective,
    EyeTrackSelectDirective,
    EyeScrollComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
