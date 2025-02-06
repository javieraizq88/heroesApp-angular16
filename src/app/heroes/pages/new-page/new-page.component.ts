import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, switchMap, tap } from 'rxjs';

import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { Publisher, Hero } from '../../interfaces/hero.interface';
import { HeroesService } from '../../services/heroes.service';

import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-new-page',
  templateUrl: './new-page.component.html',
  styles: [
  ]
})
export class NewPageComponent implements OnInit {
// formulario reactivo con validariones de cada dato
  public heroForm = new FormGroup({
    id:        new FormControl<string>(''),
    superhero: new FormControl<string>('', { nonNullable: true }), // superhero. siempre va a ser un string
    publisher: new FormControl<Publisher>( Publisher.DCComics ),
    alter_ego: new FormControl(''),
    first_appearance: new FormControl(''),
    characters: new FormControl(''),
    alt_img:    new FormControl(''),
  });

  public publishers = [
    { id: 'DC Comics', desc: 'DC - Comics' },
    { id: 'Marvel Comics', desc: 'Marvel - Comics' },
  ];

  constructor(
    private heroesService: HeroesService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  get currentHero(): Hero {
    const hero = this.heroForm.value as Hero;
    return hero;
  }

  ngOnInit(): void {
    if ( !this.router.url.includes('edit') ) return; // si no tiene editar, o sea es un heroe nuevo, crae el registro en la bbdd

    this.activatedRoute.params
      .pipe(
        switchMap( ({ id }) => this.heroesService.getHeroById( id ) ),
      ).subscribe( hero => {
        if ( !hero ) {
          return this.router.navigateByUrl('/');
        }
        this.heroForm.reset( hero );
        return;
      });
  }

  onSubmit():void {
    if ( this.heroForm.invalid ) return;
    
    // si tiene id, actualiza el heroe que ya esta creado
    if ( this.currentHero.id ) {
      this.heroesService.updateHero( this.currentHero )
      .subscribe( hero => {
        this.showSnackbar(`${ hero.superhero } actualizado!`);
      });
      return;
    }
    
    // si no tiene id, crea un heroe nuevo
    this.heroesService.addHero( this.currentHero )
      .subscribe( hero => {
        // TODO: mostrar snackbar, y navegar a /heroes/edit/ hero.id
        this.router.navigate(['/heroes/edit', hero.id ]);
        this.showSnackbar(`${ hero.superhero } creado!`);
      });
  }

  onDeleteHero() {
    if ( !this.currentHero.id ) throw Error('Hero id is required');
    const dialogRef = this.dialog.open( ConfirmDialogComponent, {
      data: this.heroForm.value
    });

    dialogRef.afterClosed()
      .pipe(
        filter( (result: boolean) => result ), // filtro 1 si el heroe existe
        switchMap( () => this.heroesService.deleteHeroById( this.currentHero.id )), // si es true se manda la eliminacion segun id
        filter( (wasDeleted: boolean) => wasDeleted ), // si se elimina se da el wasDeleted
      )
      .subscribe(() => {
        this.router.navigate(['/heroes']); // si se elimina, redirecciona al home
      });
  }

  showSnackbar( message: string ):void {
    this.snackbar.open( message, 'cerrar', {
      duration: 2500,
    })
  }

}