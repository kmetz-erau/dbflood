export function mmToInches(mm: number): number { return mm / 25.4; }
export function alertIsFloodRelated(event: string): boolean { return /flood|storm surge|coastal|hurricane|tropical storm|flash flood|high surf|rip current/i.test(event); }
