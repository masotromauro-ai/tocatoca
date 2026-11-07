# La base de BandoMaps

Firebase **`tocatoca-621a5`** (Firestore + Authentication por mail y contraseña),
creada por Mauro el 7-nov-2026. Plan **Spark** (gratis): nada de lo de acá puede
pedir facturación. Las reglas están en `firestore.rules` (v1, plantilla con el
UID del agente como marcador) y se prueban con `pruebas/reglas.mjs` en el emulador.

## Qué guarda

| Colección | Qué es | Quién escribe |
|---|---|---|
| `usuarios/{uid}` | la ficha: `nombre`, `mail`, `rol` (admin · docente · alumno), `activo`, `usuario` (el de la planilla vieja), `prefs` | el admin; cada uno sólo su `nombre` y sus `prefs`. **Nadie se cambia su propio rol** |
| `invitaciones/{mail}` | el alta: `rol` | admin (cualquier rol) · docente (sólo alumnos) · agente (migración) |
| `config/{doc}` | parámetros del sitio (`config/sitio`: registro, aviso inicial, `esquema`) | admin |
| `clases/{id}` | una clase: `docente`, `alumnos` (uids), ejercicios | el docente que la creó |
| `progreso/{uid}` | lo de cada alumno: acordes, tareas hechas, resultados | el alumno |
| `historico/{usuario}` | lo que trae la migración de la planilla vieja, por usuario viejo | agente · admin |
| `ingresos/{id}` | cada ingreso o práctica (`uid`, `tipo`, `en`, `app`) — reemplaza la hoja «Ingresos» | el alumno, sólo los suyos, sin campos de más |
| `reportes/`, `avisos/`, `_historial/` | lo común del ecosistema: fallas y pedidos, el buzón de la Pizarra, la copia antes de cada cambio del agente | — |

**Nadie es administrador por su UID.** Lo es quien tiene ficha activa con rol
`admin`. La primera vez, el agente deja las invitaciones de administrador (Mauro y
Mariano, 7-nov-2026) y cada uno crea su ficha al entrar con su mail
**verificado**: sin esa condición, cualquiera que se registrara primero con un
mail ajeno se quedaba con su invitación. Los roles se leen de `usuarios/` y no de
*custom claims*: los claims sólo se ponen desde un servidor (Cloud Functions),
que pide el plan pago.

## Un sitio estable y uno de desarrollo, con UNA sola base

Mauro, 7-nov-2026: este repositorio es donde Claude desarrolla a partir de lo que
pide Mariano; cuando algo está estable pasa al sitio que usan los alumnos. Para
el alumno tiene que haber **una sola base** donde se acumulan siempre su registro
y su avance, sin migrar cada vez que cambia la app.

**Se puede, y es más seguro que tener dos bases**, siempre que se cumplan cinco
condiciones. Lo que se arriesga es concreto: una versión en desarrollo con un
error podría escribir mal datos reales. Lo que lo contiene:

1. **Las reglas mandan, no la pantalla.** Las dos apps pasan por las mismas
   reglas, que validan la forma de lo que se escribe (`hasOnly`, el `uid` de
   quien escribe, los roles válidos). Un error del sitio de desarrollo no puede
   escribir algo que el estable no podría escribir.
2. **Los cambios de datos sólo SUMAN** (*expandir, después contraer*): un campo
   nuevo se agrega y las dos versiones lo toleran; nunca se renombra ni se borra
   un campo mientras la versión estable lo use. Se saca recién cuando el
   estable ya no lo lee. Así no hay migraciones obligatorias.
3. **`config/sitio.esquema`** dice qué versión de los datos hay. Una app que
   encuentra un esquema más nuevo del que entiende **sólo lee**: no escribe.
4. **En desarrollo se prueba con cuentas de prueba** (`probador: true` en la
   ficha, la pone el admin) y clases de prueba. Los alumnos reales usan sólo el
   sitio estable. Un docente que prueba en desarrollo lo hace sobre una clase
   marcada de prueba.
5. **Las reglas son una sola para las dos apps**: un cambio de reglas se piensa
   para las dos versiones a la vez, se prueba en el emulador
   (`pruebas/reglas.mjs`) y lo publica Mauro.

**Y la red de seguridad**: copia diaria de toda la base en la bodega privada (la
ronda), y copia en `_historial/` antes de cada cambio del agente. Spark no tiene
restauración a un punto en el tiempo (PITR): la copia diaria es la que hay.

Lo que NO conviene: dos bases (una de prueba y una real) obligan a copiar datos
cada vez que algo pasa a estable, que es justo lo que se quiere evitar.

## El registro

`/registro.html` (7-nov-2026): la persona crea su cuenta con su mail y una
contraseña que elige ella, confirma el mail con el enlace que manda Firebase, y
al volver se crea su ficha con el rol de su invitación. Sin invitación, la cuenta
queda creada pero sin ficha (y sin acceso a nada).

## La migración, en partes

1. **Reglas v1 publicadas** y la base en el respaldo diario.
2. **Las personas**: la planilla de Mariano (hoja Alumnos) pasa a
   `invitaciones/` con su `usuario` viejo; cada alumno, al entrar la primera vez
   con su mail, crea su ficha y queda enlazado a su historia.
3. **La historia**: la hoja Ingresos pasa a `historico/{usuario}`; las clases y
   asignaciones de `clases.json`, a `clases/`.
4. **El avance de cada alumno vive hoy en SU teléfono** (`localStorage`: acordes,
   tareas hechas, ajustes), no en la planilla. Por eso la app, la primera vez
   que el alumno entra con su cuenta, ofrece **«Traer lo de este teléfono»** y
   lo sube a `progreso/{uid}`. Sin ese paso, el avance se perdería al cambiar de
   teléfono o de navegador.
5. **La app**: una sola versión con login; el rol decide qué se ve (Usuarios
   para el admin, Organizador para el docente, Mis tareas para el alumno).
   Recién entonces se retiran la planilla, `clases.json`, `config.json` y
   `usuarios.json`.

## Cupo

Con decenas de alumnos: unos cientos de lecturas y escrituras por día, contra
50.000 lecturas y 20.000 escrituras gratis. Cada regla que mira la ficha
(`get`) cuenta una lectura más por pedido; con este tamaño no se nota.
