export interface QRPolynomial {
  getAt: (index: number) => number;
  getLength: () => number;
  multiply: (e: QRPolynomial) => QRPolynomial;
  mod: (e: QRPolynomial) => QRPolynomial;
}
