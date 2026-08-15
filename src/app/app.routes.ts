import { Routes } from '@angular/router';
import { MOTELCRISTALComponent } from './Pages/motelcristal/motelcristal.component';
import { LOGINComponent } from './Pages/login/login.component';
import { HOMEADMComponent } from './Pages/homeadm/homeadm.component';
import { ADUSERSComponent } from './Pages/adusers/adusers.component';

export const routes: Routes = [
    { path: '', component: MOTELCRISTALComponent},
    { path: 'MOTELCRISTAL', component: MOTELCRISTALComponent},
    { path: 'LOGIN', component: LOGINComponent},
    { path: 'HOMEADM', component: HOMEADMComponent},
    { path: 'ADUSERS', component: ADUSERSComponent}
];
