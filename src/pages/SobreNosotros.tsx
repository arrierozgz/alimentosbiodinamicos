import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Users, Sprout, ShieldCheck, Leaf, ArrowRight } from 'lucide-react';

export default function SobreNosotros() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-natural py-12 md:py-20">
          <div className="container max-w-3xl text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Leaf className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-semibold text-foreground mb-4">
              Sobre Nosotros
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Somos una comunidad sin ánimo de lucro que conecta a personas que cultivan, 
              elaboran y consumen alimentos biodinámicos.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="py-12 md:py-16">
          <div className="container max-w-3xl">
            <h2 className="font-display text-2xl md:text-3xl font-semibold mb-6">
              ¿Por qué este proyecto?
            </h2>
            <div className="prose prose-lg text-muted-foreground space-y-4">
              <p>
                La agricultura biodinámica existe desde 1924, cuando Rudolf Steiner ofreció 
                su <strong>Curso Agrícola</strong> a un grupo de agricultores preocupados por 
                la degradación de los suelos y la calidad de los alimentos.
              </p>
              <p>
                Cien años después, encontrar alimentos biodinámicos sigue siendo difícil. 
                Los agricultores que practican esta forma de cultivo a menudo trabajan de 
                forma aislada, sin una forma sencilla de mostrar lo que producen. Y los 
                consumidores que buscan estos alimentos no saben a quién acudir.
              </p>
              <p>
                <strong>Alimentos Biodinámicos</strong> nace para resolver esto: un listín 
                sencillo, gratuito y sin comisiones donde agricultores, ganaderos y elaboradores 
                de preparados pueden darse a conocer, y donde cualquier persona puede 
                encontrarles.
              </p>
              <p>
                No vendemos nada. No intermediamos. Solo conectamos personas.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container max-w-4xl">
            <h2 className="font-display text-2xl md:text-3xl font-semibold mb-8 text-center">
              Nuestros valores
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  icon: Heart,
                  title: 'Sin ánimo de lucro',
                  text: 'Este proyecto no tiene dueño comercial. Es de todos y para todos. Sin comisiones, sin publicidad, sin datos vendidos.',
                },
                {
                  icon: Users,
                  title: 'Conexión directa',
                  text: 'Tú decides con quién hablas y cómo. Nosotros solo facilitamos el encuentro.',
                },
                {
                  icon: Sprout,
                  title: 'Respeto a la tierra',
                  text: 'La agricultura biodinámica no es un sello más. Es una forma de entender la relación entre el ser humano, la tierra y el cosmos.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Transparencia',
                  text: 'El código es abierto. Los datos son tuyos. Puedes exportarlos cuando quieras.',
                },
              ].map((value) => (
                <div key={value.title} className="p-6 rounded-2xl bg-card border border-border">
                  <value.icon className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-display text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Steiner */}
        <section className="py-12 md:py-16">
          <div className="container max-w-3xl">
            <h2 className="font-display text-2xl md:text-3xl font-semibold mb-6">
              Rudolf Steiner y la agricultura biodinámica
            </h2>
            <div className="prose prose-lg text-muted-foreground space-y-4">
              <p>
                En junio de 1924, Rudolf Steiner impartió ocho conferencias en Koberwitz 
                (hoy Kobierzyce, Polonia) que sentaron las bases de la agricultura biodinámica: 
                una forma de cultivar que ve la granja como un organismo vivo.
              </p>
              <p>
                Los <strong>preparados biodinámicos</strong> (500-508) son el corazón de este método: 
                sustancias naturales que vitalizan el suelo y las plantas, elaboradas siguiendo 
                los ritmos de la naturaleza.
              </p>
              <p>
                Hoy, la agricultura biodinámica se practica en más de 50 países. En España, 
                crece poco a poco gracias a agricultores comprometidos que buscan otra forma 
                de relacionarse con la tierra.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 md:py-16 bg-gradient-earth">
          <div className="container max-w-2xl text-center">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary-foreground mb-4">
              Únete a la comunidad
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-6">
              Ya seas agricultor, consumidor o elaborador de preparados, aquí tienes tu sitio.
            </p>
            <Link to="/auth">
              <Button 
                size="xl" 
                className="h-14 text-lg bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                Crear cuenta gratuita
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
