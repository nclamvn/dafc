/**
 * Excel Import Test Script
 * Tests the Excel parser with mock data files
 * Run with: npx tsx scripts/test-excel-import.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { parseExcelFile, ParseResult } from '../lib/excel/parser';

const MOCK_DATA_DIR = '/Users/mac/Downloads/files (17)';

interface TestCase {
  file: string;
  description: string;
  expectedSuccess: boolean;
  expectedMinRows?: number;
  expectedErrors?: number;
  expectedWarnings?: number;
}

const testCases: TestCase[] = [
  {
    file: '01_SKU_Proposal_Valid_200SKUs.xlsx',
    description: 'Valid 200 SKUs - Happy path',
    expectedSuccess: true,
    expectedMinRows: 180, // Allow some flexibility
  },
  {
    file: '02_SKU_Proposal_With_Errors.xlsx',
    description: 'SKUs with validation errors',
    expectedSuccess: false,
    expectedErrors: 5, // Minimum expected errors
  },
  // Note: 10_Complete_Migration_Package.xlsx is a multi-entity migration package
  // with 11 sheets (Instructions, Brands, Categories, etc.)
  // It requires separate import logic for each entity type
];

function printResult(name: string, result: ParseResult): void {
  console.log('\n' + '='.repeat(60));
  console.log(`📄 ${name}`);
  console.log('='.repeat(60));

  console.log('\n📊 Summary:');
  console.log(`   Total Rows:    ${result.summary.totalRows}`);
  console.log(`   Parsed Rows:   ${result.summary.parsedRows}`);
  console.log(`   Error Rows:    ${result.summary.errorRows}`);
  console.log(`   Total Qty:     ${result.summary.totalQuantity.toLocaleString()}`);
  console.log(`   Total Value:   $${result.summary.totalValue.toLocaleString()}`);

  const errors = result.errors.filter(e => e.severity === 'error');
  const warnings = result.errors.filter(e => e.severity === 'warning');

  console.log(`\n❌ Errors: ${errors.length}`);
  if (errors.length > 0 && errors.length <= 10) {
    errors.forEach(e => {
      console.log(`   Row ${e.row}: [${e.column}] ${e.message}`);
    });
  } else if (errors.length > 10) {
    errors.slice(0, 5).forEach(e => {
      console.log(`   Row ${e.row}: [${e.column}] ${e.message}`);
    });
    console.log(`   ... and ${errors.length - 5} more errors`);
  }

  console.log(`\n⚠️  Warnings: ${warnings.length}`);
  if (warnings.length > 0 && warnings.length <= 5) {
    warnings.forEach(e => {
      console.log(`   Row ${e.row}: [${e.column}] ${e.message}`);
    });
  } else if (warnings.length > 5) {
    warnings.slice(0, 3).forEach(e => {
      console.log(`   Row ${e.row}: [${e.column}] ${e.message}`);
    });
    console.log(`   ... and ${warnings.length - 3} more warnings`);
  }

  // Show sample parsed data
  if (result.data.length > 0) {
    console.log('\n📋 Sample Data (first 3 rows):');
    result.data.slice(0, 3).forEach(sku => {
      console.log(`   ${sku.skuCode}: ${sku.styleName} | ${sku.category} | $${sku.retailPrice} | Qty: ${sku.orderQuantity}`);
    });
  }

  console.log(`\n✅ Parse Success: ${result.success ? 'YES' : 'NO'}`);
}

async function runTests(): Promise<void> {
  console.log('🚀 DAFC Excel Import Test Runner');
  console.log('================================\n');

  // Check if mock data directory exists
  if (!fs.existsSync(MOCK_DATA_DIR)) {
    console.error(`❌ Mock data directory not found: ${MOCK_DATA_DIR}`);
    process.exit(1);
  }

  const results: { name: string; passed: boolean; message: string }[] = [];

  for (const testCase of testCases) {
    const filePath = path.join(MOCK_DATA_DIR, testCase.file);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${testCase.file}`);
      results.push({ name: testCase.file, passed: false, message: 'File not found' });
      continue;
    }

    try {
      // Read file
      const buffer = fs.readFileSync(filePath);
      const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      );

      // Parse
      const result = parseExcelFile(arrayBuffer);

      // Print detailed result
      printResult(`${testCase.file} - ${testCase.description}`, result);

      // Verify expectations
      let passed = true;
      let message = 'OK';

      if (testCase.expectedSuccess !== undefined && result.success !== testCase.expectedSuccess) {
        passed = false;
        message = `Expected success=${testCase.expectedSuccess}, got ${result.success}`;
      }

      if (testCase.expectedMinRows !== undefined && result.summary.parsedRows < testCase.expectedMinRows) {
        passed = false;
        message = `Expected min ${testCase.expectedMinRows} rows, got ${result.summary.parsedRows}`;
      }

      const errorCount = result.errors.filter(e => e.severity === 'error').length;
      if (testCase.expectedErrors !== undefined && errorCount < testCase.expectedErrors) {
        passed = false;
        message = `Expected min ${testCase.expectedErrors} errors, got ${errorCount}`;
      }

      results.push({ name: testCase.file, passed, message });

    } catch (error) {
      console.error(`\n❌ Error processing ${testCase.file}:`, error);
      results.push({
        name: testCase.file,
        passed: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;

  results.forEach(r => {
    const status = r.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} | ${r.name} | ${r.message}`);
  });

  console.log('\n' + '-'.repeat(60));
  console.log(`Total: ${passedCount}/${totalCount} tests passed`);

  if (passedCount === totalCount) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Review the output above.');
  }
}

// Run tests
runTests().catch(console.error);
