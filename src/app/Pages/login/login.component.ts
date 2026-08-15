import { Component, OnInit, Inject, OnDestroy, Renderer2, AfterViewInit, ViewChild, ElementRef  } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators  } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { map, startWith, switchMap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { RouterModule } from '@angular/router';



@Component({
  selector: 'app-login',
    imports: [
      RouterModule,
    MatFormFieldModule, MatCardModule, MatStepperModule, MatInputModule,
    MatButtonModule, MatSelectModule, MatIconModule, ReactiveFormsModule, FormsModule,
    MatAutocompleteModule, MatDialogModule, MatListModule, MatRadioModule, CommonModule, HttpClientModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LOGINComponent implements OnInit, AfterViewInit {
  @ViewChild('emailInput') emailInput!: ElementRef<HTMLInputElement>;
  @ViewChild('passwordInput') passwordInput!: ElementRef<HTMLInputElement>;

  emailAdmi: string = '';   // Agregar propiedades para el email y la contraseña del administrador
  passwordAdmi: string = '';
  nombreUsuarioLogueado: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private renderer: Renderer2 // Renderer2 añadido para manipular clases en el DOM
  ) { 

  }
        
  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.emailInput.nativeElement.value = '';
      this.passwordInput.nativeElement.value = '';
    });
  }
  verifyAdmin() {
    const userInput = this.emailAdmi.trim();
    const password = this.passwordAdmi.trim();
  
    if (!userInput || !password) {
      this.snackBar.open('Por favor, completa ambos campos.', 'Cerrar', { duration: 3000, panelClass: ['error-snackbar'] });
      return;
    }
  
    // Determinar si es un email o username
    const isEmail = userInput.includes('@');
  
    // Construir el objeto de login según corresponda
    const loginData: any = {
      passwordUs: password
    };
  
    if (isEmail) {
      loginData.emailUs = userInput.toLowerCase();
    } else {
      loginData.usernameUs = userInput;
    }
  
    this.http.post<any>(`${environment.apiUrl}Usersadmin/authenticate`, loginData)
      .subscribe(
        response => {
          if (response.success) {
            this.nombreUsuarioLogueado = response.nombreUs;
            sessionStorage.setItem('nombreUsuarioLogueado', this.nombreUsuarioLogueado);
  
            this.snackBar.open(`¡Ingreso Exitoso! Bienvenido, ${this.nombreUsuarioLogueado}`, 'Cerrar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
  
            setTimeout(() => {
              this.router.navigate(['/HOMEADM']);
            }, 3000);
          }
        },
        error => {
          const errorMsg = error?.error?.message || 'Error al autenticar. Verifica tus credenciales.';
          this.snackBar.open(errorMsg, 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      );
  }
  
}
