import { warnOnce } from 'next/dist/build/output/log'

describe('build/output/log', () => {
  it('warnOnce', () => {
    const original = console.warn
    try {
      const messages = []
      console.warn = (m: any) => messages.push(m)
      warnOnce('test')
      expect(messages.length).toEqual(1)
      warnOnce('test again')
      expect(messages.length).toEqual(2)
      warnOnce('test', 'more')
      expect(messages.length).toEqual(3)
      warnOnce('test')
      expect(messages.length).toEqual(3)
      warnOnce('test again')
      expect(messages.length).toEqual(3)
      warnOnce('test', 'more')
      expect(messages.length).toEqual(3)
      warnOnce('test', 'should', 'add', 'another')
      expect(messages.length).toEqual(4)
    } finally {
      console.warn = original
    }
  })

  describe('warnOnce caching behavior', () => {
    const original = console.warn
    let messages: any[]

    beforeEach(() => {
      messages = []
      console.warn = (m: any) => messages.push(m)
    })

    afterEach(() => {
      console.warn = original
    })

    it('should cache based on complete message combination', () => {
      warnOnce('part1', 'part2')
      expect(messages.length).toBe(1)
      
      warnOnce('part1', 'part2')
      expect(messages.length).toBe(1)
      
      warnOnce('part1', 'part3')
      expect(messages.length).toBe(2)
    })

    it('should handle numeric arguments', () => {
      warnOnce('count', 42)
      expect(messages.length).toBe(1)
      
      warnOnce('count', 42)
      expect(messages.length).toBe(1)
      
      warnOnce('count', 43)
      expect(messages.length).toBe(2)
    })

    it('should handle boolean arguments', () => {
      warnOnce('flag', true)
      expect(messages.length).toBe(1)
      
      warnOnce('flag', false)
      expect(messages.length).toBe(2)
    })

    it('should handle object arguments', () => {
      warnOnce('object', { key: 'value' })
      expect(messages.length).toBe(1)
      
      warnOnce('object', { key: 'value' })
      expect(messages.length).toBe(1)
    })

    it('should handle empty string arguments', () => {
      warnOnce('')
      expect(messages.length).toBe(1)
      
      warnOnce('')
      expect(messages.length).toBe(1)
      
      warnOnce('', '')
      expect(messages.length).toBe(2)
    })

    it('should handle undefined arguments', () => {
      warnOnce(undefined)
      expect(messages.length).toBe(1)
      
      warnOnce(undefined)
      expect(messages.length).toBe(1)
    })

    it('should handle null arguments', () => {
      warnOnce(null)
      expect(messages.length).toBe(1)
      
      warnOnce(null)
      expect(messages.length).toBe(1)
    })

    it('should treat whitespace differences as different messages', () => {
      warnOnce('test message')
      expect(messages.length).toBe(1)
      
      warnOnce('test', 'message')
      expect(messages.length).toBe(2)
    })

    it('should handle very long messages', () => {
      const longMessage = 'a'.repeat(1000)
      warnOnce(longMessage)
      expect(messages.length).toBe(1)
      
      warnOnce(longMessage)
      expect(messages.length).toBe(1)
    })
  })

  describe('errorOnce', () => {
    const originalError = console.error
    let errorMessages: any[]

    beforeEach(() => {
      errorMessages = []
      console.error = (m: any) => errorMessages.push(m)
    })

    afterEach(() => {
      console.error = originalError
    })

    it('should only log identical error once', () => {
      const { errorOnce } = require('next/dist/build/output/log')
      
      errorOnce('error message')
      expect(errorMessages.length).toBe(1)
      
      errorOnce('error message')
      expect(errorMessages.length).toBe(1)
      
      errorOnce('different error')
      expect(errorMessages.length).toBe(2)
    })

    it('should handle multiple arguments like warnOnce', () => {
      const { errorOnce } = require('next/dist/build/output/log')
      
      errorOnce('error', 'with', 'parts')
      expect(errorMessages.length).toBe(1)
      
      errorOnce('error', 'with', 'parts')
      expect(errorMessages.length).toBe(1)
    })
  })

  describe('logging functions', () => {
    let originalLog: any
    let originalWarn: any
    let originalError: any
    let logs: any[]
    let warns: any[]
    let errors: any[]

    beforeEach(() => {
      originalLog = console.log
      originalWarn = console.warn
      originalError = console.error
      logs = []
      warns = []
      errors = []
      console.log = (...args: any[]) => logs.push(args)
      console.warn = (...args: any[]) => warns.push(args)
      console.error = (...args: any[]) => errors.push(args)
    })

    afterEach(() => {
      console.log = originalLog
      console.warn = originalWarn
      console.error = originalError
    })

    it('should have wait function that logs with prefix', () => {
      const { wait } = require('next/dist/build/output/log')
      wait('waiting message')
      expect(logs.length).toBe(1)
      expect(logs[0].join(' ')).toContain('waiting message')
    })

    it('should have error function that logs to stderr', () => {
      const { error } = require('next/dist/build/output/log')
      error('error message')
      expect(errors.length).toBe(1)
      expect(errors[0].join(' ')).toContain('error message')
    })

    it('should have warn function that logs to stderr', () => {
      const { warn } = require('next/dist/build/output/log')
      warn('warning message')
      expect(warns.length).toBe(1)
      expect(warns[0].join(' ')).toContain('warning message')
    })

    it('should have ready function', () => {
      const { ready } = require('next/dist/build/output/log')
      ready('ready message')
      expect(logs.length).toBe(1)
    })

    it('should have info function', () => {
      const { info } = require('next/dist/build/output/log')
      info('info message')
      expect(logs.length).toBe(1)
    })

    it('should have event function', () => {
      const { event } = require('next/dist/build/output/log')
      event('event message')
      expect(logs.length).toBe(1)
    })

    it('should have trace function', () => {
      const { trace } = require('next/dist/build/output/log')
      trace('trace message')
      expect(logs.length).toBe(1)
    })

    it('should handle empty messages', () => {
      const { wait } = require('next/dist/build/output/log')
      wait()
      expect(logs.length).toBe(1)
    })

    it('should handle multiple arguments', () => {
      const { info } = require('next/dist/build/output/log')
      info('first', 'second', 'third')
      expect(logs.length).toBe(1)
    })
  })
})
