from playwright.sync_api import sync_playwright

def verify_save_status():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the app
        page.goto("http://localhost:8080/index.html")

        # Wait for app to load
        page.wait_for_selector("#editor")

        # Type something to trigger autosave logic (though we want to test manual save)
        page.fill("#editor", "# Testing Save")

        # Click the save button
        page.click("#save-note-btn")

        # Check for 'Saving…' status immediately
        # Note: In a real browser, this might be too fast to catch without slowing down network/cpu,
        # but our refactor added a 300ms delay, so we should be able to see "Saving..." or "Saved"
        # depending on timing.
        # The key verification here is that the app doesn't crash and eventually shows "Saved".

        # Wait for "Saved" to appear (it should appear after ~300ms)
        # We look for the 'just-saved' class which is added when 'Saved' text is set
        page.wait_for_selector(".save-status.just-saved", timeout=2000)

        # Take a screenshot of the header
        header = page.locator(".app-header")
        header.screenshot(path="verification/save_status.png")

        browser.close()

if __name__ == "__main__":
    verify_save_status()
