import { expect, test } from "@playwright/test";

test("главная отвечает и содержит заголовок", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
