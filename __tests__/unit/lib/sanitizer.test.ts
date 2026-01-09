import {
  sanitizeString,
  sanitizeHTML,
  sanitizeObject,
  sanitizeEmail,
  sanitizeNumeric,
  sanitizeFilename,
  hasSQLInjection,
  hasNoSQLInjection,
  isValidFileExtension,
  isValidFileSize,
  isValidDate,
  isValidUUID,
  escapeForDisplay,
} from '@/lib/security/sanitizer';

describe('sanitizeString', () => {
  it('should remove HTML tags', () => {
    expect(sanitizeString('<script>alert("xss")</script>Hello')).toBe('Hello');
  });

  it('should trim whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
  });

  it('should handle empty strings', () => {
    expect(sanitizeString('')).toBe('');
  });

  it('should handle non-string inputs', () => {
    expect(sanitizeString(null as unknown as string)).toBe('');
    expect(sanitizeString(undefined as unknown as string)).toBe('');
  });
});

describe('sanitizeHTML', () => {
  it('should allow safe HTML tags', () => {
    expect(sanitizeHTML('<b>bold</b>')).toBe('<b>bold</b>');
    expect(sanitizeHTML('<i>italic</i>')).toBe('<i>italic</i>');
  });

  it('should remove dangerous tags', () => {
    expect(sanitizeHTML('<script>alert("xss")</script>')).toBe('');
    expect(sanitizeHTML('<iframe src="evil.com"></iframe>')).toBe('');
  });
});

describe('sanitizeObject', () => {
  it('should sanitize all string values in an object', () => {
    const input = {
      name: '<script>xss</script>John',
      age: 25,
      tags: ['<b>tag1</b>', 'tag2'],
    };
    const result = sanitizeObject(input);
    expect(result.name).toBe('John');
    expect(result.age).toBe(25);
  });

  it('should handle nested objects', () => {
    const input = {
      user: {
        name: '<script>xss</script>John',
      },
    };
    const result = sanitizeObject(input);
    expect(result.user.name).toBe('John');
  });
});

describe('sanitizeEmail', () => {
  it('should validate and lowercase valid emails', () => {
    expect(sanitizeEmail('Test@Example.COM')).toBe('test@example.com');
  });

  it('should return null for invalid emails', () => {
    expect(sanitizeEmail('notanemail')).toBeNull();
    expect(sanitizeEmail('missing@domain')).toBeNull();
  });
});

describe('sanitizeNumeric', () => {
  it('should parse valid integers', () => {
    expect(sanitizeNumeric('123')).toBe(123);
  });

  it('should parse valid decimals when allowed', () => {
    expect(sanitizeNumeric('123.45', { allowDecimal: true })).toBe(123.45);
  });

  it('should reject decimals when not allowed', () => {
    expect(sanitizeNumeric('123.45')).toBeNull();
  });

  it('should enforce min/max constraints', () => {
    expect(sanitizeNumeric('5', { min: 10 })).toBeNull();
    expect(sanitizeNumeric('15', { max: 10 })).toBeNull();
    expect(sanitizeNumeric('5', { min: 1, max: 10 })).toBe(5);
  });
});

describe('sanitizeFilename', () => {
  it('should remove path traversal characters', () => {
    expect(sanitizeFilename('../../../etc/passwd')).toBe('etcpasswd');
  });

  it('should remove special characters', () => {
    expect(sanitizeFilename('file<>name?.txt')).toBe('filename.txt');
  });
});

describe('hasSQLInjection', () => {
  it('should detect SQL injection patterns', () => {
    expect(hasSQLInjection("'; DROP TABLE users; --")).toBe(true);
    expect(hasSQLInjection('SELECT * FROM users')).toBe(true);
    expect(hasSQLInjection("1' OR '1'='1")).toBe(true);
  });

  it('should not flag normal input', () => {
    expect(hasSQLInjection('hello world')).toBe(false);
    expect(hasSQLInjection('john.doe@example.com')).toBe(false);
  });
});

describe('hasNoSQLInjection', () => {
  it('should detect NoSQL injection patterns', () => {
    expect(hasNoSQLInjection('{"$gt": ""}')).toBe(true);
    expect(hasNoSQLInjection('$where')).toBe(true);
  });

  it('should not flag normal input', () => {
    expect(hasNoSQLInjection('hello world')).toBe(false);
  });
});

describe('isValidFileExtension', () => {
  it('should validate allowed extensions', () => {
    expect(isValidFileExtension('file.xlsx', ['xlsx', 'xls'])).toBe(true);
    expect(isValidFileExtension('file.pdf', ['xlsx', 'xls'])).toBe(false);
  });

  it('should be case insensitive', () => {
    expect(isValidFileExtension('file.XLSX', ['xlsx'])).toBe(true);
  });
});

describe('isValidFileSize', () => {
  it('should validate file size within limit', () => {
    expect(isValidFileSize(1024, 2048)).toBe(true);
    expect(isValidFileSize(2048, 1024)).toBe(false);
  });

  it('should reject zero or negative sizes', () => {
    expect(isValidFileSize(0, 1024)).toBe(false);
    expect(isValidFileSize(-100, 1024)).toBe(false);
  });
});

describe('isValidDate', () => {
  it('should validate valid date strings', () => {
    expect(isValidDate('2025-01-15')).toBe(true);
    expect(isValidDate('2025-01-15T10:30:00Z')).toBe(true);
  });

  it('should reject invalid dates', () => {
    expect(isValidDate('not-a-date')).toBe(false);
    expect(isValidDate('')).toBe(false);
  });
});

describe('isValidUUID', () => {
  it('should validate valid UUIDs', () => {
    expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
  });

  it('should reject invalid UUIDs', () => {
    expect(isValidUUID('not-a-uuid')).toBe(false);
    expect(isValidUUID('123')).toBe(false);
  });
});

describe('escapeForDisplay', () => {
  it('should escape HTML special characters', () => {
    expect(escapeForDisplay('<script>')).toBe('&lt;script&gt;');
    expect(escapeForDisplay('"quotes"')).toBe('&quot;quotes&quot;');
    expect(escapeForDisplay("'apostrophe'")).toBe('&#x27;apostrophe&#x27;');
  });
});
