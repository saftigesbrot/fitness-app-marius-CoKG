/**
 * Get a color based on progress percentage (0 to 1).
 * Transitions from red (low progress) to green (high progress).
 * 
 * @param progress - Value between 0 and 1
 * @returns Hex color string
 */
export function getProgressColor(progress: number): string {
    // Clamp progress between 0 and 1
    const p = Math.min(Math.max(progress, 0), 1);
    
    // Define color stops
    // 0-25%: Red to Orange
    // 25-50%: Orange to Yellow
    // 50-75%: Yellow to Light Green
    // 75-100%: Light Green to Dark Green
    
    if (p < 0.25) {
        // Red (#FF3B30) to Orange (#FF9500)
        return interpolateColor('#FF3B30', '#FF9500', p / 0.25);
    } else if (p < 0.5) {
        // Orange (#FF9500) to Yellow (#FFCC00)
        return interpolateColor('#FF9500', '#FFCC00', (p - 0.25) / 0.25);
    } else if (p < 0.75) {
        // Yellow (#FFCC00) to Light Green (#8BC34A)
        return interpolateColor('#FFCC00', '#8BC34A', (p - 0.5) / 0.25);
    } else {
        // Light Green (#8BC34A) to Dark Green (#4CD964)
        return interpolateColor('#8BC34A', '#4CD964', (p - 0.75) / 0.25);
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
