from playwright.sync_api import sync_playwright

def verify_sidebar_icons():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Go to the local server
        page.goto("http://localhost:8080/index.html")

        # Wait for the sidebar to render (it might take a moment if it depends on JS)
        page.wait_for_selector("#file-list")

        # Take a screenshot of the sidebar
        # We can try to capture the whole sidebar or just the file list
        sidebar = page.locator(".sidebar")
        if sidebar.is_visible():
            sidebar.screenshot(path="verification/sidebar_icons.png")
            print("Screenshot saved to verification/sidebar_icons.png")
        else:
            print("Sidebar not visible")
            page.screenshot(path="verification/full_page.png")
            print("Full page screenshot saved to verification/full_page.png")

        browser.close()

if __name__ == "__main__":
    verify_sidebar_icons()
