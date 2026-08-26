// Kopiuje press HeroUI Buttona (scale 0.97, 250ms --ease-smooth, guard na
// motion-reduce), żeby zwykłe linki reagowały na dotyk tak samo jak przyciski.
const pressBase =
  "transform-gpu transition-[transform,background-color] duration-[250ms] " +
  "ease-[var(--ease-smooth)] motion-reduce:transition-none";

export const pressable = `${pressBase} active:scale-[0.97] active:bg-accent-soft/50`;

// Wiersz jest większy, więc mniejsza skala. `has-[button:active]` zeruje efekt,
// gdy press pochodzi z przycisku w środku — :active łapie też przodków.
export const pressableRow = `${pressBase} active:scale-[0.98] active:bg-accent-soft/40 has-[button:active]:scale-100 has-[button:active]:bg-transparent`;
