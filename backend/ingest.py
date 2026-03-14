import os
from bs4 import BeautifulSoup
import io
import json
import csv
try:
    from pypdf import PdfReader
except ImportError:
    pass # we'll use a basic text extraction if not available, or instruct user to install if critical

from playwright.sync_api import sync_playwright

def parse_url(url: str) -> list[dict]:
    """
    Fetch the URL and extract text content using Playwright to bypass basic anti-bot screens.
    """
    with sync_playwright() as p:
        # Run in headed mode so the user can see and pass Cloudflare/captchas
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 720}
        )
        page = context.new_page()
        
        try:
            # Inject a script to show a ready button across any reloads/challenges
            page.add_init_script("""
                window.addEventListener('load', () => {
                    if (window !== window.top) return;
                    if (document.getElementById('communisense-cf-overlay')) return;
                    const overlay = document.createElement('div');
                    overlay.id = 'communisense-cf-overlay';
                    overlay.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:999999;background:#10b981;font-family:sans-serif;text-align:center;border-radius:8px;padding:15px;box-shadow:0 4px 12px rgba(0,0,0,0.3);';
                    overlay.innerHTML = `
                        <div style="color:white;font-weight:bold;margin-bottom:10px;">CommuniSense</div>
                        <div style="color:white;font-size:12px;margin-bottom:10px;">Pass any checks, then click:</div>
                        <button id="communisense-cf-ok" style="background:white;color:#10b981;border:none;padding:8px 16px;border-radius:4px;font-weight:bold;cursor:pointer;">Extract Content</button>
                    `;
                    document.body.appendChild(overlay);
                    document.getElementById('communisense-cf-ok').onclick = (e) => {
                        e.preventDefault();
                        window.__cf_passed = true;
                        overlay.innerHTML = '<div style="color:white;font-weight:bold;font-size:14px;">Extracting...</div>';
                    };
                });
            """)
            
            # Go to the page (wait_until="domcontentloaded" is usually faster than "load")
            page.goto(url, timeout=60000, wait_until="domcontentloaded")
            
            # Wait for the user to click the extracted button (up to 120 seconds to give them time)
            page.wait_for_function("window.__cf_passed === true", timeout=120000)
            
            # Additional small wait to ensure everything is stable
            page.wait_for_timeout(500)
            
            # Extract text directly using Playwright's locator
            text = page.evaluate("document.body.innerText")
            
            # Chunk text into artifacts
            return [{"source": url, "content": text[:15000]}]
        except Exception as e:
            raise Exception(f"Playwright failed to load URL: {e}")
        finally:
            browser.close()

async def parse_file(filename: str, content: bytes) -> list[dict]:
    """Parse common file types to artifacts."""
    artifacts = []
    
    if filename.endswith('.txt') or filename.endswith('.csv') or filename.endswith('.json'):
        text = content.decode('utf-8', errors='ignore')
        artifacts.append({"source": filename, "content": text[:15000]})
    elif filename.endswith('.pdf'):
        try:
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(content))
            text = ""
            for page in reader.pages:
                t = page.extract_text()
                if t: text += t + "\n"
            artifacts.append({"source": filename, "content": text[:15000]})
        except Exception as e:
            artifacts.append({"source": filename, "content": "Failed to parse PDF: " + str(e)})
    else:
        artifacts.append({"source": filename, "content": content.decode('utf-8', errors='ignore')[:15000]})
        
    return artifacts
