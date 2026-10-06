// ALQUIPC - FACTURACIÓN
const PRECIO = 35000;
const MAX_ID_STORAGE = "alqipc_ids_utilizados";

const $ = id => document.getElementById(id);

const formulario = $("formulario");
const nombre = $("nombre");
const idCliente = $("idCliente");
const telefono = $("telefono");
const email = $("email");
const opcion = $("opcion");
const equipos = $("equipos");
const dias = $("dias");
const diasAdicionales = $("diasAdicionales");

const btnCalcular = $("btnCalcular");
const btnLimpiar = $("btnLimpiar");
const btnNuevaFactura = $("btnNuevaFactura");
const factura = $("factura");

let facturaGenerada = false;


// ID AUTOMÁTICO

function obtenerIDs() {
    try {
        return JSON.parse(localStorage.getItem(MAX_ID_STORAGE)) || [];
    } catch {
        return [];
    }
}

function siguienteID() {
    const ids = obtenerIDs();
    let id = 1;

    while (ids.includes(id)) id++;

    return id;
}

function guardarID(id) {
    const ids = obtenerIDs();

    if (!ids.includes(id)) {
        ids.push(id);
        localStorage.setItem(MAX_ID_STORAGE, JSON.stringify(ids));
    }
}

// VALIDACIONES

function validar() {

    nombre.value = nombre.value.trim().replace(/\s+/g, " ");
    telefono.value = telefono.value.replace(/\D/g, "");
    email.value = email.value.trim().toLowerCase();

    if (!nombre.value)
        return "El nombre es obligatorio.";

    if (nombre.value.length < 3 || nombre.value.length > 60)
        return "El nombre debe tener entre 3 y 60 caracteres.";

    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+(?:\s+[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+)*$/.test(nombre.value))
        return "El nombre solo puede contener letras y espacios.";

    if (!/^\d{10}$/.test(telefono.value))
        return "El teléfono debe tener exactamente 10 números.";

    if (/^(\d)\1{9}$/.test(telefono.value))
        return "Ingresa un teléfono válido.";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value))
        return "Ingresa un correo electrónico válido.";

    if (!opcion.value)
        return "Selecciona un tipo de servicio.";

    if (!Number.isInteger(+equipos.value) ||
        +equipos.value < 2 ||
        +equipos.value > 100)
        return "Los equipos deben estar entre 2 y 100.";

    if (!Number.isInteger(+dias.value) ||
        +dias.value < 1 ||
        +dias.value > 30)
        return "Los días deben estar entre 1 y 30.";

    if (!Number.isInteger(+diasAdicionales.value) ||
        +diasAdicionales.value < 0 ||
        +diasAdicionales.value > 30)
        return "Los días adicionales deben estar entre 0 y 30.";

    return "";
}


// FORMATO DE DINERO

function pesos(valor) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0
    }).format(Math.round(valor));
}

// GENERAR FACTURA

btnCalcular.addEventListener("click", () => {

    if (facturaGenerada) {
        alert("Esta factura ya fue generada. Usa 'Generar nueva factura'.");
        return;
    }

    const error = validar();

    if (error) {
        alert(error);
        return;
    }

    // ID automático
    const id = siguienteID();
    guardarID(id);
    idCliente.value = id;

    const eq = +equipos.value;
    const d = +dias.value;
    const da = +diasAdicionales.value;

    // Valores
    const inicial = eq * d * PRECIO;
    const adicionalBruto = eq * da * PRECIO;

    // 2% por día adicional, máximo 10%
    const descuentoPorcentaje = Math.min(da * 2, 10);
    const descuento = adicionalBruto * descuentoPorcentaje / 100;
    const adicionalFinal = adicionalBruto - descuento;

    let subtotal = inicial + adicionalFinal;
    let ajuste = 0;
    let textoAjuste = "Sin recargo ni descuento.";

    // Tipo de servicio
    if (opcion.value === "fuera") {
        ajuste = subtotal * 0.05;
        textoAjuste = `Recargo del 5%: ${pesos(ajuste)}`;
    }

    if (opcion.value === "establecimiento") {
        ajuste = -(subtotal * 0.05);
        textoAjuste = `Descuento del 5%: ${pesos(Math.abs(ajuste))}`;
    }

    const total = Math.max(0, subtotal + ajuste);

    const servicios = {
        ciudad: "Dentro de la ciudad",
        fuera: "Fuera de la ciudad",
        establecimiento: "Dentro del establecimiento"
    };

    // Mostrar información
    $("resultadoNombre").textContent = nombre.value;
    $("resultadoId").textContent = id;
    $("resultadoTelefono").textContent = telefono.value;
    $("resultadoEmail").textContent = email.value;

    $("resultadoOpcion").textContent = servicios[opcion.value];
    $("resultadoEquipos").textContent = eq;
    $("resultadoDias").textContent = d;
    $("resultadoAdicionales").textContent = da;
    $("resultadoTotalDias").textContent = d + da;

    $("resultadoInicial").textContent = pesos(inicial);
    $("resultadoAdicional").textContent = pesos(adicionalBruto);

    $("resultadoDescuento").textContent =
        `-${pesos(descuento)} (${descuentoPorcentaje}%)`;

    $("resultadoUbicacion").textContent = textoAjuste;
    $("resultadoTotal").textContent = pesos(total);

    // Mostrar factura
    factura.style.display = "block";
    facturaGenerada = true;

    btnCalcular.disabled = true;
    btnCalcular.style.opacity = "0.5";
    btnNuevaFactura.style.display = "inline-block";

    factura.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

// NUEVA FACTURA

btnNuevaFactura.addEventListener("click", () => {

    if (!confirm("¿Deseas generar una nueva factura?")) return;

    formulario.reset();
    idCliente.value = "";

    factura.style.display = "none";
    facturaGenerada = false;

    btnCalcular.disabled = false;
    btnCalcular.style.opacity = "1";
    btnNuevaFactura.style.display = "none";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    nombre.focus();
});

// LIMPIAR

btnLimpiar.addEventListener("click", () => {

    if (facturaGenerada) {
        alert("Usa 'Generar nueva factura' para comenzar otra.");
        return;
    }

    if (!confirm("¿Seguro que deseas borrar los datos?")) return;

    formulario.reset();
    idCliente.value = "";
});

// CONTROL DE CAMPOS

telefono.addEventListener("input", () => {
    telefono.value = telefono.value.replace(/\D/g, "").slice(0, 10);
});

equipos.addEventListener("input", () => {
    equipos.value = equipos.value.replace(/\D/g, "").slice(0, 3);
});

dias.addEventListener("input", () => {
    dias.value = dias.value.replace(/\D/g, "").slice(0, 2);
});

diasAdicionales.addEventListener("input", () => {
    diasAdicionales.value = diasAdicionales.value.replace(/\D/g, "").slice(0, 2);
});

email.addEventListener("blur", () => {
    email.value = email.value.trim().toLowerCase();
});

idCliente.readOnly = true;