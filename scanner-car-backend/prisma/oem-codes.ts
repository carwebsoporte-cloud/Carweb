/* ============================================================
   Códigos específicos de fabricante (OEM) — Fase 3.
   Set curado y bilingüe (ES base + EN) de los códigos P1xxx más
   conocidos por marca. La gracia de esta capa: un mismo código
   (p.ej. P1133) significa cosas distintas según el fabricante.
   Cada código cuelga del Manufacturer correspondiente vía la clave
   compuesta (code, manufacturerId).
   ============================================================ */

import type { PrismaClient } from '@prisma/client';

export interface OemContent {
  title: string;
  description: string;
  symptoms: string[];
  causes: string[];
  solutions: string[];
}

export interface OemCode {
  manufacturerSlug: string;
  code: string;
  severity: string; // 'Baja' | 'Moderada' | 'Crítica/No conducir'
  es: OemContent;
  en: OemContent;
}

export const OEM_CODES: OemCode[] = [
  // ── TOYOTA ────────────────────────────────────────────────────────────────
  { manufacturerSlug: 'toyota', code: 'P1100', severity: 'Moderada',
    es: { title: 'Circuito del Sensor BARO (Presión Barométrica)', description: 'El sensor de presión barométrica de Toyota envía una señal fuera de rango, afectando el cálculo de la mezcla según la altitud.', symptoms: ['Ralentí inestable', 'Pérdida de potencia en altura', 'Luz Check Engine'], causes: ['Sensor BARO defectuoso', 'Conector suelto o corroído', 'Cableado dañado'], solutions: ['Revisar el conector del sensor', 'Reemplazar el sensor BARO'] },
    en: { title: 'BARO Sensor Circuit (Barometric Pressure)', description: "Toyota's barometric pressure sensor sends an out-of-range signal, affecting mixture calculation by altitude.", symptoms: ['Rough idle', 'Power loss at altitude', 'Check Engine light'], causes: ['Faulty BARO sensor', 'Loose or corroded connector', 'Damaged wiring'], solutions: ['Check the sensor connector', 'Replace the BARO sensor'] } },
  { manufacturerSlug: 'toyota', code: 'P1120', severity: 'Moderada',
    es: { title: 'Circuito del Sensor de Posición del Pedal del Acelerador', description: 'Falla en el circuito del sensor de posición del pedal (sistema de acelerador electrónico ETCS) de Toyota.', symptoms: ['Respuesta de aceleración errática', 'Modo de seguridad (limp)', 'Ralentí irregular'], causes: ['Sensor de pedal defectuoso', 'Cableado o conector dañado'], solutions: ['Inspeccionar el conector del pedal', 'Reemplazar el sensor del pedal del acelerador'] },
    en: { title: 'Accelerator Pedal Position Sensor Circuit', description: "Fault in Toyota's accelerator pedal position sensor circuit (ETCS electronic throttle system).", symptoms: ['Erratic acceleration response', 'Limp mode', 'Rough idle'], causes: ['Faulty pedal sensor', 'Damaged wiring or connector'], solutions: ['Inspect the pedal connector', 'Replace the accelerator pedal sensor'] } },
  { manufacturerSlug: 'toyota', code: 'P1133', severity: 'Moderada',
    es: { title: 'Respuesta del Sensor de Relación Aire-Combustible (Banco 1 Sensor 1)', description: 'En Toyota, el sensor A/F frontal del banco 1 responde con demasiada lentitud a los cambios de mezcla.', symptoms: ['Consumo elevado', 'Ralentí irregular', 'Luz Check Engine'], causes: ['Sensor A/F envejecido', 'Contaminación del sensor', 'Fuga de escape antes del sensor'], solutions: ['Inspeccionar fugas de escape', 'Reemplazar el sensor de relación aire-combustible'] },
    en: { title: 'Air-Fuel Ratio Sensor Circuit Response (Bank 1 Sensor 1)', description: 'On Toyota, the bank 1 front A/F sensor responds too slowly to mixture changes.', symptoms: ['High fuel consumption', 'Rough idle', 'Check Engine light'], causes: ['Aged A/F sensor', 'Sensor contamination', 'Exhaust leak before the sensor'], solutions: ['Inspect for exhaust leaks', 'Replace the air-fuel ratio sensor'] } },
  { manufacturerSlug: 'toyota', code: 'P1135', severity: 'Moderada',
    es: { title: 'Circuito del Calefactor del Sensor A/F (Banco 1 Sensor 1)', description: 'El calefactor del sensor de relación aire-combustible de Toyota no alcanza la temperatura de operación.', symptoms: ['Sensor lento al arrancar en frío', 'Consumo elevado', 'Luz Check Engine'], causes: ['Calefactor del sensor quemado', 'Fusible o relé del calefactor'], solutions: ['Verificar fusible del calefactor', 'Reemplazar el sensor A/F completo'] },
    en: { title: 'Air-Fuel Ratio Sensor Heater Circuit (Bank 1 Sensor 1)', description: "Toyota's air-fuel ratio sensor heater does not reach operating temperature.", symptoms: ['Slow sensor on cold start', 'High consumption', 'Check Engine light'], causes: ['Burned-out sensor heater', 'Heater fuse or relay'], solutions: ['Check the heater fuse', 'Replace the complete A/F sensor'] } },
  { manufacturerSlug: 'toyota', code: 'P1300', severity: 'Crítica/No conducir',
    es: { title: 'Falla del Circuito del Igniter (Bobina de Encendido) No. 1', description: 'El circuito del igniter/bobina de encendido del cilindro 1 en Toyota no responde correctamente.', symptoms: ['Motor tembloroso', 'Fallo de encendido', 'Pérdida de potencia'], causes: ['Bobina de encendido defectuosa', 'Igniter dañado', 'Cableado del encendido'], solutions: ['Probar la bobina de encendido', 'Reemplazar la bobina/igniter del cilindro 1'] },
    en: { title: 'Igniter Circuit Malfunction (Ignition Coil) No. 1', description: "On Toyota, the cylinder 1 igniter/ignition coil circuit does not respond correctly.", symptoms: ['Engine shaking', 'Misfire', 'Power loss'], causes: ['Faulty ignition coil', 'Damaged igniter', 'Ignition wiring'], solutions: ['Test the ignition coil', 'Replace the cylinder 1 coil/igniter'] } },
  { manufacturerSlug: 'toyota', code: 'P1349', severity: 'Moderada',
    es: { title: 'Sistema VVT (Distribución Variable de Válvulas) - Banco 1', description: 'El sistema de distribución variable de válvulas (VVT-i) de Toyota no avanza/retrasa el árbol de levas correctamente.', symptoms: ['Pérdida de potencia', 'Ralentí inestable', 'Consumo elevado'], causes: ['Válvula OCV (control de aceite) obstruida', 'Aceite sucio o de viscosidad incorrecta', 'Actuador VVT defectuoso'], solutions: ['Cambiar aceite y filtro', 'Limpiar o reemplazar la válvula OCV', 'Revisar el actuador VVT'] },
    en: { title: 'VVT (Variable Valve Timing) System - Bank 1', description: "Toyota's VVT-i variable valve timing system does not advance/retard the camshaft correctly.", symptoms: ['Power loss', 'Rough idle', 'High consumption'], causes: ['Clogged OCV (oil control valve)', 'Dirty or wrong-viscosity oil', 'Faulty VVT actuator'], solutions: ['Change oil and filter', 'Clean or replace the OCV', 'Check the VVT actuator'] } },
  { manufacturerSlug: 'toyota', code: 'P1604', severity: 'Moderada',
    es: { title: 'Falla de Arranque (Startability)', description: 'Toyota detecta una condición de arranque deficiente: el motor tarda o titubea al encender.', symptoms: ['Arranque difícil', 'Titubeo al encender en frío'], causes: ['Bujías o bobinas degradadas', 'Presión de combustible baja', 'Sensor de cigüeñal/levas'], solutions: ['Revisar bujías y bobinas', 'Verificar la presión de combustible'] },
    en: { title: 'Startability Malfunction', description: 'Toyota detects a poor-start condition: the engine cranks slowly or hesitates when starting.', symptoms: ['Hard starting', 'Hesitation on cold start'], causes: ['Worn spark plugs or coils', 'Low fuel pressure', 'Crank/cam sensor'], solutions: ['Check spark plugs and coils', 'Check the fuel pressure'] } },

  // ── CHEVROLET / GM ────────────────────────────────────────────────────────
  { manufacturerSlug: 'chevrolet', code: 'P1133', severity: 'Moderada',
    es: { title: 'Conmutación Insuficiente del Sensor HO2S (Banco 1 Sensor 1)', description: 'En GM, el sensor de oxígeno calentado del banco 1 no conmuta entre rico y pobre las veces esperadas.', symptoms: ['Consumo elevado', 'Falla de emisiones', 'Luz Check Engine'], causes: ['Sensor HO2S envejecido', 'Fuga de escape', 'Contaminación del sensor'], solutions: ['Inspeccionar fugas de escape', 'Reemplazar el sensor de oxígeno banco 1 sensor 1'] },
    en: { title: 'HO2S Insufficient Switching (Bank 1 Sensor 1)', description: "On GM, the bank 1 heated oxygen sensor does not switch between rich and lean as often as expected.", symptoms: ['High consumption', 'Emissions failure', 'Check Engine light'], causes: ['Aged HO2S sensor', 'Exhaust leak', 'Sensor contamination'], solutions: ['Inspect for exhaust leaks', 'Replace the bank 1 sensor 1 oxygen sensor'] } },
  { manufacturerSlug: 'chevrolet', code: 'P1153', severity: 'Moderada',
    es: { title: 'Conmutación Insuficiente del Sensor HO2S (Banco 2 Sensor 1)', description: 'Igual que P1133 pero para el banco 2 en vehículos GM.', symptoms: ['Consumo elevado', 'Falla de emisiones'], causes: ['Sensor HO2S banco 2 envejecido', 'Fuga de escape banco 2'], solutions: ['Reemplazar el sensor de oxígeno banco 2 sensor 1'] },
    en: { title: 'HO2S Insufficient Switching (Bank 2 Sensor 1)', description: 'Same as P1133 but for bank 2 on GM vehicles.', symptoms: ['High consumption', 'Emissions failure'], causes: ['Aged bank 2 HO2S sensor', 'Bank 2 exhaust leak'], solutions: ['Replace the bank 2 sensor 1 oxygen sensor'] } },
  { manufacturerSlug: 'chevrolet', code: 'P1336', severity: 'Moderada',
    es: { title: 'Variación del Sistema de Posición del Cigüeñal No Aprendida (CASE)', description: 'GM requiere que el ECU "aprenda" la variación del sensor de cigüeñal; este código indica que el procedimiento no se ha realizado.', symptoms: ['Luz Check Engine', 'Posibles fallos de encendido no detectados'], causes: ['Procedimiento de reaprendizaje CASE no realizado', 'Rueda reluctora dañada', 'Sensor CKP'], solutions: ['Realizar el reaprendizaje de variación del cigüeñal con escáner', 'Revisar el sensor CKP'] },
    en: { title: 'Crankshaft Position System Variation Not Learned (CASE)', description: "GM requires the ECU to 'learn' the crankshaft sensor variation; this code means the procedure has not been performed.", symptoms: ['Check Engine light', 'Possible undetected misfires'], causes: ['CASE relearn procedure not performed', 'Damaged reluctor wheel', 'CKP sensor'], solutions: ['Perform the crankshaft variation relearn with a scan tool', 'Check the CKP sensor'] } },
  { manufacturerSlug: 'chevrolet', code: 'P1345', severity: 'Moderada',
    es: { title: 'Correlación Cigüeñal-Árbol de Levas', description: 'En GM, las señales del sensor de cigüeñal y de árbol de levas no concuerdan, indicando un problema de sincronización.', symptoms: ['Arranque difícil', 'Fallo de encendido', 'Pérdida de potencia'], causes: ['Cadena/correa de distribución saltada', 'Sensor CMP o CKP defectuoso', 'Rueda reluctora dañada'], solutions: ['Verificar la sincronización de la distribución', 'Revisar los sensores CKP y CMP'] },
    en: { title: 'Crankshaft-Camshaft Position Correlation', description: 'On GM, the crankshaft and camshaft sensor signals do not match, indicating a timing problem.', symptoms: ['Hard starting', 'Misfire', 'Power loss'], causes: ['Jumped timing chain/belt', 'Faulty CMP or CKP sensor', 'Damaged reluctor wheel'], solutions: ['Check the timing alignment', 'Check the CKP and CMP sensors'] } },
  { manufacturerSlug: 'chevrolet', code: 'P1374', severity: 'Moderada',
    es: { title: 'Circuito de Referencia 3X (Alta Resolución)', description: 'Señal de alta resolución del cigüeñal (3X) fuera de parámetros en vehículos GM.', symptoms: ['Tacómetro errático', 'Arranque difícil', 'Fallo de encendido'], causes: ['Sensor CKP defectuoso', 'Cableado del sensor 3X', 'Rueda reluctora'], solutions: ['Revisar el cableado del sensor 3X', 'Reemplazar el sensor de cigüeñal'] },
    en: { title: '3X Reference Circuit (High Resolution)', description: 'High-resolution crankshaft (3X) signal out of parameters on GM vehicles.', symptoms: ['Erratic tachometer', 'Hard starting', 'Misfire'], causes: ['Faulty CKP sensor', '3X sensor wiring', 'Reluctor wheel'], solutions: ['Check the 3X sensor wiring', 'Replace the crankshaft sensor'] } },
  { manufacturerSlug: 'chevrolet', code: 'P1516', severity: 'Crítica/No conducir',
    es: { title: 'Rendimiento del Actuador del Acelerador (TAC)', description: 'El módulo de control del acelerador electrónico (TAC) de GM detecta que la posición real no coincide con la comandada.', symptoms: ['Modo de potencia reducida', 'Aceleración limitada', 'Luz de tracción/motor'], causes: ['Cuerpo de aceleración sucio o defectuoso', 'Sensor TPS', 'Cableado del TAC'], solutions: ['Limpiar el cuerpo de aceleración', 'Reaprender el acelerador', 'Reemplazar el cuerpo de aceleración'] },
    en: { title: 'Throttle Actuator Control (TAC) Performance', description: "GM's electronic throttle actuator control (TAC) module detects the actual position does not match the commanded one.", symptoms: ['Reduced power mode', 'Limited acceleration', 'Traction/engine light'], causes: ['Dirty or faulty throttle body', 'TPS sensor', 'TAC wiring'], solutions: ['Clean the throttle body', 'Relearn the throttle', 'Replace the throttle body'] } },

  // ── FORD ──────────────────────────────────────────────────────────────────
  { manufacturerSlug: 'ford', code: 'P1000', severity: 'Baja',
    es: { title: 'Monitoreo OBD-II No Completado', description: 'En Ford, los monitores de diagnóstico OBD-II aún no han completado su ciclo (típico tras borrar códigos o desconectar la batería).', symptoms: ['No hay síntomas de manejo', 'No pasa inspección hasta completar ciclos'], causes: ['Códigos borrados recientemente', 'Batería desconectada', 'Ciclos de conducción insuficientes'], solutions: ['Conducir el ciclo de manejo (drive cycle) recomendado por Ford', 'Reintentar la inspección luego de varios ciclos'] },
    en: { title: 'OBD-II Monitor Testing Not Complete', description: "On Ford, the OBD-II diagnostic monitors have not yet completed their cycle (typical after clearing codes or disconnecting the battery).", symptoms: ['No driveability symptoms', 'Fails inspection until cycles complete'], causes: ['Recently cleared codes', 'Disconnected battery', 'Insufficient drive cycles'], solutions: ['Drive the Ford-recommended drive cycle', 'Retry the inspection after several cycles'] } },
  { manufacturerSlug: 'ford', code: 'P1131', severity: 'Moderada',
    es: { title: 'Falta de Conmutación del HO2S — Mezcla Pobre (Banco 1)', description: 'El sensor de oxígeno del banco 1 en Ford indica permanentemente mezcla pobre.', symptoms: ['Ralentí irregular', 'Titubeo al acelerar', 'Consumo variable'], causes: ['Fuga de vacío', 'Sensor MAF sucio', 'Sensor HO2S defectuoso', 'Fuga de escape'], solutions: ['Buscar fugas de vacío', 'Limpiar el sensor MAF', 'Reemplazar el sensor HO2S si es necesario'] },
    en: { title: 'Lack of HO2S Switch — Sensor Indicates Lean (Bank 1)', description: 'The bank 1 oxygen sensor on Ford permanently indicates a lean mixture.', symptoms: ['Rough idle', 'Hesitation on acceleration', 'Variable consumption'], causes: ['Vacuum leak', 'Dirty MAF sensor', 'Faulty HO2S sensor', 'Exhaust leak'], solutions: ['Look for vacuum leaks', 'Clean the MAF sensor', 'Replace the HO2S sensor if needed'] } },
  { manufacturerSlug: 'ford', code: 'P1151', severity: 'Moderada',
    es: { title: 'Falta de Conmutación del HO2S — Mezcla Pobre (Banco 2)', description: 'Igual que P1131 pero para el banco 2 en vehículos Ford.', symptoms: ['Ralentí irregular banco 2', 'Titubeo al acelerar'], causes: ['Fuga de vacío banco 2', 'Sensor HO2S banco 2 defectuoso'], solutions: ['Revisar fugas de vacío banco 2', 'Reemplazar el sensor HO2S banco 2'] },
    en: { title: 'Lack of HO2S Switch — Sensor Indicates Lean (Bank 2)', description: 'Same as P1131 but for bank 2 on Ford vehicles.', symptoms: ['Rough idle on bank 2', 'Hesitation on acceleration'], causes: ['Bank 2 vacuum leak', 'Faulty bank 2 HO2S sensor'], solutions: ['Check bank 2 vacuum leaks', 'Replace the bank 2 HO2S sensor'] } },
  { manufacturerSlug: 'ford', code: 'P1450', severity: 'Baja',
    es: { title: 'Incapaz de Liberar el Vacío del Tanque de Combustible (EVAP)', description: 'El sistema EVAP de Ford no puede aliviar el vacío del tanque, generando exceso de vacío.', symptoms: ['Luz Check Engine', 'Ruido al abrir la tapa de combustible'], causes: ['Válvula de venteo del canister obstruida', 'Mangueras EVAP colapsadas', 'Tapa de combustible defectuosa'], solutions: ['Inspeccionar las mangueras EVAP', 'Revisar la válvula de venteo del canister', 'Reemplazar la tapa de combustible'] },
    en: { title: 'Unable to Bleed Up Fuel Tank Vacuum (EVAP)', description: "Ford's EVAP system cannot relieve the tank vacuum, creating excess vacuum.", symptoms: ['Check Engine light', 'Noise when opening the fuel cap'], causes: ['Clogged canister vent valve', 'Collapsed EVAP hoses', 'Faulty fuel cap'], solutions: ['Inspect the EVAP hoses', 'Check the canister vent valve', 'Replace the fuel cap'] } },
  { manufacturerSlug: 'ford', code: 'P1504', severity: 'Moderada',
    es: { title: 'Circuito de Control de Aire de Ralentí (IAC)', description: 'En Ford, el circuito de la válvula de control de aire de ralentí está intermitente o defectuoso.', symptoms: ['Ralentí inestable', 'Motor se apaga al detenerse', 'RPM fluctuantes'], causes: ['Válvula IAC sucia o defectuosa', 'Cableado o conector del IAC'], solutions: ['Limpiar la válvula IAC', 'Reemplazar la válvula IAC'] },
    en: { title: 'Idle Air Control (IAC) Circuit Malfunction', description: "On Ford, the idle air control valve circuit is intermittent or faulty.", symptoms: ['Unstable idle', 'Engine stalls when stopping', 'Fluctuating RPM'], causes: ['Dirty or faulty IAC valve', 'IAC wiring or connector'], solutions: ['Clean the IAC valve', 'Replace the IAC valve'] } },

  // ── HONDA ─────────────────────────────────────────────────────────────────
  { manufacturerSlug: 'honda', code: 'P1259', severity: 'Moderada',
    es: { title: 'Falla del Sistema VTEC (Banco 1)', description: 'El sistema VTEC de Honda (control variable de válvulas) no engancha correctamente.', symptoms: ['Pérdida de potencia a altas RPM', 'Falta de "patada" VTEC', 'Luz Check Engine'], causes: ['Solenoide VTEC defectuoso', 'Presión de aceite baja', 'Filtro del solenoide VTEC obstruido', 'Aceite sucio'], solutions: ['Cambiar aceite y filtro', 'Limpiar o reemplazar el solenoide VTEC', 'Verificar la presión de aceite'] },
    en: { title: 'VTEC System Malfunction (Bank 1)', description: "Honda's VTEC variable valve system does not engage correctly.", symptoms: ['Power loss at high RPM', 'No VTEC "kick"', 'Check Engine light'], causes: ['Faulty VTEC solenoid', 'Low oil pressure', 'Clogged VTEC solenoid filter', 'Dirty oil'], solutions: ['Change oil and filter', 'Clean or replace the VTEC solenoid', 'Check the oil pressure'] } },
  { manufacturerSlug: 'honda', code: 'P1399', severity: 'Crítica/No conducir',
    es: { title: 'Fallo de Encendido Aleatorio Detectado', description: 'Honda detecta fallos de encendido en uno o varios cilindros sin patrón fijo.', symptoms: ['Motor tembloroso', 'Luz Check Engine parpadeando', 'Pérdida de potencia'], causes: ['Bujías desgastadas', 'Bobinas de encendido', 'Inyectores sucios', 'Baja compresión'], solutions: ['Revisar y reemplazar bujías', 'Probar las bobinas de encendido', 'Realizar prueba de compresión'] },
    en: { title: 'Random Cylinder Misfire Detected', description: 'Honda detects misfires in one or more cylinders with no fixed pattern.', symptoms: ['Engine shaking', 'Flashing Check Engine light', 'Power loss'], causes: ['Worn spark plugs', 'Ignition coils', 'Dirty injectors', 'Low compression'], solutions: ['Inspect and replace spark plugs', 'Test the ignition coils', 'Perform a compression test'] } },
  { manufacturerSlug: 'honda', code: 'P1457', severity: 'Baja',
    es: { title: 'Fuga en el Sistema EVAP (Lado del Canister)', description: 'Honda detecta una fuga en el sistema de control evaporativo, específicamente del lado del canister de carbón.', symptoms: ['Luz Check Engine', 'Leve olor a gasolina'], causes: ['Válvula de la caja del canister defectuosa', 'Mangueras EVAP agrietadas', 'Canister de carbón dañado'], solutions: ['Inspeccionar las mangueras del canister', 'Realizar prueba de humo', 'Reemplazar la válvula del canister'] },
    en: { title: 'EVAP Control System Leak (Canister Side)', description: "Honda detects a leak in the evaporative control system, specifically on the charcoal canister side.", symptoms: ['Check Engine light', 'Slight fuel smell'], causes: ['Faulty canister housing valve', 'Cracked EVAP hoses', 'Damaged charcoal canister'], solutions: ['Inspect the canister hoses', 'Perform a smoke test', 'Replace the canister valve'] } },
  { manufacturerSlug: 'honda', code: 'P1298', severity: 'Moderada',
    es: { title: 'Voltaje Alto del Detector de Carga Eléctrica (ELD)', description: 'El detector de carga eléctrica (ELD) de Honda reporta voltaje anormalmente alto.', symptoms: ['Luz Check Engine', 'Posible carga irregular de batería'], causes: ['Unidad ELD defectuosa', 'Cableado del ELD', 'Problema en el alternador'], solutions: ['Revisar el cableado del ELD', 'Reemplazar la unidad ELD'] },
    en: { title: 'Electrical Load Detector (ELD) Circuit High Voltage', description: "Honda's electrical load detector (ELD) reports abnormally high voltage.", symptoms: ['Check Engine light', 'Possible irregular battery charging'], causes: ['Faulty ELD unit', 'ELD wiring', 'Alternator problem'], solutions: ['Check the ELD wiring', 'Replace the ELD unit'] } },

  // ── NISSAN ────────────────────────────────────────────────────────────────
  { manufacturerSlug: 'nissan', code: 'P1320', severity: 'Crítica/No conducir',
    es: { title: 'Circuito Primario de la Señal de Encendido', description: 'En Nissan, la señal primaria de encendido (bobinas tipo COP) está fuera de parámetros.', symptoms: ['Motor tembloroso', 'Fallo de encendido', 'Arranque difícil'], causes: ['Bobina de encendido defectuosa', 'Cableado del encendido', 'Sensor de cigüeñal/levas'], solutions: ['Probar las bobinas de encendido', 'Reemplazar la bobina defectuosa'] },
    en: { title: 'Ignition Signal Primary Circuit', description: "On Nissan, the primary ignition signal (COP-type coils) is out of parameters.", symptoms: ['Engine shaking', 'Misfire', 'Hard starting'], causes: ['Faulty ignition coil', 'Ignition wiring', 'Crank/cam sensor'], solutions: ['Test the ignition coils', 'Replace the faulty coil'] } },
  { manufacturerSlug: 'nissan', code: 'P1126', severity: 'Baja',
    es: { title: 'Función del Termostato', description: 'Nissan detecta que el motor no alcanza la temperatura de operación esperada (termostato).', symptoms: ['Motor frío permanentemente', 'Consumo elevado', 'Calefacción débil'], causes: ['Termostato pegado abierto', 'Sensor ECT defectuoso'], solutions: ['Reemplazar el termostato', 'Verificar el sensor de temperatura del refrigerante'] },
    en: { title: 'Thermostat Function', description: 'Nissan detects that the engine does not reach the expected operating temperature (thermostat).', symptoms: ['Engine reads cold permanently', 'High consumption', 'Weak heating'], causes: ['Thermostat stuck open', 'Faulty ECT sensor'], solutions: ['Replace the thermostat', 'Check the coolant temperature sensor'] } },
  { manufacturerSlug: 'nissan', code: 'P1444', severity: 'Baja',
    es: { title: 'Válvula de Control de Volumen de Purga del Canister EVAP', description: 'La válvula de purga del sistema EVAP de Nissan no controla el volumen de vapores correctamente.', symptoms: ['Luz Check Engine', 'Ralentí irregular', 'Olor a gasolina'], causes: ['Válvula de purga obstruida o pegada', 'Mangueras EVAP', 'Conector eléctrico'], solutions: ['Limpiar o reemplazar la válvula de purga', 'Inspeccionar las mangueras EVAP'] },
    en: { title: 'EVAP Canister Purge Volume Control Valve', description: "Nissan's EVAP purge valve does not control the vapor volume correctly.", symptoms: ['Check Engine light', 'Rough idle', 'Fuel smell'], causes: ['Clogged or stuck purge valve', 'EVAP hoses', 'Electrical connector'], solutions: ['Clean or replace the purge valve', 'Inspect the EVAP hoses'] } },
  { manufacturerSlug: 'nissan', code: 'P1610', severity: 'Moderada',
    es: { title: 'Modo de Bloqueo (Inmovilizador NATS)', description: 'El sistema antirrobo NATS de Nissan bloqueó el arranque por no reconocer la llave.', symptoms: ['El motor no arranca', 'Luz del inmovilizador parpadeando'], causes: ['Llave no registrada o dañada', 'Antena del inmovilizador', 'Módulo NATS'], solutions: ['Registrar la llave con equipo del concesionario', 'Verificar la antena del inmovilizador'] },
    en: { title: 'Lock Mode (NATS Immobilizer)', description: "Nissan's NATS anti-theft system blocked starting because it did not recognize the key.", symptoms: ['Engine does not start', 'Flashing immobilizer light'], causes: ['Unregistered or damaged key', 'Immobilizer antenna', 'NATS module'], solutions: ['Register the key with dealer equipment', 'Check the immobilizer antenna'] } },

  // ── VOLKSWAGEN / AUDI ─────────────────────────────────────────────────────
  { manufacturerSlug: 'volkswagen', code: 'P1136', severity: 'Moderada',
    es: { title: 'Ajuste de Combustible a Largo Plazo — Mezcla Pobre (Banco 1)', description: 'El ECU de VW/Audi añade combustible de forma sostenida porque detecta mezcla pobre en el banco 1.', symptoms: ['Ralentí irregular', 'Titubeo al acelerar', 'Consumo variable'], causes: ['Fuga de vacío', 'Inyectores sucios', 'Sensor MAF sucio', 'Fuga en la admisión'], solutions: ['Buscar fugas de vacío y de admisión', 'Limpiar el sensor MAF', 'Revisar los inyectores'] },
    en: { title: 'Long Term Fuel Trim Additive — System Too Lean (Bank 1)', description: "VW/Audi's ECU adds fuel continuously because it detects a lean mixture on bank 1.", symptoms: ['Rough idle', 'Hesitation on acceleration', 'Variable consumption'], causes: ['Vacuum leak', 'Dirty injectors', 'Dirty MAF sensor', 'Intake leak'], solutions: ['Look for vacuum and intake leaks', 'Clean the MAF sensor', 'Check the injectors'] } },
  { manufacturerSlug: 'volkswagen', code: 'P1296', severity: 'Moderada',
    es: { title: 'Falla del Sistema de Enfriamiento', description: 'VW/Audi detecta una falla general en el sistema de enfriamiento del motor.', symptoms: ['Temperatura de motor anormal', 'Ventilador siempre encendido o apagado', 'Consumo elevado'], causes: ['Termostato defectuoso', 'Sensor de temperatura del refrigerante', 'Bomba de agua'], solutions: ['Verificar el termostato', 'Revisar el sensor de temperatura', 'Inspeccionar la bomba de agua'] },
    en: { title: 'Cooling System Malfunction', description: 'VW/Audi detects a general fault in the engine cooling system.', symptoms: ['Abnormal engine temperature', 'Fan always on or off', 'High consumption'], causes: ['Faulty thermostat', 'Coolant temperature sensor', 'Water pump'], solutions: ['Check the thermostat', 'Check the temperature sensor', 'Inspect the water pump'] } },
  { manufacturerSlug: 'volkswagen', code: 'P1340', severity: 'Moderada',
    es: { title: 'Señales de Sensores de Cigüeñal-Levas Fuera de Secuencia', description: 'En VW/Audi, las señales de los sensores de cigüeñal y árbol de levas no están sincronizadas.', symptoms: ['Arranque difícil', 'Fallo de encendido', 'Pérdida de potencia'], causes: ['Cadena/correa de distribución estirada o saltada', 'Sensor CKP o CMP', 'Tensor de la distribución'], solutions: ['Verificar la sincronización de la distribución', 'Revisar los sensores CKP y CMP'] },
    en: { title: 'Camshaft-Crankshaft Position Sensor Signals Out of Sequence', description: 'On VW/Audi, the crankshaft and camshaft sensor signals are not synchronized.', symptoms: ['Hard starting', 'Misfire', 'Power loss'], causes: ['Stretched or jumped timing chain/belt', 'CKP or CMP sensor', 'Timing tensioner'], solutions: ['Check the timing alignment', 'Check the CKP and CMP sensors'] } },
  { manufacturerSlug: 'volkswagen', code: 'P1545', severity: 'Moderada',
    es: { title: 'Falla de Control de Posición del Acelerador', description: 'El control de la mariposa de aceleración electrónica de VW/Audi no responde correctamente.', symptoms: ['Modo de potencia reducida', 'Aceleración limitada', 'Ralentí irregular'], causes: ['Cuerpo de aceleración sucio o defectuoso', 'Sensor de posición de mariposa', 'Cableado'], solutions: ['Limpiar el cuerpo de aceleración', 'Realizar la adaptación básica del acelerador', 'Reemplazar el cuerpo de aceleración'] },
    en: { title: 'Throttle Position Control Malfunction', description: "VW/Audi's electronic throttle plate control does not respond correctly.", symptoms: ['Reduced power mode', 'Limited acceleration', 'Rough idle'], causes: ['Dirty or faulty throttle body', 'Throttle position sensor', 'Wiring'], solutions: ['Clean the throttle body', 'Perform the throttle basic adaptation', 'Replace the throttle body'] } },
];

function joinPlain(items: string[]): string {
  return items.map((s) => s.trim()).filter(Boolean).join(', ');
}
function joinNumbered(items: string[]): string {
  return items.map((s, i) => `${i + 1}. ${s.trim().replace(/\.$/, '')}.`).join(' ');
}

/** Carga (upsert) los códigos OEM bajo su fabricante, con su contenido ES base
 *  + traducción EN. Idempotente: recrea las listas hijas y hace upsert del
 *  código y de la traducción. */
export async function loadOemCodes(prisma: PrismaClient): Promise<{ loaded: number; skipped: string[] }> {
  const cats = await prisma.oBDCategory.findMany({ select: { id: true, code: true } });
  const catByLetter: Record<string, number> = {};
  for (const c of cats) catByLetter[c.code] = c.id;

  let loaded = 0;
  const skipped: string[] = [];

  for (const oem of OEM_CODES) {
    const man = await prisma.manufacturer.findUnique({ where: { slug: oem.manufacturerSlug } });
    const categoryId = catByLetter[oem.code[0].toUpperCase()];
    if (!man || !categoryId) {
      skipped.push(`${oem.code}/${oem.manufacturerSlug}`);
      continue;
    }

    const base = {
      title: oem.es.title,
      description: oem.es.description,
      severity: oem.severity,
      status: 'PUBLISHED',
      source: 'oem-curated',
      categoryId,
    };
    const code = await prisma.oBDCode.upsert({
      where: { code_manufacturerId: { code: oem.code, manufacturerId: man.id } },
      create: { code: oem.code, manufacturerId: man.id, ...base },
      update: base,
    });

    // Recrea las listas hijas (idempotente).
    await prisma.oBDSymptom.deleteMany({ where: { codeId: code.id } });
    await prisma.oBDCause.deleteMany({ where: { codeId: code.id } });
    await prisma.oBDSolution.deleteMany({ where: { codeId: code.id } });
    for (const s of oem.es.symptoms) await prisma.oBDSymptom.create({ data: { codeId: code.id, symptom: s } });
    for (const c of oem.es.causes) await prisma.oBDCause.create({ data: { codeId: code.id, cause: c } });
    for (const s of oem.es.solutions) await prisma.oBDSolution.create({ data: { codeId: code.id, solution: s } });

    // Traducción EN.
    const tr = {
      title: oem.en.title,
      description: oem.en.description,
      symptoms: joinPlain(oem.en.symptoms),
      causes: joinPlain(oem.en.causes),
      solutions: joinNumbered(oem.en.solutions),
    };
    await prisma.oBDCodeTranslation.upsert({
      where: { codeId_locale: { codeId: code.id, locale: 'en' } },
      create: { codeId: code.id, locale: 'en', ...tr },
      update: tr,
    });

    loaded++;
  }
  return { loaded, skipped };
}
