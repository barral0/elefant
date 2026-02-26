from playwright.sync_api import sync_playwright

def verify_app_loads():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Create context with empty storage to force default initialization
        context = browser.new_context()
        page = context.new_page()

        try:
            print("Navigating to app...")
            page.goto("http://localhost:8080")

            # Wait for any .item in the sidebar, which indicates renderSidebar has run
            # The sidebar UL has id "file-list"
            print("Waiting for file list...")
            page.wait_for_selector("#file-list", state="attached", timeout=10000)

            # Give it a moment for the JS to populate the list
            page.wait_for_timeout(2000)

            # Check if there are any list items
            items = page.locator("#file-list li")
            count = items.count()
            print(f"Found {count} items in sidebar.")

            if count > 0:
                print("✅ Sidebar items rendered.")

                # Check for "Welcome.md" text specifically in the sidebar
                welcome_note = page.locator("#file-list", has_text="Welcome.md")
                if welcome_note.count() > 0:
                     print("✅ 'Welcome.md' item found in sidebar.")
                else:
                     print("❌ 'Welcome.md' item NOT found in sidebar.")
            else:
                print("❌ No items found in sidebar.")

            # Check editor content
            editor_val = page.locator("#editor").input_value()
            if "# Welcome to Elefant" in editor_val:
                print("✅ Editor loaded with Welcome content.")
            else:
                print(f"❌ Editor content mismatch or empty. Content start: {editor_val[:50]}...")

            page.screenshot(path="verification.png")
            print("Screenshot saved.")

        except Exception as e:
            print(f"❌ Error during verification: {e}")
            page.screenshot(path="error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_app_loads()
