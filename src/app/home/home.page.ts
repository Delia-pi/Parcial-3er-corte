import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonBadge,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonModal,
  IonInput,
  IonSpinner
} from '@ionic/angular/standalone';

import { AlertController, ToastController } from '@ionic/angular';

import { Usuario } from '../modelos/usuario.model';
import { UsuariosService } from '../servicios/usuarios.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonAvatar,
    IonBadge,
    IonButton,
    IonSelect,
    IonSelectOption,
    IonModal,
    IonInput,
    IonSpinner
  ]
})
export class HomePage implements OnInit {

  usuarios: Usuario[] = [];

  ciudadSeleccionada: string = '';
  companiaSeleccionada: string = '';

  usuarioSeleccionado: Usuario | null = null;

  modalAbierto: boolean = false;

  fechaReserva: string = '';
  horaReserva: string = '';

  cargando: boolean = false;
  mensajeError: string = '';

  constructor(
    private servicioUsuarios: UsuariosService,
    private alerta: AlertController,
    private toast: ToastController
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  // Consultar la API
  cargarUsuarios(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.servicioUsuarios.obtenerUsuarios().subscribe({
      next: (datos: Usuario[]) => {
        this.usuarios = datos;
        this.cargando = false;
      },
      error: () => {
        this.mensajeError = 'No se pudieron cargar los usuarios.';
        this.cargando = false;
      }
    });
  }

  get ciudades(): string[] {
    return [...new Set(
      this.usuarios.map(usuario => usuario.address.city)
    )].sort((a, b) => a.localeCompare(b));
  }

  get companias(): string[] {
    return [...new Set(
      this.usuarios.map(usuario => usuario.company.name)
    )].sort((a, b) => a.localeCompare(b));
  }

  // Adaptar el apellido usando la última palabra de name
  obtenerApellido(nombre: string): string {
    const partes = nombre.trim().split(/\s+/);
    return partes[partes.length - 1];
  }

  // Filtrar por ciudad y compañía y ordenar
  get usuariosFiltrados(): Usuario[] {
    return this.usuarios
      .filter(usuario =>
        (!this.ciudadSeleccionada ||
          usuario.address.city === this.ciudadSeleccionada) &&
        (!this.companiaSeleccionada ||
          usuario.company.name === this.companiaSeleccionada)
      )
      .sort((a, b) =>
        this.obtenerApellido(a.name).localeCompare(
          this.obtenerApellido(b.name)
        )
      );
  }

  // Seleccionar un usuario y abrir el modal
  abrirModal(usuario: Usuario): void {
    this.usuarioSeleccionado = usuario;
    this.fechaReserva = '';
    this.horaReserva = '';
    this.modalAbierto = true;
  }

  // Cerrar el modal
  cerrarModal(): void {
    this.modalAbierto = false;
  }

  // Validar fecha y hora antes de confirmar
  async confirmarReserva(): Promise<void> {
    if (!this.fechaReserva || !this.horaReserva) {
      const aviso = await this.alerta.create({
        header: 'Datos incompletos',
        message: 'Selecciona la fecha y la hora de la cita.',
        buttons: ['Aceptar']
      });

      await aviso.present();
      return;
    }

    const confirmacion = await this.alerta.create({
      header: 'Confirmar reserva',
      message:
        `¿Deseas reservar una cita con ${this.usuarioSeleccionado?.name} ` +
        `el ${this.fechaReserva} a las ${this.horaReserva}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.mostrarToast();
          }
        }
      ]
    });

    await confirmacion.present();
  }

  // Mostrar el Toast durante 2500 milisegundos
  async mostrarToast(): Promise<void> {
    const aviso = await this.toast.create({
      message: 'Reserva confirmada correctamente',
      duration: 2500,
      position: 'bottom'
    });

    await aviso.present();
    this.cerrarModal();
  }

  // Limpiar los filtros
  limpiarFiltros(): void {
    this.ciudadSeleccionada = '';
    this.companiaSeleccionada = '';
  }
}
