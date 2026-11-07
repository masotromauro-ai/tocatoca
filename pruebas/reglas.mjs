// pruebas/reglas.mjs — las reglas de la base (firestore.rules) contra el
// emulador de Firestore. NO corre con node a secas: necesita Java y el emulador.
// Se corre fuera del repositorio (no se agrega nada a package.json):
//   mkdir /tmp/emu && cd /tmp/emu && npm init -y
//   npm i firebase-tools@13 @firebase/rules-unit-testing@3 firebase@10
//   echo '{"emulators":{"firestore":{"port":8089}}}' > firebase.json
//   REGLAS=<ruta a firestore.rules> npx firebase emulators:exec --only firestore \
//     --project tocatoca-prueba "node <ruta a este archivo>"
// Los marcadores de UID se cambian por «mauro» y «agente».
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, addDoc, deleteDoc } from "firebase/firestore";
import fs from "fs";
const reglas = fs.readFileSync(process.env.REGLAS || new URL("../firestore.rules", import.meta.url), "utf8")
  .replace("TU-UID-ACA", "mauro").replace("UID-DEL-AGENTE", "agente");
const env = await initializeTestEnvironment({ projectId: "tocatoca-prueba", firestore: { rules: reglas, host:"127.0.0.1", port:8089 } });
await env.withSecurityRulesDisabled(async c => { const d=c.firestore();
  await setDoc(doc(d,"usuarios/doc1"),{nombre:"Mariano",rol:"docente",activo:true});
  await setDoc(doc(d,"usuarios/alu1"),{nombre:"Ana",rol:"alumno",activo:true,usuario:"ana"});
  await setDoc(doc(d,"usuarios/alu2"),{nombre:"Beto",rol:"alumno",activo:true,usuario:"beto"});
  await setDoc(doc(d,"usuarios/baja"),{nombre:"Ex",rol:"alumno",activo:false});
  await setDoc(doc(d,"invitaciones/nuevo@x.com"),{rol:"alumno"});
  await setDoc(doc(d,"clases/c1"),{docente:"doc1",alumnos:["alu1"],titulo:"Escalas"});
  await setDoc(doc(d,"historico/ana"),{ingresos:3});
  await setDoc(doc(d,"progreso/alu1"),{hechas:{}});
});
const db=(uid,email)=>env.authenticatedContext(uid,email?{email}:{}).firestore();
const anon=env.unauthenticatedContext().firestore();
let ok=0,mal=0; const t=async(n,p)=>{ try{ await p; ok++; }catch(e){ mal++; console.log("✖",n,e.message.slice(0,140)); } };
await t("sin sesión no lee usuarios", assertFails(getDoc(doc(anon,"usuarios/alu1"))));
await t("alumno lee su ficha", assertSucceeds(getDoc(doc(db("alu1"),"usuarios/alu1"))));
await t("alumno no lee la de otro", assertFails(getDoc(doc(db("alu1"),"usuarios/alu2"))));
await t("alumno no se sube el rol", assertFails(updateDoc(doc(db("alu1"),"usuarios/alu1"),{rol:"admin"})));
await t("alumno se cambia el nombre", assertSucceeds(updateDoc(doc(db("alu1"),"usuarios/alu1"),{nombre:"Ana M"})));
await t("docente no cambia roles", assertFails(updateDoc(doc(db("doc1"),"usuarios/alu1"),{rol:"docente"})));
await t("Mauro (sin ficha) cambia roles", assertSucceeds(updateDoc(doc(db("mauro"),"usuarios/alu2"),{rol:"docente"})));
await t("Mauro no pone un rol inventado", assertFails(updateDoc(doc(db("mauro"),"usuarios/alu2"),{rol:"rey"})));
await t("Mauro suspende", assertSucceeds(updateDoc(doc(db("mauro"),"usuarios/alu2"),{rol:"alumno",activo:false})));
await t("invitado crea su ficha", assertSucceeds(setDoc(doc(db("n1","Nuevo@x.com"),"usuarios/n1"),{nombre:"N",mail:"nuevo@x.com",rol:"alumno",activo:true})));
await t("invitado no se pone docente", assertFails(setDoc(doc(db("n2","nuevo@x.com"),"usuarios/n2"),{nombre:"N",mail:"nuevo@x.com",rol:"docente",activo:true})));
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
await t("docente lee progreso", assertSucceeds(getDoc(doc(db("doc1"),"progreso/alu1"))));
await t("alumno ve su histórico", assertSucceeds(getDoc(doc(db("alu1"),"historico/ana"))));
await t("alumno no ve histórico ajeno", assertFails(getDoc(doc(db("alu2"),"historico/ana"))));
await t("agente escribe histórico", assertSucceeds(setDoc(doc(db("agente"),"historico/beto"),{ingresos:1})));
await t("alumno anota ingreso", assertSucceeds(addDoc(collection(db("alu1"),"ingresos"),{uid:"alu1",tipo:"ingreso",en:1})));
await t("ingreso a nombre de otro no", assertFails(addDoc(collection(db("alu1"),"ingresos"),{uid:"alu2",tipo:"ingreso",en:1})));
await t("ingreso con campos de más no", assertFails(addDoc(collection(db("alu1"),"ingresos"),{uid:"alu1",tipo:"ingreso",en:1,x:1})));
await t("docente lista ingresos", assertSucceeds(getDocs(collection(db("doc1"),"ingresos"))));
await t("alumno no lista usuarios", assertFails(getDocs(collection(db("alu1"),"usuarios"))));
await t("agente lista usuarios", assertSucceeds(getDocs(collection(db("agente"),"usuarios"))));
await t("config: alumno lee", assertSucceeds(getDoc(doc(db("alu1"),"config/sitio"))));
await t("config: docente no escribe", assertFails(setDoc(doc(db("doc1"),"config/sitio"),{a:1})));
await t("config: Mauro escribe", assertSucceeds(setDoc(doc(db("mauro"),"config/sitio"),{esquema:1})));
await t("historial: agente crea", assertSucceeds(setDoc(doc(db("agente"),"_historial/h1"),{a:1})));
await t("historial: nadie borra", assertFails(deleteDoc(doc(db("mauro"),"_historial/h1"))));
await t("colección inventada cerrada", assertFails(setDoc(doc(db("mauro"),"otra/x"),{a:1})));
console.log(`${ok} pasadas, ${mal} fallidas`); await env.cleanup(); process.exit(mal?1:0);
