export const FUELS = ["ai92", "ai95", "ai98", "dt", "gas"] as const;
export type Fuel = (typeof FUELS)[number];

export const fuelLabels: Record<Fuel, string> = {
  ai92: "АИ-92",
  ai95: "АИ-95",
  ai98: "АИ-98",
  dt: "ДТ",
  gas: "Газ",
};

export const ORDER_STATUSES = [
  "new",
  "accepted",
  "on_the_way",
  "fueling",
  "done",
  "cancelled",
  "disputed",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/**
 * Статус — единственное место, где цвет несёт смысл, а не украшает. Поэтому
 * рядом с ним всегда есть текст: понятно и без цвета, и без зрения.
 */
export const statusLabels: Record<OrderStatus, string> = {
  new: "Ищем исполнителя",
  accepted: "Исполнитель найден",
  on_the_way: "Едет к вам",
  fueling: "Заправляет",
  done: "Готово",
  cancelled: "Отменена",
  disputed: "Спор",
};

/** Допустимые переходы. Единственный источник истины — тот же список на сервере. */
export const allowedTransitions: Record<OrderStatus, readonly OrderStatus[]> = {
  new: ["accepted", "cancelled"],
  accepted: ["on_the_way", "cancelled"],
  on_the_way: ["fueling", "cancelled"],
  fueling: ["done", "cancelled"],
  done: ["disputed"],
  cancelled: [],
  disputed: [],
};

export const LIMIT_MIN_RUB = 500;
export const LIMIT_MAX_RUB = 10_000;
