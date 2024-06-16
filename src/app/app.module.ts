import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import {MatButtonModule} from '@angular/material/button';
import { EyeTrackButtonDirective } from './decorators/directive/button-decorator';
import { EyeTrackSelectDirective } from './decorators/directive/select-decorator';
import { EyeScrollComponent } from './decorators/component/eye-scroll.component';
import { EyeTrackHrefDirective } from './decorators/directive/href-decortor';
import { EyeTrackModule } from './eye-track/eye-track.module';
import { InjectDecoratorsModule } from './decorators/inject-decorators.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    EyeTrackModule,
    InjectDecoratorsModule,
    BrowserModule,
    AppRoutingModule,
    MatButtonModule,
    HttpClientModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
