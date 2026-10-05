import {
  LEGAL_CONTACT_EMAIL,
  LEGAL_CONTACT_PHONE,
  LEGAL_OPERATOR_NAME,
  PRIVACY_VERSION,
} from "@/lib/legal";

const sections = [
  {
    title: "Quién trata tus datos",
    text: `El titular que administra TecniRed es ${LEGAL_OPERATOR_NAME}. RUC y domicilio legal: pendientes de confirmar y publicar. Para consultas sobre privacidad, escribe a ${LEGAL_CONTACT_EMAIL} o llama al ${LEGAL_CONTACT_PHONE}. Este aviso es un borrador; el titular debe completar esos datos y confirmar las obligaciones aplicables a sus bancos de datos antes de ofrecer el servicio al público.`,
  },
  {
    title: "Qué información recopilamos",
    text: "Según las funciones que uses, podemos tratar nombre, correo, contraseña gestionada por el proveedor de autenticación, teléfono y ubicación; información profesional que publiques (experiencia, especialidad, servicios, foto y portafolio); solicitudes de servicio y comunicaciones necesarias para coordinarlas; reseñas, reportes y datos técnicos básicos de uso, seguridad y diagnóstico. No ingreses datos sensibles ni información de pago en campos de texto libre.",
  },
  {
    title: "Para qué la usamos y con quién se comparte",
    text: "Usamos los datos para crear y proteger cuentas, mostrar perfiles que el usuario decida publicar, conectar solicitudes con técnicos, prestar soporte, prevenir fraude y abuso, cumplir obligaciones legales y mantener la plataforma. La información de perfil que publiques será visible según las funciones públicas del sitio; los datos de contacto y solicitudes se comparten con la contraparte solo en la medida necesaria para las interacciones elegidas. Proveedores de infraestructura y autenticación pueden procesar datos para alojar y operar el servicio bajo sus condiciones y medidas de seguridad.",
  },
  {
    title: "Decisión de proporcionar datos y consecuencias",
    text: "Nombre, correo, contraseña y tipo de cuenta son necesarios para crear una cuenta. Si no los proporcionas, no podremos registrarte. La publicación de datos profesionales y de contacto en el perfil es opcional; sin la información mínima requerida, tu perfil puede no aparecer o no permitir que los clientes evalúen tus servicios.",
  },
  {
    title: "Conservación y transferencias",
    text: "La cuenta y sus datos se conservan mientras estén activos. Los plazos exactos posteriores al cierre, los proveedores y las regiones de alojamiento deben ser confirmados por el titular antes del lanzamiento; cuando un proveedor aloje datos fuera del Perú, el titular debe informar la transferencia y cumplir las garantías exigidas por la normativa. Al cerrar una cuenta, puede conservarse la constancia de aceptación hasta que ya no sea necesaria para obligaciones legales o para atender reclamos.",
  },
  {
    title: "Tus derechos y consultas",
    text: `Puedes solicitar acceso, actualización, inclusión, rectificación, supresión u oposición al tratamiento de tus datos, según corresponda, y retirar una autorización cuando esa sea la base aplicable, sin afectar el tratamiento anterior ni las bases legales distintas. Escribe a ${LEGAL_CONTACT_EMAIL} o llama al ${LEGAL_CONTACT_PHONE}, indicando tu solicitud y un medio razonable para verificar tu identidad. También puedes acudir a la Autoridad Nacional de Protección de Datos Personales si consideras que tus derechos no fueron atendidos.`,
  },
  {
    title: "Seguridad y cambios",
    text: "Aplicamos controles técnicos y organizativos razonables para proteger la información, aunque ningún servicio en internet puede garantizar seguridad absoluta. No compartas credenciales. Si actualizamos este aviso, publicaremos la nueva versión y solicitaremos una nueva confirmación cuando la ley lo exija.",
  },
];

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">TecniRed · Datos personales</p>
      <h1 className="mt-3 text-4xl font-black text-slate-900">Aviso de privacidad</h1>
      <p className="mt-4 text-slate-600">
        Este aviso explica cómo se usan los datos personales al crear una cuenta de cliente o técnico en TecniRed.
      </p>
      <aside className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        Borrador preliminar: el RUC, domicilio legal, plazos específicos de conservación y regiones de alojamiento están
        pendientes de confirmación por el titular. La aceptación de este aviso no sustituye el cumplimiento de las
        obligaciones de protección de datos personales en Perú.
      </aside>

      <div className="mt-8 space-y-5">
        {sections.map((section) => (
          <section key={section.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">{section.title}</h2>
            <p className="mt-3 leading-7 text-slate-600">{section.text}</p>
          </section>
        ))}
      </div>

      <p className="mt-8 border-t border-slate-200 pt-5 text-sm text-slate-500">
        Versión {PRIVACY_VERSION} · Publicada el 5 de octubre de 2026
      </p>
    </article>
  );
}
