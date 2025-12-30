/**
 * METADATA MANAGEMENT TESTING SUITE
 * Suite completa de testing para el sistema de metadata
 * 
 * Tests incluidos:
 * - API Backend (mock)
 * - Validación de metadata
 * - Templates
 * - Bulk operations
 * - Persistencia (localStorage)
 * - Copy/Download
 * - Error handling
 */

import { mockBackendAPI } from '../services/mockBackendAPI';
import { metadataService } from '../services/metadataService';
import { metadataPersistence } from '../services/metadataPersistence';
import type { DocumentMetadata } from '../types/documentation';

/**
 * Configuración de testing
 */
const TEST_CONFIG = {
  verbose: true,
  stopOnFirstFailure: false,
  showSuccessLogs: true,
};

/**
 * Colores para consola
 */
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Logger para tests
 */
class TestLogger {
  private passedTests = 0;
  private failedTests = 0;
  private skippedTests = 0;
  private startTime = 0;

  start() {
    this.passedTests = 0;
    this.failedTests = 0;
    this.skippedTests = 0;
    this.startTime = Date.now();
    
    console.log('\n' + colors.cyan + '╔══════════════════════════════════════════════════════════╗' + colors.reset);
    console.log(colors.cyan + '║' + colors.reset + '        📋 METADATA MANAGEMENT TESTING SUITE               ' + colors.cyan + '║' + colors.reset);
    console.log(colors.cyan + '╚══════════════════════════════════════════════════════════╝' + colors.reset + '\n');
  }

  pass(testName: string) {
    this.passedTests++;
    if (TEST_CONFIG.showSuccessLogs || TEST_CONFIG.verbose) {
      console.log(colors.green + '✓' + colors.reset + ' ' + testName);
    }
  }

  fail(testName: string, error: string) {
    this.failedTests++;
    console.log(colors.red + '✗' + colors.reset + ' ' + testName);
    console.log(colors.red + '  Error: ' + error + colors.reset);
    
    if (TEST_CONFIG.stopOnFirstFailure) {
      throw new Error(`Test failed: ${testName}`);
    }
  }

  skip(testName: string, reason: string) {
    this.skippedTests++;
    console.log(colors.yellow + '○' + colors.reset + ' ' + testName + colors.yellow + ' (skipped: ' + reason + ')' + colors.reset);
  }

  section(sectionName: string) {
    console.log('\n' + colors.blue + '┌─ ' + sectionName + colors.reset);
  }

  info(message: string) {
    if (TEST_CONFIG.verbose) {
      console.log(colors.cyan + '  ℹ ' + message + colors.reset);
    }
  }

  summary() {
    const duration = Date.now() - this.startTime;
    const total = this.passedTests + this.failedTests + this.skippedTests;
    
    console.log('\n' + colors.cyan + '╔══════════════════════════════════════════════════════════╗' + colors.reset);
    console.log(colors.cyan + '║' + colors.reset + '                    TEST SUMMARY                           ' + colors.cyan + '║' + colors.reset);
    console.log(colors.cyan + '╚══════════════════════════════════════════════════════════╝' + colors.reset);
    console.log('');
    console.log(colors.green + '  ✓ Passed:  ' + this.passedTests + '/' + total + colors.reset);
    console.log(colors.red + '  ✗ Failed:  ' + this.failedTests + '/' + total + colors.reset);
    console.log(colors.yellow + '  ○ Skipped: ' + this.skippedTests + '/' + total + colors.reset);
    console.log('');
    console.log('  Duration: ' + (duration / 1000).toFixed(2) + 's');
    console.log('');

    if (this.failedTests === 0) {
      console.log(colors.green + '  🎉 All tests passed!' + colors.reset + '\n');
    } else {
      console.log(colors.red + '  ❌ Some tests failed. Please review.' + colors.reset + '\n');
    }

    return {
      passed: this.passedTests,
      failed: this.failedTests,
      skipped: this.skippedTests,
      total,
      duration,
      success: this.failedTests === 0,
    };
  }
}

/**
 * Testing Suite
 */
class MetadataTestSuite {
  private logger = new TestLogger();

  /**
   * Ejecutar todos los tests
   */
  async runAll(): Promise<{ success: boolean; summary: any }> {
    this.logger.start();

    try {
      await this.testBackendAPI();
      await this.testMetadataValidation();
      await this.testTemplates();
      await this.testBulkOperations();
      await this.testPersistence();
      await this.testCopyDownload();
      await this.testErrorHandling();
    } catch (error) {
      console.error(colors.red + '\n💥 Critical error during testing:' + colors.reset, error);
    }

    const summary = this.logger.summary();
    return { success: summary.success, summary };
  }

  /**
   * Test 1: Backend API (Mock)
   */
  private async testBackendAPI() {
    this.logger.section('Backend API Tests');

    // Test 1.1: Health check
    try {
      const response = await mockBackendAPI.healthCheck();
      if (response.success && response.data?.status === 'healthy') {
        this.logger.pass('Health check returns healthy status');
      } else {
        this.logger.fail('Health check failed', 'Unexpected response');
      }
    } catch (error) {
      this.logger.fail('Health check failed', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 1.2: Save document
    try {
      const testDoc = {
        path: '/test-document.md',
        content: '---\ntitle: Test\n---\n\n# Test Document',
        metadata: { title: 'Test Document', category: 'guide' as const },
      };

      const response = await mockBackendAPI.saveDocument(testDoc);
      
      if (response.success && response.data?.version === 1) {
        this.logger.pass('Save document creates version 1');
      } else {
        this.logger.fail('Save document failed', JSON.stringify(response));
      }
    } catch (error) {
      this.logger.fail('Save document failed', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 1.3: Get document
    try {
      const response = await mockBackendAPI.getDocument('/test-document.md');
      
      if (response.success && response.data?.content && response.data?.version === 1) {
        this.logger.pass('Get document retrieves saved content');
      } else {
        this.logger.fail('Get document failed', JSON.stringify(response));
      }
    } catch (error) {
      this.logger.fail('Get document failed', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 1.4: Version history
    try {
      // Save another version
      await mockBackendAPI.saveDocument({
        path: '/test-document.md',
        content: '---\ntitle: Test Updated\n---\n\n# Updated',
        metadata: { title: 'Test Updated', category: 'guide' as const },
      });

      const response = await mockBackendAPI.getVersionHistory('/test-document.md');
      
      if (response.success && response.data?.versions.length === 2) {
        this.logger.pass('Version history tracks multiple versions');
      } else {
        this.logger.fail('Version history failed', `Expected 2 versions, got ${response.data?.versions.length || 0}`);
      }
    } catch (error) {
      this.logger.fail('Version history failed', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 1.5: Bulk save
    try {
      const bulkDocs = [
        {
          path: '/bulk-test-1.md',
          content: '# Bulk 1',
          metadata: { title: 'Bulk 1' },
        },
        {
          path: '/bulk-test-2.md',
          content: '# Bulk 2',
          metadata: { title: 'Bulk 2' },
        },
      ];

      const response = await mockBackendAPI.bulkSaveDocuments({ documents: bulkDocs });
      
      if (response.success && response.data?.successCount === 2) {
        this.logger.pass('Bulk save processes multiple documents');
      } else {
        this.logger.fail('Bulk save failed', JSON.stringify(response.data));
      }
    } catch (error) {
      this.logger.fail('Bulk save failed', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 1.6: Delete document
    try {
      const response = await mockBackendAPI.deleteDocument('/test-document.md');
      
      if (response.success && response.data?.deleted) {
        this.logger.pass('Delete document removes file');
      } else {
        this.logger.fail('Delete document failed', JSON.stringify(response));
      }
    } catch (error) {
      this.logger.fail('Delete document failed', error instanceof Error ? error.message : 'Unknown error');
    }

    // Cleanup
    mockBackendAPI.clearStorage();
  }

  /**
   * Test 2: Metadata Validation
   */
  private async testMetadataValidation() {
    this.logger.section('Metadata Validation Tests');

    // Test 2.1: Valid metadata passes
    try {
      const validMetadata: Partial<DocumentMetadata> = {
        title: 'Valid Document',
        description: 'This is valid',
        category: 'guide',
        status: 'published',
        tags: ['test', 'valid'],
        author: 'Test Author',
        date: '2024-12-25',
        version: '1.0.0',
      };

      const result = metadataService.validate(validMetadata);
      
      if (result.isValid && result.errors.length === 0) {
        this.logger.pass('Valid metadata passes validation');
      } else {
        this.logger.fail('Valid metadata failed', JSON.stringify(result.errors));
      }
    } catch (error) {
      this.logger.fail('Valid metadata test failed', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 2.2: Missing required fields
    try {
      const invalidMetadata: Partial<DocumentMetadata> = {
        description: 'Missing title',
      };

      const result = metadataService.validate(invalidMetadata);
      
      if (!result.isValid && result.errors.some(e => e.field === 'title')) {
        this.logger.pass('Missing title triggers validation error');
      } else {
        this.logger.fail('Missing title validation failed', 'Should have title error');
      }
    } catch (error) {
      this.logger.fail('Missing title test failed', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 2.3: Auto-fix works
    try {
      const messyMetadata: Partial<DocumentMetadata> = {
        title: '  lowercase title  ',
        tags: ['  tag1  ', 'TAG2', 'tag3  '],
      };

      const fixed = metadataService.autoFix(messyMetadata);
      
      if (
        fixed.title === 'Lowercase Title' &&
        fixed.tags?.[0] === 'tag1' &&
        fixed.tags?.[1] === 'tag2'
      ) {
        this.logger.pass('Auto-fix normalizes metadata');
      } else {
        this.logger.fail('Auto-fix failed', JSON.stringify(fixed));
      }
    } catch (error) {
      this.logger.fail('Auto-fix test failed', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 2.4: Tag suggestions based on content
    try {
      const content = 'This document talks about React, TypeScript, and performance optimization.';
      const suggestions = metadataService.suggestTags(content);
      
      if (suggestions.length > 0) {
        this.logger.pass('Tag suggestions generated from content');
        this.logger.info(`Suggested tags: ${suggestions.join(', ')}`);
      } else {
        this.logger.fail('Tag suggestions failed', 'No suggestions generated');
      }
    } catch (error) {
      this.logger.fail('Tag suggestions test failed', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Test 3: Templates
   */
  private async testTemplates() {
    this.logger.section('Template Tests');

    // Test 3.1: Get all templates
    try {
      const templates = metadataService.getTemplates();
      
      if (templates.length === 5) {
        this.logger.pass('All 5 templates loaded');
      } else {
        this.logger.fail('Template loading failed', `Expected 5 templates, got ${templates.length}`);
      }
    } catch (error) {
      this.logger.fail('Get templates failed', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 3.2: Get template by ID
    try {
      const template = metadataService.getTemplateById('roadmap');
      
      if (template && template.id === 'roadmap') {
        this.logger.pass('Get template by ID works');
      } else {
        this.logger.fail('Get template by ID failed', 'Template not found');
      }
    } catch (error) {
      this.logger.fail('Get template by ID failed', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 3.3: Apply template
    try {
      const template = metadataService.getTemplateById('roadmap');
      const metadata = template?.metadata || {};
      
      // Stringify and parse
      const content = metadataService.stringify(metadata, '# Test content');
      const parsed = metadataService.parse(content);
      
      if (parsed.category === 'roadmap') {
        this.logger.pass('Template can be stringified and parsed');
      } else {
        this.logger.fail('Template application failed', 'Metadata not preserved');
      }
    } catch (error) {
      this.logger.fail('Template application failed', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Test 4: Bulk Operations
   */
  private async testBulkOperations() {
    this.logger.section('Bulk Operations Tests');

    // Test 4.1: Bulk metadata update
    try {
      const documents = [
        { path: '/doc1.md', content: '# Doc 1', metadata: { title: 'Doc 1', category: 'guide' as const } },
        { path: '/doc2.md', content: '# Doc 2', metadata: { title: 'Doc 2', category: 'tutorial' as const } },
        { path: '/doc3.md', content: '# Doc 3', metadata: { title: 'Doc 3', category: 'api' as const } },
      ];

      const response = await mockBackendAPI.bulkSaveDocuments({ documents });
      
      if (response.success && response.data?.successCount === 3) {
        this.logger.pass('Bulk update processes all documents');
      } else {
        this.logger.fail('Bulk update failed', `Only ${response.data?.successCount || 0}/3 succeeded`);
      }
    } catch (error) {
      this.logger.fail('Bulk update failed', error instanceof Error ? error.message : 'Unknown error');
    }

    // Cleanup
    mockBackendAPI.clearStorage();
  }

  /**
   * Test 5: Persistence
   */
  private async testPersistence() {
    this.logger.section('Persistence Tests');

    // Test 5.1: Create backup
    try {
      const testContent = '# Test document\n\nThis is a test.';
      metadataPersistence.createBackup('/test.md', testContent);
      
      const backups = metadataPersistence.getBackups('/test.md');
      
      if (backups.length > 0) {
        this.logger.pass('Backup created in localStorage');
      } else {
        this.logger.fail('Backup creation failed', 'No backups found');
      }
    } catch (error) {
      this.logger.fail('Backup creation failed', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 5.2: Retrieve backups
    try {
      const backups = metadataPersistence.getBackups('/test.md');
      
      if (backups.length > 0 && backups[0].content) {
        this.logger.pass('Backups can be retrieved');
      } else {
        this.logger.fail('Backup retrieval failed', 'No content in backup');
      }
    } catch (error) {
      this.logger.fail('Backup retrieval failed', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Test 6: Copy/Download
   */
  private async testCopyDownload() {
    this.logger.section('Copy/Download Tests');

    // Test 6.1: Validate write permissions
    try {
      const validation = metadataPersistence.validateWritePermissions('/test.md', '# Test');
      
      if (validation.canWrite) {
        this.logger.pass('Write permissions validated correctly');
      } else {
        this.logger.fail('Write permissions validation failed', validation.reason || 'Unknown reason');
      }
    } catch (error) {
      this.logger.fail('Write permissions validation failed', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 6.2: Invalid path detection
    try {
      const validation = metadataPersistence.validateWritePermissions('../etc/passwd', 'hack');
      
      if (!validation.canWrite) {
        this.logger.pass('Invalid path detected and blocked');
      } else {
        this.logger.fail('Invalid path validation failed', 'Should have blocked path traversal');
      }
    } catch (error) {
      this.logger.fail('Invalid path validation failed', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 6.3: File size limit
    try {
      const largeContent = 'x'.repeat(11 * 1024 * 1024); // 11MB
      const validation = metadataPersistence.validateWritePermissions('/large.md', largeContent);
      
      if (!validation.canWrite && validation.reason?.includes('too large')) {
        this.logger.pass('File size limit enforced');
      } else {
        this.logger.fail('File size limit failed', 'Should have blocked large file');
      }
    } catch (error) {
      this.logger.fail('File size limit failed', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 6.4: Copy to clipboard (mocked)
    try {
      // En un entorno de testing real, esto requeriría un mock del navigator.clipboard
      this.logger.skip('Copy to clipboard', 'Requires browser environment');
    } catch (error) {
      this.logger.fail('Copy to clipboard failed', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 6.5: Download file (mocked)
    try {
      // En un entorno de testing real, esto requeriría un mock del DOM
      this.logger.skip('Download file', 'Requires browser environment');
    } catch (error) {
      this.logger.fail('Download file failed', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Test 7: Error Handling
   */
  private async testErrorHandling() {
    this.logger.section('Error Handling Tests');

    // Test 7.1: Invalid file extension
    try {
      const response = await mockBackendAPI.saveDocument({
        path: '/test.txt',
        content: 'Not markdown',
        metadata: { title: 'Test' },
      });
      
      if (!response.success && response.error?.includes('.md')) {
        this.logger.pass('Invalid file extension rejected');
      } else {
        this.logger.fail('Invalid file extension handling failed', 'Should have rejected .txt file');
      }
    } catch (error) {
      this.logger.fail('Invalid file extension handling failed', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 7.2: Empty content
    try {
      const response = await mockBackendAPI.saveDocument({
        path: '/test.md',
        content: '',
        metadata: { title: 'Empty' },
      });
      
      if (!response.success && response.error?.includes('required')) {
        this.logger.pass('Empty content rejected');
      } else {
        this.logger.fail('Empty content handling failed', 'Should have rejected empty content');
      }
    } catch (error) {
      this.logger.fail('Empty content handling failed', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 7.3: Non-existent document
    try {
      const response = await mockBackendAPI.getDocument('/non-existent.md');
      
      if (!response.success && response.error?.includes('not found')) {
        this.logger.pass('Non-existent document returns error');
      } else {
        this.logger.fail('Non-existent document handling failed', 'Should have returned not found error');
      }
    } catch (error) {
      this.logger.fail('Non-existent document handling failed', error instanceof Error ? error.message : 'Unknown error');
    }
  }
}

/**
 * Export singleton instance
 */
export const metadataTestSuite = new MetadataTestSuite();

/**
 * Auto-run cuando se importa (opcional - comentar si no se desea)
 */
if (typeof window !== 'undefined') {
  // En browser
  (window as any).__runMetadataTests = () => metadataTestSuite.runAll();
  console.log(colors.cyan + '💡 Tip: Run tests with: __runMetadataTests()' + colors.reset);
}
