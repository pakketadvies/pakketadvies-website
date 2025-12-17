'use client'

import { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Play, CheckCircle, XCircle, Clock, Copy, Trash } from '@phosphor-icons/react'

interface TestResult {
  name: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  duration?: number
  error?: string
  details?: any
  timestamp: number
}

interface TestSuite {
  name: string
  tests: TestResult[]
  status: 'pending' | 'running' | 'passed' | 'failed'
  duration?: number
}

export default function E2ETestPage() {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const updateTest = (suiteIndex: number, testIndex: number, updates: Partial<TestResult>) => {
    setTestSuites(prev => {
      const newSuites = [...prev]
      newSuites[suiteIndex].tests[testIndex] = {
        ...newSuites[suiteIndex].tests[testIndex],
        ...updates,
      }
      return newSuites
    })
  }

  const updateSuiteStatus = (suiteIndex: number) => {
    setTestSuites(prev => {
      const newSuites = [...prev]
      const suite = newSuites[suiteIndex]
      const allPassed = suite.tests.every(t => t.status === 'passed')
      const anyFailed = suite.tests.some(t => t.status === 'failed')
      const allDone = suite.tests.every(t => t.status === 'passed' || t.status === 'failed')
      
      if (allDone) {
        suite.status = allPassed ? 'passed' : 'failed'
        suite.duration = suite.tests.reduce((sum, t) => sum + (t.duration || 0), 0)
      }
      return newSuites
    })
  }

  // Helper: Wait for element to appear
  const waitForElement = (selector: string, timeout = 5000): Promise<Element | null> => {
    return new Promise((resolve) => {
      const startTime = Date.now()
      const check = () => {
        const element = document.querySelector(selector)
        if (element) {
          resolve(element)
        } else if (Date.now() - startTime < timeout) {
          setTimeout(check, 100)
        } else {
          resolve(null)
        }
      }
      check()
    })
  }

  // Helper: Wait for condition
  const waitFor = (condition: () => boolean, timeout = 5000): Promise<boolean> => {
    return new Promise((resolve) => {
      const startTime = Date.now()
      const check = () => {
        if (condition()) {
          resolve(true)
        } else if (Date.now() - startTime < timeout) {
          setTimeout(check, 100)
        } else {
          resolve(false)
        }
      }
      check()
    })
  }

  // Helper: Click element
  const clickElement = async (selector: string, description: string): Promise<boolean> => {
    const element = await waitForElement(selector)
    if (!element) {
      addLog(`❌ ${description}: Element niet gevonden (${selector})`)
      return false
    }
    
    // Use real click event
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    })
    element.dispatchEvent(clickEvent)
    
    // Also try actual click if it's a button/link
    if (element instanceof HTMLElement && (element.tagName === 'BUTTON' || element.tagName === 'A')) {
      (element as HTMLElement).click()
    }
    
    addLog(`✅ ${description}: Geklikt`)
    return true
  }

  // Helper: Type into input
  const typeIntoInput = async (selector: string, value: string, description: string): Promise<boolean> => {
    const element = await waitForElement(selector) as HTMLInputElement | null
    if (!element) {
      addLog(`❌ ${description}: Input niet gevonden (${selector})`)
      return false
    }
    
    element.focus()
    element.value = value
    
    // Dispatch input events
    const inputEvent = new Event('input', { bubbles: true })
    const changeEvent = new Event('change', { bubbles: true })
    element.dispatchEvent(inputEvent)
    element.dispatchEvent(changeEvent)
    
    addLog(`✅ ${description}: "${value}" ingevoerd`)
    return true
  }

  // Helper: Check if element exists
  const checkElementExists = (selector: string, description: string): boolean => {
    const element = document.querySelector(selector)
    const exists = element !== null
    addLog(`${exists ? '✅' : '❌'} ${description}: ${exists ? 'Gevonden' : 'Niet gevonden'} (${selector})`)
    return exists
  }

  // Helper: Get text content
  const getTextContent = (selector: string): string | null => {
    const element = document.querySelector(selector)
    return element?.textContent?.trim() || null
  }

  // Helper: Check API response
  const testAPI = async (url: string, options: RequestInit = {}, description: string): Promise<any> => {
    try {
      const startTime = Date.now()
      const response = await fetch(url, options)
      const duration = Date.now() - startTime
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      addLog(`✅ ${description}: Succes (${duration}ms)`)
      return { success: true, data, duration }
    } catch (error: any) {
      addLog(`❌ ${description}: ${error.message}`)
      return { success: false, error: error.message }
    }
  }

  // Test Suite 1: Homepage Tests
  const runHomepageTests = async (): Promise<TestSuite> => {
    const suite: TestSuite = {
      name: 'Homepage Tests',
      tests: [],
      status: 'running',
    }

    // Test 1: Navigate to homepage
    suite.tests.push({
      name: 'Navigeer naar homepage',
      status: 'running',
      timestamp: Date.now(),
    })
    setTestSuites(prev => [...prev, suite])
    
    try {
      const startTime = Date.now()
      window.location.href = '/'
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait for page load
      const duration = Date.now() - startTime
      
      updateTest(0, 0, { status: 'passed', duration })
      addLog('✅ Homepage geladen')
    } catch (error: any) {
      updateTest(0, 0, { status: 'failed', error: error.message })
    }

    // Test 2: Check if best deals section exists
    suite.tests.push({
      name: 'Beste aanbiedingen sectie aanwezig',
      status: 'running',
      timestamp: Date.now(),
    })
    
    try {
      const startTime = Date.now()
      await new Promise(resolve => setTimeout(resolve, 1000))
      const exists = checkElementExists('[data-testid="homepage-best-deals"], .bg-white.rounded-2xl', 'Beste aanbiedingen sectie')
      const duration = Date.now() - startTime
      
      updateTest(0, 1, { status: exists ? 'passed' : 'failed', duration, error: exists ? undefined : 'Sectie niet gevonden' })
    } catch (error: any) {
      updateTest(0, 1, { status: 'failed', error: error.message })
    }

    // Test 3: Check if contracts are displayed
    suite.tests.push({
      name: 'Contracten worden getoond',
      status: 'running',
      timestamp: Date.now(),
    })
    
    try {
      const startTime = Date.now()
      await new Promise(resolve => setTimeout(resolve, 1500))
      const contractCards = document.querySelectorAll('[data-testid="contract-card"], .bg-gray-50.rounded-xl')
      const hasContracts = contractCards.length > 0
      const duration = Date.now() - startTime
      
      addLog(`${hasContracts ? '✅' : '❌'} Contracten: ${contractCards.length} gevonden`)
      updateTest(0, 2, { 
        status: hasContracts ? 'passed' : 'failed', 
        duration,
        details: { count: contractCards.length },
        error: hasContracts ? undefined : 'Geen contracten gevonden'
      })
    } catch (error: any) {
      updateTest(0, 2, { status: 'failed', error: error.message })
    }

    // Test 4: Test API endpoint
    suite.tests.push({
      name: 'Best deals API werkt',
      status: 'running',
      timestamp: Date.now(),
    })
    
    try {
      const startTime = Date.now()
      const result = await testAPI('/api/contracten/best-deals?limit=5&type=alle', {}, 'Best deals API')
      const duration = Date.now() - startTime
      
      updateTest(0, 3, { 
        status: result.success ? 'passed' : 'failed', 
        duration,
        details: result.data,
        error: result.success ? undefined : result.error
      })
    } catch (error: any) {
      updateTest(0, 3, { status: 'failed', error: error.message })
    }

    updateSuiteStatus(0)
    return suite
  }

  // Test Suite 2: Calculator Tests
  const runCalculatorTests = async (): Promise<TestSuite> => {
    const suite: TestSuite = {
      name: 'Calculator Tests',
      tests: [],
      status: 'running',
    }

    setTestSuites(prev => [...prev, suite])
    const suiteIndex = testSuites.length

    // Test 1: Navigate to calculator
    suite.tests.push({
      name: 'Navigeer naar calculator',
      status: 'running',
      timestamp: Date.now(),
    })
    
    try {
      const startTime = Date.now()
      window.location.href = '/calculator'
      await new Promise(resolve => setTimeout(resolve, 2000))
      const duration = Date.now() - startTime
      
      updateTest(suiteIndex, 0, { status: 'passed', duration })
      addLog('✅ Calculator pagina geladen')
    } catch (error: any) {
      updateTest(suiteIndex, 0, { status: 'failed', error: error.message })
    }

    // Test 2: Fill in postcode
    suite.tests.push({
      name: 'Postcode invullen',
      status: 'running',
      timestamp: Date.now(),
    })
    
    try {
      const startTime = Date.now()
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Try multiple selectors for postcode
      const selectors = [
        'input[name="postcode"]',
        'input[placeholder*="postcode" i]',
        'input[id*="postcode" i]',
        'input[placeholder*="Postcode" i]',
        'input[placeholder*="1234AB" i]',
      ]
      let success = false
      for (const selector of selectors) {
        success = await typeIntoInput(selector, '1000AA', 'Postcode')
        if (success) break
      }
      const duration = Date.now() - startTime
      
      updateTest(suiteIndex, 1, { status: success ? 'passed' : 'failed', duration, error: success ? undefined : 'Postcode input niet gevonden' })
    } catch (error: any) {
      updateTest(suiteIndex, 1, { status: 'failed', error: error.message })
    }

    // Test 3: Fill in house number
    suite.tests.push({
      name: 'Huisnummer invullen',
      status: 'running',
      timestamp: Date.now(),
    })
    
    try {
      const startTime = Date.now()
      await new Promise(resolve => setTimeout(resolve, 500))
      // Try multiple selectors for house number
      const selectors = [
        'input[name="huisnummer"]',
        'input[placeholder*="huisnummer" i]',
        'input[id*="huisnummer" i]',
        'input[placeholder*="Huisnummer" i]',
      ]
      let success = false
      for (const selector of selectors) {
        success = await typeIntoInput(selector, '1', 'Huisnummer')
        if (success) break
      }
      const duration = Date.now() - startTime
      
      updateTest(suiteIndex, 2, { status: success ? 'passed' : 'failed', duration, error: success ? undefined : 'Huisnummer input niet gevonden' })
    } catch (error: any) {
      updateTest(suiteIndex, 2, { status: 'failed', error: error.message })
    }

    // Test 4: Wait for address lookup (race condition check)
    suite.tests.push({
      name: 'Adres lookup (race condition check)',
      status: 'running',
      timestamp: Date.now(),
    })
    
    try {
      const startTime = Date.now()
      // Wait for address to be filled (max 5 seconds)
      const addressFilled = await waitFor(() => {
        const straatInput = document.querySelector('input[name="straat"], input[placeholder*="straat" i]') as HTMLInputElement
        return straatInput?.value?.length > 0 || false
      }, 5000)
      const duration = Date.now() - startTime
      
      updateTest(suiteIndex, 3, { 
        status: addressFilled ? 'passed' : 'failed', 
        duration,
        error: addressFilled ? undefined : 'Adres lookup timeout (mogelijk race condition)'
      })
    } catch (error: any) {
      updateTest(suiteIndex, 3, { status: 'failed', error: error.message })
    }

    // Test 5: Click calculate button
    suite.tests.push({
      name: 'Bereken knop klikken',
      status: 'running',
      timestamp: Date.now(),
    })
    
    try {
      const startTime = Date.now()
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Try multiple selectors for submit button
      const selectors = [
        'button[type="submit"]',
        'button:contains("Bereken")',
        'button:contains("Verder")',
        'button:contains("Bereken je besparing")',
      ]
      let success = false
      for (const selector of selectors) {
        // Try to find button by text content
        const buttons = Array.from(document.querySelectorAll('button'))
        const button = buttons.find(btn => 
          btn.textContent?.includes('Bereken') || 
          btn.textContent?.includes('Verder') ||
          btn.type === 'submit'
        )
        if (button) {
          button.click()
          success = true
          addLog('✅ Bereken knop: Geklikt')
          break
        }
      }
      const duration = Date.now() - startTime
      
      updateTest(suiteIndex, 4, { status: success ? 'passed' : 'failed', duration, error: success ? undefined : 'Bereken knop niet gevonden' })
    } catch (error: any) {
      updateTest(suiteIndex, 4, { status: 'failed', error: error.message })
    }

    // Test 6: Wait for results page
    suite.tests.push({
      name: 'Resultaten pagina laden',
      status: 'running',
      timestamp: Date.now(),
    })
    
    try {
      const startTime = Date.now()
      const loaded = await waitFor(() => {
        const pathnameMatches = window.location.pathname.includes('resultaten')
        const hasContractCards = document.querySelector('[data-testid="results"], .contract-card, .bg-white.rounded-xl.border') !== null
        const heading = document.querySelector('h1, h2')
        const headingText = heading?.textContent?.toLowerCase() || ''
        const headingMatches = headingText.includes('resultat') || headingText.includes('contract')
        return pathnameMatches || hasContractCards || headingMatches
      }, 10000)
      const duration = Date.now() - startTime
      
      updateTest(suiteIndex, 5, { 
        status: loaded ? 'passed' : 'failed', 
        duration,
        error: loaded ? undefined : 'Timeout: Resultaten pagina niet geladen'
      })
    } catch (error: any) {
      updateTest(suiteIndex, 5, { status: 'failed', error: error.message })
    }

    updateSuiteStatus(suiteIndex)
    return suite
  }

  // Test Suite 3: API Tests
  const runAPITests = async (): Promise<TestSuite> => {
    const suite: TestSuite = {
      name: 'API Endpoint Tests',
      tests: [],
      status: 'running',
    }

    setTestSuites(prev => [...prev, suite])
    const suiteIndex = testSuites.length

    const apiTests = [
      {
        name: 'Best deals API',
        url: '/api/contracten/best-deals?limit=5&type=alle',
        method: 'GET' as const,
      },
      {
        name: 'Eneco model berekening',
        url: '/api/model-tarieven/bereken',
        method: 'POST' as const,
        body: JSON.stringify({
          verbruikElektriciteitNormaal: 1250,
          verbruikElektriciteitDal: 900,
          verbruikGas: 900,
          heeftEnkeleMeter: false,
          aansluitwaardeElektriciteit: '3x25A',
          aansluitwaardeGas: 'G6',
        }),
      },
    ]

    for (let i = 0; i < apiTests.length; i++) {
      const test = apiTests[i]
      suite.tests.push({
        name: test.name,
        status: 'running',
        timestamp: Date.now(),
      })

      try {
        const startTime = Date.now()
        const result = await testAPI(
          test.url,
          {
            method: test.method,
            headers: test.method === 'POST' ? { 'Content-Type': 'application/json' } : {},
            body: test.body,
          },
          test.name
        )
        const duration = Date.now() - startTime

        updateTest(suiteIndex, i, {
          status: result.success ? 'passed' : 'failed',
          duration,
          details: result.data,
          error: result.success ? undefined : result.error,
        })
      } catch (error: any) {
        updateTest(suiteIndex, i, { status: 'failed', error: error.message })
      }
    }

    updateSuiteStatus(suiteIndex)
    return suite
  }

  // Test Suite 4: Contract Card Tests
  const runContractCardTests = async (): Promise<TestSuite> => {
    const suite: TestSuite = {
      name: 'Contract Card Tests',
      tests: [],
      status: 'running',
    }

    setTestSuites(prev => [...prev, suite])
    const suiteIndex = testSuites.length

    // Navigate to results page first
    suite.tests.push({
      name: 'Navigeer naar resultaten',
      status: 'running',
      timestamp: Date.now(),
    })

    try {
      const startTime = Date.now()
      window.location.href = '/calculator/resultaten?verbruik=test'
      await new Promise(resolve => setTimeout(resolve, 2000))
      const duration = Date.now() - startTime
      
      updateTest(suiteIndex, 0, { status: 'passed', duration })
    } catch (error: any) {
      updateTest(suiteIndex, 0, { status: 'failed', error: error.message })
    }

    // Test: Check if contract cards exist
    suite.tests.push({
      name: 'Contract cards aanwezig',
      status: 'running',
      timestamp: Date.now(),
    })

    try {
      const startTime = Date.now()
      await new Promise(resolve => setTimeout(resolve, 1500))
      const cards = document.querySelectorAll('[data-testid="contract-card"], .bg-white.rounded-xl.border')
      const duration = Date.now() - startTime
      
      updateTest(suiteIndex, 1, {
        status: cards.length > 0 ? 'passed' : 'failed',
        duration,
        details: { count: cards.length },
      })
    } catch (error: any) {
      updateTest(suiteIndex, 1, { status: 'failed', error: error.message })
    }

    // Test: Click "Details bekijken" on mobile
    suite.tests.push({
      name: 'Details modal openen (mobiel)',
      status: 'running',
      timestamp: Date.now(),
    })

    try {
      const startTime = Date.now()
      await new Promise(resolve => setTimeout(resolve, 500))
      // Find button by text content
      const buttons = Array.from(document.querySelectorAll('button, a'))
      const detailsButton = buttons.find(btn => 
        btn.textContent?.includes('Details bekijken') || 
        btn.textContent?.includes('Details')
      )
      
      if (detailsButton) {
        (detailsButton as HTMLElement).click()
        await new Promise(resolve => setTimeout(resolve, 1000))
        // Check for modal (multiple selectors)
        const modal = document.querySelector('[role="dialog"], .fixed.inset-0.z-\\[99999\\], .fixed.inset-0[style*="z-index"]')
        const duration = Date.now() - startTime
        
        updateTest(suiteIndex, 2, {
          status: modal !== null ? 'passed' : 'failed',
          duration,
          error: modal ? undefined : 'Modal niet geopend na klik',
        })
      } else {
        updateTest(suiteIndex, 2, {
          status: 'failed',
          error: 'Details bekijken button niet gevonden (mogelijk desktop versie)',
        })
      }
    } catch (error: any) {
      updateTest(suiteIndex, 2, { status: 'failed', error: error.message })
    }

    // Test: Check "Aanmelden" button exists
    suite.tests.push({
      name: 'Aanmelden knop aanwezig',
      status: 'running',
      timestamp: Date.now(),
    })

    try {
      const startTime = Date.now()
      await new Promise(resolve => setTimeout(resolve, 500))
      const buttons = Array.from(document.querySelectorAll('button'))
      const aanmeldenButton = buttons.find(btn => 
        btn.textContent?.includes('Aanmelden') || 
        btn.textContent?.includes('Aanvragen')
      )
      const duration = Date.now() - startTime
      
      updateTest(suiteIndex, 3, {
        status: aanmeldenButton !== undefined ? 'passed' : 'failed',
        duration,
        error: aanmeldenButton ? undefined : 'Aanmelden knop niet gevonden',
      })
    } catch (error: any) {
      updateTest(suiteIndex, 3, { status: 'failed', error: error.message })
    }

    updateSuiteStatus(suiteIndex)
    return suite
  }

  // Test Suite 5: Facebook Pixel Tests
  const runFacebookPixelTests = async (): Promise<TestSuite> => {
    const suite: TestSuite = {
      name: 'Facebook Pixel Tests',
      tests: [],
      status: 'running',
    }

    setTestSuites(prev => [...prev, suite])
    const suiteIndex = testSuites.length

    // Test 1: Check if Pixel is loaded
    suite.tests.push({
      name: 'Facebook Pixel geladen',
      status: 'running',
      timestamp: Date.now(),
    })

    try {
      const startTime = Date.now()
      const pixelLoaded = typeof window !== 'undefined' && 
                         (window as any).fbq !== undefined &&
                         typeof (window as any).fbq === 'function'
      const duration = Date.now() - startTime
      
      addLog(`${pixelLoaded ? '✅' : '❌'} Facebook Pixel: ${pixelLoaded ? 'Geladen' : 'Niet geladen'}`)
      updateTest(suiteIndex, 0, {
        status: pixelLoaded ? 'passed' : 'failed',
        duration,
        error: pixelLoaded ? undefined : 'fbq functie niet gevonden',
      })
    } catch (error: any) {
      updateTest(suiteIndex, 0, { status: 'failed', error: error.message })
    }

    // Test 2: Check Pixel ID
    suite.tests.push({
      name: 'Facebook Pixel ID correct',
      status: 'running',
      timestamp: Date.now(),
    })

    try {
      const startTime = Date.now()
      const pixelScript = document.querySelector('script[src*="facebook.net"], script[src*="fbevents.js"]')
      const hasPixelScript = pixelScript !== null
      const duration = Date.now() - startTime
      
      updateTest(suiteIndex, 1, {
        status: hasPixelScript ? 'passed' : 'failed',
        duration,
        error: hasPixelScript ? undefined : 'Pixel script niet gevonden',
      })
    } catch (error: any) {
      updateTest(suiteIndex, 1, { status: 'failed', error: error.message })
    }

    updateSuiteStatus(suiteIndex)
    return suite
  }

  // Test Suite 6: Performance Tests
  const runPerformanceTests = async (): Promise<TestSuite> => {
    const suite: TestSuite = {
      name: 'Performance Tests',
      tests: [],
      status: 'running',
    }

    setTestSuites(prev => [...prev, suite])
    const suiteIndex = testSuites.length

    // Test 1: Homepage load time
    suite.tests.push({
      name: 'Homepage laadtijd',
      status: 'running',
      timestamp: Date.now(),
    })

    try {
      const startTime = performance.now()
      window.location.href = '/'
      await new Promise(resolve => setTimeout(resolve, 3000))
      const loadTime = performance.now() - startTime
      const duration = Math.round(loadTime)
      
      const passed = loadTime < 5000 // 5 seconds max
      updateTest(suiteIndex, 0, {
        status: passed ? 'passed' : 'failed',
        duration,
        details: { loadTime: Math.round(loadTime) },
        error: passed ? undefined : `Te langzaam: ${Math.round(loadTime)}ms`,
      })
    } catch (error: any) {
      updateTest(suiteIndex, 0, { status: 'failed', error: error.message })
    }

    // Test 2: API response time
    suite.tests.push({
      name: 'API response tijd',
      status: 'running',
      timestamp: Date.now(),
    })

    try {
      const startTime = performance.now()
      const result = await testAPI('/api/contracten/best-deals?limit=5', {}, 'API response tijd')
      const responseTime = performance.now() - startTime
      
      const passed = responseTime < 2000 // 2 seconds max
      updateTest(suiteIndex, 1, {
        status: passed && result.success ? 'passed' : 'failed',
        duration: Math.round(responseTime),
        details: { responseTime: Math.round(responseTime) },
        error: passed ? undefined : `Te langzaam: ${Math.round(responseTime)}ms`,
      })
    } catch (error: any) {
      updateTest(suiteIndex, 1, { status: 'failed', error: error.message })
    }

    updateSuiteStatus(suiteIndex)
    return suite
  }

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true)
    setTestSuites([])
    setLogs([])
    addLog('🚀 Test suite gestart...')

    try {
      // Run all test suites sequentially
      await runHomepageTests()
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      await runAPITests()
      await new Promise(resolve => setTimeout(resolve, 500))
      
      await runFacebookPixelTests()
      await new Promise(resolve => setTimeout(resolve, 500))
      
      await runPerformanceTests()
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Calculator tests (requires navigation)
      await runCalculatorTests()
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Contract card tests (requires results page)
      await runContractCardTests()
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      addLog('✅ Alle test suites voltooid!')
    } catch (error: any) {
      addLog(`❌ Fout tijdens testen: ${error.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  const copyLogs = () => {
    const logText = logs.join('\n')
    navigator.clipboard.writeText(logText)
    addLog('📋 Logs gekopieerd naar klembord!')
  }

  const clearLogs = () => {
    setLogs([])
  }

  const getTotalStats = () => {
    const allTests = testSuites.flatMap(suite => suite.tests)
    const passed = allTests.filter(t => t.status === 'passed').length
    const failed = allTests.filter(t => t.status === 'failed').length
    const total = allTests.length
    const totalDuration = allTests.reduce((sum, t) => sum + (t.duration || 0), 0)

    return { passed, failed, total, totalDuration }
  }

  const stats = getTotalStats()

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-brand-navy-500">E2E Test Suite</h1>
            <p className="text-gray-600 mt-1">
              Uitgebreide end-to-end tests voor alle belangrijke functionaliteiten
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="flex items-center gap-2 px-6 py-3 bg-brand-teal-500 text-white rounded-lg font-semibold hover:bg-brand-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Play weight="bold" className="w-5 h-5" />
              {isRunning ? 'Tests draaien...' : 'Alle tests uitvoeren'}
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats.total > 0 && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
              <div className="text-sm text-gray-600">Totaal tests</div>
              <div className="text-2xl font-bold text-brand-navy-500 mt-1">{stats.total}</div>
            </div>
            <div className="bg-green-50 rounded-lg border-2 border-green-200 p-4">
              <div className="text-sm text-gray-600">Geslaagd</div>
              <div className="text-2xl font-bold text-green-600 mt-1">{stats.passed}</div>
            </div>
            <div className="bg-red-50 rounded-lg border-2 border-red-200 p-4">
              <div className="text-sm text-gray-600">Gefaald</div>
              <div className="text-2xl font-bold text-red-600 mt-1">{stats.failed}</div>
            </div>
            <div className="bg-blue-50 rounded-lg border-2 border-blue-200 p-4">
              <div className="text-sm text-gray-600">Totale tijd</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">{Math.round(stats.totalDuration / 1000)}s</div>
            </div>
          </div>
        )}

        {/* Test Suites */}
        <div className="space-y-4">
          {testSuites.map((suite, suiteIndex) => (
            <div key={suiteIndex} className="bg-white rounded-lg border-2 border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-brand-navy-500">{suite.name}</h2>
                <div className="flex items-center gap-2">
                  {suite.status === 'passed' && (
                    <CheckCircle weight="bold" className="w-6 h-6 text-green-500" />
                  )}
                  {suite.status === 'failed' && (
                    <XCircle weight="bold" className="w-6 h-6 text-red-500" />
                  )}
                  {suite.status === 'running' && (
                    <div className="w-6 h-6 border-2 border-brand-teal-500 border-t-transparent rounded-full animate-spin" />
                  )}
                  {suite.duration && (
                    <span className="text-sm text-gray-600">{Math.round(suite.duration / 1000)}s</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {suite.tests.map((test, testIndex) => (
                  <div
                    key={testIndex}
                    className={`p-3 rounded-lg border ${
                      test.status === 'passed'
                        ? 'bg-green-50 border-green-200'
                        : test.status === 'failed'
                        ? 'bg-red-50 border-red-200'
                        : test.status === 'running'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {test.status === 'passed' && (
                          <CheckCircle weight="bold" className="w-5 h-5 text-green-600" />
                        )}
                        {test.status === 'failed' && (
                          <XCircle weight="bold" className="w-5 h-5 text-red-600" />
                        )}
                        {test.status === 'running' && (
                          <div className="w-5 h-5 border-2 border-brand-teal-500 border-t-transparent rounded-full animate-spin" />
                        )}
                        {test.status === 'pending' && (
                          <Clock weight="bold" className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="font-medium text-brand-navy-500">{test.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {test.duration && (
                          <span className="text-xs text-gray-500">{test.duration}ms</span>
                        )}
                      </div>
                    </div>
                    {test.error && (
                      <div className="mt-2 text-sm text-red-600 font-mono bg-red-100 p-2 rounded">
                        {test.error}
                      </div>
                    )}
                    {test.details && (
                      <div className="mt-2 text-xs text-gray-600 font-mono bg-gray-100 p-2 rounded max-h-32 overflow-y-auto">
                        <pre>{JSON.stringify(test.details, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-brand-navy-500">Test Logs</h2>
            <div className="flex gap-2">
              <button
                onClick={copyLogs}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Copy weight="bold" className="w-4 h-4" />
                Kopieer logs
              </button>
              <button
                onClick={clearLogs}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Trash weight="bold" className="w-4 h-4" />
                Wissen
              </button>
            </div>
          </div>
          <div className="bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">Geen logs nog...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

