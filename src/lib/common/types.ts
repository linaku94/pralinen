export const pralinenSorten = ['Karamell', 'Kaktus-Eis', 'Matcha', 'Zitrone', 'Kokos', 'Himbeer'] as const;

export type PralinenSorte = typeof pralinenSorten[number];

export type Feedback = {
	name: string;
	bestePraline: PralinenSorte;
	schlechtestePraline: PralinenSorte;
	freitext: string;
	timeStamp: {seconds: number; nanoseconds: number};
}