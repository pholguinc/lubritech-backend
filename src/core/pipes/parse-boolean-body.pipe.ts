import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
/**
 * Pipe que transforma campos de tipo string en booleanos reales dentro de un objeto.
 * Útil para peticiones `multipart/form-data` donde todos los campos se envían como cadenas.
 * Soporta conversiones de:
 * - "true" -> true
 * - "false" -> false
 * - "1" -> true
 * - "0" -> false
 */
export class ParseBooleanBodyPipe implements PipeTransform {
  /**
   * Recorre las claves del objeto y aplica la conversión de tipos.
   *
   * @param value - El objeto body de la petición.
   * @returns El objeto con las cadenas booleanas transformadas.
   */
  transform(value: unknown) {
    if (typeof value !== 'object' || value === null) return value;

    const result = { ...value } as Record<string, unknown>;
    for (const key of Object.keys(result)) {
      if (result[key] === 'true') {
        result[key] = true;
      } else if (result[key] === 'false') {
        result[key] = false;
      } else if (
        typeof result[key] === 'string' &&
        (result[key] === '1' || result[key] === '0')
      ) {
        result[key] = result[key] === '1';
      }
    }
    return result;
  }
}
