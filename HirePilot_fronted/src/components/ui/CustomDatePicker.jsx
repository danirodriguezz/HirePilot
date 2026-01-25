"use client"

import DatePicker, { registerLocale } from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { es } from "date-fns/locale/es" // Importar idioma español
import { format, parseISO } from "date-fns"

// Registramos el idioma español
registerLocale("es", es)

const CustomDatePicker = ({ 
  label, 
  value, 
  onChange, 
  showMonthYearPicker = true, // Por defecto para CVs es mejor solo Mes/Año
  placeholder = "Seleccionar fecha",
  minDate,
  maxDate
}) => {
  
  // Convertir string "YYYY-MM" o "YYYY-MM-DD" a objeto Date
  const getSelectedDate = () => {
    if (!value) return null
    // Si viene solo año-mes (2023-05) le añadimos el día 01 para que sea fecha válida
    const dateString = value.length === 7 ? `${value}-01` : value
    return parseISO(dateString)
  }

  // Manejar cambio: devolver string al padre
  const handleChange = (date) => {
    if (!date) {
      onChange(null)
      return
    }
    
    // Formatear según el modo
    const formatString = showMonthYearPicker ? "yyyy-MM" : "yyyy-MM-dd"
    onChange(format(date, formatString))
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <DatePicker
          selected={getSelectedDate()}
          onChange={handleChange}
          dateFormat={showMonthYearPicker ? "MM/yyyy" : "dd/MM/yyyy"}
          showMonthYearPicker={showMonthYearPicker}
          locale="es"
          placeholderText={placeholder}
          minDate={minDate}
          maxDate={maxDate}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer bg-white"
          wrapperClassName="w-full"
          showPopperArrow={false}
          isClearable
        />
        <div className="absolute right-7 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
          <i className="fas fa-calendar-alt"></i>
        </div>
      </div>
    </div>
  )
}

export default CustomDatePicker