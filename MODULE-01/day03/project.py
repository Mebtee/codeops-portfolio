# A program inventory.py for a small Addis Ababa pharmacy that loads stock from a file into a
# dictionary, lets you update quantities, reports low-stock items, and saves the updated stock back to
# the file.
# Requirements
# • Read pharmacy.txt (one item,quantity per line) into a dictionary, inside a try / except for a
# missing file.

stock = {}
try:
    with open("pharmacy.txt", "r") as file:
        for line in file:
            item, quantity = line.strip().split(",")
            stock[item] = int(quantity)
except FileNotFoundError:
    print("Error: pharmacy.txt not found.")

# • Add a function that increases or decreases an item's quantity by a given amount.
def update_stock(item, amount):
    if item in stock:
        stock[item] += amount
    else:
        print(f"Item '{item}' not found in stock.")

# • Use a comprehension or loop to print every item where the quantity is below 10 (low stock).
for item, quantity in stock.items():
    if quantity < 10:
        print(f"Low stock: {item} - {quantity}")

# • Write the updated dictionary back to stock.txt so the changes persist.

with open("pharmacy.txt", "w") as file:
    for item, quantity in stock.items():
        file.write(f"{item},{quantity}\n")