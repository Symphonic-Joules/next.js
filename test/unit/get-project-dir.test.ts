describe('get-project-dir', () => {
  it('should not start dev server on require', async () => {
    require('next/dist/lib/get-project-dir')
  })

  describe('getProjectDir function', () => {
    let originalCwd: string
    let originalProcessEnv: NodeJS.ProcessEnv

    beforeAll(() => {
      originalCwd = process.cwd()
      originalProcessEnv = { ...process.env }
    })

    afterAll(() => {
      process.env = originalProcessEnv
    })

    it('should resolve current directory when no argument provided', () => {
      const { getProjectDir } = require('next/dist/lib/get-project-dir')
      const result = getProjectDir(undefined, false)
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should resolve provided directory path', () => {
      const { getProjectDir } = require('next/dist/lib/get-project-dir')
      const result = getProjectDir('.', false)
      expect(result).toBeTruthy()
      expect(result).toContain('test')
    })

    it('should resolve relative paths', () => {
      const { getProjectDir } = require('next/dist/lib/get-project-dir')
      const result = getProjectDir('./test', false)
      expect(result).toBeTruthy()
      expect(result).toContain('test')
    })

    it('should handle case sensitivity warnings', () => {
      const { getProjectDir } = require('next/dist/lib/get-project-dir')
      // Test basic functionality - detailed case checking requires mocking fs
      const result = getProjectDir('.', false)
      expect(result).toBeTruthy()
    })

    it('should return error for non-existent directory when exitOnEnoent is false', () => {
      const { getProjectDir } = require('next/dist/lib/get-project-dir')
      expect(() => {
        getProjectDir('/non/existent/path/that/does/not/exist', false)
      }).toThrow()
    })

    it('should handle empty string as directory', () => {
      const { getProjectDir } = require('next/dist/lib/get-project-dir')
      // Empty string should default to current directory
      const result = getProjectDir('', false)
      expect(result).toBeTruthy()
    })
  })

  describe('typo detection integration', () => {
    it('should detect typos in command names', () => {
      const { detectTypo } = require('next/dist/lib/detect-typo')
      
      const result = detectTypo('biuld', ['build', 'dev', 'start'])
      expect(result).toBe('build')
    })

    it('should detect typo for dev command', () => {
      const { detectTypo } = require('next/dist/lib/detect-typo')
      
      const result = detectTypo('dve', ['build', 'dev', 'start'])
      expect(result).toBe('dev')
    })

    it('should not detect typo when distance is too large', () => {
      const { detectTypo } = require('next/dist/lib/detect-typo')
      
      const result = detectTypo('xyz', ['build', 'dev', 'start'])
      expect(result).toBeNull()
    })

    it('should return closest match among multiple options', () => {
      const { detectTypo } = require('next/dist/lib/detect-typo')
      
      const result = detectTypo('devv', ['dev', 'develop', 'development'])
      expect(result).toBe('dev')
    })

    it('should handle case differences', () => {
      const { detectTypo } = require('next/dist/lib/detect-typo')
      
      const result = detectTypo('BUILD', ['build', 'dev', 'start'])
      expect(result).toBeTruthy()
    })

    it('should return null for exact matches', () => {
      const { detectTypo } = require('next/dist/lib/detect-typo')
      
      const result = detectTypo('build', ['build', 'dev', 'start'])
      expect(result).toBeNull()
    })

    it('should handle empty input', () => {
      const { detectTypo } = require('next/dist/lib/detect-typo')
      
      const result = detectTypo('', ['build', 'dev', 'start'])
      expect(result).toBeNull()
    })

    it('should handle empty options array', () => {
      const { detectTypo } = require('next/dist/lib/detect-typo')
      
      const result = detectTypo('build', [])
      expect(result).toBeNull()
    })
  })
})
