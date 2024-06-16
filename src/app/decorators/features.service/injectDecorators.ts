import { Inject, Injectable, Renderer2 } from "@angular/core";
import { EyetrackDecoratorI } from "../directive/interface-decorator";
import { DECORATOR_TOKEN } from "../inject-decorators.module";
import { TrackAssistent } from "src/app/eye-track/features.service/trackAssistent";

@Injectable({
    providedIn: 'root'
  })
  export class InjectDecorators {

    constructor(@Inject(DECORATOR_TOKEN) private myDecorators: EyetrackDecoratorI[],
                private trackAssistent:TrackAssistent) {}
  
    public injectDecorators(rootElement:any, renderer: Renderer2): void {
      this.myDecorators.forEach(decoraror => decoraror.injectElement(rootElement, renderer, this.trackAssistent));
    }
  }