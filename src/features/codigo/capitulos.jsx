// @datos
// El texto del manual de El Código, por capítulos.

import { CROM_DOBLE } from "../../shared/teoria/color-hsl.js";
import { CapFig, CapH3, CapImgPend, CapNota, CapP, ConceptoPar, MixFigure, PasoCard, RuedaCromatica, TarjetasMuestra, TiraColores, TiraCromatica } from "../../shared/ui/codigo/figuras.jsx";
import { PIEDRAS } from "../../shared/ui/codigo/paleta.jsx";
import { nc } from "../../shared/teoria/color.js";
import { playTone } from "../../shared/audio/audio.js";

// ─── Estructura del libro: partes y capítulos ────────────────────────────────
export const CAPITULOS = [
{ parte:"Parte I — Fundamentos", id:"cap0", titulo:"Cap. 0 — El código de color", body: (
  <>
    <div className="rounded-xl p-4 mb-4 border" style={{background:"#0a0a0a",borderColor:"#333333"}}>
      <p className="text-[10px] uppercase tracking-widest mb-2" style={{color:"#8a8a8a"}}>Antes de empezar</p>
      <p className="text-sm text-gray-300 leading-relaxed">Antes de que este sistema te ahorre un solo segundo de cálculo, te va a pedir algo: que te aprendas doce colores de memoria, con la misma seriedad con la que en algún momento te aprendiste el nombre de las doce notas. Esto no es gratis, y vale la pena decirlo así, sin vueltas, en la primera página: hay una inversión inicial antes de que aparezca la ganancia. Cualquier método serio la tiene —el solfeo, la digitación, las escalas— y este no es la excepción.</p>
    </div>
    <CapP>Lo que sí cambia es qué estás memorizando. No estás memorizando teoría todavía. Estás memorizando una paleta: doce parches de color, cada uno con un nombre de nota al lado. Nada más. La teoría llega después, capítulo a capítulo, apoyada en esa memorización — pero si llegás al capítulo de acordes sin tener el color automatizado, vas a estar leyendo colores en vez de reconociéndolos, y ahí el sistema entero pierde su función.</CapP>

    <CapH3>El orden en que conviene aprenderlo</CapH3>
    <CapP>Este libro presenta la paleta en tres pasos, cada uno con un propósito distinto.</CapP>
    <PasoCard n="1" titulo="Primero, una tira">Las doce notas en fila, igual que las teclas de un piano o de un bandoneón desplegadas en línea recta. Es la forma más directa de un primer contacto — no hay ángulos que leer, no hay geometría que entender todavía. Solo doce colores, uno al lado del otro, cada uno con su nombre.</PasoCard>
    <PasoCard n="2" titulo="Después, la rueda">Las mismas doce notas, ahora en círculo. Acá aparece algo que la tira no podía mostrar: que las notas no son una lista que termina, sino un ciclo que vuelve sobre sí mismo — la relación circular entre semitonos que vas a necesitar más adelante para entender intervalos, el círculo de quintas, y la geometría de los acordes del capítulo 8.</PasoCard>
    <PasoCard n="3" titulo="Por último, tarjetas de estudio">Una nota por vez, con su color y su enarmónico (por ejemplo, Do sostenido y Re bemol comparten color). Este es el paso de memorización activa propiamente dicho: repetición, no explicación. Es donde el código deja de ser información y empieza a ser reflejo. (Podés practicar esto en la pestaña <b>Colores</b> de la app: tocá cada tarjeta para escuchar la nota mientras fijás el color.)</PasoCard>

    <CapH3>Un aviso sobre lo que este código puede generar</CapH3>
    <CapNota>Una vez que la asociación color-nota está bien afianzada, puede pasar algo que vale la pena anticipar: empezar a "ver" notas en colores que no tienen nada que ver con este sistema — una partitura sin colorear, un semáforo, cualquier superficie con estos doce tonos. No es un efecto grave ni motivo de preocupación, pero sí una fricción real que otros métodos de asociación fuerte también generan. Este libro no lo esconde: es el precio de automatizar bien una asociación. Y como con cualquier escalera, el objetivo final es soltarla — llegar a un punto donde el color ya no hace falta, porque la nota se reconoce sola.</CapNota>
  </>
)},
{ parte:"Parte I — Fundamentos", id:"cap1", titulo:"Cap. 1 — Introducción", body: (
  <>
    <CapP>Pensá en un cifrado de jazz cualquiera. Un La13.</CapP>
    <CapP>Para leerlo, no alcanza con saber que es un acorde de La. Hay que reconstruir la escala de La, contar seis grados hacia arriba, recordar que la "trecena" es en realidad la sexta trasladada una octava, y llegar —recién ahí— al Fa sostenido. Todo eso, en el tiempo que dura un compás, muchas veces varios acordes seguidos, en tiempo real, mientras seguís tocando.</CapP>
    <CapP>Ese cálculo mental es exactamente el problema que este libro intenta resolver. No reemplazando la teoría —hace falta saber que el La13 lleva el Fa sostenido, eso no cambia—, sino agregándole una capa de reconocimiento instantáneo por encima del cálculo: si cada una de las doce notas tiene un color fijo y propio, ver el Fa sostenido en una partitura, en un cifrado o en un diagrama de acorde deja de ser una operación aritmética y pasa a ser una percepción directa. Un color no se calcula. Se reconoce.</CapP>
    <CapH3>Para qué sirve esto, en la práctica</CapH3>
    <CapP>Antes de entrar en el sistema, conviene decir con toda claridad qué es este libro y qué no es. No es un tratado de teoría del color con la música como excusa, ni una manera nueva de aprender armonía. Es un manual de estudio, pensado para alguien que va a pasar meses —tal vez un año— practicando un instrumento, y que en ese tiempo se va a topar una y otra vez con cifrados y partituras que hay que leer más rápido de lo que se los puede calcular. El color no cambia qué es un La13. Cambia cuánto tarda el ojo en encontrarlo.</CapP>
    <CapP>Con el tiempo —y esto no hace falta forzarlo, aparece solo con la práctica— el color también empieza a mostrar patrones: por qué ciertos acordes "se sienten" parecidos, por qué una progresión suena como suena. El capítulo 8 lleva esto un paso más allá y muestra que cada tipo de acorde traza una figura geométrica fija sobre la rueda de colores. Para algunos cerebros —los que procesan mejor una forma espacial que una fórmula— eso suma una capa más de reconocimiento. No es necesario para el uso básico del sistema, pero está ahí para quien lo aproveche.</CapP>
    <CapP>Y hay una última capa, todavía más opcional: el capítulo de piedras preciosas y energía (Parte IV) conecta este sistema con la litoterapia y la sanación por sonido. Eso es tradición, no método de estudio —lo va a disfrutar quien ya tenga un interés personal en esos temas, desde la salud o la espiritualidad, y quien no, puede saltearlo sin perderse nada del sistema central.</CapP>
    <CapH3>Qué vas a encontrar en este libro</CapH3>
    <CapP>El corazón del libro es un mapeo completo y sistemático: las doce notas de la escala cromática, cada una con un color propio, consistente, y derivado por una lógica explícita de mezcla —no elegido al azar ni por estética. De ahí en más, el libro recorre cómo ese sistema se comporta con acordes, tonalidades, el círculo de quintas, y termina en aplicaciones prácticas: lectura rápida de partituras, reconocimiento de acordes, y sí — entender de un vistazo qué nota es la trecena de cualquier cifrado que tengas enfrente.</CapP>
    <CapP>Los cinco primeros colores de ese mapeo —los que sostienen la pentatónica original— tienen además una historia de origen, ligada al shakuhachi, la flauta de bambú japonesa. Vale la pena decirlo desde acá: esa historia es un adorno, no el argumento. Ayuda a memorizar los primeros cinco colores con una imagen en vez de una tabla, y tiene su propio encanto —pero el sistema no depende de ella. Si mañana se olvida la leyenda, la rueda de colores y su lógica de mezcla siguen intactas.</CapP>
    <CapH3>A quién está dirigido</CapH3>
    <CapP>A cualquiera que quiera leer música más rápido de lo que puede calcularla. No hace falta formación previa en teoría —el libro construye los conceptos desde la base—, pero va a resultar especialmente útil para quien ya toca y se topa, una y otra vez, con el mismo problema del La13: saber la teoría, y aun así tardar un segundo de más en encontrar la nota.</CapP>
    <CapP>El núcleo teórico-cromático del sistema es universal — vale para cualquier instrumento. Pero la aplicación práctica (cómo se traduce un color en un movimiento de mano) sí depende del instrumento, así que este libro desarrolla en profundidad el bandoneón y el piano — los dos instrumentos donde el autor puede dar ejemplos de primera mano — y deja abierta, como expansión futura, la traducción a otros instrumentos (guitarra, cuerdas, vientos).</CapP>
  </>
)},
{ parte:"Parte I — Fundamentos", id:"cap2", titulo:"Cap. 2 — Música y color, en paralelo", body: (
  <>
    <CapP>Antes de entrar en el sistema propiamente dicho, conviene alinear dos vocabularios: el de la música y el del color. No porque sean el mismo lenguaje —no lo son—, sino porque este libro va a moverse todo el tiempo entre los dos, y ayuda tener claro qué concepto de un lado corresponde, aproximadamente, a qué concepto del otro.</CapP>
    <div className="grid sm:grid-cols-2 gap-3 my-3">
      <ConceptoPar a="Semitono" b="Matiz" descA="El semitono es la unidad mínima de la música occidental temperada: la distancia más pequeña entre dos notas. El matiz (hue) es la unidad mínima de identidad de un color. En este sistema, cada uno de los doce semitonos de la octava recibe un matiz propio y fijo."/>
      <ConceptoPar a="Escala" b="Gama" descA="Una escala es un subconjunto ordenado de notas dentro de la octava. Una gama, en color, es un subconjunto de matices seleccionados de la rueda completa. La pentatónica como los 'cinco colores ancla' es exactamente este paralelo."/>
      <ConceptoPar a="Timbre" b="Saturación y valor" descA="El timbre distingue un La tocado en violín de un La tocado en trompeta, aunque sea la misma nota. La saturación y el valor cumplen un rol parecido en color. Este libro trabaja principalmente con matiz, pero saturación y valor aparecen más adelante al hablar de acordes mayores y menores."/>
      <ConceptoPar a="Octava" b="Vuelta de la rueda" descA="Después de doce semitonos, la música 'vuelve' a la misma nota, una octava más arriba. Después de recorrer los doce matices de la rueda cromática, el color también completa una vuelta — la misma forma para los dos lenguajes."/>
    </div>
    <CapP>Con este vocabulario compartido, ya se puede avanzar al terreno donde otros lo intentaron antes.</CapP>
  </>
)},
{ parte:"Parte I — Fundamentos", id:"cap3", titulo:"Cap. 3 — Antecedentes históricos", body: (
  <>
    <CapP>Cruzar sonido y color no es una idea nueva. Antes de este sistema, hubo al menos cuatro intentos serios —y ninguno se puso de acuerdo con los demás—, lo cual, paradójicamente, es el mejor argumento a favor de construir un sistema propio y explícito en vez de buscar "la" respuesta correcta.</CapP>
    <CapP><b className="text-gray-200">Isaac Newton (1704).</b> En su tratado <i>Opticks</i>, Newton dividió el espectro de luz en siete colores —ni seis ni ocho— porque buscaba una analogía directa con las siete notas de la escala diatónica. Empezó su círculo en Re, en modo dorio, porque es la única escala de teclas blancas simétrica. Fue el primer cruce "científico" entre los dos mundos, aunque hoy se entiende como una analogía forzada entre dos fenómenos físicos sin relación real.</CapP>
    <CapP><b className="text-gray-200">Alexander Scriabin (1910).</b> El compositor ruso construyó, para su obra <i>Prometeo: El poema del fuego</i>, un sistema donde cada tonalidad tenía un color asignado, pensado para proyectarse en un teclado de luces (el <i>clavier à lumières</i>) durante la ejecución. Ordenó las doce tonalidades según el círculo de quintas y les asignó colores siguiendo el orden del espectro visible —lo cual quiere decir que, dibujado en círculo de quintas, su sistema es un arcoíris perfecto, y dibujado en orden cromático, es un desorden completo. Es la elección inversa a la de este libro, que privilegia el orden cromático por sobre el de quintas.</CapP>
    <CapP><b className="text-gray-200">Nikolai Rimsky-Korsakov (siglo XIX).</b> A diferencia de Newton y Scriabin, Rimsky-Korsakov no diseñó un sistema: describía una sinestesia que decía percibir espontáneamente. Por eso sus colores no siguen ninguna lógica geométrica, y por eso chocó públicamente con Scriabin —para uno, Do mayor era blanco; para el otro, rojo—. Ninguno de los dos estaba "equivocado": estaban describiendo experiencias distintas, no midiendo el mismo fenómeno.</CapP>
    <CapP><b className="text-gray-200">Gong-Shang-Jue-Zhi-Yu (China, antigüedad).</b> El precedente más antiguo y, para este libro, el más significativo: un sistema pentatónico —Gong, Shang, Jue, Zhi, Yu, equivalentes a Do-Re-Mi-Sol-La— vinculado desde hace milenios a los cinco elementos (Wu Xing) y sus colores tradicionales: tierra-amarillo, metal-blanco, madera-verde, fuego-rojo, agua-negro/azul. No coincide con los colores de este libro, pero es la prueba de que la idea central —pentatónica más color más naturaleza— tiene una tradición real y antigua, no inventada para la ocasión.</CapP>
    <CapImgPend texto="comparativa de los cuatro sistemas históricos (Newton, Scriabin, Rimsky-Korsakov, Gong-Shang-Jue-Zhi-Yu) uno al lado del otro."/>
    <CapP>Ningún sistema histórico coincide con otro. Eso no es una falla del proyecto: es la evidencia de que este cruce siempre fue, y siempre va a ser, una construcción simbólica —nunca un hecho descubierto. Este libro no pretende ser la excepción. Pretende, en cambio, ser el más explícito y mejor justificado de todos.</CapP>
  </>
)},
{ parte:"Parte I — Fundamentos", id:"cap4", titulo:"Cap. 4 — La historia del shakuhachi", body: (
  <>
    <CapP>Antes de entrar en la historia, una aclaración de peso: lo que sigue es el origen romanceado de los primeros cinco colores, no el argumento que sostiene el sistema. El argumento está en el capítulo 5, donde esos cinco colores se combinan por mezcla y generan matemáticamente el resto de la rueda. Esta historia es, en cambio, la forma más simple de memorizar el punto de partida — una imagen en vez de una tabla — y funciona bien precisamente porque no pretende ser más que eso.</CapP>
    <CapP>Antes de cualquier historia, hay una certeza que no necesita relato para sostenerse: en español, la nota Sol comparte nombre con el astro Sol — y el sol, a simple vista, es amarillo. No hace falta ninguna leyenda para afirmar que Sol es amarillo: es la correspondencia más firme de todo el sistema, la verdad de la que se parte, no una hipótesis más entre varias. Todo lo demás se construye a partir de ahí, y vuelve ahí cada vez que hace falta un punto fijo.</CapP>
    <CapP>Lo que sigue en este capítulo tiene un estatus distinto, y conviene decirlo con esa claridad: es una historia transmitida de viva voz, sin registro documentado, contada por un amigo —luthier e intérprete de shakuhachi, la flauta de bambú japonesa, que construyó instrumentos con cañas traídas de Tailandia—. No es el origen de todo el sistema. Es un relato romántico, probablemente modificado con los años como toda historia oral, que se incluye acá no como fundamento sino como acompañamiento — en gran parte porque tiene una coincidencia genuina que vale la pena señalar: en la propia historia, cuando aparece la nota asociada a la vida, aparece también el rojo — la sangre, el corazón. Esa coincidencia no prueba nada, pero suma, y por eso tiene un lugar en el libro.</CapP>
    <CapImgPend texto="ilustración atmosférica de la leyenda (montaña, sol, cielo, pasto, ganado a la distancia) — a generar en Midjourney."/>
    <CapP>Con esa jerarquía clara —Sol-amarillo como certeza, el resto como historia oral que acompaña—, así es como se cuenta:</CapP>
    <CapP>Antes de que existiera una escala como tal, alguien mira hacia arriba y ve el sol —claro, luminoso—. De ahí nace la primera referencia: Sol es amarillo.</CapP>
    <CapP>Después el cielo: Do es azul. Después lo que crece bajo los pies, el pasto de la montaña: Re es verde. Después la tierra y la piedra de la montaña misma: Mi es marrón. Y por último, lejos, el color de la vida —el ganado, la gente a la distancia—: La es rojo.</CapP>
    <CapFig caption="La pentatónica original: Do, Re, Mi, Sol, La. Azul, verde, marrón, amarillo, rojo.">
      <TiraCromatica highlight={["C","D","E","G","A"]}/>
    </CapFig>
    <CapP>Con el tiempo, cuando la música se volvió más compleja y se agregaron las notas "de en medio" —Fa y Si—, esas dos no heredaron un color de la leyenda. Y no hace falta que lo tengan: la pentatónica es, en gran parte del mundo, la capa más antigua de la música —China, África, los Andes, la música celta, el propio shakuhachi—, y agregar notas después es, históricamente, lo normal. Fa y Si son esa segunda capa. El capítulo 5 muestra de dónde sale, entonces, su color.</CapP>
  </>
)},
{ parte:"Parte I — Fundamentos", id:"cap5", titulo:"Cap. 5 — De la pentatónica al cromatismo", body: (
  <>
    <CapP>Los cinco colores de origen no se quedan aislados: se combinan entre sí, por mezcla directa, para generar los siete colores restantes y completar la rueda de doce.</CapP>
    <CapP>Do (azul) y Re (verde) se mezclan y dan Do sostenido, celeste — una mezcla válida en dos sentidos a la vez, porque el celeste, a diferencia del resto, es también un color espectral real: existe físicamente en la luz, entre el azul y el verde. Re (verde) y Mi (marrón) dan Re sostenido, un oliva que resulta de la mezcla real entre ambos. Mi (marrón) y Sol (amarillo) dan, en dos pasos, Fa y Fa sostenido —un dorado que se aclara a medida que se acerca al amarillo—. Sol (amarillo) y La (rojo) se mezclan y dan Sol sostenido, naranja. Y por último, La (rojo) y Do (azul) se mezclan y dan Si, violeta —que a su vez, mezclado otra vez con La, da Sib, rosa—.</CapP>
    <CapP>El marrón merece una aclaración aparte, porque a primera vista parece "romper" el espectro: no existe una banda de luz que produzca marrón. Técnicamente es un naranja oscurecido y desaturado, un color que solo existe por mezcla o por sombra, nunca en un prisma. Eso significa que ubicarlo donde lo ubica la leyenda —entre el verde y el amarillo— no viola ninguna ley óptica: el marrón nunca tuvo un lugar "correcto" en el espectro que este sistema esté alterando.</CapP>
    <CapFig caption="Figura 5. Las cinco notas ancla y las mezclas que completan la rueda de doce.">
      <RuedaCromatica highlight={["C","D","E","G","A"]}/>
    </CapFig>
    <CapP>Y acá aparece un cierre que no estaba planeado, pero que sostiene el argumento con una precisión que vale la pena señalar: Fa y Si, las dos notas sin historia propia, están exactamente a distancia de tritono entre sí —seis semitonos—. El tritono es, en música, el intervalo de mayor tensión e inestabilidad. Y en este sistema de color, es también el único intervalo cuya relación cromática es un <b>complementario exacto</b> —el par de colores de máximo contraste posible en toda la rueda—. Las dos notas que llegaron después, sin mito de origen, resultan ser las que generan, al mismo tiempo, la máxima tensión armónica y el máximo contraste visual. No hizo falta forzarlo: es consecuencia directa de aplicar la misma lógica hasta el final.</CapP>
  </>
)},
{ parte:"Parte I — Fundamentos", id:"cap5bis", titulo:"Cap. 5bis — Una variante real: el espectro continuo", body: (
  <>
    <CapP>Todo lo construido hasta acá —la leyenda del shakuhachi, la mezcla pentatónica, el marrón de Mi que en realidad es un naranja ensombrecido— pertenece a lo que este libro va a llamar, de ahora en más, la <b>paleta de estudio</b>. Es una paleta pensada para enseñar: cada color tiene una historia, una razón, un porqué que se puede contar en una frase. Eso es, exactamente, lo que la vuelve memorable — y también lo que la vuelve, en un sentido estricto, artificial: nadie en la naturaleza mezcla marrón con amarillo para producir un color intermedio, porque el marrón no es un color de la luz.</CapP>
    <CapP>Pero hay preguntas que la paleta de estudio no está pensada para responder bien. Si dos o tres notas se combinan en un acorde, ¿qué pasa si en vez de mezclar el marrón de Mi lo que se mezcla es un matiz continuo, sin sombras narrativas de por medio? Para eso este libro construye una segunda paleta, con un criterio completamente distinto: no contar una historia, sino calcular con la mayor coherencia física posible dentro del mismo sistema temperado de doce colores.</CapP>
    <CapP>Esta segunda paleta —la paleta real, o espectral— parte de los tres únicos anclajes que este libro considera innegociables, porque no dependen de una leyenda sino de una coincidencia de idioma y de percepción directa: Do es azul (el cielo), Sol es amarillo (el sol, con el mismo nombre en español) y La es rojo. Entre esos tres puntos fijos, en vez de mezclar colores nota por nota como hizo el capítulo 5, la paleta real interpola un matiz continuo alrededor de toda la rueda, sin agregar ningún color a mano. El resultado es una rueda que sí es, de punta a punta, un espectro real: no hay marrón, no hay oliva, no hay beige — hay una progresión ininterrumpida de matiz, igual que un arcoíris continuo doblado en círculo.</CapP>
    <CapP>Esto tiene un costo, y conviene decirlo con la misma honestidad que sostuvo el capítulo anterior: al interpolar matemáticamente, la paleta real pierde la justificación individual de cada color. Mi ya no es "la tierra de la montaña" — es, simplemente, el matiz que le toca por posición entre el verde de Re y el amarillo de Sol. Se gana continuidad física; se pierde historia. Es la razón por la que este libro nunca usa la paleta real para enseñar el sistema por primera vez.</CapP>
    <div className="grid sm:grid-cols-2 gap-4 my-4">
      <CapFig caption="Paleta de estudio — narrativa">
        <RuedaCromatica size={220}/>
      </CapFig>
      <CapFig caption="Paleta real — calculada en vivo (interpolación de matiz Do→Sol→La)">
        <RuedaCromatica size={220} usePaletteReal/>
      </CapFig>
    </div>
    <CapNota>Esta segunda rueda se calcula acá mismo, en la app, con el método que describe el libro (interpolación circular de matiz entre las tres anclas). No es una paleta fija ni "oficial" — es una demostración en vivo del criterio del capítulo, para comparar contra la paleta de estudio.</CapNota>
    <CapP>Las dos paletas conviven a propósito, cada una con su función: la de estudio para aprender y reconocer, la real para calcular mezclas de acordes con un criterio más físicamente coherente cuando se necesita esa precisión. Ninguna de las dos es "la verdadera". Las dos son honestas sobre lo que sacrifican, y esa honestidad —no una fórmula descubierta— es lo que sostiene todo el sistema.</CapP>
  </>
)},
{ parte:"Parte II — El sistema en profundidad", id:"cap6", titulo:"Cap. 6 — La correspondencia de la tercera", body: (
  <>
    <CapP>Hay una pregunta que este sistema no podía dejar sin responder: ¿por qué el marrón —justamente el color más "irregular" de toda la rueda— cae exactamente en Mi, la tercera de la tónica?</CapP>
    <CapP>La respuesta no es solo narrativa. En armonía, la tercera de un acorde es la nota que decide si ese acorde es mayor o menor. La fundamental y la quinta son estructurales, estables, casi neutras; la tercera es la que "tiñe" el carácter emocional del acorde entero. Por eso, en la jerga de la armonía, muchos músicos la llaman directamente "la nota de color" del acorde —mucho antes de que existiera este libro.</CapP>
    <CapP>El marrón, en teoría del color, cumple una función estructuralmente idéntica: no es un matiz propio, es una modificación de valor y saturación sobre otro color —un naranja oscurecido—. No aporta una identidad nueva: aporta una sombra sobre una identidad existente.</CapP>
    <CapP>La nota cuya función musical es matizar la armonía es representada, con coherencia real y no solo poética, por la familia de color cuya función óptica es exactamente matizar en lugar de aportar un color propio. Es la misma lógica que después aparece, otra vez, en el mundo mineral: el mismo ion de cromo produce rojo en el rubí y verde en la esmeralda, dependiendo únicamente de la estructura que lo aloja. La identidad no cambia. La expresión sí, según el contexto. Ese principio —contexto que define expresión sin alterar identidad— es, en el fondo, el que sostiene a todo el libro.</CapP>
    <CapH3>La tercera como nota de color, en cualquier tonalidad</CapH3>
    <CapP>Todo lo anterior se explicó con Do como ejemplo, pero el principio es transportable a las doce tonalidades. Tomemos Sol sostenido, que en este sistema es naranja —la mezcla entre Sol y La—. Su quinta es siempre Re sostenido (oliva), sea la tonalidad mayor o menor: la quinta es estructural y no cambia el carácter del acorde. Lo que sí cambia es la tercera: en Sol sostenido mayor, la tercera es Do (azul); en Sol sostenido menor, la tercera es Si (violeta). Dos colores completamente distintos matizando el mismo naranja de base, solo por el cambio de un semitono en la tercera — la manifestación cromática exacta de lo que ese semitono hace armónicamente.</CapP>
    <div className="grid grid-cols-2 gap-3 my-4">
      <MixFigure titulo="Sol# mayor (Sol#–Do–Re#)" notes={["G#","C","D#"]} nota="Fundamental naranja + tercera mayor (Do, azul) + quinta oliva."/>
      <MixFigure titulo="Sol# menor (Sol#–Si–Re#)" notes={["G#","B","D#"]} nota="Misma fundamental y quinta — la tercera menor (Si, violeta) tiñe todo el acorde distinto."/>
    </div>
    <CapP>Esto se repite, con sus propios valores, para cualquiera de las doce tónicas — probalo en la pestaña <b>Acorde</b> con cualquier acorde mayor y su relativo menor.</CapP>
  </>
)},
{ parte:"Parte II — El sistema en profundidad", id:"cap7", titulo:"Cap. 7 — El doble temperamento", body: (
  <>
    <CapP>Este es el capítulo bisagra: todo lo anterior construye hacia acá, y todo lo que sigue lo aplica.</CapP>
    <CapP>La música occidental temperada no usa las proporciones "puras" de la afinación natural —la serie armónica—. Las ajusta, deliberadamente, para poder dividir la octava en doce semitonos exactamente iguales. Es una decisión práctica, no un descubrimiento: se sacrifica la pureza acústica para ganar un sistema funcional y transportable a cualquier tonalidad.</CapP>
    <CapP>Este libro hace, con el color, exactamente el mismo gesto. Y para demostrarlo —no solo para afirmarlo— se pusieron a prueba tres intentos distintos de encontrar una correspondencia física real entre sonido y color, y los tres, de manera consistente, fallaron:</CapP>
    <CapP><b className="text-gray-200">Primero</b>, el espectro de luz real no tiene el mismo tamaño que una octava musical —ocupa apenas menos de una octava—, así que ningún mapeo directo de frecuencia de sonido a frecuencia de luz logra que las doce notas entren completas en el rango visible: algo siempre queda afuera, en infrarrojo o ultravioleta.</CapP>
    <CapP><b className="text-gray-200">Segundo</b>, incluso usando la técnica válida de elevar una frecuencia de audio cuarenta octavas para llevarla al rango de luz visible, el resultado no coincide con los colores de este sistema — de hecho invierte varias asignaciones (Do termina siendo infrarrojo, invisible; La termina siendo naranja, no rojo).</CapP>
    <CapP><b className="text-gray-200">Tercero</b>, se compararon las propiedades físicas reales de las doce piedras preciosas elegidas para cada nota —densidad, dureza, índice de refracción— contra la frecuencia sonora de cada nota. La correlación estadística fue prácticamente cero en los tres casos.</CapP>
    <CapNota>Tres intentos, tres resultados negativos, siempre de la misma manera. Y ese patrón repetido es, en sí mismo, el argumento central de todo el libro: si alguno de esos tres intentos hubiera arrojado una correlación fuerte, sería motivo de sospecha, no de celebración. Que los tres fallen limpiamente confirma que este es un sistema <b>temperado</b>: construido con criterios explícitos y defendibles, no derivado de una fórmula de la naturaleza. Y sin embargo, el sistema funciona —porque nunca pretendió ser un hallazgo. Pretendió, desde el principio, ser un lenguaje.</CapNota>
    <CapH3>Un anclaje real, sin necesidad de leyenda</CapH3>
    <CapP>Todo lo anterior son intentos de correspondencia física que fallaron, y este libro los cuenta igual porque el fracaso ordenado es parte del argumento. Pero hay una sola nota, en todo el sistema, que sí tiene un anclaje físico real, verificable y ajeno a cualquier leyenda: el La. No por ninguna propiedad de su color —la idea de que el rojo sea "el primer color que percibe el ojo" circula bastante, pero no resiste una revisión mínima: según qué estudio se consulte, el primer matiz en aparecer en el umbral de percepción es el amarillo, no el rojo, y no hay acuerdo real entre las fuentes.</CapP>
    <CapP>Lo que el La sí tiene, y que ninguna otra nota de la escala tiene, es un anclaje universalmente estandarizado: los 440 Hz del diapasón, la referencia de afinación de la música occidental (norma ISO 16), el punto del que parte cualquier instrumento que se afina hoy. No es una leyenda ni una elección estética — es, probablemente, el hecho más verificable de todo este libro.</CapP>
    <CapP>Y en este sistema, el La ya es rojo desde el capítulo 4 —la vida, la sangre, a la distancia—, sin que hiciera falta ajustar nada para lograrlo. Que la única nota con anclaje físico real termine siendo también el color de mayor intensidad simbólica de la leyenda no es una prueba de nada, pero sí es una segunda capa de sentido que vale la pena señalar.</CapP>
  </>
)},
{ parte:"Parte II — El sistema en profundidad", id:"cap8", titulo:"Cap. 8 — El círculo de quintas en color", body: (
  <>
    <CapP>El círculo de quintas —la forma en que las tonalidades se organizan por su distancia armónica, no por su distancia cromática— revela algo que el círculo cromático simple no muestra.</CapP>
    <CapP>Cada salto de una quinta equivale, en la rueda de doce colores de este sistema, a un giro constante de 210 grados. No es un número cualquiera: coincide con relaciones que la teoría del color ya nombra formalmente.</CapP>
    <CapP>El <b>tritono</b> —seis semitonos, 180°— es un complementario exacto: el intervalo más disonante e inestable de la música cae en el par de colores de máximo contraste posible. La <b>quinta justa</b> —210°— es un split-complementario: consonancia máxima después de la octava, pero el color no llega al opuesto exacto, se queda a 30° de distancia — contraste resuelto, no frontal. La <b>tercera mayor</b> —120°— es el ángulo clásico del esquema tríadico en teoría del color, el más vibrante y equilibrado que existe.</CapP>
    <CapP>Dibujado como estrella de doce puntas —la forma tradicional del círculo de quintas—, cada conexión de este sistema resulta ser siempre split-complementaria: nunca un choque frontal, siempre una tensión resuelta. Y si se reordena la rueda completa según el círculo de quintas en vez del orden cromático, los colores dejan de avanzar en degradé y saltan de forma irregular — la elección exactamente inversa a la de Scriabin, que ordenó por quintas para lograr ahí su arcoíris prolijo, sacrificando el orden cromático. Este sistema prioriza lo opuesto, a propósito.</CapP>
    <CapH3>La geometría de los acordes</CapH3>
    <CapP>Si el círculo de quintas ya mostraba que un intervalo fijo es siempre el mismo ángulo, no importa desde qué nota se lo mida, el paso siguiente es natural: un acorde entero —no ya un intervalo suelto, sino una combinación de varias notas— también traza una figura fija sobre la rueda.</CapP>
    <CapP>Una tríada mayor cualquiera son tres puntos: la fundamental, la tercera mayor (4 semitonos) y la quinta justa (7 semitonos). Esos tres puntos, unidos, forman un triángulo. Do mayor es Do-Mi-Sol: un triángulo escaleno con vértices en esas tres posiciones. Sumarle la séptima mayor (Si, 11 semitonos) no cambia el triángulo — lo extiende a un cuadrilátero, agregando un cuarto vértice. Y una tríada menor, que solo difiere de la mayor en un semitono (la tercera baja de Mi a Mib), traza un triángulo parecido pero no idéntico: un vértice se corre, la figura entera se deforma un poco.</CapP>
    <CapP>Y ahí aparece la utilidad más concreta de pensar los acordes como figuras: trasponer deja de ser recalcular notas una por una, y pasa a ser girar la misma figura sobre la rueda. Un Do mayor trasladado a Fa no es "hay que pensar cuál es la tercera de Fa" — es tomar el mismo triángulo y rotarlo hasta que la fundamental caiga en Fa. La forma no cambia nunca; lo único que cambia es la orientación. Cada tipo de acorde —mayor, menor, séptima mayor, séptima dominante, disminuido, aumentado— tiene su propia figura característica, fija, reconocible de un vistazo, sea cual sea la tonalidad.</CapP>
    <CapP>Para acordes de cuatro notas en adelante, la misma rueda admite una segunda lectura, más propia del vocabulario del jazz: en vez de una única figura cerrada, el acorde se puede descomponer en una <b>base</b> (fundamental, tercera, quinta y séptima) y sus <b>tensiones</b> (novena, oncena, trecena). Esta doble lectura es exactamente el concepto de poliacorde: pensar una estructura superior como dos acordes más simples sonando a la vez. (La pestaña <b>Quintas</b> de esta app ya implementa el círculo interactivo de este capítulo.)</CapP>
  </>
)},
{ parte:"Parte III — Aplicación", id:"cap9", titulo:"Cap. 9 — Lectura rápida de partituras por color", body: (
  <>
    <CapNota>Capítulo en desarrollo — sección práctica, pendiente de definir ejercicios concretos de lectura.</CapNota>
    <CapP>La idea central de este capítulo es simple de enunciar y requiere práctica para volverse automática: en vez de leer una nota, calcular su nombre, y recién ahí reconocer su función armónica, el color permite saltar directo al último paso. Un pasaje de partitura coloreado según este sistema convierte la lectura en reconocimiento de patrón visual —qué colores se repiten, cuáles contrastan, dónde aparece la tensión de un tritono— antes que en decodificación nota por nota.</CapP>
    <CapP>Falta desarrollar acá: ejercicios progresivos de lectura, ejemplos de partituras reales coloreadas, y una guía de cómo aplicar el sistema a instrumentos específicos (teclado, bandoneón, cuerdas, viento).</CapP>
  </>
)},
{ parte:"Parte III — Aplicación", id:"cap10", titulo:"Cap. 10 — Acordes y tonalidades por mezcla", body: (
  <>
    <CapP>Si cada nota tiene un color, un acorde —varias notas simultáneas— puede pensarse como una mezcla de colores. Este sistema resuelve esa mezcla con tres decisiones independientes, no con una fórmula única:</CapP>
    <CapP><b className="text-gray-200">Cuánto pesa cada nota.</b> El modelo armónico usa la proporción real de la serie de armónicos naturales. El modelo narrativo le da más peso a la tercera, coherente con el capítulo 6. Pero ninguno de los dos resuelve un problema práctico: si la séptima, la novena o la trecena pesan casi lo mismo que la fundamental, el color final puede terminar más cerca de esa tensión que de la raíz — un Do13 con la trecena en La puede leerse casi rojo, y deja de comunicar que sigue siendo, ante todo, un acorde de Do.</CapP>
    <CapP>Por eso el modo por defecto de esta app es un tercer criterio: <b>raíz dominante</b>. La fundamental se queda con un porcentaje fijo del peso total —80% por defecto— y todo lo demás se reparte en partes iguales el porcentaje restante. El resultado es un color que nunca se aleja demasiado de la raíz, sin importar cuántas notas se agreguen encima.</CapP>
    <CapP><b className="text-gray-200">Cómo se mezclan.</b> El modelo de <i>luz</i> mezcla por promedio aditivo de RGB —como sumar haces de proyector—. El modelo de <i>pintura</i> mezcla en espacio sustractivo —como pigmento real: cuantos más colores se suman, más se oscurece. Esta app usa el modelo de luz.</CapP>
    <CapP>El sistema no se detiene en la tríada: se extiende a séptimas, novenas, acordes disminuidos, aumentados y suspendidos, cada uno con su propia combinación de notas y, por lo tanto, su propio color resultante. Estos son los mismos ejemplos del libro, calculados en vivo con la paleta actual:</CapP>
    <div className="grid sm:grid-cols-3 gap-3 my-4">
      <MixFigure titulo="Re mayor (Re–Fa#–La)" notes={["D","F#","A"]}/>
      <MixFigure titulo="Re menor (Re–Fa–La)" notes={["D","F","A"]}/>
      <MixFigure titulo="Sol7 (Sol–Si–Re–Fa)" notes={["G","B","D","F"]}/>
    </div>
    <CapP>La tonalidad completa de una obra —no solo un acorde aislado— se resuelve como el color de su acorde tónica: Re mayor es la mezcla de Re-Fa♯-La; Re menor, la mezcla de Re-Fa-La. Es la solución más económica y la más coherente con todo lo demás: la identidad de una tonalidad es, en la práctica musical, la calidad de su tríada tónica.</CapP>
    <CapP>La pestaña <b>Acorde</b> de esta app implementa este capítulo en forma práctica: analizá cualquier cifrado y vas a ver sus notas coloreadas con esta misma paleta.</CapP>
  </>
)},
{ parte:"Parte III — Aplicación", id:"cap11", titulo:"Cap. 11 — Reconocimiento de acordes", body: (
  <CapNota>Capítulo pendiente — de acuerdo a lo conversado, esta sección "musical neta" —entrenar el reconocimiento auditivo y visual de acordes usando el sistema de color— queda para una etapa posterior del desarrollo del libro.</CapNota>
)},
{ parte:"Parte III — Aplicación", id:"cap12", titulo:"Cap. 12 — Ejercicios progresivos", body: (
  <CapNota>Capítulo pendiente de diseño. Estructura tentativa: ejercicios de reconocimiento de notas sueltas por color → intervalos → tríadas → acordes extendidos → lectura de fragmentos breves → progresiones tonales completas. Falta definir la cantidad de niveles y si se acompañan de partituras reales o de ejercicios propios.</CapNota>
)},
{ parte:"Parte IV — Una puerta lateral", id:"piedras", titulo:"Piedras, energía y sonido", body: (
  <>
    <CapP>Esta es la única puerta lateral del libro. Todo lo anterior —Partes I, II y III— es el sistema propiamente dicho: justificado, temperado, y transportable a cualquier tonalidad. Lo que sigue acá es distinto en naturaleza, no solo en tono.</CapP>
    <CapP>Este capítulo nace de una inquietud personal: las piedras preciosas tienen colores propios —ya vimos, en el capítulo 6, que ese color tiene una causa atómica real y verificable—, pero en muchas tradiciones espirituales, además, se les atribuyen propiedades energéticas. La pregunta que dio origen a este capítulo fue simple: si cada piedra de este sistema ya tiene asignada una nota musical propia, ¿podría esa nota funcionar como una forma de "sintonizar" o reforzar simbólicamente la energía que la tradición le atribuye a esa piedra?</CapP>
    <CapNota>Lo que sigue es tradición espiritual, no evidencia científica. La sanación con cristales (litoterapia) y la sanación con sonido son prácticas con siglos de historia —documentadas ya en la Mesopotamia sumeria, hacia el 3000 a.C.— pero no cuentan con respaldo científico validado. Se presentan acá como una capa de sentido para quien la busca, no como un hecho comprobado.</CapNota>
    <CapH3>Correspondencia entre piedra, energía tradicional y nota</CapH3>
    <div className="overflow-x-auto rounded-xl border border-gray-800" style={{background:"#121212"}}>
      <table className="w-full text-xs" style={{minWidth:"520px"}}>
        <thead>
          <tr style={{background:"#1a1a1a",borderBottom:"1px solid #333333"}}>
            {["Nota","Piedra","Energía tradicional","Chakra"].map(h=>(
              <th key={h} className="text-left px-3 py-2 text-gray-500 uppercase tracking-widest font-normal">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PIEDRAS.map((p,i)=>(
            <tr key={p.n} style={{borderBottom:"1px solid #2a2a2a",background:i%2===0?"transparent":"#1a1a1a"}}>
              <td className="px-3 py-2">
                <button onClick={()=>playTone(p.n,4,0.6)} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-bold border-2"
                  style={{backgroundColor:nc(p.n)+"18",borderColor:nc(p.n),color:nc(p.n)}}>
                  {CROM_DOBLE[p.n]}
                </button>
              </td>
              <td className="px-3 py-2 italic text-gray-300">{p.piedra}</td>
              <td className="px-3 py-2 text-gray-500">{p.energia}</td>
              <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{p.chakra}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <CapH3>La nota como forma simbólica de sintonía</CapH3>
    <CapP>La propuesta de este capítulo, dentro de ese marco de tradición y no de ciencia, es sencilla: ya que cada piedra tiene asignada una nota musical exacta dentro de este sistema, tocar esa nota específica —en un xilófono, un cuenco tibetano afinado, una voz, cualquier instrumento— cerca de la piedra, o simplemente mientras se la sostiene, ofrece una forma de sintonía simbólica coherente con todo el resto del sistema: la misma nota que la representa en color es, ahora, también la que la representa en sonido. No se plantea como un mecanismo físico comprobado — se plantea como un gesto ritual con sentido interno, consistente de principio a fin con la lógica de todo el libro.</CapP>
  </>
)},
{ parte:"Anexos", id:"anexo", titulo:"Anexo — Ficha de referencia rápida", body: (
  <>
    <CapP>Los doce colores oficiales del sistema, con su hex y su piedra correspondiente — la misma paleta que usa toda esta app.</CapP>
    <div className="rounded-xl border border-gray-800 divide-y divide-gray-800 overflow-hidden" style={{background:"#121212"}}>
      {PIEDRAS.map(p=>(
        <div key={p.n} className="flex items-center gap-3 px-4 py-2.5">
          <div className="w-8 h-8 rounded-full border-2 flex-shrink-0" style={{background:nc(p.n),borderColor:nc(p.n)}}/>
          <span className="font-bold w-16" style={{color:nc(p.n),fontFamily:"'Libre Baskerville',serif"}}>{CROM_DOBLE[p.n]}</span>
          <span className="font-mono text-xs text-gray-600 w-20">{nc(p.n)}</span>
          <span className="italic text-gray-500 text-sm">{p.piedra}</span>
        </div>
      ))}
    </div>
    <CapNota>Pendiente de compilación futura: guías de ejercitación por instrumento (bandoneón, piano), y partituras reales coloreadas con el sistema — quedan para publicaciones independientes de este manual, una vez que el método demuestre su naturalidad en el uso diario.</CapNota>
  </>
)},
];

// Capítulos que ven los alumnos: solo lo técnico del temperamento cromático. El manual completo (CAPITULOS) queda en el Organizador.
export const CAPITULOS_TEC = [
{ parte:"El método", id:"cap0", titulo:"El código de color", body: (
  <>
    <CapP>Antes de que el sistema te ahorre cálculo hay una inversión inicial: aprender <b className="text-gray-200">doce colores de memoria</b>, con la misma seriedad con que aprendiste el nombre de las doce notas.</CapP>
    <CapP>Lo que memorizás es una paleta —doce colores, cada uno con su nombre de nota—, no teoría. La teoría llega después, apoyada en esa memoria.</CapP>
    <CapH3>El orden para aprenderla</CapH3>
    <PasoCard n="1" titulo="Primero, una tira" fig={<TiraColores/>}>Las doce notas en fila, cada una con su color y su nombre.</PasoCard>
    <PasoCard n="2" titulo="Después, la rueda" fig={<RuedaCromatica size={210}/>}>Las mismas doce en círculo: no son una lista que termina, sino un ciclo que vuelve a empezar.</PasoCard>
    <PasoCard n="3" titulo="Por último, tarjetas" fig={<TarjetasMuestra/>}>Una nota por vez, con su color y su enarmónico (Do♯ y Re♭ comparten color). Repetición hasta que sea reflejo; se practica en la pestaña <b>Colores</b>.</PasoCard>
  </>
)},
{ parte:"El método", id:"tec5", titulo:"De la pentatónica al cromatismo", body: (
  <>
    <CapP>Los cinco colores de origen no se quedan aislados: se combinan entre sí, por mezcla directa, para generar los siete colores restantes y completar la rueda de doce.</CapP>
    <CapP>Do (azul) y Re (verde) se mezclan y dan Do sostenido, celeste —un color espectral real, entre el azul y el verde—. Re (verde) y Mi (marrón) dan Re sostenido, un oliva. Mi (marrón) y Sol (amarillo) dan, en dos pasos, Fa y Fa sostenido, un dorado que se aclara a medida que se acerca al amarillo. Sol (amarillo) y La (rojo) dan Sol sostenido, naranja. La (rojo) y Do (azul) dan Si, violeta, que mezclado otra vez con La da Si bemol, rosa.</CapP>
    <CapP>El marrón no existe como banda de luz: es un naranja oscurecido y desaturado, un color que solo aparece por mezcla o por sombra, nunca en un prisma. Por eso ubicarlo entre el verde y el amarillo no viola ninguna ley óptica.</CapP>
    <CapFig caption="Las cinco notas ancla y las mezclas que completan la rueda de doce.">
      <RuedaCromatica highlight={["C","D","E","G","A"]}/>
    </CapFig>
  </>
)},
{ parte:"El método", id:"tec7", titulo:"El temperamento cromático", body: (
  <>
    <CapP>La música occidental temperada no usa las proporciones "puras" de la afinación natural —la serie armónica—. Las ajusta, deliberadamente, para dividir la octava en doce semitonos exactamente iguales. Es una decisión práctica: se sacrifica la pureza acústica para ganar un sistema funcional y transportable a cualquier tonalidad.</CapP>
    <CapP>El código de color hace el mismo gesto: no deriva los colores de una fórmula física, los ajusta con criterio explícito para que la paleta de doce sea funcional y se pueda transportar a las doce tonalidades.</CapP>
    <CapH3>Por qué no hay una correspondencia física directa</CapH3>
    <CapP><b className="text-gray-200">El espectro de luz no es una octava.</b> El espectro visible ocupa apenas menos de una octava, así que ningún mapeo directo de la frecuencia del sonido a la frecuencia de la luz hace entrar las doce notas completas en el rango visible: algo siempre queda afuera, en infrarrojo o ultravioleta.</CapP>
    <CapP><b className="text-gray-200">Subir el sonido hasta la luz tampoco coincide.</b> Aun elevando una frecuencia de audio cuarenta octavas para llevarla al rango visible, el resultado no coincide con los colores del sistema e invierte varias asignaciones: Do queda en infrarrojo, invisible, y La queda naranja, no rojo.</CapP>
    <CapNota>Como la física no entrega una correspondencia, el sistema es temperado: está construido con criterios explícitos y defendibles, no derivado de una fórmula de la naturaleza. No pretende ser un hallazgo, sino un lenguaje.</CapNota>
  </>
)},
];
