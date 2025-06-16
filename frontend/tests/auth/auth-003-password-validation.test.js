/**
 * AUTH-003: Password Validation Test
 * 
 * Test delle regole di validazione password con controlli
 * di sicurezza, forza e pattern richiesti.
 */

import { validatePassword, getPasswordStrength } from '../../src/utils/passwordValidator';

describe('AUTH-003: Password Validation', () => {
  describe('validatePassword function', () => {
    test('dovrebbe accettare password valide', () => {
      const validPasswords = [
        'Test123!',
        'MySecure456@',
        'Strong789#',
        'Complex2024$'
      ];

      validPasswords.forEach(password => {
        expect(validatePassword(password)).toEqual({
          isValid: true,
          errors: []
        });
      });
    });

    test('dovrebbe rifiutare password troppo corte', () => {
      const shortPasswords = ['123', 'Test1!', 'Ab1!'];

      shortPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password deve essere almeno 8 caratteri');
      });
    });

    test('dovrebbe richiedere almeno una lettera maiuscola', () => {
      const noUppercase = 'test123!';
      
      const result = validatePassword(noUppercase);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password deve contenere almeno una lettera maiuscola');
    });

    test('dovrebbe richiedere almeno una lettera minuscola', () => {
      const noLowercase = 'TEST123!';
      
      const result = validatePassword(noLowercase);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password deve contenere almeno una lettera minuscola');
    });

    test('dovrebbe richiedere almeno un numero', () => {
      const noNumber = 'TestPassword!';
      
      const result = validatePassword(noNumber);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password deve contenere almeno un numero');
    });

    test('dovrebbe richiedere almeno un carattere speciale', () => {
      const noSpecial = 'TestPassword123';
      
      const result = validatePassword(noSpecial);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password deve contenere almeno un carattere speciale');
    });

    test('dovrebbe rifiutare password troppo lunghe', () => {
      const tooLong = 'A'.repeat(129) + '1!';
      
      const result = validatePassword(tooLong);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password non può superare 128 caratteri');
    });

    test('dovrebbe rifiutare password comuni', () => {
      const commonPasswords = [
        'Password123!',
        '123456789!',
        'Qwerty123!',
        'Admin123!'
      ];

      commonPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password troppo comune');
      });
    });

    test('dovrebbe rifiutare sequenze consecutive', () => {
      const sequentialPasswords = [
        'Abc123!',
        'Test1234!',
        'Qwer123!'
      ];

      sequentialPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Password non può contenere sequenze consecutive');
      });
    });
  });

  describe('getPasswordStrength function', () => {
    test('dovrebbe calcolare forza DEBOLE per password semplici', () => {
      const weakPasswords = [
        'Test123!',
        'Simple1!'
      ];

      weakPasswords.forEach(password => {
        const strength = getPasswordStrength(password);
        expect(strength.level).toBe('DEBOLE');
        expect(strength.score).toBeLessThan(40);
      });
    });

    test('dovrebbe calcolare forza MEDIA per password moderate', () => {
      const mediumPasswords = [
        'MySecure456@',
        'Decent789#Pass'
      ];

      mediumPasswords.forEach(password => {
        const strength = getPasswordStrength(password);
        expect(strength.level).toBe('MEDIA');
        expect(strength.score).toBeGreaterThanOrEqual(40);
        expect(strength.score).toBeLessThan(70);
      });
    });

    test('dovrebbe calcolare forza FORTE per password robuste', () => {
      const strongPasswords = [
        'VeryComplex789@#Strong',
        'Ultra$ecure2024!Password'
      ];

      strongPasswords.forEach(password => {
        const strength = getPasswordStrength(password);
        expect(strength.level).toBe('FORTE');
        expect(strength.score).toBeGreaterThanOrEqual(70);
      });
    });

    test('dovrebbe fornire suggerimenti per migliorare', () => {
      const weakPassword = 'test123';
      const strength = getPasswordStrength(weakPassword);
      
      expect(strength.suggestions).toContain('Aggiungi lettere maiuscole');
      expect(strength.suggestions).toContain('Aggiungi caratteri speciali');
      expect(strength.suggestions).toContain('Aumenta la lunghezza');
    });

    test('dovrebbe penalizzare pattern ripetitivi', () => {
      const repetitivePassword = 'AaAa1!1!';
      const normalPassword = 'MySecure123!';
      
      const repetitiveStrength = getPasswordStrength(repetitivePassword);
      const normalStrength = getPasswordStrength(normalPassword);
      
      expect(repetitiveStrength.score).toBeLessThan(normalStrength.score);
    });

    test('dovrebbe premiare diversità di caratteri', () => {
      const diversePassword = 'MyComplex789@#$';
      const simplePassword = 'Test123!';
      
      const diverseStrength = getPasswordStrength(diversePassword);
      const simpleStrength = getPasswordStrength(simplePassword);
      
      expect(diverseStrength.score).toBeGreaterThan(simpleStrength.score);
    });
  });

  describe('Edge cases', () => {
    test('dovrebbe gestire password vuote', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password è richiesta');
    });

    test('dovrebbe gestire password null/undefined', () => {
      expect(validatePassword(null)).toEqual({
        isValid: false,
        errors: ['Password è richiesta']
      });

      expect(validatePassword(undefined)).toEqual({
        isValid: false,
        errors: ['Password è richiesta']
      });
    });

    test('dovrebbe gestire caratteri Unicode', () => {
      const unicodePassword = 'Tëst123!è';
      const result = validatePassword(unicodePassword);
      expect(result.isValid).toBe(true);
    });

    test('dovrebbe gestire emoji in password', () => {
      const emojiPassword = 'Test123!😊';
      const result = validatePassword(emojiPassword);
      expect(result.isValid).toBe(true);
    });
  });
});
