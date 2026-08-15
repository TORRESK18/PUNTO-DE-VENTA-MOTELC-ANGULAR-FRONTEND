import { Component, AfterViewInit, HostListener, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-motelcristal',
  standalone: true,
  templateUrl: './motelcristal.component.html',
  styleUrl: './motelcristal.component.css'
})
export class MOTELCRISTALComponent implements AfterViewInit {
  constructor(
    private elRef: ElementRef,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }


  heroBottom = 0;
  currentSlides: { [key: string]: number } = {};
  goToLogin() {
    this.handleNavClick(); // esto cierra el menú si está abierto
    this.router.navigate(['/LOGIN']);
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.route.fragment.subscribe(fragment => {
        if (fragment) {
          const element = this.elRef.nativeElement.querySelector(`#${fragment}`);
          if (element) {
            setTimeout(() => {
              element.scrollIntoView({ behavior: 'smooth' });
            }, 100); // delay para asegurarse que el DOM está cargado
          }
        }
      });
    }
  }


  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const heroSection = this.elRef.nativeElement.querySelector('#inicio');
      if (heroSection) {
        this.heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
      }
      this.onWindowScroll();

      // Lanzamos carruseles individuales
      this.initSlider('slider-1');
      this.initSlider('slider-2');
    }
  }


  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!isPlatformBrowser(this.platformId)) return;

    const navbar = this.elRef.nativeElement.querySelector('.navbar');
    const hamburguesa = this.elRef.nativeElement.querySelector('#hamburguesa-container');

    if (!navbar || !hamburguesa) return;

    if (window.scrollY > this.heroBottom - 80) {
      navbar.classList.add('navbar-hidden');
      hamburguesa.classList.remove('hamburguesa-hidden');
    } else {
      navbar.classList.remove('navbar-hidden');
      hamburguesa.classList.add('hamburguesa-hidden');
    }
  }

  isMenuOpen = false;

  toggleMenu(targetId?: string) {
    if (!isPlatformBrowser(this.platformId)) return;

    this.isMenuOpen = !this.isMenuOpen;

    const sideMenu = this.elRef.nativeElement.querySelector('#side-menu');
    const overlay = this.elRef.nativeElement.querySelector('#menu-overlay');
    const burgerInput = this.elRef.nativeElement.querySelector('#burger');

    if (this.isMenuOpen) {
      sideMenu.classList.add('active');
      overlay.classList.add('active');
    } else {
      sideMenu.classList.remove('active');
      overlay.classList.remove('active');

      if (burgerInput) burgerInput.checked = false;

      // Navegación suave si hay objetivo
      if (targetId) {
        const element = this.elRef.nativeElement.querySelector(`#${targetId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }

  scrollTo(targetId: string, event?: Event) {
    // Previene el comportamiento por defecto del navegador
    if (event) event.preventDefault();

    // Verifica que estamos en el navegador (no SSR)
    if (!isPlatformBrowser(this.platformId)) return;

    const element = this.elRef.nativeElement.querySelector(`#${targetId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }



  handleNavClick() {
    // Espera a que se haga el scroll (ancla), luego cierra el menú
    setTimeout(() => {
      this.isMenuOpen = false;

      const sideMenu = this.elRef.nativeElement.querySelector('#side-menu');
      const overlay = this.elRef.nativeElement.querySelector('#menu-overlay');
      const burgerInput = this.elRef.nativeElement.querySelector('#burger');

      sideMenu?.classList.remove('active');
      overlay?.classList.remove('active');
      if (burgerInput) burgerInput.checked = false;
    }, 300); // Esperamos 300ms para que termine el scroll suave
  }



  initSlider(sliderId: string) {
    const slider = this.elRef.nativeElement.querySelector(`#${sliderId}`);
    if (!slider) return;

    const slides = slider.querySelectorAll('.slide');
    if (slides.length === 0) return;

    // Inicializamos estado
    this.currentSlides[sliderId] = 0;

    setInterval(() => this.advanceSlider(sliderId), 8000);
  }

  advanceSlider(sliderId: string) {
    const slider = this.elRef.nativeElement.querySelector(`#${sliderId}`);
    if (!slider) return;

    const slides = slider.querySelectorAll('.slide');
    if (slides.length === 0) return;

    const currentIndex = this.currentSlides[sliderId] ?? 0;
    slides[currentIndex]?.classList.remove('active');

    const nextIndex = (currentIndex + 1) % slides.length;
    slides[nextIndex]?.classList.add('active');

    this.currentSlides[sliderId] = nextIndex;
  }

  goToPrevious(sliderId: string) {
    const slider = this.elRef.nativeElement.querySelector(`#${sliderId}`);
    if (!slider) return;

    const slides = slider.querySelectorAll('.slide');
    if (slides.length === 0) return;

    const currentIndex = this.currentSlides[sliderId] ?? 0;
    slides[currentIndex]?.classList.remove('active');

    const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
    slides[prevIndex]?.classList.add('active');

    this.currentSlides[sliderId] = prevIndex;
  }


}
