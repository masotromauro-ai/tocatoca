// pruebas/reglas.mjs — las reglas de la base (firestore.rules) contra el
// emulador de Firestore. NO corre con node a secas: necesita Java y el emulador.
// Se corre fuera del repositorio (no se agrega nada a package.json):
//   mkdir /tmp/emu && cd /tmp/emu && npm init -y
//   npm i firebase-tools@13 @firebase/rules-unit-testing@3 firebase@10
//   echo '{"emulators":{"firestore":{"port":8089}}}' > firebase.json
//   REGLAS=<ruta a firestore.rules> npx firebase emulators:exec --only firestore \
//     --project tocatoca-prueba "node <ruta a este archivo>"
// El marcador del UID del agente se cambia por «agente». «adm1» es un admin con ficha.
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, addDoc, deleteDoc } from "firebase/firestore";
import fs from "fs";
const reglas = fs.readFileSync(process.env.REGLAS || new URL("../firestore.rules", import.meta.url), "utf8")
  .replace("UID-DEL-AGENTE", "agente");
const env = await initializeTestEnvironment({ projectId: "tocatoca-prueba", firestore: { rules: reglas, host:"127.0.0.1", port:8089 } });
await env.withSecurityRulesDisabled(async c => { const d=c.firestore();
  await setDoc(doc(d,"usuarios/adm1"),{nombre:"Admin",rol:"admin",activo:true});
  await setDoc(doc(d,"invitaciones/admin2@x.com"),{rol:"admin"});
  await setDoc(doc(d,"usuarios/doc1"),{nombre:"Mariano",rol:"docente",activo:true});
  await setDoc(doc(d,"usuarios/alu1"),{nombre:"Ana",rol:"alumno",activo:true,usuario:"ana"});
  await setDoc(doc(d,"usuarios/alu2"),{nombre:"Beto",rol:"alumno",activo:true,usuario:"beto"});
  await setDoc(doc(d,"usuarios/doc2"),{nombre:"Otro",rol:"docente",activo:true});
  await setDoc(doc(d,"usuarios/alu3"),{nombre:"Caro",rol:"alumno",activo:true,docente:"doc1"});
  await setDoc(doc(d,"progreso/alu3"),{hechas:{}});
  await setDoc(doc(d,"progreso/alu3/dias/2026-11-07"),{min:{codigo:3},en:1});
  await setDoc(doc(d,"usuarios/baja"),{nombre:"Ex",rol:"alumno",activo:false});
  await setDoc(doc(d,"invitaciones/nuevo@x.com"),{rol:"alumno"});
  await setDoc(doc(d,"clases/c1"),{docente:"doc1",alumnos:["alu1"],titulo:"Escalas"});
  await setDoc(doc(d,"historico/ana"),{ingresos:3});
  await setDoc(doc(d,"progreso/alu1"),{hechas:{}});
  // v3 (20-nov-2026): una solicitud que espera al admin (ficha inactiva con «pidio»).
  await setDoc(doc(d,"usuarios/pend1"),{nombre:"Pendiente",mail:"pend@x.com",rol:"alumno",activo:false,pidio:"docente",creado:1});
  await setDoc(doc(d,"invitaciones/conInv@x.com".toLowerCase()),{rol:"alumno"});
});
const db=(uid,email,verif=true)=>env.authenticatedContext(uid,email?{email,email_verified:verif}:{}).firestore();
const anon=env.unauthenticatedContext().firestore();
let ok=0,mal=0; const t=async(n,p)=>{ try{ await p; ok++; }catch(e){ mal++; console.log("✖",n,e.message.slice(0,140)); } };
await t("sin sesión no lee usuarios", assertFails(getDoc(doc(anon,"usuarios/alu1"))));
await t("alumno lee su ficha", assertSucceeds(getDoc(doc(db("alu1"),"usuarios/alu1"))));
await t("alumno no lee la de otro", assertFails(getDoc(doc(db("alu1"),"usuarios/alu2"))));
await t("alumno no se sube el rol", assertFails(updateDoc(doc(db("alu1"),"usuarios/alu1"),{rol:"admin"})));
await t("alumno se cambia el nombre", assertSucceeds(updateDoc(doc(db("alu1"),"usuarios/alu1"),{nombre:"Ana M"})));
await t("docente no cambia roles", assertFails(updateDoc(doc(db("doc1"),"usuarios/alu1"),{rol:"docente"})));
await t("admin cambia roles", assertSucceeds(updateDoc(doc(db("adm1"),"usuarios/alu2"),{rol:"docente"})));
await t("admin no pone un rol inventado", assertFails(updateDoc(doc(db("adm1"),"usuarios/alu2"),{rol:"rey"})));
await t("admin suspende", assertSucceeds(updateDoc(doc(db("adm1"),"usuarios/alu2"),{rol:"alumno",activo:false})));
await t("invitado crea su ficha", assertSucceeds(setDoc(doc(db("n1","Nuevo@x.com"),"usuarios/n1"),{nombre:"N",mail:"nuevo@x.com",rol:"alumno",activo:true})));
await t("invitado no se pone docente", assertFails(setDoc(doc(db("n2","nuevo@x.com"),"usuarios/n2"),{nombre:"N",mail:"nuevo@x.com",rol:"docente",activo:true})));
await t("invitado con mail SIN verificar no crea ficha", assertFails(setDoc(doc(db("n4","admin2@x.com",false),"usuarios/n4"),{nombre:"X",mail:"admin2@x.com",rol:"admin",activo:true})));
await t("invitado admin verificado crea su ficha de admin", assertSucceeds(setDoc(doc(db("n5","admin2@x.com"),"usuarios/n5"),{nombre:"Mariano",mail:"admin2@x.com",rol:"admin",activo:true})));
await t("un uid sin ficha no es admin", assertFails(updateDoc(doc(db("mauro"),"usuarios/alu1"),{rol:"docente"})));
await t("sin invitación no hay ficha", assertFails(setDoc(doc(db("n3","otro@x.com"),"usuarios/n3"),{nombre:"O",mail:"otro@x.com",rol:"alumno",activo:true})));
await t("docente invita alumno", assertSucceeds(setDoc(doc(db("doc1"),"invitaciones/a@x.com"),{rol:"alumno"})));
await t("docente no invita docentes", assertFails(setDoc(doc(db("doc1"),"invitaciones/b@x.com"),{rol:"docente"})));
await t("agente invita", assertSucceeds(setDoc(doc(db("agente"),"invitaciones/c@x.com"),{rol:"alumno"})));
await t("alumno no invita", assertFails(setDoc(doc(db("alu1"),"invitaciones/d@x.com"),{rol:"alumno"})));
await t("alumno lee su clase", assertSucceeds(getDoc(doc(db("alu1"),"clases/c1"))));
await t("alumno no lee clase ajena", assertFails(getDoc(doc(db("alu2"),"clases/c1"))));
await t("alumno no edita clase", assertFails(updateDoc(doc(db("alu1"),"clases/c1"),{titulo:"x"})));
await t("docente edita la suya", assertSucceeds(updateDoc(doc(db("doc1"),"clases/c1"),{titulo:"Escalas 2"})));
await t("docente crea clase propia", assertSucceeds(setDoc(doc(db("doc1"),"clases/c2"),{docente:"doc1",alumnos:[]})));
await t("docente no crea a nombre de otro", assertFails(setDoc(doc(db("doc1"),"clases/c3"),{docente:"otro",alumnos:[]})));
await t("alumno guarda su progreso", assertSucceeds(setDoc(doc(db("alu1"),"progreso/alu1"),{hechas:{a:true}})));
await t("alumno no toca progreso ajeno", assertFails(setDoc(doc(db("alu1"),"progreso/alu2"),{hechas:{}})));
await t("suspendido no guarda", assertFails(setDoc(doc(db("baja"),"progreso/baja"),{hechas:{}})));
await t("v2: docente NO lee el progreso de un alumno que no es suyo", assertFails(getDoc(doc(db("doc1"),"progreso/alu1"))));
await t("v2: docente lee el progreso de SU alumno", assertSucceeds(getDoc(doc(db("doc1"),"progreso/alu3"))));
await t("v2: otro docente no lo lee", assertFails(getDoc(doc(db("doc2"),"progreso/alu3"))));
await t("v2: admin lee cualquier progreso", assertSucceeds(getDoc(doc(db("adm1"),"progreso/alu1"))));
await t("v2: docente lista los días de su alumno", assertSucceeds(getDocs(collection(db("doc1"),"progreso/alu3/dias"))));
await t("v2: otro docente no lista esos días", assertFails(getDocs(collection(db("doc2"),"progreso/alu3/dias"))));
await t("v2: el alumno lista sus días", assertSucceeds(getDocs(collection(db("alu3"),"progreso/alu3/dias"))));
await t("v2: el alumno no lista los de otro", assertFails(getDocs(collection(db("alu3"),"progreso/alu1/dias"))));
await t("v2: el alumno guarda su día", assertSucceeds(setDoc(doc(db("alu3"),"progreso/alu3/dias/2026-11-08"),{min:{codigo:2.5,entrenador:1},ingresos:1,ej:{"colores-juego":{a:3,f:1}},notas:{"0":{a:1,f:0}},en:5},{merge:true})));
await t("v2: día con un campo de más no", assertFails(setDoc(doc(db("alu3"),"progreso/alu3/dias/2026-11-09"),{min:{},en:5,docente:"x"})));
await t("v2: día con un id que no es fecha no", assertFails(setDoc(doc(db("alu3"),"progreso/alu3/dias/hoy"),{min:{},en:5})));
await t("v2: día sin «en» no", assertFails(setDoc(doc(db("alu3"),"progreso/alu3/dias/2026-11-10"),{min:{}})));
await t("v2: nadie escribe el día de otro", assertFails(setDoc(doc(db("alu1"),"progreso/alu3/dias/2026-11-08"),{min:{},en:5})));
await t("v2: el docente no escribe el día del alumno", assertFails(setDoc(doc(db("doc1"),"progreso/alu3/dias/2026-11-08"),{min:{},en:5})));
await t("v2: el alumno no se pone docente", assertFails(updateDoc(doc(db("alu3"),"usuarios/alu3"),{docente:"alu3"})));
await t("v2: el admin asigna el docente", assertSucceeds(updateDoc(doc(db("adm1"),"usuarios/alu1"),{docente:"doc1"})));
await t("alumno ve su histórico", assertSucceeds(getDoc(doc(db("alu1"),"historico/ana"))));
await t("alumno no ve histórico ajeno", assertFails(getDoc(doc(db("alu2"),"historico/ana"))));
await t("agente escribe histórico", assertSucceeds(setDoc(doc(db("agente"),"historico/beto"),{ingresos:1})));
await t("alumno anota ingreso", assertSucceeds(addDoc(collection(db("alu1"),"ingresos"),{uid:"alu1",tipo:"ingreso",en:1})));
await t("ingreso a nombre de otro no", assertFails(addDoc(collection(db("alu1"),"ingresos"),{uid:"alu2",tipo:"ingreso",en:1})));
await t("ingreso con campos de más no", assertFails(addDoc(collection(db("alu1"),"ingresos"),{uid:"alu1",tipo:"ingreso",en:1,x:1})));
await t("v2: docente ya no lista todos los ingresos", assertFails(getDocs(collection(db("doc1"),"ingresos"))));
await t("v2: admin lista ingresos", assertSucceeds(getDocs(collection(db("adm1"),"ingresos"))));
await t("alumno no lista usuarios", assertFails(getDocs(collection(db("alu1"),"usuarios"))));
await t("agente lista usuarios", assertSucceeds(getDocs(collection(db("agente"),"usuarios"))));
await t("config: alumno lee", assertSucceeds(getDoc(doc(db("alu1"),"config/sitio"))));
await t("config: docente no escribe", assertFails(setDoc(doc(db("doc1"),"config/sitio"),{a:1})));
await t("config: admin escribe", assertSucceeds(setDoc(doc(db("adm1"),"config/sitio"),{esquema:1})));
await t("historial: agente crea", assertSucceeds(setDoc(doc(db("agente"),"_historial/h1"),{a:1})));
await t("historial: nadie borra", assertFails(deleteDoc(doc(db("adm1"),"_historial/h1"))));
await t("colección inventada cerrada", assertFails(setDoc(doc(db("adm1"),"otra/x"),{a:1})));
// ── v3 (20-nov-2026, Mariano): la SOLICITUD sin invitación, por el link de alumnos o de profesores ──
const sol = (mail, extra = {}) => ({ nombre: "Sol", mail, rol: "alumno", activo: false, pidio: "alumno", creado: 1, ...extra });
await t("v3: sin invitación, con el mail verificado, deja una solicitud de alumno", assertSucceeds(setDoc(doc(db("s1","s1@x.com"),"usuarios/s1"), sol("s1@x.com"))));
await t("v3: puede pedir ser docente: el rol sigue alumno hasta que un admin decida", assertSucceeds(setDoc(doc(db("s2","s2@x.com"),"usuarios/s2"), sol("s2@x.com", { pidio: "docente" }))));
await t("v3: la solicitud no se pone rol docente", assertFails(setDoc(doc(db("s3","s3@x.com"),"usuarios/s3"), sol("s3@x.com", { rol: "docente" }))));
await t("v3: la solicitud no nace activa", assertFails(setDoc(doc(db("s4","s4@x.com"),"usuarios/s4"), sol("s4@x.com", { activo: true }))));
await t("v3: con el mail SIN verificar no hay solicitud", assertFails(setDoc(doc(db("s5","s5@x.com",false),"usuarios/s5"), sol("s5@x.com"))));
await t("v3: no se pide ser admin", assertFails(setDoc(doc(db("s6","s6@x.com"),"usuarios/s6"), sol("s6@x.com", { pidio: "admin" }))));
await t("v3: no se pide con un mail ajeno", assertFails(setDoc(doc(db("s7","s7@x.com"),"usuarios/s7"), sol("otro7@x.com"))));
await t("v3: no se cuela un campo de más (usuario, permisos)", assertFails(setDoc(doc(db("s8","s8@x.com"),"usuarios/s8"), sol("s8@x.com", { permisos: { todo: true } }))));
await t("v3: el nombre, hasta 60 letras", assertFails(setDoc(doc(db("s9","s9@x.com"),"usuarios/s9"), sol("s9@x.com", { nombre: "x".repeat(61) }))));
await t("v3: quien tiene invitación no deja una solicitud (entra con su invitación)", assertFails(setDoc(doc(db("s10","coninv@x.com"),"usuarios/s10"), sol("coninv@x.com"))));
await t("v3: no se crea la solicitud de otro uid", assertFails(setDoc(doc(db("s11","s11@x.com"),"usuarios/otro11"), sol("s11@x.com"))));
await t("v3: la persona pendiente lee su ficha (para ver que espera)", assertSucceeds(getDoc(doc(db("pend1","pend@x.com"),"usuarios/pend1"))));
await t("v3: la persona pendiente no se activa sola", assertFails(updateDoc(doc(db("pend1","pend@x.com"),"usuarios/pend1"),{activo:true})));
await t("v3: la persona pendiente no se cambia el nombre (no está activa)", assertFails(updateDoc(doc(db("pend1","pend@x.com"),"usuarios/pend1"),{nombre:"Otra"})));
await t("v3: la persona pendiente no lee la ficha de otro", assertFails(getDoc(doc(db("pend1","pend@x.com"),"usuarios/alu1"))));
await t("v3: la persona pendiente no lee clases", assertFails(getDoc(doc(db("pend1","pend@x.com"),"clases/c1"))));
await t("v3: un docente ve las solicitudes en la lista", assertSucceeds(getDocs(collection(db("doc1"),"usuarios"))));
await t("v3: un docente no aprueba", assertFails(updateDoc(doc(db("doc1"),"usuarios/pend1"),{activo:true,rol:"docente",pidio:""})));
await t("v3: el admin rechaza (rechazado: true)", assertSucceeds(updateDoc(doc(db("adm1"),"usuarios/s1"),{rechazado:true})));
await t("v3: el admin aprueba con el rol que elige", assertSucceeds(updateDoc(doc(db("adm1"),"usuarios/pend1"),{activo:true,rol:"docente",pidio:""})));
await t("v3: aprobada, entra como cualquiera: cambia su nombre", assertSucceeds(updateDoc(doc(db("pend1","pend@x.com"),"usuarios/pend1"),{nombre:"Ya adentro"})));
console.log(`${ok} pasadas, ${mal} fallidas`); await env.cleanup(); process.exit(mal?1:0);
