/**
 * Calculates human-readable, evenly distributed Y-axis tick intervals.
 * Matches the reference image (0, 200, 400, 600, 800, 1000, 1200) for sales near ~1000 EGP.
 */
export function calculateYAxisTicks(maxValue, mode, lng = 'ar') {
    const isEn = lng.startsWith('en');
    if (mode === 'sales') {
        if (maxValue <= 0) {
            const defaultTicks = [0, 200, 400, 600, 800, 1000, 1200];
            return {
                ticks: defaultTicks,
                formattedTicks: defaultTicks.map((v) => formatTickValue(v, true, isEn)),
                maxTick: 1200,
            };
        }
        // Determine nice tick step
        const targetIntervals = 5;
        const rawStep = maxValue / targetIntervals;
        const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep || 1)));
        const normalized = rawStep / magnitude;
        let step;
        if (normalized <= 1.2) {
            step = 1 * magnitude;
        }
        else if (normalized <= 2.2) {
            step = 2 * magnitude;
        }
        else if (normalized <= 3.5) {
            step = 2.5 * magnitude;
        }
        else if (normalized <= 6) {
            step = 5 * magnitude;
        }
        else {
            step = 10 * magnitude;
        }
        if (step < 10)
            step = 10;
        const maxTick = Math.ceil(maxValue / step) * step;
        const ticks = [];
        for (let v = 0; v <= maxTick; v += step) {
            ticks.push(v);
        }
        // Safety fallback
        if (ticks.length < 3) {
            ticks.push(maxTick + step);
        }
        return {
            ticks,
            formattedTicks: ticks.map((v) => formatTickValue(v, true, isEn)),
            maxTick: ticks[ticks.length - 1],
        };
    }
    else {
        // Orders mode (integers only)
        if (maxValue <= 0) {
            const defaultTicks = [0, 2, 4, 6, 8, 10];
            return {
                ticks: defaultTicks,
                formattedTicks: defaultTicks.map((v) => formatTickValue(v, false, isEn)),
                maxTick: 10,
            };
        }
        let step = 1;
        if (maxValue <= 5) {
            step = 1;
        }
        else if (maxValue <= 12) {
            step = 2;
        }
        else if (maxValue <= 25) {
            step = 5;
        }
        else if (maxValue <= 60) {
            step = 10;
        }
        else {
            step = Math.ceil(maxValue / 5);
        }
        const maxTick = Math.ceil(maxValue / step) * step;
        const ticks = [];
        for (let v = 0; v <= maxTick; v += step) {
            ticks.push(v);
        }
        return {
            ticks,
            formattedTicks: ticks.map((v) => formatTickValue(v, false, isEn)),
            maxTick: ticks[ticks.length - 1],
        };
    }
}
/**
 * Format individual tick labels on the Y axis.
 */
function formatTickValue(val, isCurrency, isEn) {
    const formattedNum = val.toLocaleString();
    if (!isCurrency) {
        return formattedNum;
    }
    return isEn ? `EGP ${formattedNum}` : `${formattedNum} ج.م`;
}
/**
 * Builds a smooth cubic Bezier curve path string through Cartesian data points.
 * Clamps control points between minY and baselineY to prevent unrealistic dipping or overshoot.
 */
export function buildSmoothBezierPath(points, baselineY, minY = 10) {
    if (!points || points.length === 0)
        return '';
    if (points.length === 1)
        return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    if (points.length === 2) {
        return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)} ${points[1].y.toFixed(1)}`;
    }
    const tension = 0.2;
    let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
        const pPrev = i > 0 ? points[i - 1] : points[i];
        const pCurr = points[i];
        const pNext = points[i + 1];
        const pAfter = i + 2 < points.length ? points[i + 2] : pNext;
        let cp1x = pCurr.x + (pNext.x - pPrev.x) * tension;
        let cp1y = pCurr.y + (pNext.y - pPrev.y) * tension;
        let cp2x = pNext.x - (pAfter.x - pCurr.x) * tension;
        let cp2y = pNext.y - (pAfter.y - pCurr.y) * tension;
        // Clamp Y values to chart area bounds
        cp1y = Math.min(baselineY, Math.max(minY, cp1y));
        cp2y = Math.min(baselineY, Math.max(minY, cp2y));
        path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${pNext.x.toFixed(1)} ${pNext.y.toFixed(1)}`;
    }
    return path;
}
/**
 * Builds the closed SVG path for the subtle gradient area beneath the curve.
 */
export function buildAreaPath(linePath, points, baselineY) {
    if (!linePath || points.length === 0)
        return '';
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    return `${linePath} L ${lastPoint.x.toFixed(1)} ${baselineY.toFixed(1)} L ${firstPoint.x.toFixed(1)} ${baselineY.toFixed(1)} Z`;
}
/**
 * Localizes X-axis bucket labels between English and Arabic.
 */
export function localizeChartLabel(label, lng = 'ar') {
    const isAr = !lng.startsWith('en');
    if (!isAr)
        return label;
    // 12-hour AM/PM formats
    const hourMap = {
        '10 AM': '10 ص',
        '12 PM': '12 م',
        '2 PM': '2 م',
        '4 PM': '4 م',
        '6 PM': '6 م',
        '8 PM': '8 م',
        '10 PM': '10 م',
        '12 AM': '12 ص',
    };
    if (hourMap[label])
        return hourMap[label];
    // Weekdays
    const dayMap = {
        Sat: 'السبت',
        Sun: 'الأحد',
        Mon: 'الإثنين',
        Tue: 'الثلاثاء',
        Wed: 'الأربعاء',
        Thu: 'الخميس',
        Fri: 'الجمعة',
    };
    if (dayMap[label])
        return dayMap[label];
    return label;
}
/**
 * Formats a bucket's start time for the detailed floating tooltip.
 * E.g. "8:00 PM" in English or "8:00 م" in Arabic.
 */
export function formatDetailedBucketTime(bucket, lng = 'ar') {
    const isEn = lng.startsWith('en');
    const d = new Date(bucket.startTime);
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampmEn = hours >= 12 ? 'PM' : 'AM';
    const ampmAr = hours >= 12 ? 'م' : 'ص';
    hours = hours % 12;
    if (hours === 0)
        hours = 12;
    const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
    if (isEn) {
        return `${hours}:${minStr} ${ampmEn}`;
    }
    return `${hours}:${minStr} ${ampmAr}`;
}
