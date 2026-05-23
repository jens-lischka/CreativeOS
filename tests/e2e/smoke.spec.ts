import { expect, test } from "@playwright/test";

test("Today view renders with the command bar", async ({ page }) => {
  await page.goto("/today");
  await expect(page.getByRole("heading", { name: "Today" })).toBeVisible();
  await expect(page.getByPlaceholder(/What do you want to do/)).toBeVisible();
});

test("create work, then record an update that lands in the project log", async ({ page }) => {
  // Create a new work object via the command/quick-action UI.
  await page.goto("/work/new");
  const title = `Smoke Project ${Date.now()}`;
  await page.getByLabel("What is being made?").fill(title);
  await page.getByLabel("Tier").selectOption("2");
  await page.getByRole("button", { name: "Create work" }).click();

  // We should land on the detail page with the project log showing creation.
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(page.getByText(`Created Project "${title}"`)).toBeVisible();

  // Record a time-logged update; it should appear in the log.
  await page.getByRole("combobox").first().selectOption("time_logged");
  await page.getByPlaceholder("hours").fill("2");
  await page.getByPlaceholder("Add a note…").fill("first pass");
  await page.getByRole("button", { name: "Record update" }).click();

  await expect(page.getByText("Logged 2h — first pass")).toBeVisible();
});
