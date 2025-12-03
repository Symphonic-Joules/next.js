/**
 * @jest-environment node
 */
import { ModulesData, AnalyzeData } from '../analyze-data'

describe('ModulesData', () => {
  let modulesArrayBuffer: ArrayBuffer
  let modulesData: ModulesData

  beforeEach(() => {
    // Create a mock modules.data binary format
    // Format: [4 bytes: JSON length][JSON header][Binary data]
    const modulesHeader = {
      modules: [
        { ident: 'module1', path: '/path/to/module1.js' },
        { ident: 'module2', path: '/path/to/module2.js' },
        { ident: 'module3', path: '/path/to/module1.js' }, // Same path as module1
      ],
      module_dependents: { offset: 0, length: 0 },
      async_module_dependents: { offset: 0, length: 0 },
      module_dependencies: { offset: 0, length: 0 },
      async_module_dependencies: { offset: 0, length: 0 },
    }

    const jsonString = JSON.stringify(modulesHeader)
    const jsonBytes = new TextEncoder().encode(jsonString)
    const jsonLength = jsonBytes.length

    // Create ArrayBuffer with header
    modulesArrayBuffer = new ArrayBuffer(4 + jsonLength)
    const view = new DataView(modulesArrayBuffer)
    view.setUint32(0, jsonLength, false)

    const uint8Array = new Uint8Array(modulesArrayBuffer)
    uint8Array.set(jsonBytes, 4)

    modulesData = new ModulesData(modulesArrayBuffer)
  })

  describe('constructor', () => {
    it('should parse modules data correctly', () => {
      expect(modulesData.moduleCount()).toBe(3)
    })

    it('should build path to module index map correctly', () => {
      const indices = modulesData.getModuleIndiciesFromPath('/path/to/module1.js')
      expect(indices).toEqual([0, 2])
    })

    it('should handle modules with unique paths', () => {
      const indices = modulesData.getModuleIndiciesFromPath('/path/to/module2.js')
      expect(indices).toEqual([1])
    })
  })

  describe('module', () => {
    it('should return module at valid index', () => {
      const module = modulesData.module(0)
      expect(module).toEqual({
        ident: 'module1',
        path: '/path/to/module1.js',
      })
    })

    it('should return undefined for invalid index', () => {
      const module = modulesData.module(999)
      expect(module).toBeUndefined()
    })

    it('should return undefined for negative index', () => {
      const module = modulesData.module(-1)
      expect(module).toBeUndefined()
    })
  })

  describe('moduleCount', () => {
    it('should return correct module count', () => {
      expect(modulesData.moduleCount()).toBe(3)
    })
  })

  describe('getModuleIndiciesFromPath', () => {
    it('should return empty array for non-existent path', () => {
      const indices = modulesData.getModuleIndiciesFromPath('/non/existent/path.js')
      expect(indices).toEqual([])
    })

    it('should return all indices for duplicate paths', () => {
      const indices = modulesData.getModuleIndiciesFromPath('/path/to/module1.js')
      expect(indices).toHaveLength(2)
      expect(indices).toContain(0)
      expect(indices).toContain(2)
    })
  })

  describe('readEdgesDataAtIndex', () => {
    it('should return empty array when length is 0', () => {
      const dependents = modulesData.moduleDependents(0)
      expect(dependents).toEqual([])
    })

    it('should return empty array for out of range index', () => {
      const dependents = modulesData.moduleDependents(-1)
      expect(dependents).toEqual([])
    })
  })

  describe('with edge data', () => {
    beforeEach(() => {
      // Create modules data with actual edge data
      const modulesHeader = {
        modules: [
          { ident: 'entry', path: '/entry.js' },
          { ident: 'dep1', path: '/dep1.js' },
          { ident: 'dep2', path: '/dep2.js' },
        ],
        module_dependents: { offset: 4, length: 32 },
        async_module_dependents: { offset: 0, length: 0 },
        module_dependencies: { offset: 36, length: 32 },
        async_module_dependencies: { offset: 0, length: 0 },
      }

      const jsonString = JSON.stringify(modulesHeader)
      const jsonBytes = new TextEncoder().encode(jsonString)
      const jsonLength = jsonBytes.length

      // Binary data structure:
      // [4 bytes: JSON length]
      // [JSON bytes]
      // [4 bytes: 0 padding]
      // [module_dependents data: offset 4, length 32]
      // [module_dependencies data: offset 36, length 32]
      
      const binarySize = 4 + jsonLength + 4 + 32 + 32
      modulesArrayBuffer = new ArrayBuffer(binarySize)
      const view = new DataView(modulesArrayBuffer)
      
      // Write JSON length
      view.setUint32(0, jsonLength, false)
      
      // Write JSON
      const uint8Array = new Uint8Array(modulesArrayBuffer)
      uint8Array.set(jsonBytes, 4)
      
      // Write module_dependents data (offset: 4 + jsonLength)
      const dependentsOffset = 4 + jsonLength
      // Number of modules (3)
      view.setUint32(dependentsOffset, 3, false)
      // Offsets: module 0 has 2 dependents, module 1 has 0, module 2 has 1
      view.setUint32(dependentsOffset + 4, 2, false) // offset for module 0
      view.setUint32(dependentsOffset + 8, 2, false) // offset for module 1 (same as previous = no dependents)
      view.setUint32(dependentsOffset + 12, 3, false) // offset for module 2
      // Data: module 0's dependents [1, 2], module 2's dependents [0]
      view.setUint32(dependentsOffset + 16, 1, false)
      view.setUint32(dependentsOffset + 20, 2, false)
      view.setUint32(dependentsOffset + 24, 0, false)

      // Write module_dependencies data (offset: dependentsOffset + 32)
      const depsOffset = dependentsOffset + 32
      view.setUint32(depsOffset, 3, false)
      view.setUint32(depsOffset + 4, 0, false) // module 0 has no dependencies
      view.setUint32(depsOffset + 8, 1, false) // module 1 has 1 dependency
      view.setUint32(depsOffset + 12, 2, false) // module 2 has 1 dependency
      view.setUint32(depsOffset + 16, 0, false) // module 1 depends on 0
      view.setUint32(depsOffset + 20, 0, false) // module 2 depends on 0

      modulesData = new ModulesData(modulesArrayBuffer)
    })

    it('should read module dependents correctly', () => {
      const dependents = modulesData.moduleDependents(0)
      expect(dependents).toEqual([1, 2])
    })

    it('should return empty array for module with no dependents', () => {
      const dependents = modulesData.moduleDependents(1)
      expect(dependents).toEqual([])
    })

    it('should read module dependencies correctly', () => {
      const deps = modulesData.moduleDependencies(1)
      expect(deps).toEqual([0])
    })

    it('should read async module dependencies', () => {
      const asyncDeps = modulesData.asyncModuleDependencies(0)
      expect(asyncDeps).toEqual([])
    })

    it('should read async module dependents', () => {
      const asyncDependents = modulesData.asyncModuleDependents(0)
      expect(asyncDependents).toEqual([])
    })
  })

  describe('getRawModulesHeader', () => {
    it('should return the raw modules header', () => {
      const header = modulesData.getRawModulesHeader()
      expect(header.modules).toHaveLength(3)
      expect(header.modules[0].ident).toBe('module1')
    })
  })
})

describe('AnalyzeData', () => {
  let analyzeArrayBuffer: ArrayBuffer
  let analyzeData: AnalyzeData

  beforeEach(() => {
    // Create a mock analyze.data binary format
    const analyzeHeader = {
      sources: [
        { parent_source_index: null, path: '/root/' },
        { parent_source_index: 0, path: 'app/' },
        { parent_source_index: 1, path: 'page.tsx' },
      ],
      chunk_parts: [
        { source_index: 2, output_file_index: 0, size: 1024 },
        { source_index: 2, output_file_index: 1, size: 512 },
      ],
      output_files: [
        { filename: '[client-fs]/main.js' },
        { filename: '[project]/styles.css' },
      ],
      output_file_chunk_parts: { offset: 0, length: 0 },
      source_chunk_parts: { offset: 0, length: 0 },
      source_children: { offset: 0, length: 0 },
      source_roots: [0],
    }

    const jsonString = JSON.stringify(analyzeHeader)
    const jsonBytes = new TextEncoder().encode(jsonString)
    const jsonLength = jsonBytes.length

    analyzeArrayBuffer = new ArrayBuffer(4 + jsonLength)
    const view = new DataView(analyzeArrayBuffer)
    view.setUint32(0, jsonLength, false)

    const uint8Array = new Uint8Array(analyzeArrayBuffer)
    uint8Array.set(jsonBytes, 4)

    analyzeData = new AnalyzeData(analyzeArrayBuffer)
  })

  describe('constructor', () => {
    it('should parse analyze data correctly', () => {
      expect(analyzeData.sourceCount()).toBe(3)
    })

    it('should build path to source index map', () => {
      const sourceIndex = analyzeData.getSourceIndexFromPath('/root/app/page.tsx')
      expect(sourceIndex).toBe(2)
    })
  })

  describe('source', () => {
    it('should return source at valid index', () => {
      const source = analyzeData.source(0)
      expect(source).toEqual({
        parent_source_index: null,
        path: '/root/',
      })
    })

    it('should return undefined for invalid index', () => {
      const source = analyzeData.source(999)
      expect(source).toBeUndefined()
    })
  })

  describe('sourceCount', () => {
    it('should return correct source count', () => {
      expect(analyzeData.sourceCount()).toBe(3)
    })
  })

  describe('getSourceIndexFromPath', () => {
    it('should return correct index for valid path', () => {
      const index = analyzeData.getSourceIndexFromPath('/root/')
      expect(index).toBe(0)
    })

    it('should return undefined for non-existent path', () => {
      const index = analyzeData.getSourceIndexFromPath('/non/existent')
      expect(index).toBeUndefined()
    })

    it('should handle nested paths correctly', () => {
      const index = analyzeData.getSourceIndexFromPath('/root/app/page.tsx')
      expect(index).toBe(2)
    })
  })

  describe('chunkPart', () => {
    it('should return chunk part at valid index', () => {
      const chunkPart = analyzeData.chunkPart(0)
      expect(chunkPart).toEqual({
        source_index: 2,
        output_file_index: 0,
        size: 1024,
      })
    })

    it('should return undefined for invalid index', () => {
      const chunkPart = analyzeData.chunkPart(999)
      expect(chunkPart).toBeUndefined()
    })
  })

  describe('chunkPartCount', () => {
    it('should return correct chunk part count', () => {
      expect(analyzeData.chunkPartCount()).toBe(2)
    })
  })

  describe('outputFile', () => {
    it('should return output file at valid index', () => {
      const outputFile = analyzeData.outputFile(0)
      expect(outputFile).toEqual({ filename: '[client-fs]/main.js' })
    })

    it('should return undefined for invalid index', () => {
      const outputFile = analyzeData.outputFile(999)
      expect(outputFile).toBeUndefined()
    })
  })

  describe('outputFileCount', () => {
    it('should return correct output file count', () => {
      expect(analyzeData.outputFileCount()).toBe(2)
    })
  })

  describe('sourceRoots', () => {
    it('should return source roots array', () => {
      expect(analyzeData.sourceRoots()).toEqual([0])
    })
  })

  describe('getFullSourcePath', () => {
    it('should return path for root source', () => {
      const path = analyzeData.getFullSourcePath(0)
      expect(path).toBe('/root/')
    })

    it('should concatenate parent paths correctly', () => {
      const path = analyzeData.getFullSourcePath(2)
      expect(path).toBe('/root/app/page.tsx')
    })

    it('should return empty string for invalid index', () => {
      const path = analyzeData.getFullSourcePath(999)
      expect(path).toBe('')
    })

    it('should handle intermediate paths', () => {
      const path = analyzeData.getFullSourcePath(1)
      expect(path).toBe('/root/app/')
    })
  })

  describe('getSourceOutputSize', () => {
    it('should calculate total size from chunk parts', () => {
      const size = analyzeData.getSourceOutputSize(2)
      expect(size).toBe(1536) // 1024 + 512
    })

    it('should return 0 for source with no chunk parts', () => {
      const size = analyzeData.getSourceOutputSize(0)
      expect(size).toBe(0)
    })
  })

  describe('sourceChunks', () => {
    it('should return unique sorted chunk filenames', () => {
      const chunks = analyzeData.sourceChunks(2)
      expect(chunks).toEqual(['[client-fs]/main.js', '[project]/styles.css'])
    })

    it('should return empty array for source with no chunks', () => {
      const chunks = analyzeData.sourceChunks(0)
      expect(chunks).toEqual([])
    })
  })

  describe('getSourceFlags', () => {
    it('should detect client flag from filename', () => {
      const flags = analyzeData.getSourceFlags(2)
      expect(flags.client).toBe(true)
      expect(flags.traced).toBe(true)
    })

    it('should detect file types correctly', () => {
      const flags = analyzeData.getSourceFlags(2)
      expect(flags.js).toBe(true)
      expect(flags.css).toBe(true)
    })

    it('should return all false flags for source with no chunks', () => {
      const flags = analyzeData.getSourceFlags(0)
      expect(flags.client).toBe(false)
      expect(flags.server).toBe(false)
      expect(flags.traced).toBe(false)
      expect(flags.js).toBe(false)
      expect(flags.css).toBe(false)
      expect(flags.json).toBe(false)
      expect(flags.asset).toBe(false)
    })
  })

  describe('isPolyfillModule', () => {
    it('should return false for non-polyfill modules', () => {
      expect(analyzeData.isPolyfillModule(2)).toBe(false)
    })

    it('should return true for polyfill-module.js', () => {
      // Create data with polyfill module
      const header = {
        sources: [
          { parent_source_index: null, path: 'node_modules/next/dist/build/polyfills/polyfill-module.js' },
        ],
        chunk_parts: [],
        output_files: [],
        output_file_chunk_parts: { offset: 0, length: 0 },
        source_chunk_parts: { offset: 0, length: 0 },
        source_children: { offset: 0, length: 0 },
        source_roots: [0],
      }

      const jsonString = JSON.stringify(header)
      const jsonBytes = new TextEncoder().encode(jsonString)
      const buffer = new ArrayBuffer(4 + jsonBytes.length)
      new DataView(buffer).setUint32(0, jsonBytes.length, false)
      new Uint8Array(buffer).set(jsonBytes, 4)

      const data = new AnalyzeData(buffer)
      expect(data.isPolyfillModule(0)).toBe(true)
    })
  })

  describe('isPolyfillNoModule', () => {
    it('should return false for non-polyfill modules', () => {
      expect(analyzeData.isPolyfillNoModule(2)).toBe(false)
    })

    it('should return true for polyfill-nomodule.js', () => {
      const header = {
        sources: [
          { parent_source_index: null, path: 'node_modules/next/dist/build/polyfills/polyfill-nomodule.js' },
        ],
        chunk_parts: [],
        output_files: [],
        output_file_chunk_parts: { offset: 0, length: 0 },
        source_chunk_parts: { offset: 0, length: 0 },
        source_children: { offset: 0, length: 0 },
        source_roots: [0],
      }

      const jsonString = JSON.stringify(header)
      const jsonBytes = new TextEncoder().encode(jsonString)
      const buffer = new ArrayBuffer(4 + jsonBytes.length)
      new DataView(buffer).setUint32(0, jsonBytes.length, false)
      new Uint8Array(buffer).set(jsonBytes, 4)

      const data = new AnalyzeData(buffer)
      expect(data.isPolyfillNoModule(0)).toBe(true)
    })
  })

  describe('getRawAnalyzeHeader', () => {
    it('should return the raw analyze header', () => {
      const header = analyzeData.getRawAnalyzeHeader()
      expect(header.sources).toHaveLength(3)
      expect(header.chunk_parts).toHaveLength(2)
    })
  })

  describe('edge cases', () => {
    it('should handle empty binary data sections', () => {
      const children = analyzeData.sourceChildren(0)
      expect(children).toEqual([])
    })

    it('should handle source with negative parent index gracefully', () => {
      const path = analyzeData.getFullSourcePath(0)
      expect(path).toBe('/root/')
    })
  })
})

describe('Binary data edge cases', () => {
  it('should handle malformed JSON in buffer', () => {
    const buffer = new ArrayBuffer(100)
    const view = new DataView(buffer)
    view.setUint32(0, 50, false) // Set length larger than actual data
    
    expect(() => new ModulesData(buffer)).toThrow()
  })

  it('should handle empty buffer', () => {
    const buffer = new ArrayBuffer(0)
    expect(() => new ModulesData(buffer)).toThrow()
  })

  it('should handle buffer with only length header', () => {
    const buffer = new ArrayBuffer(4)
    const view = new DataView(buffer)
    view.setUint32(0, 100, false)
    
    expect(() => new ModulesData(buffer)).toThrow()
  })
})