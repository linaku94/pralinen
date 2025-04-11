export const pralinenSorten = ['Karamell', 'Kaktus-Eis', 'Karlsruhe', 'Eierlikör', 'Zitrone', 'Kokos', 'Himbeer'] as const;

export type PralinenSorte = typeof pralinenSorten[number];

export type Feedback = {
	name: string;
	bestePraline: PralinenSorte;
	schlechtestePraline: PralinenSorte;
	freitext: string;
}