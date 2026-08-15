import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, Routes } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { MOTELCRISTALComponent } from './app/Pages/motelcristal/motelcristal.component';
import { LOGINComponent } from './app/Pages/login/login.component';
import { HOMEADMComponent } from './app/Pages/homeadm/homeadm.component';
import { ADUSERSComponent } from './app/Pages/adusers/adusers.component';

export const routes: Routes = [
  { path: '', component: MOTELCRISTALComponent },
  { path: 'MOTELCRISTAL', component: MOTELCRISTALComponent },
  { path: 'LOGIN', component: LOGINComponent },
  { path: 'HOMEADM', component: HOMEADMComponent },
  { path: 'ADUSERS', component: ADUSERSComponent}
];

const extendedAppConfig = {
  ...appConfig,
  providers: [
    ...appConfig.providers,
    provideHttpClient(withFetch()),
    provideAnimationsAsync(),
    provideRouter(routes),

    importProvidersFrom(ReactiveFormsModule, FormsModule)
  ]
};

bootstrapApplication(AppComponent, extendedAppConfig)
  .catch((err) => console.error(err));
