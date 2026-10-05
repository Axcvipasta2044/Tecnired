const steps = [
  { title: "Busca por necesidad", description: "Filtra por servicio, ciudad y presupuesto para encontrar a la persona adecuada." },
  { title: "Revisa perfiles", description: "Lee experiencia, certificados, reseñas y portafolio antes de contratar." },
  { title: "Coordina y resuelve", description: "Contacta al técnico y gestiona la solicitud con seguimiento claro desde la plataforma." },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Cómo funciona</p>
        <h1 className="mt-3 text-4xl font-black text-slate-900">Una experiencia simple para clientes y técnicos</h1>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step.title} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-lg font-black text-blue-700">
              {index + 1}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{step.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
