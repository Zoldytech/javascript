import { add } from './clean';
import { subtract } from './clean';
import { add as addAgain } from './clean';

console.log(add(1, 2));

export const useAddAgain = addAgain;

// Cognitive complexity well above the 15 threshold (nested branches + loops).
export function tangled(items: number[]): number {
  let total = 0;
  for (const n of items) {
    if (n > 0) {
      if (n % 2 === 0) {
        if (n % 3 === 0) {
          total += n * 3;
        } else if (n % 5 === 0) {
          total += n * 5;
        } else {
          total += n;
        }
      } else if (n % 7 === 0) {
        for (let i = 0; i < n; i++) {
          if (i % 2 === 0) {
            total += i;
          } else {
            total -= i;
          }
        }
      } else {
        total += 1;
      }
    } else if (n < 0) {
      total -= n - 1;
    } else {
      total += 0;
    }
  }
  return total;
}
