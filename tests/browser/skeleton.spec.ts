import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/?fixture");
  await expect(page.locator("[data-skeleton-shape]").first()).toBeVisible();
});

test("generates real text and media shapes while hiding content", async ({ page }) => {
  const root = page.getByTestId("fixture-skeleton");
  await expect(root).toHaveAttribute("aria-busy", "true");
  await expect(root.locator('[data-skeleton-shape="text"]')).toHaveCount(2);
  await expect(root.locator('[data-skeleton-shape="block"]')).toHaveCount(3);
  await expect(root.locator("[data-skeleton-content]")).toHaveCSS("opacity", "0");
  await expect(root.locator("[data-skeleton-content]")).toHaveAttribute("aria-hidden", "true");
  const avatar = await root.getByTestId("avatar").boundingBox();
  const shape = await root.locator('[data-skeleton-shape="block"]').first().boundingBox();
  expect(avatar).toEqual(shape);
  await expect(root.locator('[data-skeleton-shape="block"]').first()).toHaveCSS(
    "border-radius",
    "50%",
  );
});

test("follows dynamic content and responsive wrapping", async ({ page }) => {
  const text = page.locator('[data-skeleton-shape="text"]');
  await page.getByRole("button", { name: "Change content" }).click();
  await expect.poll(() => text.count()).toBeGreaterThan(3);
  const wideLines = await text.count();
  await page.getByRole("button", { name: "Resize container" }).click();
  await expect.poll(() => text.count()).toBeGreaterThan(wideLines);
});

test("observes child dimensions even when the outer width is unchanged", async ({ page }) => {
  const shape = page.locator('[data-skeleton-shape="block"]').first();
  await expect(shape).toHaveCSS("width", "48px");
  await page.getByRole("button", { name: "Resize child" }).click();
  await expect(shape).toHaveCSS("width", "80px");
  await expect(shape).toHaveCSS("height", "80px");
});

test("preserves state, input values, and layout across loading transitions", async ({ page }) => {
  const root = page.getByTestId("fixture-skeleton");
  const before = await root.boundingBox();
  await page.getByRole("button", { name: "Toggle loading" }).click();
  await root.getByTestId("counter").click();
  await root.getByRole("textbox").fill("Kept across toggles");
  await page.getByRole("button", { name: "Toggle loading" }).click();
  await expect(root.locator("[data-skeleton-overlay]")).toBeVisible();
  await page.getByRole("button", { name: "Toggle loading" }).click();
  await expect(root.getByTestId("counter")).toHaveText("Count 1");
  await expect(root.getByRole("textbox")).toHaveValue("Kept across toggles");
  expect(await root.boundingBox()).toEqual(before);
  await expect(root.locator("[data-skeleton-overlay]")).toHaveCount(0);
});

test("prevents keyboard and programmatic focus on loading content", async ({ page }) => {
  await page.getByRole("button", { name: "Hydrate", exact: true }).focus();
  await page.keyboard.press("Tab");
  await expect(page.getByTestId("after")).toBeFocused();
  await page.getByTestId("counter").evaluate((element) => (element as HTMLElement).focus());
  await expect(page.getByTestId("counter")).not.toBeFocused();
});

test("honors reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const animation = await page
    .locator("[data-skeleton-shape]")
    .first()
    .evaluate((element) => getComputedStyle(element, "::after").animationName);
  expect(animation).toBe("none");
});

test("hydrates server markup without recoverable errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.getByRole("button", { name: "Hydrate", exact: true }).click();
  await expect(page.locator("#hydrated [data-skeleton-shape]")).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("supports repeated mount and unmount without runtime errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (let index = 0; index < 3; index++) {
    await page.getByRole("button", { name: "Toggle mount" }).click();
    await expect(page.locator("[data-skeleton-shape]")).toHaveCount(0);
    await page.getByRole("button", { name: "Toggle mount" }).click();
    await expect(page.locator("[data-skeleton-shape]").first()).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("playground controls work at desktop and mobile widths", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Article", exact: true }).click();
  await expect(
    page.getByTestId("demo-skeleton").locator("[data-skeleton-shape]").first(),
  ).toBeVisible();
  await page.getByLabel("Animation", { exact: true }).selectOption("pulse");
  await expect(page.getByTestId("demo-skeleton")).toHaveAttribute("data-animation", "pulse");
  await page.getByRole("button", { name: "Loading on" }).click();
  await expect(page.getByTestId("demo-skeleton").getByRole("heading")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});
