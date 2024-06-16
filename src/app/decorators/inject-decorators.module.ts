import { BrowserModule } from "@angular/platform-browser";
import { EyeScrollComponent } from "./component/eye-scroll.component";
import { EyeTrackButtonDirective } from "./directive/button-decorator";
import { EyeTrackHrefDirective } from "./directive/href-decortor";
import { EyeTrackSelectDirective } from "./directive/select-decorator";
import { TrackAssistent } from "../eye-track/features.service/trackAssistent";
import { InjectionToken, NgModule } from "@angular/core";
import { EyeTrackModule } from "../eye-track/eye-track.module";
import { EyetrackDecoratorI } from "./directive/interface-decorator";

export const DECORATOR_TOKEN = new InjectionToken<EyetrackDecoratorI[]>('DecoratorToken');

@NgModule({
    declarations: [
        EyeTrackButtonDirective,
        EyeTrackSelectDirective,
        EyeTrackHrefDirective,
        EyeScrollComponent
    ],
    imports: [
      BrowserModule,
      EyeTrackModule
    ],
    providers: [
      TrackAssistent,
      { provide: DECORATOR_TOKEN, useClass: EyeTrackButtonDirective, multi: true },
      { provide: DECORATOR_TOKEN, useClass: EyeTrackSelectDirective, multi: true },
      { provide: DECORATOR_TOKEN, useClass: EyeTrackHrefDirective, multi: true },
    ],
    exports: [
        EyeTrackButtonDirective,
        EyeTrackSelectDirective,
        EyeTrackHrefDirective,
        EyeScrollComponent
    ]
  })
  export class InjectDecoratorsModule { }

  export { EyetrackDecoratorI };