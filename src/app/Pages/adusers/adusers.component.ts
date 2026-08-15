import { Component, OnInit, Inject, Renderer2 } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { NgZone } from '@angular/core';


@Component({
  selector: 'app-adusers',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule
  ], 
  templateUrl: './adusers.component.html', 
  styleUrl: './adusers.component.css'
})
export class ADUSERSComponent implements OnInit{
  datosAdmins: any[] = [];
  editForm: FormGroup;
  newForm: FormGroup;
  selectedTrabajador: any = null;
  ntrabajadorUs: string = '';
  mostrarNuevoForm: boolean = false;
  isResultLoaded = false;
  showPassword: { [id: number]: boolean } = {}; // Objeto para almacenar el estado de visibilidad de la contraseña

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private ngZone: NgZone, private renderer: Renderer2, private cdr: ChangeDetectorRef, private fb: FormBuilder, public dialog: MatDialog, private router: Router) {
    this.editForm = this.fb.group({
      ntrabajadorUs: [''],
      NombreUs: [''],
      PuestoUs: [''],
      DepartamentoUs: [''],
      EmailUs: [''],
      UsernameUs: [''],
      PasswordUs: ['']
    });
    
    this.newForm = this.fb.group({
      ntrabajadorUs: [''],
      NombreUs: [''],
      PuestoUs: [''],
      DepartamentoUs: [''],
      EmailUs: [''],
      UsernameUs: [''],
      PasswordUs: ['']
    });
  }

  togglePasswordVisibility(IdUs: number): void {
    this.showPassword[IdUs] = !this.showPassword[IdUs];
  }

  ngOnInit() {
    this.renderer.addClass(document.body, 'loading-active');
    this.loadData();
  }

  saveAndExit() {
    this.router.navigate(['/HOMEMA3']);
  }

  private loadData(): void {
    this.loadDatosRecursively();
  }

  private loadDatosRecursively(): void {
    this.loadDatos(); // Simplemente llama a loadDatos(), que ya maneja todo el ciclo de suscripción
  }

  private loadDatos(): void {
    this.http.get<any[]>(`${this.apiUrl}Usersadmin`).subscribe(
      data => {
        console.log(data); // Verificar estructura y existencia de PasswordAdmi
        this.datosAdmins = data;
        this.isResultLoaded = true;
        this.cdr.detectChanges(); // Forzamos la detección de cambios
      },
      error => {
        console.error('Error al cargar datos:', error);
        setTimeout(() => {
          this.loadDatosRecursively();
        }, 5000);
      }
    );
  }


  editDatos(datos: any) {
    console.log("Datos recibidos en editDatos:", datos);
  
    // Mapeo de campos para que coincidan con el formulario
    const datosTransformados = {
      IdUs: datos.idUs,
      ntrabajadorUs: datos.ntrabajadorUs,
      NombreUs: datos.nombreUs,
      PuestoUs: datos.puestoUs,
      DepartamentoUs: datos.departamentoUs,
      EmailUs: datos.emailUs,
      UsernameUs: datos.usernameUs,
      PasswordUs: datos.passwordUs
    };
  
    const dialogRef = this.dialog.open(EditLiderDialog, {
      width: '40%',
      data: datosTransformados
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log("Resultado del diálogo:", result);
  
        if (!result.IdUs) {
          console.error("IdUs está indefinido. No se puede realizar la solicitud PUT.");
          return;
        }
  
        // Transformar los campos a mayúsculas, excepto los que no deben cambiarse
        result = this.transformarCamposAMayusculas(result);
  
        this.http.put(`${this.apiUrl}Usersadmin/${result.IdUs}`, result).subscribe(() => {
          this.loadDatos(); // Recargar datos después del guardado
        }, error => {
          console.error('Error al guardar los datos editados:', error);
        });
      }
    });
  }
  

  private transformarCamposAMayusculas(data: any) {
    if (typeof data.ntrabajadorUs === 'string') {
      data.ntrabajadorUs = data.ntrabajadorUs.toUpperCase();
    }
    if (typeof data.NombreUs === 'string') {
      data.NombreUs = data.NombreUs.toUpperCase();
    }
    if (typeof data.PuestoUs === 'string') {
      data.PuestoUs = data.PuestoUs.toUpperCase();
    }
    if (typeof data.DepartamentoUs === 'string') {
      data.DepartamentoUs = data.DepartamentoUs.toUpperCase();
    }
    return data;
  }
  

  saveEdit() {
    if (this.selectedTrabajador) {
      const editedData = this.editForm.value;
      // Transformar los datos a mayúsculas, excepto el email
      editedData.ntrabajadorUs = editedData.ntrabajadorUs.toUpperCase();
      editedData.NombreUs = editedData.NombreUs.toUpperCase();
      editedData.PuestoUs = editedData.PuestoUs.toUpperCase();
      editedData.DepartamentoUs = editedData.DepartamentoUs.toUpperCase();
      // Email permanece tal cual

      this.http.put(`${this.apiUrl}Usersadmin/${this.selectedTrabajador.IdUs}`, editedData).subscribe(() => {
        this.loadDatos();
        this.selectedTrabajador = null;
      });
    }
  }

  deleteDatos(IdUs: number) {
    this.http.delete(`${this.apiUrl}Usersadmin/${IdUs}`).subscribe(() => {
      this.loadDatos();
    });
  }

  confirmDelete(datos: any) {
    const dialogRef = this.dialog.open(ConfirmDeleteDialog, {
      width: '40%',
      data: datos
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteDatos(result.IdUs);
      }
    });
  }

  addNuevoTrabajador() {
    const dialogRef = this.dialog.open(AddNuevoLiderDialog, {
      width: '40%',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Verificar duplicados
        const duplicate = this.datosAdmins.find(lider =>
          lider.ntrabajadorUs === result.ntrabajadorUs &&
          lider.NombreUs === result.NombreUs &&
          lider.PuestoUs === result.PuestoUs &&
          lider.DepartamentoUs === result.DepartamentoUs &&
          lider.emailAdmi === result.emailAdmi
        );

        if (duplicate) {
          alert('Este Trabajador ya se encuentra registrado');
        } else {
          // Transformar los datos a mayúsculas, excepto el email
          result.ntrabajadorUs = result.ntrabajadorUs.toUpperCase();
          result.NombreUs = result.NombreUs.toUpperCase();
          result.PuestoUs = result.PuestoUs.toUpperCase();
          result.DepartamentoUs = result.DepartamentoUs.toUpperCase();
          // Email permanece tal cual

          //  Generar contraseña con iniciales + número de trabajador
          const nombres = result.NombreUs.trim().split(/\s+/); // divide por espacios
          const iniciales = nombres.map((n: string) => n.charAt(0)).join('').toUpperCase();
          const trabajador = result.ntrabajadorUs;
          result.PasswordUs = `${iniciales}${trabajador}`; // <-- IMPORTANTE: usar "PasswordUs"

          this.http.post(`${this.apiUrl}Usersadmin`, result).subscribe(() => {
            this.loadDatos();
          });
        }
      }
    });
  }

  searchTrabajador() {
    if (this.ntrabajadorUs) {
      this.http.get<any>(`${this.apiUrl}Usersadmin/${this.ntrabajadorUs}`).subscribe(data => {
        this.datosAdmins = [data];
      });
    } else {
      this.loadDatos();
    }
  }

  searchTrabajadorDynamic() {
    if (this.ntrabajadorUs) {
      this.http.get<any[]>(`${this.apiUrl}Usersadmin`).subscribe(data => {
        this.datosAdmins = data.filter(item => item.ntrabajadorUs.toString().includes(this.ntrabajadorUs));
      });
    } else {
      this.loadDatos();
    }
  }


  allowOnlyNumbers(event: KeyboardEvent): boolean {
    const charCode = event.charCode;
    if (charCode >= 48 && charCode <= 57) {
      return true;
    }
    event.preventDefault();
    return false;
  }
}

@Component({
  selector: 'confirm-delete-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title style="font-family: century-gothic, sans-serif; color: black;">¿Estás seguro de eliminar al Usuario?</h2>
    <div mat-dialog-content style="font-family: century-gothic, sans-serif; color: black;">
      <ul>
        <li>Trabajador: {{data.ntrabajadorUs}}</li>
        <li>Nombre Completo: {{data.NombreUs}}</li>
        <li>Puesto: {{data.PuestoUs}}</li>
        <li>Departamento: {{data.DepartamentoUs}}</li>
        <li>Email: {{data.EmailUs}}</li>
      </ul>
    </div>
    <div mat-dialog-actions>
      
      <button mat-button color="warn" (click)="onConfirm()" class="custom-button">Confirmar</button>
      <button mat-button (click)="onCancel()" class="custom-button" style="color:white;">Cancelar</button>
    </div>
  `,
  styles: [
    `.mat-dialog-container {
      font-family: century-gothic, sans-serif;
      color: black;
      height: 40%;
      width: 40%;
      overflow: auto;
    }
    .cdk-global-overlay-wrapper {
      z-index: 1000;
    }
    .cdk-overlay-backdrop {
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(10px);
    }
    @keyframes pulse {
      from {
        transform: scale(0.9);
        opacity: 1;
      }
      to {
        transform: scale(1.8);
        opacity: 0;
      }
    }
    .inputneg:focus {
      border: 2px solid transparent;
      color: #fff;
      box-shadow: 3px 3px 10px rgba(0, 0, 0, 1), -1px -1px 6px rgba(255, 255, 255, 0.4), inset 3px 3px 10px rgba(0, 0, 0, 1), inset -1px -1px 6px rgba(255, 255, 255, 0.4);
    }
    .container .inputneg:valid ~ .label,
    .container .inputneg:focus ~ .label {
      transition: 0.3s;
      padding-left: 2px;
      transform: translateY(-35px);
    }
    .container .inputneg:valid,
    .container .inputneg:focus {
      box-shadow: 3px 3px 10px rgba(0, 0, 0, 1), -1px -1px 6px rgba(255, 255, 255, 0.4), inset 3px 3px 10px rgba(0, 0, 0, 1), inset -1px -1px 6px rgba(255, 255, 255, 0.4);
    }
    .custom-button {
      margin-top: 20px;
      margin: 2px;
      position: relative;
      padding: 10px 20px;
      border-radius: 50px;
      border: 1px solid rgba(255, 255, 255, 0);
      width: 100%;
      height: 48px;
      font-size: 14px;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 2px;
      background: transparent;
      color: black;
      overflow: hidden;
      box-shadow: 0 0 0 0 transparent;
      transition: all 0.2s ease-in;
      background: #202020;
    }

    .custom-button:hover {
      background: #8c3d3d;
      box-shadow: 0 0 30px 5px #944848;
      transition: all 0.2s ease-out;
      color: white;
    }

    .custom-button:hover::before {
      animation: sh02 0.5s 0s linear;
    }

    .custom-button::before {
      content: '';
      display: block;
      width: 0px;
      height: 86%;
      position: absolute;
      top: 7%;
      left: 0%;
      opacity: 0;
      background: #5f5f5f;
      box-shadow: 0 0 50px 30px #5f5f5f;
      transform: skewX(-20deg);
    }

    .custom-button:active {
      box-shadow: 0 0 0 0 transparent;
      transition: box-shadow 0.2s ease-in;
    }

    @keyframes sh02 {
      from {
        opacity: 0;
        left: 0%;
      }

      50% {
        opacity: 1;
      }

      to {
        opacity: 0;
        left: 100%;
      }
    }`
  ]
})
export class ConfirmDeleteDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ConfirmDeleteDialog>
  ) { }

  onConfirm(): void {
    this.dialogRef.close(this.data);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'add-nuevo-lider-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatInputModule, MatDialogModule],
  template: `
    <form [formGroup]="newForm" (ngSubmit)="onSubmit()" class="form1" style="display: flex; flex-direction: column; gap: 10px; padding: 20px; border-radius: 0px; position: relative; background-color: #353535; color: #fff; border: 1px solid #333; font-family: century-gothic, sans-serif; align-items: center; align-content: center;">
      <p class="title" style="font-size: 28px; font-weight: 600; letter-spacing: -1px; position: relative; display: flex; align-items: center; padding-left: 30px; color: #fdfdfd;">
        Agregar Nuevo Usuario
        <span style="width: 18px; height: 18px; position: absolute; content: ''; height: 16px; width: 16px; border-radius: 50%; left: 0px; background-color: #ff0000; animation: pulse 1s linear infinite;"></span>
      </p>

      <div class="container" style="display: flex; flex-direction: column; gap: 7px; position: relative; color: white; width: 100%;">
        <input formControlName="NtrabajadorUs" required type="text" class="inputneg" (input)="toUpperCase($event)" (keypress)="allowOnlyNumbers($event)" style="width: 97%; height: 45px; margin-bottom: 15px; border: none; outline: none; padding: 0px 7px; border-radius: 6px; color: #fff; font-size: 15px; background-color: transparent; box-shadow: 3px 3px 10px rgba(0, 0, 0, 1), -1px -1px 6px rgba(255, 255, 255, 0.4);">
        <label class="label" style="font-size: 15px; padding-left: 10px; position: absolute; top: 13px; transition: 0.3s; pointer-events: none;">Trabajador</label>
      </div>
      <div class="container" style="display: flex; flex-direction: column; gap: 7px; position: relative; color: white; width: 100%;">
        <input formControlName="NombreUs" required type="text" class="inputneg" (input)="toUpperCase($event)" style="width: 97%; height: 45px; margin-bottom: 15px; border: none; outline: none; padding: 0px 7px; border-radius: 6px; color: #fff; font-size: 15px; background-color: transparent; box-shadow: 3px 3px 10px rgba(0, 0, 0, 1), -1px -1px 6px rgba(255, 255, 255, 0.4);">
        <label class="label" style="font-size: 15px; padding-left: 10px; position: absolute; top: 13px; transition: 0.3s; pointer-events: none;">Nombre y Apellido (OBLIGATORIO)</label>
      </div>
      <div class="container" style="display: flex; flex-direction: column; gap: 7px; position: relative; color: white; width: 100%;">
        <input formControlName="PuestoUs" required type="text" class="inputneg" (input)="toUpperCase($event)" style="width: 97%; height: 45px; margin-bottom: 15px; border: none; outline: none; padding: 0px 7px; border-radius: 6px; color: #fff; font-size: 15px; background-color: transparent; box-shadow: 3px 3px 10px rgba(0, 0, 0, 1), -1px -1px 6px rgba(255, 255, 255, 0.4);">
        <label class="label" style="font-size: 15px; padding-left: 10px; position: absolute; top: 13px; transition: 0.3s; pointer-events: none;">Puesto</label>
      </div>
      <div class="container" style="display: flex; flex-direction: column; gap: 7px; position: relative; color: white; width: 100%;">
        <input formControlName="DepartamentoUs" required type="text" class="inputneg" (input)="toUpperCase($event)" style="width: 97%; height: 45px; margin-bottom: 15px; border: none; outline: none; padding: 0px 7px; border-radius: 6px; color: #fff; font-size: 15px; background-color: transparent; box-shadow: 3px 3px 10px rgba(0, 0, 0, 1), -1px -1px 6px rgba(255, 255, 255, 0.4);">
        <label class="label" style="font-size: 15px; padding-left: 10px; position: absolute; top: 13px; transition: 0.3s; pointer-events: none;">Departamento</label>
      </div>

      <div class="container" style="display: flex; flex-direction: column; gap: 7px; position: relative; color: white; width: 100%;">
        <input formControlName="EmailUs" type="text" class="inputneg" style="width: 97%; height: 45px; margin-bottom: 15px; border: none; outline: none; padding: 0px 7px; border-radius: 6px; color: #fff; font-size: 15px; background-color: transparent; box-shadow: 3px 3px 10px rgba(0, 0, 0, 1), -1px -1px 6px rgba(255, 255, 255, 0.4);">
        <label class="label" style="font-size: 15px; padding-left: 10px; position: absolute; top: 13px; transition: 0.3s; pointer-events: none;">Email</label>
      </div>

      <button type="submit" class="submit custom-button" style="color:white; background-color: #5c5c5c;">Guardar Nuevo Usuario</button>
      <button type="button" class="Cancelar custom-button" (click)="onCancel()" style="color:white; background-color: #5c5c5c;">Cancelar</button>
    </form>
  `,
  styles: [
    `.mat-dialog-container {
      font-family: century-gothic, sans-serif;
      color: black;
      height: 40%;
      width: 40%;
      overflow: auto;
    }
    .cdk-global-overlay-wrapper {
      z-index: 1000;
    }
    .cdk-overlay-backdrop {
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(10px);
    }
    @keyframes pulse {
      from {
        transform: scale(0.9);
        opacity: 1;
      }
      to {
        transform: scale(1.8);
        opacity: 0;
      }
    }
    .inputneg:focus {
      border: 2px solid transparent;
      color: #fff;
      box-shadow: 3px 3px 10px rgba(0, 0, 0, 1), -1px -1px 6px rgba(255, 255, 255, 0.4), inset 3px 3px 10px rgba(0, 0, 0, 1), inset -1px -1px 6px rgba(255, 255, 255, 0.4);
    }
    .container .inputneg:valid ~ .label,
    .container .inputneg:focus ~ .label {
      transition: 0.3s;
      padding-left: 2px;
      transform: translateY(-35px);
    }
    .container .inputneg:valid,
    .container .inputneg:focus {
      box-shadow: 3px 3px 10px rgba(0, 0, 0, 1), -1px -1px 6px rgba(255, 255, 255, 0.4), inset 3px 3px 10px rgba(0, 0, 0, 1), inset -1px -1px 6px rgba(255, 255, 255, 0.4);
    }
    .custom-button {
      margin-top: 20px;
      margin: 2px;
      position: relative;
      padding: 10px 20px;
      border-radius: 50px;
      border: 1px solid rgba(255, 255, 255, 0);
      width: 100%;
      height: 48px;
      font-size: 14px;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 2px;
      background: transparent;
      color: black;
      overflow: hidden;
      box-shadow: 0 0 0 0 transparent;
      transition: all 0.2s ease-in;
      background: #202020;
    }

    .custom-button:hover {
      background: #8c3d3d;
      box-shadow: 0 0 30px 5px #944848;
      transition: all 0.2s ease-out;
      color: white;
    }

    .custom-button:hover::before {
      animation: sh02 0.5s 0s linear;
    }

    .custom-button::before {
      content: '';
      display: block;
      width: 0px;
      height: 86%;
      position: absolute;
      top: 7%;
      left: 0%;
      opacity: 0;
      background: #5f5f5f;
      box-shadow: 0 0 50px 30px #5f5f5f;
      transform: skewX(-20deg);
    }

    .custom-button:active {
      box-shadow: 0 0 0 0 transparent;
      transition: box-shadow 0.2s ease-in;
    }

    @keyframes sh02 {
      from {
        opacity: 0;
        left: 0%;
      }

      50% {
        opacity: 1;
      }

      to {
        opacity: 0;
        left: 100%;
      }
    }`
  ]
})
export class AddNuevoLiderDialog {
  newForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddNuevoLiderDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.newForm = this.fb.group({
      NtrabajadorUs: [''],
      NombreUs: [''],
      PuestoUs: [''],
      DepartamentoUs: [''],
      EmailUs: ['']
    });
  }

  onSubmit(): void {
    if (this.newForm.valid) {
      this.dialogRef.close(this.newForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  toUpperCase(event: any): void {
    event.target.value = event.target.value.toUpperCase();
  }

  allowOnlyNumbers(event: KeyboardEvent): boolean {
    const charCode = event.charCode;
    if (charCode >= 48 && charCode <= 57) {
      return true;
    }
    event.preventDefault();
    return false;
  }
}

@Component({
  selector: 'edit-lider-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatInputModule, MatDialogModule],
  template: `
    <form [formGroup]="editForm" (ngSubmit)="onSubmit()" class="form1" style="display: flex; flex-direction: column; gap: 10px; padding: 20px; border-radius: 0px; position: relative; background-color: #353535; color: #fff; border: 1px solid #333; font-family: century-gothic, sans-serif; align-items: center; align-content: center;">
      <p class="title" style="font-size: 28px; font-weight: 600; letter-spacing: -1px; position: relative; display: flex; align-items: center; padding-left: 30px; color: #fdfdfd;">
        Editar Uuario
        <span style="width: 18px; height: 18px; position: absolute; content: ''; height: 16px; width: 16px; border-radius: 50%; left: 0px; background-color: #ff0000; animation: pulse 1s linear infinite;"></span>
      </p>

      <div class="container" style="display: flex; flex-direction: column; gap: 7px; position: relative; color: white; width: 100%;">
        <input formControlName="ntrabajadorUs" required type="text" class="inputneg" (input)="toUpperCase($event)" (keypress)="allowOnlyNumbers($event)" style="width: 97%; height: 45px; margin-bottom: 15px; border: none; outline: none; padding: 0px 7px; border-radius: 6px; color: #fff; font-size: 15px; background-color: transparent; box-shadow: 3px 3px 10px rgba(0, 0, 0, 1), -1px -1px 6px rgba(255, 255, 255, 0.4);">
        <label class="label" style="font-size: 15px; padding-left: 10px; position: absolute; top: 13px; transition: 0.3s; pointer-events: none;">Trabajador</label>
      </div>
      <div class="container" style="display: flex; flex-direction: column; gap: 7px; position: relative; color: white; width: 100%;">
        <input formControlName="NombreUs" required type="text" class="inputneg" (input)="toUpperCase($event)" style="width: 97%; height: 45px; margin-bottom: 15px; border: none; outline: none; padding: 0px 7px; border-radius: 6px; color: #fff; font-size: 15px; background-color: transparent; box-shadow: 3px 3px 10px rgba(0, 0, 0, 1), -1px -1px 6px rgba(255, 255, 255, 0.4);">
        <label class="label" style="font-size: 15px; padding-left: 10px; position: absolute; top: 13px; transition: 0.3s; pointer-events: none;">Nombre</label>
      </div>
      <div class="container" style="display: flex; flex-direction: column; gap: 7px; position: relative; color: white; width: 100%;">
        <input formControlName="PuestoUs" required type="text" class="inputneg" (input)="toUpperCase($event)" style="width: 97%; height: 45px; margin-bottom: 15px; border: none; outline: none; padding: 0px 7px; border-radius: 6px; color: #fff; font-size: 15px; background-color: transparent; box-shadow: 3px 3px 10px rgba(0, 0, 0, 1), -1px -1px 6px rgba(255, 255, 255, 0.4);">
        <label class="label" style="font-size: 15px; padding-left: 10px; position: absolute; top: 13px; transition: 0.3s; pointer-events: none;">Puesto</label>
      </div>
      <div class="container" style="display: flex; flex-direction: column; gap: 7px; position: relative; color: white; width: 100%;">
        <input formControlName="DepartamentoUs" required type="text" class="inputneg" (input)="toUpperCase($event)" style="width: 97%; height: 45px; margin-bottom: 15px; border: none; outline: none; padding: 0px 7px; border-radius: 6px; color: #fff; font-size: 15px; background-color: transparent; box-shadow: 3px 3px 10px rgba(0, 0, 0, 1), -1px -1px 6px rgba(255, 255, 255, 0.4);">
        <label class="label" style="font-size: 15px; padding-left: 10px; position: absolute; top: 13px; transition: 0.3s; pointer-events: none;">Departamento</label>
      </div>
      <div class="container" style="display: flex; flex-direction: column; gap: 7px; position: relative; color: white; width: 100%;">
        <input formControlName="EmailUs" type="text" class="inputneg" style="width: 97%; height: 45px; margin-bottom: 15px; border: none; outline: none; padding: 0px 7px; border-radius: 6px; color: #fff; font-size: 15px; background-color: transparent; box-shadow: 3px 3px 10px rgba(0, 0, 0, 1), -1px -1px 6px rgba(255, 255, 255, 0.4);">
        <label class="label" style="font-size: 15px; padding-left: 10px; position: absolute; top: 13px; transition: 0.3s; pointer-events: none;">Email Magna</label>
      </div>

      <button type="submit" class="submit custom-button" style="color:white; background-color: #5c5c5c;">Guardar</button>
      <button type="button" class="Cancelar custom-button" (click)="onCancel()" style="color:white; background-color: #5c5c5c;">Cancelar</button>
    </form>
  `,
  styles: [
    `.mat-dialog-container {
      font-family: century-gothic, sans-serif;
      color: black;
      height: 40%;
      width: 40%;
      overflow: auto;
    }
    .cdk-global-overlay-wrapper {
      z-index: 1000;
    }
    .cdk-overlay-backdrop {
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(10px);
    }
    @keyframes pulse {
      from {
        transform: scale(0.9);
        opacity: 1;
      }
      to {
        transform: scale(1.8);
        opacity: 0;
      }
    }
    .inputneg:focus {
      border: 2px solid transparent;
      color: #fff;
      box-shadow: 3px 3px 10px rgba(0, 0, 0, 1), -1px -1px 6px rgba(255, 255, 255, 0.4), inset 3px 3px 10px rgba(0, 0, 0, 1), inset -1px -1px 6px rgba(255, 255, 255, 0.4);
    }
    .container .inputneg:valid ~ .label,
    .container .inputneg:focus ~ .label {
      transition: 0.3s;
      padding-left: 2px;
      transform: translateY(-35px);
    }
    .container .inputneg:valid,
    .container .inputneg:focus {
      box-shadow: 3px 3px 10px rgba(0, 0, 0, 1), -1px -1px 6px rgba(255, 255, 255, 0.4), inset 3px 3px 10px rgba(0, 0, 0, 1), inset -1px -1px 6px rgba(255, 255, 255, 0.4);
    }
    .custom-button {
      margin-top: 20px;
      margin: 2px;
      position: relative;
      padding: 10px 20px;
      border-radius: 50px;
      border: 1px solid rgba(255, 255, 255, 0);
      width: 100%;
      height: 48px;
      font-size: 14px;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 2px;
      background: transparent;
      color: black;
      overflow: hidden;
      box-shadow: 0 0 0 0 transparent;
      transition: all 0.2s ease-in;
      background: #202020;
    }

    .custom-button:hover {
      background: #8c3d3d;
      box-shadow: 0 0 30px 5px #944848;
      transition: all 0.2s ease-out;
      color: white;
    }

    .custom-button:hover::before {
      animation: sh02 0.5s 0s linear;
    }

    .custom-button::before {
      content: '';
      display: block;
      width: 0px;
      height: 86%;
      position: absolute;
      top: 7%;
      left: 0%;
      opacity: 0;
      background: #5f5f5f;
      box-shadow: 0 0 50px 30px #5f5f5f;
      transform: skewX(-20deg);
    }

    .custom-button:active {
      box-shadow: 0 0 0 0 transparent;
      transition: box-shadow 0.2s ease-in;
    }

    @keyframes sh02 {
      from {
        opacity: 0;
        left: 0%;
      }

      50% {
        opacity: 1;
      }

      to {
        opacity: 0;
        left: 100%;
      }
    }`
  ]
})

export class EditLiderDialog {
  editForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditLiderDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log("Datos recibidos en EditLiderDialog:", data); // Verifica que `IdUs` esté presente

    this.editForm = this.fb.group({
      IdUs: [data.IdUs || ''],
      ntrabajadorUs: [data.ntrabajadorUs || ''],
      NombreUs: [data.NombreUs || ''],
      PuestoUs: [data.PuestoUs || ''],
      DepartamentoUs: [data.DepartamentoUs || ''],
      EmailUs: [data.EmailUs || '']
    });


  }

  onSubmit(): void {
    if (this.editForm.valid) {
      this.dialogRef.close(this.editForm.value); // Incluye todos los datos, incluyendo IdUs
    }
  }


  onCancel(): void {
    this.dialogRef.close();
  }

  toUpperCase(event: any): void {
    event.target.value = event.target.value.toUpperCase();
  }

  allowOnlyNumbers(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode >= 48 && charCode <= 57 || charCode === 8 || charCode === 9) {
      return true;
    }
    event.preventDefault();
    return false;
  }
}
