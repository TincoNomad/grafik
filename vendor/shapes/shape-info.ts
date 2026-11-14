import type {Instruction} from './types';

export type ShapeInfo = {
	path: string;
	width: number;
	height: number;
	transformOrigin: string;
	instructions: Instruction[];
};
