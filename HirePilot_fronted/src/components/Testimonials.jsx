"use client"

import { useState, useEffect, useRef } from "react"

// Componente individual de carta de testimonio
const TestimonialCard = ({ testimonial, index, isVisible }) => {
  return (
    <div
      className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Header con estrellas y fecha */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1">
          {[...Array(testimonial.rating)].map((_, i) => (
            <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.602-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        {testimonial.date && <span className="text-sm text-gray-400">{testimonial.date}</span>}
      </div>

      {/* Contenido del testimonio */}
      <blockquote className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.content}"</blockquote>

      {/* Información del autor */}
      <div className="flex items-center gap-4">
        <div className="relative">
          {testimonial.avatar ? (
            <img
              src={testimonial.avatar || "/placeholder.svg"}
              alt={testimonial.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-emerald-100"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {testimonial.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)}
            </div>
          )}
          {testimonial.verified && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
          <p className="text-sm text-gray-500">{testimonial.position}</p>
          {testimonial.company && <p className="text-sm text-emerald-600 font-medium">{testimonial.company}</p>}
        </div>

        {/* Botón de acción opcional */}
        {testimonial.linkedIn && (
          <a
            href={testimonial.linkedIn}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-emerald-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        )}
      </div>

      {/* Categoría o etiqueta */}
      {testimonial.category && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {testimonial.category}
          </span>
        </div>
      )}
    </div>
  )
}

// Componente principal de testimonios
const TestimonialCards = ({
  testimonials = [],
  title = "Lo que dicen nuestros clientes",
  subtitle = "Testimonios reales de profesionales que han transformado su carrera",
  columns = 3,
  showNavigation = false,
  autoplay = false,
  autoplayInterval = 5000,
}) => {
  const [visibleCards, setVisibleCards] = useState(new Set())
  const [currentSlide, setCurrentSlide] = useState(0)
  const containerRef = useRef(null)
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 0)

  // Intersection Observer para animaciones
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number.parseInt(entry.target.dataset.index)
            setVisibleCards((prev) => new Set([...prev, index]))
          }
        })
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    )

    const cards = containerRef.current?.querySelectorAll("[data-index]")
    cards?.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [testimonials])

  // Autoplay para carrusel
  useEffect(() => {
    if (autoplay && testimonials.length > columns) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev >= testimonials.length - columns ? 0 : prev + 1))
      }, autoplayInterval)

      return () => clearInterval(interval)
    }
  }, [autoplay, autoplayInterval, testimonials.length, columns])

  // Trackeador del ancho de pantalla
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Navegación del carrusel
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev >= testimonials.length - columns - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev <= 0 ? testimonials.length - columns - 1 : prev - 1))
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  if (!testimonials.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay testimonios disponibles</p>
      </div>
    )
  }

  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-gray-50 to-white" id="testimonios">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>
        </div>

        {/* Testimonials Grid/Carousel */}
        <div ref={containerRef} className="relative">
          {showNavigation && testimonials.length > columns && windowWidth > 900 ? (
            // Modo Carrusel
            <div className="relative overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentSlide * (100 / columns)}%)`,
                  width: `${(testimonials.length / columns) * 100}%`,
                }}
              >
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    data-index={index}
                    className="flex-shrink-0 px-4"
                    style={{ width: `${100 / testimonials.length}%` }}
                  >
                    <TestimonialCard testimonial={testimonial} index={index} isVisible={visibleCards.has(index)} />
                  </div>
                ))}
              </div>

              {/* Controles de navegación */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Indicadores */}
              <div className="flex justify-center mt-8 gap-2">
                {Array.from({ length: testimonials.length - columns }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      currentSlide === index ? "bg-emerald-600 scale-110" : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            // Modo Grid
            <div className={`grid ${gridCols[columns]} gap-8`}>
              {testimonials.slice(0, 4).map((testimonial, index) => (
                <div key={index} data-index={index}>
                  <TestimonialCard testimonial={testimonial} index={index} isVisible={visibleCards.has(index)} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Estadísticas opcionales */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-emerald-600">98%</div>
            <div className="text-gray-600">Satisfacción</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-emerald-600">5,000+</div>
            <div className="text-gray-600">Clientes</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-emerald-600">4.9/5</div>
            <div className="text-gray-600">Valoración</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-emerald-600">85%</div>
            <div className="text-gray-600">Más entrevistas</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialCards
