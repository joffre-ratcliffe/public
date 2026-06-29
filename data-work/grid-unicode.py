import requests
from bs4 import BeautifulSoup

def print_secret_message(url):
    # 1. Fetch the content
    try:
        response = requests.get(url)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching the document: {e}")
        return

    # 2. Parse the HTML
    soup = BeautifulSoup(response.text, 'html.parser')
    table = soup.find('table')
    
    if not table:
        print("No table found.")
        return

    # 3. Extract data (Skip header row)
    data = []
    max_x, max_y = 0, 0
    rows = table.find_all('tr')[1:]
    
    for row in rows:
        cols = row.find_all('td')
        if len(cols) >= 3:
            try:
                # The format is: x, character, y
                x = int(cols[0].get_text().strip())
                char = cols[1].get_text().strip()
                y = int(cols[2].get_text().strip())
                
                data.append((x, y, char))
                
                # Update bounds
                if x > max_x: max_x = x
                if y > max_y: max_y = y
            except (ValueError, IndexError):
                continue

    # 4. Initialize grid (y rows, x columns)
    # Using ' ' as the filler for any unspecified positions
    grid = [[' ' for _ in range(max_x + 1)] for _ in range(max_y + 1)]

    # 5. Populate the grid
    for x, y, char in data:
        grid[y][x] = char

    # 6. Print the grid 
    # Since (0,0) is top-left, we print from index 0 to max_y
    for row in grid:
        print("".join(row))

# Run the function
# url = "https://docs.google.com/document/d/e/2PACX-1vSvM5gDlNvt7npYHhp_XfsJvuntUhq184By5xO_pA4b_gCWeXb6dM6ZxwN8rE6S4ghUsCj2VKR21oEP/pub"
url = "https://docs.google.com/document/d/e/2PACX-1vTMOmshQe8YvaRXi6gEPKKlsC6UpFJSMAk4mQjLm_u1gmHdVVTaeh7nBNFBRlui0sTZ-snGwZM4DBCT/pub"
print_secret_message(url)
