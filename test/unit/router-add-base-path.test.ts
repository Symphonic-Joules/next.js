/* eslint-env jest */
import { addBasePath } from 'next/dist/client/add-base-path'

describe('router addBasePath', () => {
  it('should add basePath correctly when no basePath', () => {
    const result = addBasePath('/hello')
    expect(result).toBe('/hello')
  })

  describe('with basePath set', () => {
    const originalBasePath = process.env.__NEXT_ROUTER_BASEPATH
    const originalManualBasePath = process.env.__NEXT_MANUAL_CLIENT_BASE_PATH

    beforeEach(() => {
      process.env.__NEXT_ROUTER_BASEPATH = '/docs'
      delete process.env.__NEXT_MANUAL_CLIENT_BASE_PATH
    })

    afterEach(() => {
      if (originalBasePath !== undefined) {
        process.env.__NEXT_ROUTER_BASEPATH = originalBasePath
      } else {
        delete process.env.__NEXT_ROUTER_BASEPATH
      }
      if (originalManualBasePath !== undefined) {
        process.env.__NEXT_MANUAL_CLIENT_BASE_PATH = originalManualBasePath
      } else {
        delete process.env.__NEXT_MANUAL_CLIENT_BASE_PATH
      }
    })

    it('should prepend basePath to root path', () => {
      const result = addBasePath('/')
      expect(result).toBe('/docs')
    })

    it('should prepend basePath to regular path', () => {
      const result = addBasePath('/hello')
      expect(result).toBe('/docs/hello')
    })

    it('should prepend basePath to nested path', () => {
      const result = addBasePath('/hello/world')
      expect(result).toBe('/docs/hello/world')
    })

    it('should preserve query strings', () => {
      const result = addBasePath('/hello?foo=bar')
      expect(result).toBe('/docs/hello?foo=bar')
    })

    it('should preserve hash fragments', () => {
      const result = addBasePath('/hello#section')
      expect(result).toBe('/docs/hello#section')
    })

    it('should preserve both query and hash', () => {
      const result = addBasePath('/hello?foo=bar#section')
      expect(result).toBe('/docs/hello?foo=bar#section')
    })

    it('should handle complex query strings', () => {
      const result = addBasePath('/api?param1=value1&param2=value2')
      expect(result).toBe('/docs/api?param1=value1&param2=value2')
    })

    it('should handle paths with special characters', () => {
      const result = addBasePath('/hello-world_test')
      expect(result).toBe('/docs/hello-world_test')
    })

    it('should handle encoded characters in path', () => {
      const result = addBasePath('/hello%20world')
      expect(result).toBe('/docs/hello%20world')
    })
  })

  describe('with manual client basePath', () => {
    const originalBasePath = process.env.__NEXT_ROUTER_BASEPATH
    const originalManualBasePath = process.env.__NEXT_MANUAL_CLIENT_BASE_PATH

    beforeEach(() => {
      process.env.__NEXT_ROUTER_BASEPATH = '/docs'
      process.env.__NEXT_MANUAL_CLIENT_BASE_PATH = 'true'
    })

    afterEach(() => {
      if (originalBasePath !== undefined) {
        process.env.__NEXT_ROUTER_BASEPATH = originalBasePath
      } else {
        delete process.env.__NEXT_ROUTER_BASEPATH
      }
      if (originalManualBasePath !== undefined) {
        process.env.__NEXT_MANUAL_CLIENT_BASE_PATH = originalManualBasePath
      } else {
        delete process.env.__NEXT_MANUAL_CLIENT_BASE_PATH
      }
    })

    it('should not add basePath when manual mode is enabled', () => {
      const result = addBasePath('/hello')
      expect(result).toBe('/hello')
    })

    it('should add basePath when required flag is true', () => {
      const result = addBasePath('/hello', true)
      expect(result).toBe('/docs/hello')
    })

    it('should preserve path when required is false', () => {
      const result = addBasePath('/hello', false)
      expect(result).toBe('/hello')
    })
  })

  describe('edge cases', () => {
    it('should handle empty string', () => {
      const result = addBasePath('')
      expect(result).toBe('')
    })

    it('should not modify paths not starting with slash', () => {
      const result = addBasePath('relative/path')
      expect(result).toBe('relative/path')
    })

    it('should handle paths with only query string', () => {
      const result = addBasePath('/?query=value')
      expect(result).toBe('/?query=value')
    })

    it('should handle paths with only hash', () => {
      const result = addBasePath('/#hash')
      expect(result).toBe('/#hash')
    })

    it('should handle multiple slashes', () => {
      const result = addBasePath('//hello//world')
      expect(result).toBe('//hello//world')
    })
  })
})
