import {
  LEGAL_CONTACT_EMAIL,
  LEGAL_CONTACT_PHONE,
  LEGAL_OPERATOR_NAME,
  TERMS_VERSION,
} from "@/lib/legal";

type AccountRole = "client" | "technician";

const sharedTerms = [
  {
    title: "1. Alcance del servicio",
    text: "TecniRed es una plataforma digital que permite publicar perfiles profesionales y facilitar el contacto entre clientes y técnicos independientes. Salvo que una condición particular diga expresamente lo contrario, TecniRed no es parte del contrato de reparación o servicio que acuerden entre sí el cliente y el técnico, no dirige su ejecución y no garantiza que se concrete.",
  },
  {
    title: "2. Cuenta y seguridad",
    text: "Debes tener al menos 18 años, proporcionar información exacta y mantener seguros tus datos de acceso. Eres responsable de la actividad realizada desde tu cuenta; avísanos si sospechas de un uso no autorizado. No suplantes a otra persona ni abras cuentas para cometer fraude.",
  },
  {
    title: "3. Uso permitido y contenido",
    text: "Usa la plataforma de forma lícita, respetuosa y segura. No publiques datos engañosos, contenido ajeno sin autorización, información sensible innecesaria, amenazas ni ofertas ilegales. Podemos ocultar contenido o suspender una cuenta cuando existan motivos razonables de fraude, riesgo, incumplimiento o mandato legal; comunicaremos el motivo cuando sea legal y razonablemente posible.",
  },
  {
    title: "4. Seguridad, calidad y límites",
    text: "La información de perfiles, reseñas y verificaciones ayuda a tomar decisiones, pero no constituye una garantía de identidad, licencia, calidad, disponibilidad, precio o resultado. La verificación se limita a los controles que TecniRed indique expresamente. Antes de contratar, confirma identidad, alcance, precio, materiales, plazos y condiciones; no compartas contraseñas, códigos bancarios ni información financiera innecesaria.",
  },
  {
    title: "5. Responsabilidad y derechos obligatorios",
    text: "Cada usuario responde por la exactitud de lo que publica y por sus propios acuerdos y actos. TecniRed responde por las obligaciones que le correspondan como operador de la plataforma y conforme a la ley aplicable. Nada en estos términos excluye o limita derechos de consumidores ni responsabilidades que legalmente no puedan excluirse. En lo demás, TecniRed no garantiza disponibilidad ininterrumpida ni resultados de acuerdos celebrados directamente entre usuarios.",
  },
  {
    title: "6. Disponibilidad y cambios",
    text: "Podemos mantener, modificar o interrumpir funciones por razones técnicas, de seguridad o legales, procurando informar los cambios relevantes. Si actualizamos estas condiciones, indicaremos la nueva versión y, cuando se requiera, solicitaremos aceptación antes de seguir usando las funciones afectadas.",
  },
  {
    title: "7. Ley aplicable y contacto",
    text: `Estos términos se interpretan conforme a las leyes de la República del Perú, respetando las reglas imperativas de protección al consumidor y demás derechos aplicables. Titular de TecniRed: ${LEGAL_OPERATOR_NAME}. Para consultas o reportar un problema, escribe a ${LEGAL_CONTACT_EMAIL} o llama al ${LEGAL_CONTACT_PHONE}.`,
  },
];

const roleTerms: Record<AccountRole, { title: string; sections: { title: string; text: string }[] }> = {
  client: {
    title: "Condiciones para clientes",
    sections: [
      {
        title: "8. Solicitudes y contratación",
        text: "La solicitud enviada por la plataforma es una invitación a coordinar, no una confirmación automática de contratación ni de precio. Antes de iniciar el trabajo, acuerda directamente con el técnico el diagnóstico, alcance, materiales, precio total, impuestos si corresponden, plazos, garantías ofrecidas y forma de pago. No pagues por servicios que no hayas acordado.",
      },
      {
        title: "9. Decisiones y reportes",
        text: "Evalúa las credenciales y condiciones del servicio antes de contratar. No ingreses a lugares ni entregues bienes si no te sientes seguro. Si detectas fraude, conducta peligrosa o incumplimiento en la plataforma, repórtalo a TecniRed; esto no reemplaza los canales legales o de emergencia disponibles.",
      },
    ],
  },
  technician: {
    title: "Condiciones adicionales para técnicos",
    sections: [
      {
        title: "8. Independencia profesional",
        text: "Te registras como profesional independiente. El uso de TecniRed no crea, por sí solo, relación laboral, sociedad, representación, franquicia ni exclusividad entre tú y TecniRed. Conservas autonomía para aceptar o rechazar solicitudes y eres responsable de organizar y ejecutar los trabajos que aceptes, sin perjuicio de las normas imperativas aplicables.",
      },
      {
        title: "9. Perfil, habilitaciones y ofertas",
        text: "Mantén actualizados tus datos, experiencia, especialidades, disponibilidad y precios orientativos. Solo afirma contar con licencias, certificaciones, seguros o experiencia que puedas acreditar; conserva las habilitaciones legalmente necesarias y cumple las normas de seguridad, tributarias y profesionales aplicables a tu actividad. No publiques información de clientes, empleadores o terceros sin autorización.",
      },
      {
        title: "10. Trabajos y trato a clientes",
        text: "Al aceptar un trabajo, confirma con el cliente el diagnóstico, alcance, materiales, precio final, plazos, condiciones de pago y garantías que ofrezcas. Ejecuta el trabajo con diligencia, informa oportunamente los cambios y no solicites claves, códigos de autenticación ni datos financieros ajenos a la coordinación del servicio. Eres responsable de tus compromisos y de las obligaciones que la ley te atribuya como proveedor.",
      },
    ],
  },
};

export default async function TermsPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo } = await searchParams;
  const role: AccountRole = tipo === "technician" ? "technician" : "client";
  const roleCopy = roleTerms[role];

  return (
    <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
        TecniRed · {role === "client" ? "Cuenta de cliente" : "Cuenta de técnico"}
      </p>
      <h1 className="mt-3 text-4xl font-black text-slate-900">Términos y condiciones</h1>
      <p className="mt-4 text-slate-600">
        Estas condiciones incluyen reglas generales y reglas adicionales para {role === "client" ? "clientes" : "técnicos"}.
        Léelas antes de crear tu cuenta.
      </p>
      <aside className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        Borrador preliminar: el titular aún debe confirmar su identificación tributaria y domicilio legal, y obtener revisión
        de un profesional legal en Perú. Estas condiciones no garantizan por sí solas el cumplimiento normativo ni eliminan
        responsabilidades que la ley atribuye al titular.
      </aside>

      <div className="mt-8 space-y-7">
        {[...sharedTerms, ...roleCopy.sections].map((section) => (
          <section key={section.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">{section.title}</h2>
            <p className="mt-3 leading-7 text-slate-600">{section.text}</p>
          </section>
        ))}
      </div>

      <p className="mt-8 border-t border-slate-200 pt-5 text-sm text-slate-500">
        Versión {TERMS_VERSION} · Publicada el 5 de octubre de 2026 · {roleCopy.title}
      </p>
    </article>
  );
}
