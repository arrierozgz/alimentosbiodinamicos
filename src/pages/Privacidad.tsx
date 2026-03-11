import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Shield } from 'lucide-react';

export default function Privacidad() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-natural py-12 md:py-20">
          <div className="container max-w-3xl text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-semibold text-foreground mb-4">
              Política de Privacidad
            </h1>
            <p className="text-lg text-muted-foreground">
              Última actualización: 10 de marzo de 2026
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container max-w-3xl prose prose-lg text-muted-foreground">

            <h2 className="font-display text-2xl font-semibold text-foreground">1. Responsable del tratamiento</h2>
            <p>
              <strong>Alimentos Conscientes</strong> es un proyecto sin ánimo de lucro gestionado por particulares.
              Email de contacto: <a href="mailto:aragonbiodinamica@gmail.com" className="text-primary hover:underline">aragonbiodinamica@gmail.com</a>
            </p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">2. Datos que recogemos</h2>
            <p>Al registrarte y usar la plataforma, podemos recoger:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Datos de cuenta</strong>: nombre, email, contraseña (cifrada).</li>
              <li><strong>Datos de perfil público</strong>: nombre o nombre comercial, ubicación (localidad, provincia), descripción, productos ofrecidos, fotografías.</li>
              <li><strong>Datos de uso</strong>: mensajes entre usuarios dentro de la plataforma.</li>
            </ul>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">3. Finalidad del tratamiento</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Permitir el funcionamiento del directorio: que agricultores y consumidores puedan encontrarse.</li>
              <li>Facilitar la comunicación directa entre usuarios registrados.</li>
              <li>Enviar notificaciones por email relacionadas con mensajes recibidos en la plataforma.</li>
            </ul>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">4. Base legal</h2>
            <p>
              El tratamiento se basa en el <strong>consentimiento</strong> del usuario al registrarse y publicar voluntariamente sus datos en el directorio, 
              así como en el <strong>interés legítimo</strong> de mantener la plataforma operativa.
            </p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">5. Visibilidad de los datos</h2>
            <p>
              Al publicar tu perfil como agricultor, ganadero o elaborador, los siguientes datos serán <strong>visibles públicamente</strong> en el directorio: 
              nombre o nombre comercial, localidad, provincia, descripción y productos. 
              Tu email <strong>no se muestra públicamente</strong> — la comunicación se realiza a través del sistema de mensajería interna.
            </p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">6. Conservación de datos</h2>
            <p>
              Tus datos se conservan mientras mantengas tu cuenta activa. Puedes eliminar tu cuenta en cualquier momento, 
              lo que supone la eliminación de todos tus datos personales y contenido publicado.
            </p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">7. Portabilidad de datos</h2>
            <p>
              Desde tu perfil puedes <strong>descargar todos tus datos en formato JSON</strong> en cualquier momento. 
              Creemos que tus datos son tuyos y debes poder llevártelos.
            </p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">8. Tus derechos</h2>
            <p>Tienes derecho a:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Acceso</strong>: consultar qué datos tenemos sobre ti.</li>
              <li><strong>Rectificación</strong>: corregir datos inexactos desde tu perfil.</li>
              <li><strong>Supresión</strong>: eliminar tu cuenta y todos tus datos.</li>
              <li><strong>Portabilidad</strong>: descargar tus datos en formato estructurado (JSON).</li>
              <li><strong>Oposición</strong>: dejar de participar en el directorio en cualquier momento.</li>
            </ul>
            <p>
              Para ejercer estos derechos, escríbenos a <a href="mailto:aragonbiodinamica@gmail.com" className="text-primary hover:underline">aragonbiodinamica@gmail.com</a>.
            </p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">9. Cookies</h2>
            <p>
              Utilizamos únicamente <strong>cookies técnicas</strong> necesarias para el funcionamiento de la aplicación (sesión de usuario). 
              No utilizamos cookies de publicidad ni de seguimiento de terceros.
            </p>
            <p>
              Utilizamos <strong>Google Analytics</strong> para conocer estadísticas anónimas de uso del sitio. 
              Puedes desactivar Google Analytics con extensiones de navegador como <em>Google Analytics Opt-out</em>.
            </p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">10. Seguridad</h2>
            <p>
              Las contraseñas se almacenan cifradas. La comunicación se realiza a través de HTTPS. 
              No compartimos datos con terceros ni los usamos con fines comerciales.
            </p>

            <h2 className="font-display text-2xl font-semibold text-foreground mt-8">11. Cambios en esta política</h2>
            <p>
              Nos reservamos el derecho de actualizar esta política. Los cambios se publicarán en esta misma página con la fecha de actualización.
            </p>

          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
