import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TrainAppPage } from './eye-track/train/trainApp.page';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: true
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
