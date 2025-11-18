export function isActiveRoute(
    pattern: string | string[],
    exact: boolean = false,
): boolean {
    const current = route().current();

    if (!current) return false;

    const patterns = Array.isArray(pattern) ? pattern : [pattern];

    return patterns.some((pat) => {
        if (exact) {
            return current === pat;
        }
        const regex = new RegExp('^' + pat.replace(/\*/g, '.*') + '$');
        return regex.test(current);
    });
}
