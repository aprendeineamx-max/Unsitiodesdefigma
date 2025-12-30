/**
 * USE METADATA VALIDATION HOOK
 * Hook para validación en tiempo real de metadata con debounce
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { metadataService, type ValidationResult } from '../services/metadataService';
import type { DocumentMetadata } from '../types/documentation';

interface UseMetadataValidationOptions {
  /**
   * Debounce en ms para validación (default: 300ms)
   */
  debounceMs?: number;
  
  /**
   * Validar automáticamente al cambiar metadata (default: true)
   */
  autoValidate?: boolean;
  
  /**
   * Aplicar auto-fix automáticamente (default: false)
   */
  autoFix?: boolean;
  
  /**
   * Callback cuando la validación cambia
   */
  onValidationChange?: (result: ValidationResult) => void;
}

interface UseMetadataValidationReturn {
  /**
   * Resultado de validación actual
   */
  validation: ValidationResult | null;
  
  /**
   * Si está validando actualmente
   */
  isValidating: boolean;
  
  /**
   * Validar metadata manualmente
   */
  validate: (metadata: Partial<DocumentMetadata>) => ValidationResult;
  
  /**
   * Aplicar auto-fix a metadata
   */
  applyAutoFix: (metadata: Partial<DocumentMetadata>) => Partial<DocumentMetadata>;
  
  /**
   * Limpiar validación
   */
  clearValidation: () => void;
  
  /**
   * Si hay errores
   */
  hasErrors: boolean;
  
  /**
   * Si hay warnings
   */
  hasWarnings: boolean;
  
  /**
   * Si metadata es válida
   */
  isValid: boolean;
}

/**
 * Hook para validación de metadata con debounce y auto-fix
 */
export function useMetadataValidation(
  metadata: Partial<DocumentMetadata>,
  options: UseMetadataValidationOptions = {}
): UseMetadataValidationReturn {
  const {
    debounceMs = 300,
    autoValidate = true,
    autoFix = false,
    onValidationChange,
  } = options;

  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const onValidationChangeRef = useRef(onValidationChange);

  // Actualizar ref de callback
  useEffect(() => {
    onValidationChangeRef.current = onValidationChange;
  }, [onValidationChange]);

  /**
   * Validar metadata
   */
  const validate = useCallback((meta: Partial<DocumentMetadata>): ValidationResult => {
    const result = metadataService.validate(meta);
    setValidation(result);
    onValidationChangeRef.current?.(result);
    return result;
  }, []);

  /**
   * Aplicar auto-fix
   */
  const applyAutoFix = useCallback((meta: Partial<DocumentMetadata>): Partial<DocumentMetadata> => {
    return metadataService.autofix(meta);
  }, []);

  /**
   * Limpiar validación
   */
  const clearValidation = useCallback(() => {
    setValidation(null);
    setIsValidating(false);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  /**
   * Auto-validar con debounce cuando metadata cambia
   */
  useEffect(() => {
    if (!autoValidate) return;

    // Limpiar timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsValidating(true);

    // Debounce de validación
    debounceTimerRef.current = setTimeout(() => {
      let metaToValidate = metadata;

      // Aplicar auto-fix si está habilitado
      if (autoFix) {
        metaToValidate = metadataService.autofix(metadata);
      }

      const result = metadataService.validate(metaToValidate);
      setValidation(result);
      setIsValidating(false);
      onValidationChangeRef.current?.(result);
    }, debounceMs);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [metadata, autoValidate, autoFix, debounceMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const hasErrors = validation ? validation.errors.length > 0 : false;
  const hasWarnings = validation ? validation.warnings.length > 0 : false;
  const isValid = validation ? validation.valid : false;

  return {
    validation,
    isValidating,
    validate,
    applyAutoFix,
    clearValidation,
    hasErrors,
    hasWarnings,
    isValid,
  };
}
