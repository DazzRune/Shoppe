export function getCSSProp(prop: string, el: HTMLElement): number {
	return parseInt(window.getComputedStyle(el).getPropertyValue(prop))
}

// случайное целое число из диапозона, включая правую границу
export function getRandomFromRange(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function idGenerator(): string {
	return Date.now().toString(36) + Math.random().toString(36).substring(2)
}
