/** Côté cliente, le bus de moments n'existe pas : un `emit` partagé y est inerte. */
export const emettreMoment: (type: string, charge: unknown) => void = () => undefined;
