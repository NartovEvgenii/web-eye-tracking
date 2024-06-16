import { ElementRef, Renderer2 } from "@angular/core";
import { TrackAssistent } from "src/app/eye-track/features.service/trackAssistent";

export interface EyetrackDecoratorI{
    injectElement(rootElement: any, renderer: Renderer2, eyeTrackAssist: TrackAssistent): void
  }