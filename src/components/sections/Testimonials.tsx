import { Card, CardContent } from '@/components/ui/Card'

export function Testimonials() {
  const testimonials = [
    {
      name: 'Jan de Vries',
      company: 'Bakkerij De Vries',
      rating: 5,
      text: 'Zeer tevreden met de service van PakketAdvies. Ze hebben ons geholpen om te besparen op onze energiekosten en het hele proces was simpel en transparant.',
    },
    {
      name: 'Maria Jansen',
      company: 'Kapsalon Elegance',
      rating: 5,
      text: 'Professionele begeleiding van begin tot eind. De adviseur nam de tijd om alles uit te leggen en we zijn nu zeer blij met ons nieuwe contract.',
    },
    {
      name: 'Peter Smit',
      company: 'Restaurant Het Anker',
      rating: 5,
      text: 'Enorme besparing gerealiseerd! PakketAdvies vond een contract dat perfect bij ons bedrijf past. Aanrader voor elke ondernemer.',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-navy-500 mb-4">
            Wat onze klanten over ons zeggen
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Ontdek waarom meer dan 500 bedrijven ons vertrouwen
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="pt-8">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-warning-500 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Testimonial text */}
                <p className="text-gray-500 mb-6 italic">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="font-semibold text-brand-navy-500">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-500">{testimonial.company}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

