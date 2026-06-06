from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:3000/dashboard")
    page.wait_for_timeout(2000)

    # Take screenshot of the new Dashboard Layout
    page.screenshot(path="dashboard_verification.png", full_page=True)
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir=".",
            viewport={'width': 1280, 'height': 800}
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
