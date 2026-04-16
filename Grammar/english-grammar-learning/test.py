#!/usr/bin/env python3
"""Test the English Grammar Learning Webapp"""

import asyncio
from playwright.async_api import async_playwright
import os

async def test_page():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        errors = []
        page.on("console", lambda msg: errors.append(f"Console {msg.type}: {msg.text}") if msg.type == "error" else None)
        page.on("pageerror", lambda err: errors.append(f"Page error: {err}"))

        # Load the local HTML file
        html_path = os.path.abspath("index.html")
        await page.goto(f"file://{html_path}")

        # Wait for page to fully load
        await page.wait_for_load_state("networkidle")
        await asyncio.sleep(2)

        # Check for critical elements
        checks = {
            "Hero section": await page.locator(".hero").count() > 0,
            "Progress section": await page.locator(".progress-section").count() > 0,
            "Level tabs": await page.locator(".level-tabs").count() > 0,
            "Topic cards": await page.locator(".topic-card").count() > 0,
            "Practice modal": await page.locator("#practice-modal").count() > 0,
            "Game modal": await page.locator("#game-modal").count() > 0,
        }

        print("\n=== Page Load Test Results ===")
        print(f"Page title: {await page.title()}")

        all_passed = True
        for check, passed in checks.items():
            status = "PASS" if passed else "FAIL"
            print(f"{check}: {status}")
            if not passed:
                all_passed = False

        if errors:
            print("\n=== Console Errors ===")
            for err in errors:
                print(err)
        else:
            print("\nNo console errors detected!")

        # Test interactivity
        print("\n=== Interactivity Test ===")

        # Click on Games tab
        await page.click('[data-section="games"]')
        await asyncio.sleep(0.5)
        games_visible = await page.locator("#games.active").count() > 0
        print(f"Games section switch: {'PASS' if games_visible else 'FAIL'}")

        # Click on Homework tab
        await page.click('[data-section="homework"]')
        await asyncio.sleep(0.5)
        homework_visible = await page.locator("#homework.active").count() > 0
        print(f"Homework section switch: {'PASS' if homework_visible else 'FAIL'}")

        # Click on Progress tab
        await page.click('[data-section="progress"]')
        await asyncio.sleep(0.5)
        progress_visible = await page.locator("#progress.active").count() > 0
        print(f"Progress section switch: {'PASS' if progress_visible else 'FAIL'}")

        await browser.close()

        print("\n=== Final Result ===")
        if all_passed and not errors:
            print("All tests PASSED!")
            return True
        else:
            print("Some tests FAILED!")
            return False

if __name__ == "__main__":
    result = asyncio.run(test_page())
    exit(0 if result else 1)
