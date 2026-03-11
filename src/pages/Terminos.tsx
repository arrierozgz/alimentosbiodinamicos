import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { FileText } from 'lucide-react';

export default function Terminos() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-natural py-12 md:py-20">
          <div className="container max-w-3xl text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-semibold text-foreground mb-4">
              Términos de Uso
            </h1>
            <p className="text-lg text-muted-foreground">
              Última actualización: 10 de marzo de 2026
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container max-w-3xl prose prose-lg text-muted-foreground">

            <h2 className="font-display text-2xl font-semibold text-foreground">1. Qué es Alimentos Conscientes</h2>
            <p>
              Alimentos Conscientes es un <strong>directorio gratuito y sin ánimo de lucro</strong> que facilita el encuentro directo 
              entre agricultores (agricultores, ganaderos, elaboradores) y consumidores de alimentos ecológicos, biodinámicos y de proximidad en España.
            </p>
            <p>
              <strong>No somos intermediarios</strong>. No vendemos productos, no gestionamos pagos ni envíos, 
              y no participamos en las transacciones entre usuarios. Solo proporcionamos la plataforma para que las personas se encuentren.
            </p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">2. Registro y cuenta</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>El registro es gratuito y voluntario.</li>
              <li>Debes proporcionar información veraz y mantenerla actualizada.</li>
              <li>Eres responsable de la seguridad de tu cuenta.</li>
              <li>Puedes eliminar tu cuenta en cualquier momento desde tu perfil.</li>
            </ul>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">3. Contenido publicado</h2>
            <p>Al publicar información en el directorio:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Declaras que la información es <strong>veraz y propia</strong>.</li>
              <li>Aceptas que tu perfil de agricultor será <strong>visible públicamente</strong>.</li>
              <li>No publicarás contenido ilegal, ofensivo, engañoso o que infrinja derechos de terceros.</li>
              <li>Las fotografías que subas deben ser tuyas o tener permiso para usarlas.</li>
            </ul>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">4. Uso de la mensajería</h2>
            <p>
              El sistema de mensajería interna es para facilitar el contacto entre usuarios con fines relacionados con el directorio. 
              No está permitido usarlo para spam, publicidad no solicitada o cualquier fin ajeno a la plataforma.
            </p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">5. Certificaciones y sellos</h2>
            <p>
              Los agricultores que indiquen certificaciones (Ecológico, Biodinámico, Demeter) son responsables de la veracidad de dicha información. 
              Alimentos Conscientes <strong>no verifica certificaciones</strong> — recomendamos a los consumidores solicitar la documentación 
              directamente al agricultor.
            </p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">6. Sin garantías comerciales</h2>
            <p>
              Al no ser intermediarios, <strong>no nos hacemos responsables</strong> de la calidad, precio, disponibilidad o entrega 
              de los productos ofrecidos por los agricultores. Cualquier relación comercial es exclusivamente entre el agricultor y el consumidor.
            </p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">7. Propiedad intelectual</h2>
            <p>
              El diseño, código y estructura de la plataforma son propiedad de Alimentos Conscientes. 
              Los contenidos publicados por los usuarios (textos, fotos) son propiedad de sus respectivos autores.
            </p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">8. Moderación</h2>
            <p>
              Nos reservamos el derecho de eliminar contenido o cuentas que incumplan estos términos, 
              sin previo aviso y a nuestra discreción.
            </p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">9. Modificaciones</h2>
            <p>
              Estos términos pueden actualizarse. Los cambios se publicarán en esta página con la fecha correspondiente. 
              El uso continuado de la plataforma implica la aceptación de los términos vigentes.
            </p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">10. Contacto</h2>
            <p>
              Para cualquier consulta sobre estos términos: <a href="mailto:aragonbiodinamica@gmail.com" className="text-primary hover:underline">aragonbiodinamica@gmail.com</a>
            </p>

          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
