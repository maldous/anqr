export function generateRandomFragment(length: number, rng: () => number): string {
  let fragment = "";

  for (let i = 0; i < length; i++) {
    fragment += Math.floor(rng() * 10).toString();
  }

  return fragment;
}
