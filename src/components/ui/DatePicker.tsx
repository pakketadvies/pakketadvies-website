'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar, X } from '@phosphor-icons/react'
import { format, parse, isValid, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, getDay } from 'date-fns'

interface DatePickerProps {
  value?: string
  onChange: (value: string) => void
  error?: string
  label?: string
  placeholder?: string
  required?: boolean
}

const MONTHS = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december'
]

export function DatePicker({ value, onChange, error, label, placeholder = 'dd-mm-jjjj', required }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value || '')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [focusedDate, setFocusedDate] = useState<Date | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Parse initial value
  useEffect(() => {
    if (value) {
      const parsed = parseDateInput(value)
      if (parsed) {
        setSelectedDate(parsed)
        setInputValue(formatDateForInput(parsed))
      } else {
        setInputValue(value)
      }
    }
  }, [value])

  // Close calendar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Parse various date formats
  function parseDateInput(input: string): Date | null {
    if (!input) return null

    // Remove spaces and normalize
    const cleaned = input.trim().replace(/\s+/g, '')

    // Try different formats: dd-mm-yyyy, d-m-yyyy, dd-m-yyyy, d-mm-yyyy
    const patterns = [
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/,
    ]

    for (const pattern of patterns) {
      const match = cleaned.match(pattern)
      if (match) {
        const day = parseInt(match[1], 10)
        const month = parseInt(match[2], 10) - 1
        const year = parseInt(match[3], 10)
        const date = new Date(year, month, day)
        if (isValid(date) && date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
          return date
        }
      }
    }

    return null
  }

  // Format date for input (dd-mm-yyyy)
  function formatDateForInput(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  }

  // Format date for display (18 juli 1992)
  function formatDateForDisplay(date: Date): string {
    const day = date.getDate()
    const month = MONTHS[date.getMonth()]
    const year = date.getFullYear()
    return `${day} ${month} ${year}`
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value
    setInputValue(newValue)

    const parsed = parseDateInput(newValue)
    if (parsed) {
      setSelectedDate(parsed)
      setCurrentMonth(parsed)
      onChange(formatDateForInput(parsed))
    } else if (newValue === '') {
      setSelectedDate(null)
      onChange('')
    }
  }

  function handleInputBlur() {
    if (inputValue && selectedDate) {
      // Format properly on blur
      setInputValue(formatDateForInput(selectedDate))
    }
  }

  function handleDateSelect(date: Date) {
    setSelectedDate(date)
    setInputValue(formatDateForInput(date))
    onChange(formatDateForInput(date))
    setIsOpen(false)
    inputRef.current?.blur()
  }

  function handleClear() {
    setInputValue('')
    setSelectedDate(null)
    onChange('')
    setIsOpen(false)
  }

  // Calendar navigation
  function goToPreviousMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  function goToNextMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  function goToToday() {
    const today = new Date()
    setCurrentMonth(today)
    handleDateSelect(today)
  }

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = new Date(monthStart)
  calendarStart.setDate(calendarStart.getDate() - calendarStart.getDay()) // Start from Sunday
  const calendarEnd = new Date(monthEnd)
  calendarEnd.setDate(calendarEnd.getDate() + (6 - calendarEnd.getDay())) // End on Saturday

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const weekDays = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pr-10 border-2 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-brand-teal-500 focus:border-brand-teal-500 ${
            error
              ? 'border-red-300 bg-red-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X weight="bold" className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-brand-teal-600 hover:text-brand-teal-700 transition-colors"
          >
            <Calendar weight="duotone" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}

      {selectedDate && !error && (
        <p className="text-xs text-gray-600 mt-1">
          {formatDateForDisplay(selectedDate)}
        </p>
      )}

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl p-4 w-full max-w-sm">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-center">
              <div className="font-semibold text-brand-navy-500">
                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </div>
            </div>
            <button
              type="button"
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-gray-600 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const isCurrentMonth = isSameMonth(day, currentMonth)
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const isTodayDate = isToday(day)
              const isFocused = focusedDate && isSameDay(day, focusedDate)

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  onFocus={() => setFocusedDate(day)}
                  className={`
                    aspect-square p-1 text-sm rounded-lg transition-all
                    ${!isCurrentMonth ? 'text-gray-300' : ''}
                    ${isTodayDate && !isSelected ? 'bg-brand-teal-50 font-semibold text-brand-teal-600' : ''}
                    ${isSelected ? 'bg-brand-teal-500 text-white font-semibold' : ''}
                    ${!isSelected && isCurrentMonth && !isTodayDate ? 'hover:bg-gray-100 text-gray-700' : ''}
                    ${isFocused ? 'ring-2 ring-brand-teal-500' : ''}
                  `}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>

          {/* Today Button */}
          <button
            type="button"
            onClick={goToToday}
            className="w-full mt-3 py-2 text-sm font-medium text-brand-teal-600 hover:bg-brand-teal-50 rounded-lg transition-colors"
          >
            Vandaag
          </button>
        </div>
      )}
    </div>
  )
}

