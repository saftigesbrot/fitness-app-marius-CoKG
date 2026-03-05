/**
 * Get a color based on progress percentage (0 to 1) for points.
 * Transitions from red through yellow, green to gold at maximum.
 * 
 * @param progress - Value between 0 and 1
 * @returns Hex color string
 */
export function getProgressColor(progress: number): string {
    // Clamp progress between 0 and 1
    const p = Math.min(Math.max(progress, 0), 1);
    
    // Red to Green to Gold gradient
    // 0-50%: Red (#FF3B30) to Yellow (#FFCC00)
    // 50-95%: Yellow (#FFCC00) to Green (#4CD964)
    // 95-100%: Green (#4CD964) to Gold (#FFD700)
    
    if (p < 0.5) {
        return interpolateColor('#FF3B30', '#FFCC00', p / 0.5);
    } else if (p < 0.95) {
        return interpolateColor('#FFCC00', '#4CD964', (p - 0.5) / 0.45);
    } else {
        return interpolateColor('#4CD964', '#FFD700', (p - 0.95) / 0.05);
    }
}

/**
 * Get a blue color based on progress percentage (0 to 1) for level.
 * Transitions from blue (negative/low) through cyan to green (positive/high).
 * 
 * @param progress - Value between 0 and 1
 * @returns Hex color string
 */
export function getLevelColor(progress: number): string {
    // Clamp progress between 0 and 1
    const p = Math.min(Math.max(progress, 0), 1);
    
    // Blue to green gradient
    // 0-33%: Dark Blue (#1E5BB8) to Medium Blue (#2D74DA)
    // 33-66%: Medium Blue (#2D74DA) to Cyan/Turquoise (#00BCD4)
    // 66-100%: Cyan (#00BCD4) to Bright Green (#4CD964)
    
    if (p < 0.33) {
        return interpolateColor('#1E5BB8', '#2D74DA', p / 0.33);
    } else if (p < 0.66) {
        return interpolateColor('#2D74DA', '#00BCD4', (p - 0.33) / 0.33);
    } else {
        return interpolateColor('#00BCD4', '#4CD964', (p - 0.66) / 0.34);
    }
}

/**
 * Interpolate between two hex colors
 */
function interpolateColor(color1: string, color2: string, factor: number): string {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    
    if (!c1 || !c2) return color1;
    
    const r = Math.round(c1.r + factor * (c2.r - c1.r));
    const g = Math.round(c1.g + factor * (c2.g - c1.g));
    const b = Math.round(c1.b + factor * (c2.b - c1.b));
    
    return rgbToHex(r, g, b);
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * Convert RGB to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}
