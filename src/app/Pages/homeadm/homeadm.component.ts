import { Component, OnInit, ViewChild, ElementRef, Renderer2, inject, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { HttpClient, HttpClientModule } from '@angular/common/http';

import { Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';

import { environment } from '../../../environments/environment';

interface AuthResponse {
  success: boolean;
  message: string;
}

@Component({
  standalone: true,
  selector: 'app-homeadm',
  templateUrl: './homeadm.component.html',
  styleUrls: ['./homeadm.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // <-- esto es lo necesario
})
export class HOMEADMComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private renderer = inject(Renderer2);
  isBrowser: boolean;

  parteForm!: FormGroup;
modoEdicion: boolean = false;
numeroHabitacionSeleccionada: number | null = null;
nombreUsuarioLogueado: string | null = null;


  errorMessage: string = '';

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }


  ADUSERS(): void {
    this.router.navigate(['/ADUSERS'], { queryParams: { usuario: this.nombreUsuarioLogueado } });
  }

  Exit(): void {
    this.router.navigate(['/LOGIN']);
  }

  ngOnInit(): void {

    this.parteForm = this.formBuilder.group({
      tipohab: ['', Validators.required],
      tipoCamahab: ['', Validators.required],
      jacuzzihab: ['', Validators.required],
      preciohab: ['', Validators.required]
    });

    this.renderer.addClass(document.body, 'loading-active');

    if (this.isBrowser) {
      this.nombreUsuarioLogueado = sessionStorage.getItem('nombreUsuarioLogueado');

      if (this.nombreUsuarioLogueado) {
        console.log('Usuario autenticado:', this.nombreUsuarioLogueado);
      } else {
        console.warn('No hay un usuario autenticado en sessionStorage. Activando verifyAdmin()...');
        this.snackBar.open('Error: Usuario no autenticado. Por favor, ingrese credenciales.', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    }


  }

  openForm2ConNumero(num: number): void {
    console.log('Habitación seleccionada:', num); // 👈 Verifica que el número esté llegando
    this.numeroHabitacionSeleccionada = num;
  
    const formContainer = document.getElementById('formContainer');
    if (formContainer) formContainer.style.display = 'flex';
  
    this.parteForm.reset();
    this.modoEdicion = false;
  
    this.http.get<any>(`${environment.apiUrl}Habitaciones/${num}`).subscribe({
      next: (data) => {
        this.parteForm.patchValue({
          tipohab: data.tipohab,
          tipoCamahab: data.tipoCamahab,
          jacuzzihab: data.jacuzzihab,
          preciohab: data.preciohab
        });
        this.modoEdicion = true;
      },
      error: () => {
        console.log('No hay datos existentes para habitación:', num);
        this.modoEdicion = false;
      }
    });
  }
  
  
  guardarNuevaParte(): void {
    if (!this.numeroHabitacionSeleccionada || this.parteForm.invalid) {
      console.warn('Formulario inválido o número no definido', this.numeroHabitacionSeleccionada);
      return;
    }
  
    const payload = {
      numhab: this.numeroHabitacionSeleccionada,
      tipohab: this.parteForm.value.tipohab,
      tipoCamahab: this.parteForm.value.tipoCamahab,
      jacuzzihab: this.parteForm.value.jacuzzihab,
      albercahab: this.parteForm.value.jacuzzihab === 'ALBERCA' ? 'SI' : 'NO',
      preciohab: String(this.parteForm.value.preciohab),
      acargoUserMTL: this.nombreUsuarioLogueado,
      turnoUserMTL: Number(1)

    };
  
    console.log('Payload que se enviará:', payload);
  
    this.http.post(`${environment.apiUrl}Habitaciones/guardar`, payload).subscribe({
      next: () => {
        this.closeForm2();
        alert(this.modoEdicion ? 'Habitación actualizada' : 'Habitación agregada');
      },
      error: (err) => {
        console.error(' Error completo en POST:', err);
        if (err.error) {
          console.error(' Detalle del error desde el backend:', err.error);
        }
        alert(' No se pudo guardar la habitación. Revisa consola.');
      }
      
    });
  }
  
  

  closeForm2(): void {
    const formContainer = document.getElementById('formContainer');
    if (formContainer) {
      formContainer.style.display = 'none';
    }

    this.errorMessage = '';
  }


  abrirFormReserva(num: number): void {
    this.numeroHabitacionSeleccionada = num;
  
    const formContainer = document.getElementById('formReserva');
    if (formContainer) {
      formContainer.style.display = 'flex';
    }
  
    // Restablece el formulario y modo edición
    this.parteForm.reset();
    this.modoEdicion = false;
  
    // Si deseas precargar los datos existentes (como en el otro form), puedes reutilizar:
    this.http.get<any>(`${environment.apiUrl}Habitaciones/${num}`).subscribe({
      next: (data) => {
        this.parteForm.patchValue({
          tipohab: data.tipohab,
          tipoCamahab: data.tipoCamahab,
          jacuzzihab: data.jacuzzihab,
          preciohab: data.preciohab
        });
        this.modoEdicion = true;
      },
      error: () => {
        console.log('No hay datos existentes para habitación:', num);
        this.modoEdicion = false;
      }
    });
  }

  
  reservanum3(): void {
    if (!this.numeroHabitacionSeleccionada || this.parteForm.invalid) {
      console.warn('Formulario inválido o número no definido', this.numeroHabitacionSeleccionada);
      return;
    }

  }

  closeForm3(): void {
    const formContainer = document.getElementById('formReserva');
    if (formContainer) {
      formContainer.style.display = 'none';
    }

    this.errorMessage = '';
  }

  guardarInfoHab(): void {

  }

  abrirNuevoCliente(): void {
    this.showForm('nuevoClienteForm');
  }

  showForm(formId: string): void {
    this.closeAllForms();
    (document.getElementById(formId) as HTMLElement).style.display = 'flex';
    (document.querySelector('mat-card') as HTMLElement).classList.add('blur');
  }

  private closeAllForms(): void {
    const forms = document.querySelectorAll('.form');
    forms.forEach(form => {
      (form as HTMLElement).style.display = 'none';
    });
    (document.querySelector('mat-card') as HTMLElement).classList.remove('blur');
  }

  cerrarModalPDF(): void {
  }

}
