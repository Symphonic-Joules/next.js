/* eslint-env jest */
import {
  PHASE_EXPORT,
  PHASE_PRODUCTION_BUILD,
  PHASE_PRODUCTION_SERVER,
  PHASE_DEVELOPMENT_SERVER,
} from 'next/constants'

describe('phaseConstants', () => {
  it('should set phases correctly', () => {
    expect(PHASE_EXPORT).toBe('phase-export')
    expect(PHASE_PRODUCTION_BUILD).toBe('phase-production-build')
    expect(PHASE_PRODUCTION_SERVER).toBe('phase-production-server')
    expect(PHASE_DEVELOPMENT_SERVER).toBe('phase-development-server')
  })

  describe('additional phase constants', () => {
    it('should have PHASE_ANALYZE constant', () => {
      const { PHASE_ANALYZE } = require('next/constants')
      expect(PHASE_ANALYZE).toBe('phase-analyze')
    })

    it('should have PHASE_TEST constant', () => {
      const { PHASE_TEST } = require('next/constants')
      expect(PHASE_TEST).toBe('phase-test')
    })

    it('should have PHASE_INFO constant', () => {
      const { PHASE_INFO } = require('next/constants')
      expect(PHASE_INFO).toBe('phase-info')
    })
  })

  describe('phase constant types', () => {
    it('should export all phases as strings', () => {
      expect(typeof PHASE_EXPORT).toBe('string')
      expect(typeof PHASE_PRODUCTION_BUILD).toBe('string')
      expect(typeof PHASE_PRODUCTION_SERVER).toBe('string')
      expect(typeof PHASE_DEVELOPMENT_SERVER).toBe('string')
    })

    it('should have unique phase values', () => {
      const phases = [
        PHASE_EXPORT,
        PHASE_PRODUCTION_BUILD,
        PHASE_PRODUCTION_SERVER,
        PHASE_DEVELOPMENT_SERVER,
      ]
      const uniquePhases = new Set(phases)
      expect(uniquePhases.size).toBe(phases.length)
    })

    it('should use kebab-case naming convention', () => {
      const phases = [
        PHASE_EXPORT,
        PHASE_PRODUCTION_BUILD,
        PHASE_PRODUCTION_SERVER,
        PHASE_DEVELOPMENT_SERVER,
      ]
      phases.forEach((phase) => {
        expect(phase).toMatch(/^phase-[a-z-]+$/)
      })
    })
  })

  describe('compiler constants', () => {
    it('should have COMPILER_NAMES object', () => {
      const { COMPILER_NAMES } = require('next/constants')
      expect(COMPILER_NAMES).toBeDefined()
      expect(COMPILER_NAMES.client).toBe('client')
      expect(COMPILER_NAMES.server).toBe('server')
      expect(COMPILER_NAMES.edgeServer).toBe('edge-server')
    })

    it('should have COMPILER_INDEXES object', () => {
      const { COMPILER_INDEXES, COMPILER_NAMES } = require('next/constants')
      expect(COMPILER_INDEXES).toBeDefined()
      expect(COMPILER_INDEXES[COMPILER_NAMES.client]).toBe(0)
      expect(COMPILER_INDEXES[COMPILER_NAMES.server]).toBe(1)
      expect(COMPILER_INDEXES[COMPILER_NAMES.edgeServer]).toBe(2)
    })

    it('should have unique compiler index values', () => {
      const { COMPILER_INDEXES } = require('next/constants')
      const indexes = Object.values(COMPILER_INDEXES)
      const uniqueIndexes = new Set(indexes)
      expect(uniqueIndexes.size).toBe(indexes.length)
    })
  })

  describe('adapter output types', () => {
    it('should have AdapterOutputType enum', () => {
      const { AdapterOutputType } = require('next/constants')
      expect(AdapterOutputType).toBeDefined()
      expect(AdapterOutputType.PAGES).toBe('PAGES')
      expect(AdapterOutputType.PAGES_API).toBe('PAGES_API')
      expect(AdapterOutputType.APP_PAGE).toBe('APP_PAGE')
      expect(AdapterOutputType.APP_ROUTE).toBe('APP_ROUTE')
      expect(AdapterOutputType.PRERENDER).toBe('PRERENDER')
      expect(AdapterOutputType.STATIC_FILE).toBe('STATIC_FILE')
      expect(AdapterOutputType.MIDDLEWARE).toBe('MIDDLEWARE')
    })

    it('should use SCREAMING_SNAKE_CASE for adapter types', () => {
      const { AdapterOutputType } = require('next/constants')
      const types = Object.values(AdapterOutputType)
      types.forEach((type) => {
        expect(type).toMatch(/^[A-Z_]+$/)
      })
    })

    it('should have unique adapter output type values', () => {
      const { AdapterOutputType } = require('next/constants')
      const types = Object.values(AdapterOutputType)
      const uniqueTypes = new Set(types)
      expect(uniqueTypes.size).toBe(types.length)
    })
  })

  describe('constant immutability', () => {
    it('should not allow reassignment of phase constants', () => {
      expect(() => {
        // @ts-expect-error - testing immutability
        PHASE_EXPORT = 'something-else'
      }).toThrow()
    })

    it('should export constants as const values', () => {
      // Verify the constants are properly exported and accessible
      expect(PHASE_EXPORT).toBeDefined()
      expect(PHASE_PRODUCTION_BUILD).toBeDefined()
      expect(PHASE_PRODUCTION_SERVER).toBeDefined()
      expect(PHASE_DEVELOPMENT_SERVER).toBeDefined()
    })
  })
})
